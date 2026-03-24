import {
  Tag,
  Package,
  Megaphone,
  ShoppingCart,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { formatINR } from '../utils/dateUtils.js'
import { riskBadgeClasses } from '../utils/riskUtils.js'

const typeMeta = {
  discount: { icon: Tag, label: 'Discount' },
  bundle: { icon: Package, label: 'Bundle' },
  promote: { icon: Megaphone, label: 'Promote' },
  reposition: { icon: ShoppingCart, label: 'Reposition' },
  procurement_alert: { icon: Bell, label: 'Procurement' },
}

function ConfidenceBar({ value = 0.6, label = 'Medium' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const color =
    label === 'High'
      ? 'bg-safe'
      : label === 'Low'
        ? 'bg-warning'
        : 'bg-primary'
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Confidence</span>
        <span className="font-semibold text-slate-700">{label}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function SuggestionCard({ item, onAction, busy = false }) {
  const meta = typeMeta[item.suggestion_type] || typeMeta.promote
  const Icon = meta.icon

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {item.product?.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {item.product?.category}
            </span>
            <span
              className={[
                'rounded-full border px-2.5 py-1 text-xs font-semibold',
                riskBadgeClasses(item.risk?.label),
              ].join(' ')}
            >
              {item.risk?.label} Risk
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {meta.label}
            </span>
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 text-sm leading-6 text-slate-700">
        {item.suggestion_text}
      </div>

      <ConfidenceBar value={item.confidence_value} label={item.confidence} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Units at risk
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {item.units_at_risk}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Est. revenue loss
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {formatINR(item.estimated_revenue_loss)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {item.risk?.days_to_expiry < 0
            ? `${Math.abs(item.risk?.days_to_expiry)} days expired`
            : `${item.risk?.days_to_expiry} days to expiry`}
        </div>
        <button
          onClick={() => onAction?.(item)}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as Actioned
        </button>
      </div>
    </div>
  )
}

