import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/freshtrack'

export default function useExpiryData({ filter = 'all', category = '', search = '', page = 1, limit = 20 } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const params = useMemo(
    () => ({ filter, category, search, page, limit }),
    [filter, category, search, page, limit],
  )

  const refresh = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/expiry-list`, { params, signal })
      setData(res.data)
    } catch (e) {
      if (e.name === 'CanceledError') return
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    refresh(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  return { data, loading, error, refresh: () => refresh() }
}

