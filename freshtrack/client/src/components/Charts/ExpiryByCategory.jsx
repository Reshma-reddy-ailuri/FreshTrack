import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

function Skeleton() {
  return <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200" />
}

export default function ExpiryByCategory({ data, loading }) {
  if (loading) return <Skeleton />
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
        No analytics data yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">
        Expiry distribution by category
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="expired" stackId="a" fill="#DC2626" />
            <Bar dataKey="expiring_7" stackId="a" fill="#D97706" />
            <Bar dataKey="expiring_30" stackId="a" fill="#EAB308" />
            <Bar dataKey="safe" stackId="a" fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

