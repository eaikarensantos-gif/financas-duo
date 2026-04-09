import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { Transaction, Profile } from '../types'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const categoryKeywords: Record<string, string> = {
  'alimenta|super|mercar|açaí|restaur|café|almoço|jantar': 'Alimentação',
  'transporte|uber|taxi|combustível|gasolina|metrô|ônibus': 'Transporte',
  'saúde|farma|médic|dentista|hospital': 'Saúde',
  'educação|curso|escola|facul': 'Educação',
  'lazer|cinema|show|viagem|hotel|passeio': 'Lazer',
  'utilidade|água|luz|gás|telefone|internet': 'Utilidades',
  'assinatura|saas|software|netflix|spotify': 'Software/SaaS',
  'salário|renda|freelance': 'Renda',
}

function inferCategory(title: string): string {
  const lowerTitle = title.toLowerCase()
  for (const [keywords, category] of Object.entries(categoryKeywords)) {
    const regex = new RegExp(keywords)
    if (regex.test(lowerTitle)) return category
  }
  return 'Outros'
}

function parseDate(dateStr: string): string {
  const patterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // D/M/YYYY
  ]

  for (const pattern of patterns) {
    const match = dateStr.match(pattern)
    if (match) {
      if (pattern === patterns[0] || pattern === patterns[2]) {
        // DD/MM/YYYY or D/M/YYYY
        const [, day, month, year] = match
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } else {
        // YYYY-MM-DD
        return dateStr
      }
    }
  }

  return new Date().toISOString().split('T')[0]
}

function parseAmount(amountStr: string): number {
  let cleaned = amountStr.replace(/[R$\s]/g, '')

  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Brazilian format: 5.000,00 → dots are thousands, comma is decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',')) {
    // Comma-only: 5000,00 → comma is decimal
    cleaned = cleaned.replace(',', '.')
  }
  // Dot-only: 5000.00 → dot is already decimal, no change needed

  return parseFloat(cleaned) || 0
}

function parseCSV(content: string, profile: Profile): Promise<Partial<Transaction>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const transactions: Partial<Transaction>[] = []

        for (const row of results.data) {
          const [dateStr, titleStr, categoryStr, amountStr] = row as string[]

          if (!dateStr || !titleStr || !amountStr) continue

          const amount = parseAmount(amountStr)
          if (amount === 0) continue

          transactions.push({
            profile,
            type: amount > 0 ? 'income' : 'expense',
            title: titleStr.trim(),
            description: categoryStr?.trim(),
            date: parseDate(dateStr),
            amount,
            category: categoryStr?.trim() || inferCategory(titleStr),
            paymentMethod: 'Transferência',
          })
        }

        resolve(transactions)
      },
      error: (error: Error) => reject(new Error(`Erro ao processar CSV: ${error.message}`)),
    })
  })
}

function parseExcel(file: File, profile: Profile): Promise<Partial<Transaction>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

        const transactions: Partial<Transaction>[] = []

        for (const row of rows) {
          const [dateStr, titleStr, categoryStr, amountStr] = row

          if (!dateStr || !titleStr || !amountStr) continue

          const amount = parseAmount(String(amountStr))
          if (amount === 0) continue

          transactions.push({
            profile,
            type: amount > 0 ? 'income' : 'expense',
            title: String(titleStr).trim(),
            description: categoryStr ? String(categoryStr).trim() : undefined,
            date: parseDate(String(dateStr)),
            amount,
            category: categoryStr ? String(categoryStr).trim() : inferCategory(String(titleStr)),
            paymentMethod: 'Transferência',
          })
        }

        resolve(transactions)
      } catch (error) {
        reject(new Error(`Erro ao processar Excel: ${error instanceof Error ? error.message : 'desconhecido'}`))
      }
    }

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

async function parsePDF(file: File, profile: Profile): Promise<Partial<Transaction>[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n'
  }

  // Try to extract table-like data from PDF text
  const lines = fullText.split('\n').filter((l) => l.trim())
  const transactions: Partial<Transaction>[] = []

  // Simple pattern: try to find lines with date and amount
  const dateAmountPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|[\d\-]+).*?([\d,\.]+)\s*(?:R\$|$)/

  for (const line of lines) {
    const match = line.match(dateAmountPattern)
    if (match) {
      const dateStr = match[1]
      const amountStr = match[2]

      if (dateStr && amountStr) {
        transactions.push({
          profile,
          type: 'expense',
          title: line.replace(match[0], '').trim().slice(0, 50) || 'Transação',
          date: parseDate(dateStr),
          amount: -Math.abs(parseAmount(amountStr)),
          category: 'Outros',
          paymentMethod: 'Transferência',
        })
      }
    }
  }

  return transactions
}

export async function parseUploadedFile(
  file: File,
  profile: Profile
): Promise<Partial<Transaction>[]> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    const content = await file.text()
    return parseCSV(content, profile)
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file, profile)
  } else if (fileName.endsWith('.pdf')) {
    return parsePDF(file, profile)
  } else {
    throw new Error('Formato de arquivo não suportado')
  }
}
