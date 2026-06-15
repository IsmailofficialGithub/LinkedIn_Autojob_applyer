import { Alert, Button, IconButton, InputAdornment, TextField } from '@mui/material'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordStrength } from '../components/auth/PasswordStrength'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../lib/errorHandler'
import { getPasswordStrength } from '../lib/passwordStrength'

export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const passwordStrength = getPasswordStrength(form.password)
  const passwordsMatch = Boolean(form.confirmPassword) && form.confirmPassword === form.password

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!passwordStrength.isValid) {
      setError('Password must include 8 characters, uppercase, lowercase, number, and symbol')
      return
    }

    setLoading(true)

    try {
      const data = await signUp({ email: form.email, password: form.password })
      if (data.session) {
        navigate('/', { replace: true })
        return
      }

      setNotice('Account created. Check your email if confirmation is enabled.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start with email and password. LinkedIn connection comes next."
      footerText="Already have an account?"
      footerAction="Sign in"
      footerTo="/signin"
    >
      <form onSubmit={handleSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {notice ? <Alert severity="success">{notice}</Alert> : null}
        <TextField
          fullWidth
          required
          sx={{ mb: 2.25, mt: error || notice ? 2 : 0 }}
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
          helperText="Use 8+ characters with uppercase, lowercase, number, and symbol."
          inputProps={{ minLength: 8, autoComplete: 'new-password' }}
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
        <PasswordStrength password={form.password} />
        <TextField
          fullWidth
          required
          sx={{ mb: 2.25 }}
          label="Confirm password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={handleChange}
          error={Boolean(form.confirmPassword) && form.confirmPassword !== form.password}
          helperText={
            form.confirmPassword && form.confirmPassword !== form.password
              ? 'Passwords do not match'
              : 'Re-enter the same password.'
          }
          inputProps={{ minLength: 8, autoComplete: 'new-password' }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    edge="end"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading || !passwordStrength.isValid || !passwordsMatch}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
