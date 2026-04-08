import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatBRL } from '../utils/format'

interface Props {
  type: 'income' | 'expense' | 'balance'
  value: number
  change?: number   // percentage change vs previous period
}

const config = {
  income: {
    label: 'Entradas',
    Icon: TrendingUp,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    valueColor: 'text-gray-900',
  },
  expense: {
    label: 'Saídas',
    Icon: TrendingDown,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    valueColor: 'text-gray-900',
  },
  balance: {
    label: 'Saldo Atual',
    Icon: Wallet,
    iconColor: 'text-white',
    iconBg: 'bg-white/20',
    valueColor: 'text-white',
  },
}

export default function SummaryCard({ type, value, change }: Props) {
  const { label, Icon, iconColor, iconBg, valueColor } = config[type]
  const isBalance = type === 'balance'

  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3
        ${isBalance
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white'
          : 'bg-white border border-gray-100'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full
              ${change >= 0
                ? isBalance ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                : isBalance ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
              }`}
          >
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>

      <div>
        <p className={`text-xs font-medium mb-1 ${isBalance ? 'text-indigo-200' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`text-2xl font-bold ${valueColor}`}>
          {isBalance && value < 0 ? '-' : ''}
          {formatBRL(Math.abs(value))}
        </p>
      </div>
    </div>
  )
}
