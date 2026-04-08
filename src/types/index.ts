export type Profile = 'PF' | 'PJ'

export type TransactionType = 'income' | 'expense' | 'transfer'

export type PaymentMethod =
  | 'Cartão de Débito'
  | 'Cartão de Crédito'
  | 'Transferência'
  | 'Boleto'
  | 'Dinheiro'
  | 'PIX'

export interface Transaction {
  id: string
  profile: Profile
  type: TransactionType
  title: string
  description?: string
  date: string          // ISO date string
  amount: number        // positive = income, negative = expense
  category: string
  subcategory?: string
  paymentMethod: PaymentMethod
  hasReceipt?: boolean  // PJ: nota fiscal anexada
  isRecurring?: boolean
  tags?: string[]
}

export interface CategorySummary {
  name: string
  value: number
  color: string
}

export interface MonthlySummary {
  income: number
  expenses: number
  balance: number
  incomeChange: number    // % vs previous month
  expenseChange: number
}

export interface AITip {
  title: string
  body: string
  type: 'info' | 'warning' | 'success'
}
