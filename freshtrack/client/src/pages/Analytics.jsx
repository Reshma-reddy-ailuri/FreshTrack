import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BarChart3 } from 'lucide-react'
import ExpiryByCategory from '../components/Charts/ExpiryByCategory.jsx'
import NearExpiryTrend from '../components/Charts/NearExpiryTrend.jsx'
import InventoryRiskPie from '../components/Charts/InventoryRiskPie.jsx'
import { formatINR } from '../utils/dateUtils.js'

const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/freshtrack'

function SkeletonKPI() {
  return <div className="h-10 w-48 animate-pulse rounded bg-red-200/60" />
}

export default function Analytics() {
  const [expiryByCat, setExpiryByCat] = useState(null)
  const [revRisk, setRevRisk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [a, b] = await Promise.all([
          axios.get(`${API_BASE}/analytics/expiry-by-category`, { signal: controller.signal }),
          axios.get(`${API_BASE}/analytics/revenue-at-risk`, { signal: controller.signal }),
        ])
        setExpiryByCat(a.data)
        setRevRisk(b.data)
      } catch (e) {
        if (e.name === 'CanceledError') return
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [])

  const pieData = useMemo(() => {
    const list = revRisk?.by_category || []
    const total = list.reduce((s, x) => s + Number(x.value || 0), 0) || 1
    return list.map((x) => ({
      category: x.category,
      value: Math.round((Number(x.value || 0) / total) * 100),
    }))
  }, [revRisk])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Category breakdown, near-expiry trends, and inventory revenue risk.
          </div>
        </div>

        <div className="rounded-xl border border-danger/20 bg-red-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-danger">
            Total revenue at risk
          </div>
          {loading ? (
            <div className="mt-1">
              <SkeletonKPI />
            </div>
          ) : (
            <div className="mt-1 text-2xl font-semibold text-danger">
              {formatINR(revRisk?.total || 0)}
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger">
          Failed to load analytics. Start the backend server and try again.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExpiryByCategory data={expiryByCat} loading={loading} />
        <NearExpiryTrend data={revRisk?.trend_last_30_days} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InventoryRiskPie data={pieData} loading={loading} />
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">
            Revenue at risk by category
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-full animate-pulse rounded bg-slate-200" />
              ))}
            </div>
          ) : (revRisk?.by_category || []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
              No near-expiry inventory found.
            </div>
          ) : (
            <div className="space-y-2">
              {revRisk.by_category.map((row) => (
                <div
                  key={row.category}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {row.category}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatINR(row.value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

