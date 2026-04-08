import { Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { AITip } from '../types'

interface Props {
  tip: AITip
}

const typeConfig = {
  info: {
    Icon: Info,
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    iconColor: 'text-indigo-500',
    titleColor: 'text-indigo-800',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
  },
  success: {
    Icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800',
  },
}

export default function AITipCard({ tip }: Props) {
  const { Icon, bg, border, iconColor, titleColor } = typeConfig[tip.type]

  return (
    <div className={`rounded-2xl p-5 border ${bg} ${border}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Dica de IA</span>
      </div>

      {/* Content */}
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <p className={`text-sm font-semibold mb-1 ${titleColor}`}>{tip.title}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{tip.body}</p>
        </div>
      </div>
    </div>
  )
}
