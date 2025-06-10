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
        const res = await fetch('https://anthroposcity-tokens.anthroposcity.workers.dev/visitorCount')
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data = await res.json()
        setCount(data.count)
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
