import { Alert, Button, IconButton, InputAdornment, TextField } from '@mui/material'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { useTimedStatus } from '../hooks/useTimedStatus'
import { getErrorMessage } from '../lib/errorHandler'

const signInMessages = [
  { after: 0, text: 'Connecting securely...' },
  { after: 3000, text: 'Still checking your account. This can take a few seconds.' },
  { after: 5000, text: 'Almost there. Waiting for a secure response.' },
  { after: 9000, text: 'This is taking longer than usual. Please keep this page open.' },
]

export function SignInPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const loadingMessage = useTimedStatus(loading, signInMessages)

  const redirectTo = location.state?.from?.pathname || '/'

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(form)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use your account to continue to the automation dashboard."
      footerText="New here?"
      footerAction="Create an account"
      footerTo="/signup"
    >
      <form onSubmit={handleSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? (
          <Alert severity="info" sx={{ mt: error ? 2 : 0, mb: 2 }}>
            {loadingMessage}
          </Alert>
        ) : null}
        <TextField
          fullWidth
          required
          sx={{ mb: 2.25, mt: error || loading ? 2 : 0 }}
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          required
          sx={{ mb: 2.25 }}
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    edge="end"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button fullWidth size="large" type="submit" variant="contained" disabled={loading}>
          {loading ? loadingMessage : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
