import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function Skeleton() {
  return <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200" />
}

export default function NearExpiryTrend({ data, loading }) {
  if (loading) return <Skeleton />
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
        No trend data available.
      </div>
    )
  }

  const compact = data.map((d) => ({
    ...d,
    label: String(d.date).slice(5),
  }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">
        Near-expiry batches trend (last 30 days)
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={compact}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={18} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="near_expiry_batches"
              stroke="#0F766E"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

