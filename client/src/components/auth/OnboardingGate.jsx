import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useOnboarding } from '../../hooks/useOnboarding'
import { metadata } from '../../config/metadata'

export function OnboardingGate() {
  const location = useLocation()
  const { isComplete, loading, onboarding } = useOnboarding()

  if (loading || !onboarding) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--surface-page)] p-4">
        <div className="w-full max-w-md rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-6 text-center shadow-sm">
          <img
            src={metadata.company.logoUrl}
            alt=""
            className="mx-auto h-12 w-12 rounded-lg border border-[var(--border-subtle)] bg-white"
          />
          <h1 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
            Preparing your setup
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            We are checking your account progress and getting the next step ready.
          </p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-600" />
          </div>
        </div>
      </div>
    )
  }

  if (!isComplete && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  return <Outlet />
}
