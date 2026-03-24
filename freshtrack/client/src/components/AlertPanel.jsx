import { AlertTriangle, Info, Flame, X, Check } from 'lucide-react'
import { timeAgo } from '../utils/dateUtils.js'

function groupFor(alert) {
  if (alert.alert_type === 'expired') return 'Critical'
  if (alert.alert_type === 'expiring_soon') return 'Warning'
  return 'Info'
}

const groupMeta = {
  Critical: { icon: Flame, tone: 'text-danger', bg: 'bg-red-50 border-danger/20' },
  Warning: { icon: AlertTriangle, tone: 'text-warning', bg: 'bg-orange-50 border-warning/20' },
  Info: { icon: Info, tone: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
}

export default function AlertPanel({ items = [], onDismiss, onAction, busyId }) {
  const grouped = items.reduce((acc, a) => {
    const g = groupFor(a)
    acc[g] = acc[g] || []
    acc[g].push(a)
    return acc
  }, {})

  const groups = ['Critical', 'Warning', 'Info']

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
        Alerts
      </div>
      <div className="p-4 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
            No active alerts right now. Generate suggestions to create demo alerts.
          </div>
        ) : (
          groups.map((g) => {
            const meta = groupMeta[g]
            const Icon = meta.icon
            const list = grouped[g] || []
            if (list.length === 0) return null
            return (
              <div key={g}>
                <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${meta.tone}`}>
                  <Icon className="h-4 w-4" />
                  {g}
                </div>
                <div className="space-y-2">
                  {list.map((a) => (
                    <div
                      key={a._id}
                      className={`rounded-lg border p-3 ${meta.bg}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {a.product?.name || 'Product'}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            {a.message}
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            {timeAgo(a.created_at)}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <button
                            onClick={() => onDismiss?.(a)}
                            disabled={busyId === a._id}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" />
                            Dismiss
                          </button>
                          <button
                            onClick={() => onAction?.(a)}
                            disabled={busyId === a._id}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Action
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

