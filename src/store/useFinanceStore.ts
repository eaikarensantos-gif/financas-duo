import { create } from 'zustand'
import type { Profile, Transaction, MonthlySummary, CategorySummary, AITip } from '../types'
import { categoryColors } from '../data/mockData'
import { db, auth } from '../lib/firebase'
import { collection, addDoc, deleteDoc, doc, query, where, orderBy, getDocs, writeBatch } from 'firebase/firestore'

interface FinanceStore {
  // ── Profile ───────────────────────────────────────────────────────────────
  activeProfile: Profile
  setProfile: (p: Profile) => void

  // ── Filters ───────────────────────────────────────────────────────────────
  selectedMonth: string
  selectedType: 'all' | 'income' | 'expense' | 'transfer'
  setMonth: (m: string) => void
  setType: (t: FinanceStore['selectedType']) => void

  // ── Transactions ──────────────────────────────────────────────────────────
  transactions: Transaction[]
  setTransactions: (t: Transaction[]) => void
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>
  importTransactions: (items: Omit<Transaction, 'id'>[]) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  clearData: () => void
  isLoading: boolean

  // ── Derived ───────────────────────────────────────────────────────────────
  getFiltered: () => Transaction[]
  getMonthlySummary: () => MonthlySummary
  getCategorySummary: () => CategorySummary[]
  getAITip: () => AITip
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  activeProfile: 'PF',
  selectedMonth: 'all',
  selectedType: 'all',
  transactions: [],
  isLoading: false,

  setProfile: (p) => set({ activeProfile: p }),
  setMonth: (m) => set({ selectedMonth: m }),
  setType: (t) => set({ selectedType: t }),

  setTransactions: (t) => set({ transactions: t }),

  addTransaction: async (t) => {
    set({ isLoading: true })
    try {
      const user = auth.currentUser
      if (!user) throw new Error('User not authenticated')

      await addDoc(collection(db, 'transactions'), {
        ...t,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Refetch transactions
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]
      set({ transactions: data })
    } catch (err) {
      console.error('Error adding transaction:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  importTransactions: async (items) => {
    set({ isLoading: true })
    try {
      const user = auth.currentUser
      if (!user) throw new Error('User not authenticated')

      const now = new Date().toISOString()
      const colRef = collection(db, 'transactions')

      // Firestore batches support max 500 operations
      for (let i = 0; i < items.length; i += 400) {
        const batch = writeBatch(db)
        const chunk = items.slice(i, i + 400)
        for (const t of chunk) {
          const ref = doc(colRef)
          batch.set(ref, { ...t, userId: user.uid, createdAt: now, updatedAt: now })
        }
        await batch.commit()
      }

      // Single refetch at the end
      const q = query(colRef, where('userId', '==', user.uid), orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[]
      set({ transactions: data })
    } catch (err) {
      console.error('Error importing transactions:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  removeTransaction: async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id))
      set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
    } catch (err) {
      console.error('Error removing transaction:', err)
    }
  },

  clearData: () => set({ transactions: [] }),

  getFiltered: () => {
    const { transactions, activeProfile, selectedMonth, selectedType } = get()
    return transactions.filter((t) => {
      if (t.profile !== activeProfile) return false
      if (selectedMonth !== 'all' && !t.date.startsWith(selectedMonth)) return false
      if (selectedType !== 'all' && t.type !== selectedType) return false
      return true
    })
  },

  getMonthlySummary: () => {
    const filtered = get().getFiltered()
    const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const expenses = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    return { income, expenses, balance: income - expenses, incomeChange: 12, expenseChange: -5 }
  },

  getCategorySummary: () => {
    const filtered = get().getFiltered().filter((t) => t.amount < 0)
    const map = new Map<string, number>()
    for (const t of filtered) {
      map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount))
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: categoryColors[name] ?? '#94a3b8',
      }))
  },

  getAITip: (): AITip => {
    const { activeProfile, getMonthlySummary, getCategorySummary, getFiltered } = get()
    const summary = getMonthlySummary()
    const categories = getCategorySummary()
    const transactions = getFiltered()

    if (activeProfile === 'PJ') {
      const saas = categories.find((c) => c.name === 'Software/SaaS')
      if (saas && saas.value > 500) {
        return {
          title: 'Revisão de assinaturas SaaS',
          body: `Você gastou R$ ${saas.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em Software/SaaS este período.`,
          type: 'warning',
        }
      }
      const missingReceipts = transactions.filter((t) => t.amount < 0 && t.hasReceipt === false)
      if (missingReceipts.length > 0) {
        return {
          title: `${missingReceipts.length} lançamento(s) sem nota fiscal`,
          body: 'Alguns gastos da PJ ainda não têm nota fiscal anexada.',
          type: 'warning',
        }
      }
      if (summary.balance > 10000) {
        return {
          title: 'Saldo PJ elevado — considere distribuir lucros',
          body: `Seu saldo atual está positivo em R$ ${summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
          type: 'success',
        }
      }
      return { title: 'Finanças PJ sob controle', body: 'Continue acompanhando seus lançamentos.', type: 'info' }
    }

    const lazer = categories.find((c) => c.name === 'Lazer')
    if (lazer && lazer.value > 200) {
      return {
        title: 'Orçamento de lazer próximo do limite',
        body: `Você já gastou R$ ${lazer.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em lazer.`,
        type: 'warning',
      }
    }
    if (summary.balance < 0) {
      return {
        title: 'Atenção: saldo negativo',
        body: 'Suas saídas estão superando as entradas neste período.',
        type: 'warning',
      }
    }
    return { title: 'Finanças pessoais estáveis', body: 'Seu saldo está positivo!', type: 'success' }
  },
}))
