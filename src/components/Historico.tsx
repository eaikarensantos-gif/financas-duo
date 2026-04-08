import { useState } from 'react'
import { Search, ChevronDown, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'
import TransactionItem from './TransactionItem'

export default function Historico() {
  const { getFiltered, removeTransaction } = useFinanceStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filtered = getFiltered()
    .filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
    .sort((a, b) => {
      let compareValue = 0
      if (sortBy === 'date') {
        compareValue = a.date.localeCompare(b.date)
      } else if (sortBy === 'amount') {
        compareValue = a.amount - b.amount
      } else {
        compareValue = a.title.localeCompare(b.title)
      }
      return sortOrder === 'asc' ? compareValue : -compareValue
    })

  const totalIncome = filtered.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(filtered.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico Completo</h1>
        <p className="text-sm text-gray-500 mt-1">
          {filtered.length} transação(ões) • Entrada: R$ {totalIncome.toFixed(2)} • Saída: R$ {totalExpense.toFixed(2)}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição, categoria..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Ordenar por Data</option>
            <option value="amount">Ordenar por Valor</option>
            <option value="title">Ordenar por Descrição</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 text-sm"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
            {sortOrder === 'desc' ? 'Descendente' : 'Ascendente'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Nenhuma transação encontrada</p>
              <p className="text-sm">Tente ajustar sua busca ou filtros</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <TransactionItem transaction={transaction} onRemove={removeTransaction} />
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Deseja remover "${transaction.title}"?`)) {
                      removeTransaction(transaction.id)
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Remover transação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
