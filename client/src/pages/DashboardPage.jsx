import { metadata } from '../config/metadata'

const setupSteps = [
  { label: 'LinkedIn identity', status: 'Required' },
  { label: 'Resume upload', status: 'PDF or DOCX' },
  { label: 'Gmail sender', status: 'App password' },
  { label: 'Job submissions', status: 'Manual content' },
]

const metrics = [
  { label: 'Queued emails', value: '0' },
  { label: 'Submitted jobs', value: '0' },
  { label: 'Recruiter emails', value: '0' },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-600">{metadata.company.productStatus}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metadata.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
              {metadata.description}
            </p>
          </div>
          <button className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 md:w-auto">
            Add job content
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4"
          >
            <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]">
        <div className="border-b border-[var(--border-subtle)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Setup checklist</h2>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {setupSteps.map((step, index) => (
            <div key={step.label} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--brand-soft)] text-sm font-semibold text-brand-700 dark:text-brand-100">
              {index + 1}
                </span>
                <p className="text-sm font-medium text-[var(--text-primary)]">{step.label}</p>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{step.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
