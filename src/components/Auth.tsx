import { useState } from 'react'
import { auth } from '../lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { Mail, Lock, LogOut } from 'lucide-react'

interface Props {
  user: { id: string; email: string } | null
  onAuthChange: () => void
}

export default function Auth({ user, onAuthChange }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
        setEmail('')
        setPassword('')
        alert('Cadastro realizado! Agora faça login com suas credenciais.')
        setIsSignUp(false)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        setEmail('')
        setPassword('')
        onAuthChange()
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setLoading(true)
    try {
      await signOut(auth)
      onAuthChange()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl border border-gray-100">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">Conectado como</p>
          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Finanças Duo</h1>
      <p className="text-sm text-gray-500 mb-6">
        {isSignUp ? 'Crie uma conta' : 'Entre na sua conta'}
      </p>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 p-2.5 rounded">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      <button
        onClick={() => { setIsSignUp(!isSignUp); setError('') }}
        className="w-full mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        {isSignUp ? 'Já tem conta? Entre' : 'Novo? Cadastre-se'}
      </button>
    </div>
  )
}
