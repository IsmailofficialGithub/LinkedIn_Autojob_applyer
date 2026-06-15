import { Link } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle'
import { metadata } from '../../config/metadata'

export function AuthLayout({ children, title, subtitle, footerText, footerAction, footerTo }) {
  return (
    <main className="grid min-h-screen bg-[var(--surface-page)] lg:grid-cols-[1fr_520px]">
      <section className="hidden border-r border-[var(--border-subtle)] bg-[var(--surface-panel)] p-10 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <img
            src={metadata.company.logoUrl}
            alt=""
            className="h-10 w-10 rounded-lg border border-[var(--border-subtle)] bg-white"
          />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {metadata.company.shortName}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{metadata.company.productStatus}</p>
          </div>
        </div>

        <div className="my-auto max-w-xl">
          <p className="text-sm font-semibold text-brand-600">Recruiter outreach workflow</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {metadata.company.tagline}
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)]">
            Upload your resume, save job content, extract recruiter emails, and keep sending under
            your own controls.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col p-4 sm:p-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{title}</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            </div>
            {children}
          </div>
          <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            {footerText}{' '}
            <Link to={footerTo} className="font-semibold text-brand-600 hover:text-brand-700">
              {footerAction}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
