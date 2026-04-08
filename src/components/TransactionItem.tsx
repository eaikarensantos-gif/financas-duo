import { TrendingUp, TrendingDown, ArrowLeftRight, X, AlertCircle } from 'lucide-react'
import type { Transaction } from '../types'
import { formatBRL, formatDate } from '../utils/format'

interface Props {
  transaction: Transaction
  onRemove: (id: string) => void
}

export default function TransactionItem({ transaction: t, onRemove }: Props) {
  const isIncome = t.amount > 0
  const isTransfer = t.type === 'transfer'

  const Icon = isTransfer ? ArrowLeftRight : isIncome ? TrendingUp : TrendingDown
  const iconBg = isTransfer
    ? 'bg-blue-50'
    : isIncome
    ? 'bg-emerald-50'
    : 'bg-rose-50'
  const iconColor = isTransfer
    ? 'text-blue-500'
    : isIncome
    ? 'text-emerald-500'
    : 'text-rose-500'
  const amountColor = isIncome ? 'text-emerald-600' : 'text-rose-600'

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-xl group transition-colors">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
          {t.profile === 'PJ' && t.amount < 0 && t.hasReceipt === false && (
            <div title="Sem nota fiscal">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDate(t.date)}&nbsp;·&nbsp;{t.category}
          {t.subcategory && <>&nbsp;·&nbsp;<span className="italic">{t.subcategory}</span></>}
          &nbsp;·&nbsp;
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{t.paymentMethod}</span>
        </p>
      </div>

      {/* Amount */}
      <span className={`text-sm font-semibold shrink-0 ${amountColor}`}>
        {isIncome ? '+ ' : '- '}
        {formatBRL(Math.abs(t.amount))}
      </span>

      {/* Remove button */}
      <button
        onClick={() => onRemove(t.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full ml-1"
        aria-label="Remover transação"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>
    </div>
  )
}
