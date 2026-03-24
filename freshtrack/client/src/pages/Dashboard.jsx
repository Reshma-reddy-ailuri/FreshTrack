import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import StatCard from '../components/StatCard.jsx'
import ExpiryTable from '../components/ExpiryTable.jsx'
import AlertPanel from '../components/AlertPanel.jsx'
import useAlerts from '../hooks/useAlerts.js'
import useExpiryData from '../hooks/useExpiryData.js'
import { formatINR } from '../utils/dateUtils.js'
import toast from 'react-hot-toast'

const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/freshtrack'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState(null)

  const [tableState, setTableState] = useState({
    category: '',
    filter: '30',
    search: '',
  })

  const expiry = useExpiryData({
    filter: tableState.filter,
    category: tableState.category,
    search: tableState.search,
    page: 1,
    limit: 25,
  })

  const alerts = useAlerts({ auto: true })
  const [busyId, setBusyId] = useState(null)

  const loadSummary = async (signal) => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const res = await axios.get(`${API_BASE}/dashboard-summary`, { signal })
      setSummary(res.data)
    } catch (e) {
      if (e.name === 'CanceledError') return
      setSummaryError(e)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadSummary(controller.signal)
    return () => controller.abort()
  }, [])

  const items = expiry.data?.items || []
  const alertItems = alerts.data?.items || []

  const onAlertAction = async (a, action) => {
    setBusyId(a._id)
    try {
      await alerts.actionAlert(a._id, action)
      toast.success(action === 'actioned' ? 'Marked as actioned' : 'Dismissed')
      await alerts.refresh()
    } catch (e) {
      toast.error('Failed to update alert. Is the server running?')
    } finally {
      setBusyId(null)
    }
  }

  const revenueAtRisk = useMemo(() => formatINR(summary?.revenue_at_risk || 0), [summary])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-slate-900">Dashboard</div>
          <div className="mt-1 text-sm text-slate-600">
            Track expiring inventory and act on smart sales suggestions.
          </div>
        </div>
        <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 md:block">
          Revenue at risk (≤ 30d): <span className="font-semibold text-danger">{revenueAtRisk}</span>
        </div>
      </div>

      {summaryError ? (
        <div className="rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger">
          Failed to load dashboard summary. Start the backend server and try again.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total SKUs" value={summary?.total_skus ?? '—'} loading={summaryLoading} />
        <StatCard
          title="Expiring in 7 Days"
          value={summary?.expiring_7 ?? '—'}
          loading={summaryLoading}
          tone="warning"
        />
        <StatCard
          title="Expiring in 30 Days"
          value={summary?.expiring_30 ?? '—'}
          loading={summaryLoading}
          tone="yellow"
        />
        <StatCard
          title="Already Expired"
          value={summary?.expired ?? '—'}
          loading={summaryLoading}
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpiryTable
            items={items}
            loading={expiry.loading}
            error={expiry.error}
            category={tableState.category}
            filter={tableState.filter}
            search={tableState.search}
            onChange={(next) => setTableState((s) => ({ ...s, ...next }))}
          />
        </div>
        <div>
          <AlertPanel
            items={alertItems.slice(0, 12)}
            busyId={busyId}
            onDismiss={(a) => onAlertAction(a, 'dismissed')}
            onAction={(a) => onAlertAction(a, 'actioned')}
          />
        </div>
      </div>
    </div>
  )
}

