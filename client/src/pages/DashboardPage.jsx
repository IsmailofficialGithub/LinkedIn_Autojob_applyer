import { metadata } from '../config/metadata'

const setupSteps = [
  'Create account and connect LinkedIn identity',
  'Upload PDF or DOCX resume',
  'Add Gmail app password and email template',
  'Submit LinkedIn job/post content',
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink-200 bg-white p-6">
        <p className="text-sm font-medium text-brand-600">{metadata.company.productStatus}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
          {metadata.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ink-500">{metadata.description}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {setupSteps.map((step, index) => (
          <div key={step} className="rounded-lg border border-ink-200 bg-white p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-sm font-semibold text-brand-700">
              {index + 1}
            </span>
            <h2 className="mt-4 text-base font-semibold text-ink-900">{step}</h2>
            <p className="mt-2 text-sm text-ink-500">Ready for frontend wiring.</p>
          </div>
        ))}
      </section>
    </div>
  )
}
