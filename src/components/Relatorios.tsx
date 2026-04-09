import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useFinanceStore } from '../store/useFinanceStore'
import { monthName } from '../utils/format'

export default function Relatorios() {
  const { getFiltered } = useFinanceStore()
  const filtered = getFiltered()

  // Monthly summary data
  const monthlyData = filtered.reduce((acc, t) => {
    const [year, month] = t.date.split('-')
    const key = `${month}/${year}`
    const existing = acc.find((d) => d.month === key)

    if (existing) {
      if (t.amount > 0) existing.income += t.amount
      else existing.expense += Math.abs(t.amount)
    } else {
      acc.push({
        month: key,
        income: t.amount > 0 ? t.amount : 0,
        expense: t.amount < 0 ? Math.abs(t.amount) : 0,
      })
    }
    return acc
  }, [] as { month: string; income: number; expense: number }[])

  monthlyData.sort((a, b) => {
    const [mA, yA] = a.month.split('/')
    const [mB, yB] = b.month.split('/')
    if (yA !== yB) return yA.localeCompare(yB)
    return mA.localeCompare(mB)
  })

  // Category breakdown
  const categoryData = filtered
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => {
      const existing = acc.find((d) => d.name === t.category)
      if (existing) existing.value += Math.abs(t.amount)
      else acc.push({ name: t.category, value: Math.abs(t.amount) })
      return acc
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)

  // Payment method breakdown
  const paymentData = filtered.reduce((acc, t) => {
    const existing = acc.find((d) => d.name === t.paymentMethod)
    if (existing) existing.value += 1
    else acc.push({ name: t.paymentMethod, value: 1 })
    return acc
  }, [] as { name: string; value: number }[])

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']

  const totalIncome = filtered.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(filtered.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
  const totalBalance = totalIncome - totalExpense

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Análise detalhada de suas transações</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-600 mb-2">Total de Entradas</p>
          <p className="text-3xl font-bold text-green-600">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-3">{filtered.filter((t) => t.amount > 0).length} transações</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-600 mb-2">Total de Saídas</p>
          <p className="text-3xl font-bold text-red-600">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-3">{filtered.filter((t) => t.amount < 0).length} transações</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-600 mb-2">Saldo Total</p>
          <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-3">Período completo</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly trend */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendência Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown */}
        {categoryData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoria</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${Number(value).toFixed(0)}`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly bar chart */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparativo Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Payment methods */}
      {paymentData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento Utilizados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paymentData.map((method) => (
              <div key={method.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{method.name}</span>
                <span className="text-sm font-semibold text-indigo-600">{method.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
