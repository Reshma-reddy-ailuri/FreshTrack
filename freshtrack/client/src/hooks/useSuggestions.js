import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/freshtrack'

export default function useSuggestions({ regenerate = false } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSuggestions = async (signal, regen = regenerate) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/suggestions`, {
        params: { regenerate: String(regen) },
        signal,
      })
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
    fetchSuggestions(controller.signal, regenerate)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regenerate])

  return { data, loading, error, refresh: (regen = false) => fetchSuggestions(undefined, regen) }
}

