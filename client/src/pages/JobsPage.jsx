import { Alert, Button, MenuItem, TextField } from '@mui/material'
import { BriefcaseBusiness, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { getErrorMessage } from '../lib/errorHandler'

const sourceTypes = [
  { value: 'linkedin_job', label: 'LinkedIn job' },
  { value: 'linkedin_post', label: 'LinkedIn post' },
]

function formatDate(value) {
  if (!value) return 'No date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [sourceType, setSourceType] = useState('linkedin_job')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const activeJobs = useMemo(() => jobs.filter((job) => !job.deletedAt), [jobs])

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get('/job-submissions')
      setJobs(data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadJobs()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadJobs])

  const submitJob = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      await apiClient.post('/job-submissions', {
        sourceType,
        url,
        content,
      })
      setUrl('')
      setContent('')
      setNotice('Job content saved. Recruiter emails will be extracted when found.')
      await loadJobs()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">Job sources</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Submit LinkedIn job or post content
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Paste a LinkedIn URL and page/post text. The backend extracts recruiter emails and
              creates queue items when emails are found.
            </p>
          </div>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={loadJobs}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </section>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? <Alert severity="success">{notice}</Alert> : null}

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
        <form className="space-y-4" onSubmit={submitJob}>
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <TextField
              select
              label="Source type"
              value={sourceType}
              onChange={(event) => setSourceType(event.target.value)}
            >
              {sourceTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="LinkedIn URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              required
            />
          </div>
          <TextField
            fullWidth
            multiline
            minRows={7}
            label="Pasted content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste the job description or LinkedIn post text here."
            required
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<BriefcaseBusiness size={16} />}
            disabled={saving || !url.trim() || !content.trim()}
          >
            {saving ? 'Saving...' : 'Save job content'}
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]">
        <div className="border-b border-[var(--border-subtle)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Submitted jobs
          </h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">Loading submitted jobs...</p>
        ) : activeJobs.length === 0 ? (
          <p className="p-5 text-sm text-[var(--text-secondary)]">No job content submitted yet.</p>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {sourceTypes.find((type) => type.value === job.sourceType)?.label ||
                      job.sourceType}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{job.url}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{formatDate(job.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
