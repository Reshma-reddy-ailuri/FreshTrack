export default function StatCard({
  title,
  value,
  subtitle,
  tone = 'default', // default|danger|warning|safe|yellow
  loading = false,
}) {
  const toneStyles = {
    default: 'border-slate-200',
    danger: 'border-danger/30 bg-red-50',
    warning: 'border-warning/30 bg-orange-50',
    yellow: 'border-yellow-500/30 bg-yellow-50',
    safe: 'border-safe/30 bg-green-50',
  }

  return (
    <div
      className={[
        'rounded-xl border p-4',
        'bg-white',
        toneStyles[tone] || toneStyles.default,
      ].join(' ')}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200" />
      ) : (
        <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      )}
      {subtitle ? (
        <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
      ) : null}
    </div>
  )
}

