import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategorySummary } from '../types'
import { formatBRL } from '../utils/format'

interface Props {
  data: CategorySummary[]
}

export default function DonutChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        Nenhum gasto registrado
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatBRL(value), 'Total']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
            </div>
            <span className="font-medium text-gray-900">{formatBRL(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
