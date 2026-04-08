export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day} de ${monthName(parseInt(month, 10))}`
}

const MONTHS = [
  '', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

export function monthName(m: number): string {
  return MONTHS[m] ?? ''
}

export function availableMonths(transactions: { date: string }[]): string[] {
  const set = new Set(transactions.map((t) => t.date.slice(0, 7)))
  return Array.from(set).sort().reverse()
}
