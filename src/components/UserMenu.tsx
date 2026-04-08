import { useState } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

interface Props {
  user: { id: string; email: string }
  onLogout: () => void
}

export default function UserMenu({ user, onLogout }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      onLogout()
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <User className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.email}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-gray-100 shadow-lg z-10 min-w-[200px] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => {
              handleLogout()
              setIsOpen(false)
            }}
            disabled={loading}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      )}
    </div>
  )
}
