import { useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'
import SummaryCard from './SummaryCard'
import TransactionItem from './TransactionItem'
import DonutChart from './DonutChart'
import AITipCard from './AITipCard'
import { availableMonths, monthName } from '../utils/format'

export default function Dashboard() {
  const {
    transactions,
    activeProfile,
    selectedMonth,
    selectedType,
    setMonth,
    setType,
    getFiltered,
    getMonthlySummary,
    getCategorySummary,
    getAITip,
    removeTransaction,
  } = useFinanceStore()

  const [showMonthMenu, setShowMonthMenu] = useState(false)
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  const filtered    = getFiltered()
  const summary     = getMonthlySummary()
  const categories  = getCategorySummary()
  const tip         = getAITip()

  const months = availableMonths(transactions.filter((t) => t.profile === activeProfile))

  const monthLabel = selectedMonth === 'all'
    ? 'Todos os Meses'
    : (() => {
        const [y, m] = selectedMonth.split('-')
        return `${monthName(parseInt(m, 10)).charAt(0).toUpperCase() + monthName(parseInt(m, 10)).slice(1)}/${y}`
      })()

  const typeLabel = {
    all: 'Todas',
    income: 'Entradas',
    expense: 'Saídas',
    transfer: 'Transferências',
  }[selectedType]

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* ── Left column ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard type="income"  value={summary.income}   change={summary.incomeChange} />
          <SummaryCard type="expense" value={summary.expenses} change={summary.expenseChange} />
          <SummaryCard type="balance" value={summary.balance} />
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100">
          {/* List header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Transações Recentes</h2>

            <div className="flex items-center gap-2">
              {/* Month filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowMonthMenu(!showMonthMenu); setShowTypeMenu(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {monthLabel}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showMonthMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[160px] py-1">
                    <button
                      onClick={() => { setMonth('all'); setShowMonthMenu(false) }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors
                        ${selectedMonth === 'all' ? 'text-indigo-600 font-semibold' : 'text-gray-700'}`}
                    >
                      Todos os Meses
                    </button>
                    {months.map((m) => {
                      const [y, mo] = m.split('-')
                      const label = `${monthName(parseInt(mo, 10)).charAt(0).toUpperCase() + monthName(parseInt(mo, 10)).slice(1)}/${y}`
                      return (
                        <button
                          key={m}
                          onClick={() => { setMonth(m); setShowMonthMenu(false) }}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors
                            ${selectedMonth === m ? 'text-indigo-600 font-semibold' : 'text-gray-700'}`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Type filter */}
              <div className="relative">
                <button
                  onClick={() => { setShowTypeMenu(!showTypeMenu); setShowMonthMenu(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {typeLabel}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showTypeMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 min-w-[140px] py-1">
                    {(['all', 'income', 'expense', 'transfer'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setType(t); setShowTypeMenu(false) }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors
                          ${selectedType === t ? 'text-indigo-600 font-semibold' : 'text-gray-700'}`}
                      >
                        {{ all: 'Todas', income: 'Entradas', expense: 'Saídas', transfer: 'Transferências' }[t]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add button */}
              <button className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50 px-1 py-2 max-h-[460px] overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                Nenhuma transação encontrada
              </p>
            ) : (
              filtered.map((t) => (
                <TransactionItem key={t.id} transaction={t} onRemove={removeTransaction} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Right column ───────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 space-y-4">

        {/* Category chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Gastos por Categoria</h2>
          <DonutChart data={categories} />
        </div>

        {/* AI Tip */}
        <AITipCard tip={tip} />

        {/* PJ alert: missing receipts */}
        {activeProfile === 'PJ' && (() => {
          const missing = filtered.filter((t) => t.amount < 0 && t.hasReceipt === false)
          if (missing.length === 0) return null
          return (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                {missing.length} gasto(s) sem nota fiscal
              </p>
              <ul className="space-y-1">
                {missing.slice(0, 3).map((t) => (
                  <li key={t.id} className="text-[11px] text-amber-600 truncate">· {t.title}</li>
                ))}
                {missing.length > 3 && (
                  <li className="text-[11px] text-amber-500">e mais {missing.length - 3}…</li>
                )}
              </ul>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
