import { useMemo, useState } from 'react'
import { Bell, Flame, AlertTriangle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import useAlerts from '../hooks/useAlerts.js'
import { timeAgo } from '../utils/dateUtils.js'

function groupFor(alert) {
  if (alert.alert_type === 'expired') return 'Critical'
  if (alert.alert_type === 'expiring_soon') return 'Warning'
  return 'Info'
}

const meta = {
  Critical: { icon: Flame, tone: 'text-danger' },
  Warning: { icon: AlertTriangle, tone: 'text-warning' },
  Info: { icon: Info, tone: 'text-slate-700' },
}

function SkeletonItem() {
  return <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
}

export default function Alerts() {
  const alerts = useAlerts({ auto: true })
  const [busyId, setBusyId] = useState(null)

  const items = alerts.data?.items || []

  const grouped = useMemo(() => {
    return items.reduce((acc, a) => {
      const g = groupFor(a)
      acc[g] = acc[g] || []
      acc[g].push(a)
      return acc
    }, {})
  }, [items])

  const onAction = async (a, action) => {
    setBusyId(a._id)
    try {
      await alerts.actionAlert(a._id, action)
      toast.success(action === 'actioned' ? 'Marked as actioned' : 'Dismissed')
      await alerts.refresh()
    } catch {
      toast.error('Failed to update alert')
    } finally {
      setBusyId(null)
    }
  }

  const order = ['Critical', 'Warning', 'Info']

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Bell className="h-5 w-5 text-primary" />
          Alerts
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Active alerts sorted by urgency, grouped as Critical / Warning / Info.
        </div>
      </div>

      {alerts.error ? (
        <div className="rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger">
          Failed to load alerts. Start the backend server and try again.
        </div>
      ) : null}

      {alerts.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <div className="text-sm font-semibold text-slate-900">No active alerts</div>
          <div className="mt-1 text-sm text-slate-600">
            Visit Suggestions to generate alerts for near-expiry/slow-moving items.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {order.map((g) => {
            const Icon = meta[g].icon
            const list = grouped[g] || []
            if (list.length === 0) return null
            return (
              <section key={g}>
                <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${meta[g].tone}`}>
                  <Icon className="h-4 w-4" />
                  {g}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {list.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {list.map((a) => (
                    <div
                      key={a._id}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {a.product?.name || 'Product'}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">{a.message}</div>
                          <div className="mt-2 text-xs text-slate-500">
                            {timeAgo(a.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAction(a, 'dismissed')}
                            disabled={busyId === a._id}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => onAction(a, 'actioned')}
                            disabled={busyId === a._id}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                          >
                            Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

