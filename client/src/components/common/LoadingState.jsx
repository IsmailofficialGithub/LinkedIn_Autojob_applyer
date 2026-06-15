export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4 text-sm text-[var(--text-secondary)]">
      {label}
    </div>
  )
}
