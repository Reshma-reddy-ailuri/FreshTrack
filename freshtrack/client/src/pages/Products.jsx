import { useState } from 'react'
import ExpiryTable from '../components/ExpiryTable.jsx'
import useExpiryData from '../hooks/useExpiryData.js'

export default function Products() {
  const [state, setState] = useState({ category: '', filter: 'all', search: '' })

  const expiry = useExpiryData({
    filter: state.filter,
    category: state.category,
    search: state.search,
    page: 1,
    limit: 35,
  })

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold text-slate-900">Products</div>
        <div className="mt-1 text-sm text-slate-600">
          Browse all inventory batches and filter by category/expiry/search.
        </div>
      </div>

      <ExpiryTable
        items={expiry.data?.items || []}
        loading={expiry.loading}
        error={expiry.error}
        category={state.category}
        filter={state.filter}
        search={state.search}
        onChange={(next) => setState((s) => ({ ...s, ...next }))}
      />
    </div>
  )
}

