import { useState } from 'react'
import { Sparkles, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import SuggestionCard from '../components/SuggestionCard.jsx'
import useSuggestions from '../hooks/useSuggestions.js'
import useAlerts from '../hooks/useAlerts.js'

function SkeletonCard() {
  return <div className="h-56 animate-pulse rounded-xl bg-slate-200" />
}

export default function Suggestions() {
  const suggestions = useSuggestions({ regenerate: false })
  const alerts = useAlerts({ auto: false })
  const [busy, setBusy] = useState(null)

  const items = suggestions.data?.items || []

  const regenerate = async () => {
    try {
      await suggestions.refresh(true)
      toast.success('Suggestions regenerated')
    } catch {
      toast.error('Failed to regenerate suggestions')
    }
  }

  const markActioned = async (item) => {
    if (!item.alert_id) {
      toast.error('No alert found for this suggestion yet. Refresh and try again.')
      return
    }
    setBusy(item.inventory_id)
    try {
      await alerts.actionAlert(item.alert_id, 'actioned')
      toast.success('Marked as actioned')
      await suggestions.refresh(false)
    } catch {
      toast.error('Failed to action suggestion. Is the server running?')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggestions
          </div>
          <div className="mt-1 text-sm text-slate-600">
            AI-powered sales actions for products expiring within 30 days.
          </div>
        </div>
        <button
          onClick={regenerate}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Regenerate
        </button>
      </div>

      {suggestions.error ? (
        <div className="rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger">
          Failed to load suggestions. Start the backend server and try again.
        </div>
      ) : null}

      {suggestions.loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <div className="text-sm font-semibold text-slate-900">
            No near-expiry products found
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Seed the database and ensure the backend is connected to MongoDB.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <SuggestionCard
              key={item.inventory_id}
              item={item}
              onAction={markActioned}
              busy={busy === item.inventory_id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

