export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-500">
      {label}
    </div>
  )
}
