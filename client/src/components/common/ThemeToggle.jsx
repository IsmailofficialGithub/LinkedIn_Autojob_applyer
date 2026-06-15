import { IconButton, Tooltip } from '@mui/material'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Tooltip title={label}>
      <IconButton
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        size="small"
        sx={{
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--surface-panel)',
          '&:hover': {
            backgroundColor: 'var(--surface-muted)',
          },
        }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
    </Tooltip>
  )
}
