import { useMemo, useState } from 'react'
import { Search, ArrowUpDown, Filter } from 'lucide-react'
import { formatDate } from '../utils/dateUtils.js'
import { getStatusColor } from '../utils/riskUtils.js'

const ranges = [
  { value: 'all', label: 'All' },
  { value: '7', label: 'Expiring ≤ 7 days' },
  { value: '30', label: 'Expiring ≤ 30 days' },
  { value: 'expired', label: 'Expired' },
]

function SortHeader({ label, sortKey, activeKey, direction, onSort }) {
  const active = sortKey === activeKey
  return (
    <button
      className={[
        'inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide',
        active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
      ].join(' ')}
      onClick={() => onSort(sortKey)}
      type="button"
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
      {active ? (
        <span className="sr-only">{direction === 'asc' ? 'ascending' : 'descending'}</span>
      ) : null}
    </button>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-4 w-full rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  )
}

export default function ExpiryTable({
  items = [],
  loading = false,
  error = null,
  category = '',
  filter = 'all',
  search = '',
  onChange,
}) {
  const categories = useMemo(() => {
    const set = new Set(items.map((r) => r.product?.category).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  const [sortKey, setSortKey] = useState('days_remaining')
  const [direction, setDirection] = useState('asc')

  const sorted = useMemo(() => {
    const dir = direction === 'asc' ? 1 : -1
    const copy = [...items]
    copy.sort((a, b) => {
      const av =
        sortKey === 'product'
          ? a.product?.name || ''
          : sortKey === 'category'
            ? a.product?.category || ''
            : sortKey === 'expiry_date'
              ? new Date(a.expiry_date).getTime()
              : sortKey === 'quantity'
                ? Number(a.quantity || 0)
                : Number(a.days_remaining || 0)
      const bv =
        sortKey === 'product'
          ? b.product?.name || ''
          : sortKey === 'category'
            ? b.product?.category || ''
            : sortKey === 'expiry_date'
              ? new Date(b.expiry_date).getTime()
              : sortKey === 'quantity'
                ? Number(b.quantity || 0)
                : Number(b.days_remaining || 0)

      if (typeof av === 'string') return av.localeCompare(String(bv)) * dir
      return (av - bv) * dir
    })
    return copy
  }, [items, sortKey, direction])

  const onSort = (key) => {
    if (key === sortKey) setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setDirection(key === 'product' || key === 'category' ? 'asc' : 'asc')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Filter className="h-4 w-4 text-primary" />
          Expiry Tracking
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={category}
            onChange={(e) => onChange?.({ category: e.target.value, filter, search })}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filter}
            onChange={(e) => onChange?.({ category, filter: e.target.value, search })}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/30"
          >
            {ranges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onChange?.({ category, filter, search: e.target.value })}
              placeholder="Search product..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 sm:w-64"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-4 text-sm text-danger">
          Failed to load expiry list. Please retry after the server is running.
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead className="sticky top-0 bg-slate-50">
            <tr className="text-left">
              <th className="px-3 py-3">
                <SortHeader label="Product" sortKey="product" activeKey={sortKey} direction={direction} onSort={onSort} />
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Category" sortKey="category" activeKey={sortKey} direction={direction} onSort={onSort} />
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Batch
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Qty" sortKey="quantity" activeKey={sortKey} direction={direction} onSort={onSort} />
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Expiry Date" sortKey="expiry_date" activeKey={sortKey} direction={direction} onSort={onSort} />
              </th>
              <th className="px-3 py-3">
                <SortHeader label="Days Remaining" sortKey="days_remaining" activeKey={sortKey} direction={direction} onSort={onSort} />
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-600">
                  No matching inventory batches. Try changing filters or search.
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const color = getStatusColor(row.days_remaining)
                return (
                  <tr
                    key={row._id}
                    className={[color.row, 'transition hover:bg-slate-50/70'].join(' ')}
                  >
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {row.product?.name}
                      </div>
                      <div className="text-xs text-slate-500">{row.product?.brand}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700">
                      {row.product?.category}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700">{row.batch_no}</td>
                    <td className="px-3 py-3 text-sm font-medium text-slate-900">
                      {row.quantity}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700">{row.location}</td>
                    <td className="px-3 py-3 text-sm text-slate-700">
                      {formatDate(row.expiry_date)}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-slate-900">
                      {row.days_remaining}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={[
                          'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                          color.badge,
                        ].join(' ')}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-slate-500">
                        {row.days_remaining < 0 ? 'Dispose' : 'Promote'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

