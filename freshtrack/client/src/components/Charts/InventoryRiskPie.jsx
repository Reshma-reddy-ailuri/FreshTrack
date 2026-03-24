import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function Skeleton() {
  return <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200" />
}

const COLORS = ['#DC2626', '#D97706', '#EAB308', '#16A34A']

export default function InventoryRiskPie({ data, loading }) {
  if (loading) return <Skeleton />
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
        No inventory risk data available.
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">
        % inventory revenue at risk by category
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="value"
              nameKey="category"
              outerRadius={90}
              innerRadius={55}
              paddingAngle={3}
            >
              {sorted.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

