import { Alert, Button } from '@mui/material'
import { Mail, RefreshCw, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { getErrorMessage } from '../lib/errorHandler'

function formatDate(value) {
  if (!value) return 'No date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function StatusPill({ status }) {
  const tone =
    status === 'sent'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
      : status === 'failed'
        ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
        : 'bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100'

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>
}

export function EmailPage() {
  const [queue, setQueue] = useState([])
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const activeQueue = useMemo(() => queue.filter((item) => !item.deletedAt), [queue])
  const activeRecruiters = useMemo(
    () => recruiters.filter((item) => !item.deletedAt),
    [recruiters],
  )

  const loadOutreach = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [queueResponse, recruiterResponse] = await Promise.all([
        apiClient.get('/email-queue'),
        apiClient.get('/recruiter-emails'),
      ])
      setQueue(queueResponse.data.data || [])
      setRecruiters(recruiterResponse.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadOutreach()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadOutreach])

  const sendQueueItem = async (id) => {
    setSendingId(id)
    setError('')
    setNotice('')

    try {
      await apiClient.post(`/email-queue/${id}/send`)
      setNotice('Email queue item processed.')
      await loadOutreach()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSendingId('')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">Outreach review</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Review recruiter emails and queue
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Check extracted recruiters, pending emails, and send individual queue items.
            </p>
          </div>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={loadOutreach}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </section>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? <Alert severity="success">{notice}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">Queue items</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
            {activeQueue.length}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">Recruiter emails</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
            {activeRecruiters.length}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4">
          <p className="text-sm text-[var(--text-secondary)]">Pending sends</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
            {activeQueue.filter((item) => item.status === 'pending').length}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
          <Mail size={18} />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Email queue</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">Loading outreach queue...</p>
        ) : activeQueue.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">No emails are queued yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {activeQueue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {item.recipient}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                    {item.subject || 'No subject saved'} - {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={item.status || 'pending'} />
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Send size={15} />}
                    onClick={() => sendQueueItem(item.id)}
                    disabled={sendingId === item.id || item.status === 'sent'}
                  >
                    {sendingId === item.id ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]">
        <div className="border-b border-[var(--border-subtle)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Recruiter emails
          </h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">Loading recruiters...</p>
        ) : activeRecruiters.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">
            No recruiter emails extracted yet.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {activeRecruiters.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.email}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {item.source || 'manual'} - {formatDate(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
