import { Alert, Button, MenuItem, TextField } from '@mui/material'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  KeyRound,
  Link,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { getErrorMessage } from '../lib/errorHandler'
import { useOnboarding } from '../hooks/useOnboarding'

const workModes = ['remote', 'hybrid', 'onsite']
const keywordLimit = 5

function StepPanel({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100">
          <Icon size={20} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

const setupSteps = [
  {
    id: 'linkedin',
    title: 'Connect LinkedIn',
    description: 'Verify your LinkedIn identity before continuing.',
    icon: Link,
    completeKey: 'linkedinConnected',
  },
  {
    id: 'resume',
    title: 'Upload or create resume',
    description: 'Upload a PDF/DOCX resume, or create a simple PDF from text.',
    icon: FileText,
    completeKey: 'hasResume',
  },
  {
    id: 'keywords',
    title: 'Add keywords',
    description: 'Save at least one keyword set for matching job content.',
    icon: KeyRound,
    completeKey: 'hasKeywords',
  },
]

export function SetupPage() {
  const { onboarding, refreshOnboarding } = useOnboarding()
  const [searchParams] = useSearchParams()
  const [resumeFile, setResumeFile] = useState(null)
  const [activeResume, setActiveResume] = useState(null)
  const [linkedinStatus, setLinkedinStatus] = useState(null)
  const [keywordSets, setKeywordSets] = useState([])
  const [editingKeywordId, setEditingKeywordId] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('remote')
  const [error, setError] = useState(
    searchParams.get('linkedin') === 'failed'
      ? 'LinkedIn connection could not be completed. Please try again from this page.'
      : '',
  )
  const [notice, setNotice] = useState(
    searchParams.get('linkedin') === 'connected' ? 'LinkedIn connected successfully.' : '',
  )
  const [loadingAction, setLoadingAction] = useState('')
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [activeStep, setActiveStep] = useState(0)

  const steps = onboarding?.steps || {}
  const linkedinAccount = linkedinStatus?.connected ? linkedinStatus.account : null
  const activeKeywordSets = useMemo(
    () => keywordSets.filter((set) => set.enabled && !set.deletedAt),
    [keywordSets],
  )
  const currentStep = setupSteps[activeStep]
  const currentComplete = Boolean(steps[currentStep.completeKey])
  const completedCount = setupSteps.filter((step) => steps[step.completeKey]).length

  const loadSetupDetails = useCallback(async () => {
    setLoadingDetails(true)
    try {
      const [linkedinResponse, resumeResponse, keywordResponse] = await Promise.all([
        apiClient.get('/linkedin/status'),
        apiClient.get('/resumes/active'),
        apiClient.get('/keyword-sets'),
      ])
      setLinkedinStatus(linkedinResponse.data.data)
      setActiveResume(resumeResponse.data.data)
      setKeywordSets(keywordResponse.data.data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingDetails(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSetupDetails()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadSetupDetails])

  const refreshSetup = async () => {
    await Promise.all([refreshOnboarding(), loadSetupDetails()])
  }

  const runAction = async (key, task, successMessage, options = {}) => {
    setError('')
    setNotice('')
    setLoadingAction(key)

    try {
      await task()
      await refreshSetup()
      setNotice(successMessage)
      if (options.advance !== false) {
        setActiveStep((current) => Math.min(current + 1, setupSteps.length - 1))
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoadingAction('')
    }
  }

  const connectLinkedin = () =>
    runAction(
      'linkedin',
      async () => {
        const { data } = await apiClient.get('/linkedin/connect')
        window.location.href = data.data.url
      },
      'Opening LinkedIn connection.',
      { advance: false },
    )

  const disconnectLinkedin = () =>
    runAction(
      'linkedin',
      async () => {
        await apiClient.delete('/linkedin/disconnect')
      },
      'LinkedIn disconnected. You can reconnect anytime.',
      { advance: false },
    )

  const uploadResume = () =>
    runAction(
      'resume',
      async () => {
        if (!resumeFile) throw new Error('Choose a PDF or DOCX resume first.')
        const formData = new FormData()
        formData.append('resume', resumeFile)
        await apiClient.post('/resumes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      },
      'Resume saved.',
    )

  const deleteResume = (resumeId) =>
    runAction(
      'resume-delete',
      async () => {
        await apiClient.delete(`/resumes/${resumeId}`)
      },
      'Resume removed.',
      { advance: false },
    )

  const createResume = () =>
    runAction(
      'resume',
      async () => {
        if (!resumeText.trim()) throw new Error('Add resume text first.')

        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF()
        const lines = pdf.splitTextToSize(resumeText.trim(), 180)
        pdf.text(lines, 15, 20)
        const file = new File([pdf.output('blob')], 'created-resume.pdf', {
          type: 'application/pdf',
        })
        const formData = new FormData()
        formData.append('resume', file)
        await apiClient.post('/resumes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      },
      'Resume created and saved.',
    )

  const resetKeywordForm = () => {
    setEditingKeywordId('')
    setKeywords('')
    setLocation('')
    setWorkMode('remote')
  }

  const editKeywordSet = (keywordSet) => {
    setEditingKeywordId(keywordSet.id)
    setKeywords((keywordSet.keywords || []).join(', '))
    setLocation(keywordSet.filters?.location || '')
    setWorkMode(keywordSet.filters?.workMode || 'remote')
  }

  const saveKeywords = () =>
    runAction(
      'keywords',
      async () => {
        const keywordList = keywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)

        if (keywordList.length === 0) throw new Error('Add at least one keyword.')

        const payload = {
          keywords: keywordList,
          filters: {
            location,
            workMode,
          },
        }

        if (editingKeywordId) {
          await apiClient.put(`/keyword-sets/${editingKeywordId}`, payload)
          return
        }

        await apiClient.post('/keyword-sets', payload)
      },
      editingKeywordId ? 'Keywords updated.' : 'Keywords saved.',
      { advance: !editingKeywordId },
    )

  const deleteKeywordSet = (id) =>
    runAction(
      `keyword-delete-${id}`,
      async () => {
        await apiClient.delete(`/keyword-sets/${id}`)
        if (editingKeywordId === id) resetKeywordForm()
      },
      'Keyword set deleted.',
      { advance: false },
    )

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">Account setup</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Manage your setup
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Review LinkedIn, resume, and keyword settings used by your automation workflow.
            </p>
          </div>
          <div className="min-w-48">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {completedCount}/{setupSteps.length} complete
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border-subtle)]">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${(completedCount / setupSteps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? <Alert severity="success">{notice}</Alert> : null}

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-3">
          <div className="space-y-1">
            {setupSteps.map((step, index) => {
              const Icon = step.icon
              const complete = Boolean(steps[step.completeKey])
              const active = index === activeStep
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`flex w-full items-center gap-3 rounded-md p-3 text-left transition ${
                    active
                      ? 'bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                      complete
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300'
                        : 'bg-[var(--surface-muted)]'
                    }`}
                  >
                    {complete ? <Check size={17} /> : <Icon size={17} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{step.title}</span>
                    <span className="block text-xs opacity-80">
                      {complete ? 'Complete' : `Step ${index + 1}`}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="space-y-4">
          {currentStep.id === 'linkedin' ? (
            <StepPanel
              icon={Link}
              title={currentStep.title}
              description={currentStep.description}
            >
              {loadingDetails ? (
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  Loading LinkedIn connection...
                </p>
              ) : null}

              {linkedinAccount ? (
                <div className="mb-4 flex flex-col gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 sm:flex-row sm:items-center">
                  {linkedinAccount.picture ? (
                    <img
                      src={linkedinAccount.picture}
                      alt=""
                      className="h-16 w-16 rounded-full border border-[var(--border-subtle)] object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100">
                      <Link size={28} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {linkedinAccount.name || 'LinkedIn user'}
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                      {linkedinAccount.email || 'No LinkedIn email returned'}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Connected {linkedinAccount.connectedAt ? 'on' : ''}
                      {linkedinAccount.connectedAt
                        ? ` ${new Date(linkedinAccount.connectedAt).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="contained"
                  startIcon={<Link size={17} />}
                  onClick={connectLinkedin}
                  disabled={loadingAction === 'linkedin'}
                  sx={{
                    backgroundColor: '#0A66C2',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#084d93' },
                  }}
                >
                  {loadingAction === 'linkedin'
                    ? 'Working...'
                    : steps.linkedinConnected
                      ? 'Reconnect with LinkedIn'
                      : 'Continue with LinkedIn'}
                </Button>
                {steps.linkedinConnected ? (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={disconnectLinkedin}
                    disabled={loadingAction === 'linkedin'}
                  >
                    Disconnect
                  </Button>
                ) : null}
              </div>
              {steps.linkedinConnected ? (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200">
                  <p className="font-semibold">LinkedIn connected</p>
                  <p className="mt-1">
                    Your LinkedIn identity is verified. You can reconnect or disconnect it here.
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  You will be redirected to LinkedIn, then brought back here after approval.
                </p>
              )}
            </StepPanel>
          ) : null}

          {currentStep.id === 'resume' ? (
            <StepPanel
              icon={FileText}
              title={currentStep.title}
              description={currentStep.description}
            >
              {loadingDetails ? (
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  Loading active resume...
                </p>
              ) : activeResume ? (
                <div className="mb-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Active resume
                      </p>
                      <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                        {activeResume.originalName}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {Math.ceil((activeResume.size || 0) / 1024)} KB -{' '}
                        {activeResume.mimeType?.includes('pdf') ? 'PDF' : 'DOCX'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeResume.previewUrl ? (
                        <Button
                          variant="outlined"
                          startIcon={<ExternalLink size={16} />}
                          href={activeResume.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open preview
                        </Button>
                      ) : null}
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<Trash2 size={16} />}
                        onClick={() => deleteResume(activeResume.id)}
                        disabled={loadingAction === 'resume-delete'}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {activeResume.previewUrl ? (
                    <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-white">
                      <iframe
                        title="Resume preview"
                        src={activeResume.previewUrl}
                        className="h-96 w-full"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-3 text-sm text-[var(--text-secondary)]">
                      <Eye size={16} />
                      Preview is available for PDF resumes. DOCX files can still be used for email attachments.
                    </div>
                  )}
                </div>
              ) : (
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  No active resume uploaded yet.
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                    className="block w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-primary)]"
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={uploadResume}
                    disabled={loadingAction === 'resume' || !resumeFile}
                  >
                    Upload resume
                  </Button>
                </div>
                <div className="space-y-3">
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Create resume from text"
                    value={resumeText}
                    onChange={(event) => setResumeText(event.target.value)}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={createResume}
                    disabled={loadingAction === 'resume' || !resumeText.trim()}
                  >
                    Create PDF resume
                  </Button>
                </div>
              </div>
            </StepPanel>
          ) : null}

          {currentStep.id === 'keywords' ? (
            <StepPanel
              icon={KeyRound}
              title={currentStep.title}
              description={currentStep.description}
            >
              {loadingDetails ? (
                <p className="mb-4 text-sm text-[var(--text-secondary)]">Loading keywords...</p>
              ) : activeKeywordSets.length > 0 ? (
                <div className="mb-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Saved keyword sets
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {activeKeywordSets.length}/{keywordLimit} saved
                    </p>
                  </div>
                  {activeKeywordSets.map((keywordSet) => (
                    <div
                      key={keywordSet.id}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            {(keywordSet.keywords || []).map((keyword) => (
                              <span
                                key={keyword}
                                className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-brand-700 dark:text-brand-100"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-[var(--text-secondary)]">
                            Location: {keywordSet.filters?.location || 'Any'} - Work mode:{' '}
                            {keywordSet.filters?.workMode || 'Any'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit3 size={15} />}
                            onClick={() => editKeywordSet(keywordSet)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Trash2 size={15} />}
                            onClick={() => deleteKeywordSet(keywordSet.id)}
                            disabled={loadingAction === `keyword-delete-${keywordSet.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-4 text-sm text-[var(--text-secondary)]">
                  No keyword sets saved yet.
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-[1fr_180px_160px]">
                <TextField
                  fullWidth
                  label="Keywords"
                  placeholder="React, Node.js, DevOps"
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                  helperText="Separate multiple keywords with commas."
                />
                <TextField
                  fullWidth
                  label="Location"
                  placeholder="Remote, USA"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
                <TextField
                  select
                  fullWidth
                  label="Work mode"
                  value={workMode}
                  onChange={(event) => setWorkMode(event.target.value)}
                >
                  {workModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={saveKeywords}
                disabled={
                  loadingAction === 'keywords' ||
                  !keywords.trim() ||
                  (!editingKeywordId && activeKeywordSets.length >= keywordLimit)
                }
              >
                {editingKeywordId ? 'Update keywords' : 'Save keywords'}
              </Button>
              {editingKeywordId ? (
                <Button sx={{ mt: 2, ml: 1 }} variant="text" onClick={resetKeywordForm}>
                  Cancel edit
                </Button>
              ) : null}
              {!editingKeywordId && activeKeywordSets.length >= keywordLimit ? (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  You have reached the {keywordLimit} keyword set limit. Delete or edit an existing
                  set to continue.
                </p>
              ) : null}
            </StepPanel>
          ) : null}

          <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4">
            <Button
              startIcon={<ArrowLeft size={16} />}
              disabled={activeStep === 0}
              onClick={() => setActiveStep((current) => Math.max(current - 1, 0))}
            >
              Back
            </Button>
            <Button
              endIcon={<ArrowRight size={16} />}
              disabled={!currentComplete || activeStep === setupSteps.length - 1}
              onClick={() => setActiveStep((current) => Math.min(current + 1, setupSteps.length - 1))}
            >
              Next step
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
