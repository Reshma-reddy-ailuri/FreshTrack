import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://freshtrack-6jri.onrender.com/api/freshtrack'

export default function useAlerts({ auto = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(auto))
  const [error, setError] = useState(null)

  const fetchAlerts = async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/alerts`, { signal })
      setData(res.data)
    } catch (e) {
      if (e.name === 'CanceledError') return
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!auto) return
    const controller = new AbortController()
    fetchAlerts(controller.signal)
    return () => controller.abort()
  }, [auto])

  const actionAlert = async (id, action) => {
    const res = await axios.post(`${API_BASE}/alerts/${id}/action`, { action })
    return res.data
  }

  return { data, loading, error, refresh: () => fetchAlerts(), actionAlert }
}

