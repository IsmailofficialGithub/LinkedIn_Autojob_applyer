import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../common/LoadingState'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--surface-page)] p-4">
        <LoadingState label="Checking your session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return <Outlet />
}
