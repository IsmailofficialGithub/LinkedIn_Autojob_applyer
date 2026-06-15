import { Alert, Button, MenuItem, TextField } from '@mui/material'
import { ArrowLeft, ArrowRight, Check, FileText, KeyRound, Link } from 'lucide-react'
import { useState } from 'react'
import { apiClient } from '../lib/apiClient'
import { getErrorMessage } from '../lib/errorHandler'
import { useOnboarding } from '../hooks/useOnboarding'

const workModes = ['remote', 'hybrid', 'onsite']

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
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('remote')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loadingAction, setLoadingAction] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  const steps = onboarding?.steps || {}
  const currentStep = setupSteps[activeStep]
  const currentComplete = Boolean(steps[currentStep.completeKey])
  const completedCount = setupSteps.filter((step) => steps[step.completeKey]).length

  const runAction = async (key, task, successMessage, options = {}) => {
    setError('')
    setNotice('')
    setLoadingAction(key)

    try {
      await task()
      await refreshOnboarding()
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

  const saveKeywords = () =>
    runAction(
      'keywords',
      async () => {
        const keywordList = keywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)

        if (keywordList.length === 0) throw new Error('Add at least one keyword.')

        await apiClient.post('/keyword-sets', {
          keywords: keywordList,
          filters: {
            location,
            workMode,
          },
        })
      },
      'Keywords saved.',
    )

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-600">Account setup</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              Complete your setup
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Finish these steps once. After that, your dashboard opens automatically.
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={steps.linkedinConnected ? 'outlined' : 'contained'}
                  onClick={connectLinkedin}
                  disabled={loadingAction === 'linkedin'}
                >
                  {loadingAction === 'linkedin'
                    ? 'Working...'
                    : steps.linkedinConnected
                      ? 'Reconnect LinkedIn'
                      : 'Connect LinkedIn'}
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
                disabled={loadingAction === 'keywords' || !keywords.trim()}
              >
                Save keywords
              </Button>
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
