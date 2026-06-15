import { useCallback, useMemo, useState } from 'react'

export const useLoadingManager = () => {
  const [loadingKeys, setLoadingKeys] = useState(() => new Set())

  const startLoading = useCallback((key = 'global') => {
    setLoadingKeys((current) => new Set(current).add(key))
  }, [])

  const stopLoading = useCallback((key = 'global') => {
    setLoadingKeys((current) => {
      const next = new Set(current)
      next.delete(key)
      return next
    })
  }, [])

  const withLoading = useCallback(
    async (key, task) => {
      startLoading(key)
      try {
        return await task()
      } finally {
        stopLoading(key)
      }
    },
    [startLoading, stopLoading],
  )

  return useMemo(
    () => ({
      isLoading: loadingKeys.size > 0,
      loadingKeys,
      startLoading,
      stopLoading,
      withLoading,
    }),
    [loadingKeys, startLoading, stopLoading, withLoading],
  )
}
