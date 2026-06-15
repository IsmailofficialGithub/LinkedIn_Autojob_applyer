import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient, onUnauthorized, setAuthToken } from '../lib/apiClient'
import { AuthContext } from './authContext'

const TOKEN_KEY = 'autolinkedapply-access-token'
const USER_KEY = 'autolinkedapply-user'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearAuth = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setSession(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let mounted = true

    const restoreSession = async () => {
      const token = window.localStorage.getItem(TOKEN_KEY)
      const storedUser = window.localStorage.getItem(USER_KEY)

      if (!token) {
        setLoading(false)
        return
      }

      setAuthToken(token)

      try {
        const { data } = await apiClient.get('/auth/session')
        if (!mounted) return

        const nextUser = data.data.user
        setSession({ accessToken: token })
        setUser(nextUser)
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      } catch {
        clearAuth()
        if (mounted && storedUser) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    restoreSession()

    return () => {
      mounted = false
    }
  }, [clearAuth])

  useEffect(() => onUnauthorized(clearAuth), [clearAuth])

  const applyAuthData = useCallback((authData) => {
    const token = authData.session?.accessToken

    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token)
      window.localStorage.setItem(USER_KEY, JSON.stringify(authData.user))
      setAuthToken(token)
    }

    setSession(authData.session)
    setUser(authData.user)
    return authData
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data } = await apiClient.post('/auth/signin', { email, password })
    return applyAuthData(data.data)
  }, [applyAuthData])

  const signUp = useCallback(async ({ email, password }) => {
    const { data } = await apiClient.post('/auth/signup', { email, password })
    return applyAuthData(data.data)
  }, [applyAuthData])

  const signOut = useCallback(async () => {
    clearAuth()
  }, [clearAuth])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
    }),
    [session, user, loading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
