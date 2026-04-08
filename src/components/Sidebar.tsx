import { LayoutDashboard, History, BarChart2, Trash2, Wallet } from 'lucide-react'

type View = 'dashboard' | 'historico' | 'relatorios'

interface Props {
  activeView: View
  onNavigate: (v: View) => void
  onClear: () => void
}

const navItems: { id: View; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'historico',  label: 'Histórico',  Icon: History },
  { id: 'relatorios', label: 'Relatórios', Icon: BarChart2 },
]

export default function Sidebar({ activeView, onNavigate, onClear }: Props) {
  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm leading-tight">
          Finanças<br />
          <span className="text-indigo-600">Duo</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeView === id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Clear data */}
      <div className="px-3 pb-4">
        <button
          onClick={onClear}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 shrink-0" />
          Limpar Dados
        </button>
      </div>
    </aside>
  )
}
