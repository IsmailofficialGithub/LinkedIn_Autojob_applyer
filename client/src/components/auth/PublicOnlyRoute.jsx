import { Navigate, Outlet } from 'react-router-dom'
import { LoadingState } from '../common/LoadingState'
import { useAuth } from '../../hooks/useAuth'

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--surface-page)] p-4">
        <LoadingState label="Loading auth page" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
