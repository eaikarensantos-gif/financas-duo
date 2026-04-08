import { useEffect, useState } from 'react'
import { auth, db } from './lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore'
import { useFinanceStore } from './store/useFinanceStore'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Historico from './components/Historico'
import Relatorios from './components/Relatorios'
import Auth from './components/Auth'
import type { Transaction } from './types'

type View = 'dashboard' | 'historico' | 'relatorios'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const { setTransactions, clearData, activeProfile, setProfile } = useFinanceStore()

  // ── Check auth status on mount ────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ id: firebaseUser.uid, email: firebaseUser.email || '' })
        setupTransactionListener(firebaseUser.uid)
      } else {
        setUser(null)
        clearData()
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ── Setup real-time listener for transactions from Firestore ─────────────
  function setupTransactionListener(userId: string) {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[]
        setTransactions(data)
      })

      return unsubscribe
    } catch (err) {
      console.error('Error setting up transaction listener:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <Auth user={user} onAuthChange={() => {}} />
      </div>
    )
  }

  async function handleClear() {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      try {
        if (!user) return
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.id)
        )
        const snapshot = await getDocs(q)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deletePromises)
        clearData()
      } catch (err) {
        console.error('Error clearing data:', err)
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeView={view}
        onNavigate={setView}
        onClear={handleClear}
      />

      <div className="flex-1 flex flex-col">
        <Header
          activeProfile={activeProfile}
          onProfileChange={setProfile}
          onUpload={() => {}}
        />

        <main className="flex-1 overflow-y-auto">
          {view === 'dashboard' && <Dashboard />}
          {view === 'historico' && <Historico />}
          {view === 'relatorios' && <Relatorios />}
        </main>
      </div>

      {/* User menu (floating) */}
      <div className="absolute top-4 right-4 bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
        <Auth user={user} onAuthChange={() => setUser(null)} />
      </div>
    </div>
  )
}
