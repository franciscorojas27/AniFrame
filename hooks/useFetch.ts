import { useState, useEffect, useCallback } from 'react'

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error ${response.status}`)
      const json = await response.json()
      setData(json)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
