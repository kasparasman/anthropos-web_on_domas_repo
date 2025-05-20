// hooks/useVisitorCount.ts
import { useState, useEffect } from 'react'

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCount() {
      try {
        setLoading(true)
        // TODO: replace with real fetch, e.g.:
        // cores = await fetch('/api/visitor-count')
        // const data = await res.json()
        // setCount(data.count)
        await new Promise((r) => setTimeout(r, 500))  // simulate network
        setCount(123)                                 // mock value
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCount()
  }, [])

  return { count, isLoading, error }
}
