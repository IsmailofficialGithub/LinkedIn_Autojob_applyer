import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../hooks/useAuth'
import { OnboardingContext } from './onboardingContext'

export function OnboardingProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [onboarding, setOnboarding] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshOnboarding = useCallback(async () => {
    if (!isAuthenticated) {
      setOnboarding(null)
      return null
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await apiClient.get('/onboarding')
      setOnboarding(data.data)
      return data.data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshOnboarding()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refreshOnboarding])

  const value = useMemo(
    () => ({
      onboarding,
      loading,
      error,
      refreshOnboarding,
      isComplete: Boolean(onboarding?.complete),
    }),
    [onboarding, loading, error, refreshOnboarding],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
