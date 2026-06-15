import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { metadata } from '../config/metadata'
import { apiClient } from '../lib/apiClient'
import { getErrorMessage } from '../lib/errorHandler'

const keywordLimit = 5
const pageSize = 5
const emptyList = Object.freeze([])

const endpoints = {
  onboarding: '/onboarding',
  keywordSets: '/keyword-sets',
  emailQueue: '/email-queue',
  jobSubmissions: '/job-submissions',
  recruiterEmails: '/recruiter-emails',
}

const sourceLabels = {
  linkedin_job: 'LinkedIn job',
  linkedin_post: 'LinkedIn post',
}

function useDashboardResource(endpoint, fallback) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await apiClient.get(endpoint)
      setData(response.data.data ?? fallback)
    } catch (err) {
      setError(getErrorMessage(err))
      setData(fallback)
    } finally {
      setLoading(false)
    }
  }, [endpoint, fallback])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [load])

  return { data, loading, error, reload: load }
}

function formatDate(value) {
  if (!value) return 'No date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getActiveItems(items) {
  return items.filter((item) => !item.deletedAt)
}

function getEnabledKeywordSets(items) {
  return getActiveItems(items).filter((item) => item.enabled)
}

function countByStatus(items) {
  return items.reduce((counts, item) => {
    const status = item.status || 'unknown'
    return { ...counts, [status]: (counts[status] || 0) + 1 }
  }, {})
}

function DashboardCard({ label, value, loading, error, icon: Icon, helper }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        {Icon ? (
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Fetching data...</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      ) : (
        <>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
          {helper ? <p className="mt-1 text-xs text-[var(--text-secondary)]">{helper}</p> : null}
        </>
      )}
    </div>
  )
}

function StatusPill({ children, tone = 'default' }) {
  const styles = {
    default: 'bg-[var(--surface-muted)] text-[var(--text-secondary)]',
    good: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    warn: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    info: 'bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  )
}

function Section({ title, action, loading, error, empty, children }) {
  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]">
      <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
        {action ? <div>{action}</div> : null}
      </div>

      {loading ? (
        <div className="p-5 text-sm text-[var(--text-secondary)]">
          Fetching {title.toLowerCase()}...
        </div>
      ) : error ? (
        <div className="p-5 text-sm text-red-500">{error}</div>
      ) : empty ? (
        <div className="p-5 text-sm text-[var(--text-secondary)]">{empty}</div>
      ) : (
        children
      )}
    </section>
  )
}

function RefreshButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:cursor-wait disabled:opacity-70"
    >
      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
      Refresh
    </button>
  )
}

function Pagination({ page, totalPages, onPageChange, total }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-5 py-3 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {page} of {totalPages} - {total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function PaginatedSection({ title, items, loading, error, empty, renderItem, action }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleItems = items.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <Section
      title={title}
      loading={loading}
      error={error}
      empty={items.length === 0 ? empty : ''}
      action={action}
    >
      <div className="divide-y divide-[var(--border-subtle)]">
        {visibleItems.map(renderItem)}
      </div>
      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={items.length}
        onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), totalPages))}
      />
    </Section>
  )
}

function KeywordSetRow({ item }) {
  const filters = Object.entries(item.filters || {}).filter(([, value]) => Boolean(value))

  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {(item.keywords || []).map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-100"
              >
                {keyword}
              </span>
            ))}
          </div>
          {filters.length > 0 ? (
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Filters: {filters.map(([key, value]) => `${key}: ${value}`).join(', ')}
            </p>
          ) : (
            <p className="mt-2 text-xs text-[var(--text-secondary)]">No filters saved</p>
          )}
        </div>
        <StatusPill tone={item.enabled ? 'good' : 'warn'}>
          {item.enabled ? 'Enabled' : 'Disabled'}
        </StatusPill>
      </div>
    </div>
  )
}

function SimpleRow({ title, subtitle, meta, status }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        {subtitle ? (
          <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {meta ? <p className="text-xs text-[var(--text-secondary)]">{meta}</p> : null}
        {status ? <StatusPill tone="info">{status}</StatusPill> : null}
      </div>
    </div>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div
        className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}

function ReadinessPanel({ onboarding, keywordCount, jobCount, queueCount, loading }) {
  const setupItems = [
    Boolean(onboarding?.steps?.linkedinConnected),
    Boolean(onboarding?.steps?.hasResume),
    keywordCount > 0,
    Boolean(onboarding?.optionalSteps?.hasEmailAccount),
    jobCount > 0,
  ]
  const completed = setupItems.filter(Boolean).length
  const score = Math.round((completed / setupItems.length) * 100)

  const nextAction = !onboarding?.steps?.linkedinConnected
    ? 'Connect LinkedIn identity'
    : !onboarding?.steps?.hasResume
      ? 'Upload or create resume'
      : keywordCount === 0
        ? 'Save keywords'
        : !onboarding?.optionalSteps?.hasEmailAccount
          ? 'Add Gmail sender'
          : jobCount === 0
            ? 'Submit job content'
            : queueCount === 0
              ? 'Extract recruiter emails'
              : 'Review queued emails'

  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">Automation readiness</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
            {loading ? 'Checking setup...' : `${score}% ready`}
          </h2>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100">
          {score === 100 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={loading ? 15 : score} />
      </div>
      <div className="mt-4 rounded-md bg-[var(--surface-muted)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Next best action
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{nextAction}</p>
      </div>
    </section>
  )
}

function QueueBreakdown({ counts, loading, error }) {
  const statuses = [
    ['pending', 'Pending'],
    ['sent', 'Sent'],
    ['failed', 'Failed'],
    ['skipped_limit', 'Limit skipped'],
  ]

  return (
    <Section title="Queue breakdown" loading={loading} error={error}>
      <div className="grid grid-cols-2 gap-3 p-5">
        {statuses.map(([key, label]) => (
          <div key={key} className="rounded-md bg-[var(--surface-muted)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">{label}</p>
            <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              {counts[key] || 0}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}

function QuickActions({ keywordCount }) {
  const actions = [
    {
      label: keywordCount >= keywordLimit ? 'Keyword limit reached' : 'Manage setup',
      description: `${keywordCount}/${keywordLimit} keyword sets saved`,
      to: '/setup',
      icon: Search,
      primary: false,
    },
    {
      label: 'Add job content',
      description: 'Paste LinkedIn job or post content',
      to: '/jobs',
      icon: BriefcaseBusiness,
      primary: true,
    },
    {
      label: 'Review outreach',
      description: 'Check queue before sending',
      to: '/email',
      icon: Send,
      primary: false,
    },
  ]

  return (
    <section className="overflow-hidden rounded-lg border border-brand-600/30 bg-[var(--surface-panel)]">
      <div className="border-b border-brand-600/20 bg-[var(--brand-soft)] px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">
              Command center
            </p>
            <h2 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
              Quick actions
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Jump straight into the next workflow.</p>
        </div>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              to={action.to}
              className={`group flex min-h-32 flex-col justify-between rounded-lg border p-4 transition hover:-translate-y-0.5 ${
                action.primary
                  ? 'border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-page)] hover:border-brand-600/50 hover:bg-[var(--surface-muted)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-md ${
                    action.primary
                      ? 'bg-white/15 text-white'
                      : 'bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100'
                  }`}
                >
                  <Icon size={19} />
                </span>
                <ArrowRight
                  size={18}
                  className={`transition group-hover:translate-x-1 ${
                    action.primary ? 'text-white' : 'text-[var(--text-secondary)]'
                  }`}
                />
              </div>
              <div className="mt-5">
                <p
                  className={`text-sm font-semibold ${
                    action.primary ? 'text-white' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {action.label}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    action.primary ? 'text-white/80' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function SetupChecklist({ onboarding, keywordCount, jobCount, loading, error }) {
  const steps = [
    {
      label: 'LinkedIn identity',
      status: onboarding?.steps?.linkedinConnected ? 'Connected' : 'Required',
      complete: Boolean(onboarding?.steps?.linkedinConnected),
    },
    {
      label: 'Resume upload',
      status: onboarding?.steps?.hasResume ? 'Active resume' : 'PDF or DOCX',
      complete: Boolean(onboarding?.steps?.hasResume),
    },
    {
      label: 'Keywords',
      status: `${keywordCount}/${keywordLimit} saved`,
      complete: keywordCount > 0,
    },
    {
      label: 'Gmail sender',
      status: onboarding?.optionalSteps?.hasEmailAccount ? 'Connected' : 'App password',
      complete: Boolean(onboarding?.optionalSteps?.hasEmailAccount),
    },
    {
      label: 'Job submissions',
      status: jobCount > 0 ? `${jobCount} submitted` : 'Add content',
      complete: jobCount > 0,
    },
  ]

  return (
    <Section title="Setup checklist" loading={loading} error={error}>
      <div className="divide-y divide-[var(--border-subtle)]">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold ${
                  step.complete
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100'
                }`}
              >
                {index + 1}
              </span>
              <p className="min-w-0 text-sm font-medium text-[var(--text-primary)]">
                {step.label}
              </p>
            </div>
            <StatusPill tone={step.complete ? 'good' : 'warn'}>{step.status}</StatusPill>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function DashboardPage() {
  const onboarding = useDashboardResource(endpoints.onboarding, null)
  const keywordSets = useDashboardResource(endpoints.keywordSets, emptyList)
  const emailQueue = useDashboardResource(endpoints.emailQueue, emptyList)
  const jobSubmissions = useDashboardResource(endpoints.jobSubmissions, emptyList)
  const recruiterEmails = useDashboardResource(endpoints.recruiterEmails, emptyList)

  const activeKeywords = useMemo(() => getEnabledKeywordSets(keywordSets.data), [keywordSets.data])
  const activeQueue = useMemo(() => getActiveItems(emailQueue.data), [emailQueue.data])
  const activeJobs = useMemo(() => getActiveItems(jobSubmissions.data), [jobSubmissions.data])
  const activeRecruiters = useMemo(
    () => getActiveItems(recruiterEmails.data),
    [recruiterEmails.data],
  )
  const queueCounts = useMemo(() => countByStatus(activeQueue), [activeQueue])
  const reloadOnboarding = onboarding.reload
  const reloadKeywordSets = keywordSets.reload
  const reloadEmailQueue = emailQueue.reload
  const reloadJobSubmissions = jobSubmissions.reload
  const reloadRecruiterEmails = recruiterEmails.reload
  const loadingAny =
    onboarding.loading ||
    keywordSets.loading ||
    emailQueue.loading ||
    jobSubmissions.loading ||
    recruiterEmails.loading
  const refreshAll = useCallback(() => {
    reloadOnboarding()
    reloadKeywordSets()
    reloadEmailQueue()
    reloadJobSubmissions()
    reloadRecruiterEmails()
  }, [
    reloadEmailQueue,
    reloadJobSubmissions,
    reloadKeywordSets,
    reloadOnboarding,
    reloadRecruiterEmails,
  ])

  const metricCards = [
    {
      label: 'Queued emails',
      value: activeQueue.length,
      loading: emailQueue.loading,
      error: emailQueue.error,
      icon: Clock3,
      helper: `${queueCounts.pending || 0} pending`,
    },
    {
      label: 'Submitted jobs',
      value: activeJobs.length,
      loading: jobSubmissions.loading,
      error: jobSubmissions.error,
      icon: BriefcaseBusiness,
      helper: 'Manual LinkedIn sources',
    },
    {
      label: 'Recruiter emails',
      value: activeRecruiters.length,
      loading: recruiterEmails.loading,
      error: recruiterEmails.error,
      icon: Send,
      helper: `${activeQueue.length} queue records`,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] px-5 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
              <Sparkles size={16} />
              {metadata.company.productStatus}
            </div>
            <RefreshButton onClick={refreshAll} loading={loadingAny} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {metadata.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                {metadata.description}
              </p>
            </div>
          </div>
          <Link
            to="/jobs"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
          >
            <BriefcaseBusiness size={17} />
            Add job content
          </Link>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 md:grid-cols-3">
        {metricCards.map((metric) => (
          <DashboardCard key={metric.label} {...metric} />
        ))}
      </section>

      <QuickActions keywordCount={activeKeywords.length} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <PaginatedSection
            title="Saved keywords"
            items={activeKeywords}
            loading={keywordSets.loading}
            error={keywordSets.error}
            empty="No keyword sets saved yet."
            action={
              <StatusPill tone={activeKeywords.length >= keywordLimit ? 'warn' : 'info'}>
                {activeKeywords.length}/{keywordLimit} saved
              </StatusPill>
            }
            renderItem={(item) => <KeywordSetRow key={item.id} item={item} />}
          />

          <PaginatedSection
            title="Submitted jobs"
            items={activeJobs}
            loading={jobSubmissions.loading}
            error={jobSubmissions.error}
            empty="No job or post content has been submitted yet."
            renderItem={(item) => (
              <SimpleRow
                key={item.id}
                title={sourceLabels[item.sourceType] || item.sourceType || 'Job submission'}
                subtitle={item.url}
                meta={formatDate(item.createdAt)}
                status={item.status || 'submitted'}
              />
            )}
          />
        </div>

        <div className="space-y-6">
          <ReadinessPanel
            onboarding={onboarding.data}
            keywordCount={activeKeywords.length}
            jobCount={activeJobs.length}
            queueCount={activeQueue.length}
            loading={onboarding.loading}
          />

          <SetupChecklist
            onboarding={onboarding.data}
            keywordCount={activeKeywords.length}
            jobCount={activeJobs.length}
            loading={onboarding.loading}
            error={onboarding.error}
          />

          <QueueBreakdown
            counts={queueCounts}
            loading={emailQueue.loading}
            error={emailQueue.error}
          />

          <PaginatedSection
            title="Recruiter emails"
            items={activeRecruiters}
            loading={recruiterEmails.loading}
            error={recruiterEmails.error}
            empty="No recruiter emails found yet."
            renderItem={(item) => (
              <SimpleRow
                key={item.id}
                title={item.email}
                subtitle={item.source || 'manual'}
                meta={formatDate(item.createdAt)}
              />
            )}
          />

          <PaginatedSection
            title="Email queue"
            items={activeQueue}
            loading={emailQueue.loading}
            error={emailQueue.error}
            empty="No emails are queued yet."
            renderItem={(item) => (
              <SimpleRow
                key={item.id}
                title={item.recipient}
                subtitle={item.subject || 'No subject saved'}
                meta={formatDate(item.createdAt)}
                status={item.status || 'pending'}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
