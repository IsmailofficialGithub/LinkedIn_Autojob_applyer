import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-lg border border-ink-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">This page does not exist yet.</p>
      <Link
        to="/"
        className="mt-4 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </section>
  )
}
