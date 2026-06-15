import { Button, Drawer, IconButton, Tooltip } from '@mui/material'
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { metadata } from '../../config/metadata'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../common/ThemeToggle'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Resume', to: '/resume', icon: FileText },
  { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness },
  { label: 'Email', to: '/email', icon: Mail },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function BrandBlock({ collapsed = false }) {
  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <img
        src={metadata.company.logoUrl}
        alt=""
        className="h-10 w-10 rounded-lg border border-[var(--border-subtle)] bg-white"
      />
      <div className={collapsed ? 'hidden' : ''}>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {metadata.company.shortName}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">{metadata.company.productStatus}</p>
      </div>
    </div>
  )
}

function SidebarNav({ collapsed = false, onNavigate }) {
  return (
    <nav className="mt-8 flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const link = (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center rounded-md px-3 py-2.5 text-sm font-medium ${
                collapsed ? 'justify-center' : 'gap-3'
              } ${
                isActive
                  ? 'bg-[var(--brand-soft)] text-brand-700 dark:text-brand-100'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <Icon size={18} />
            <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
          </NavLink>
        )

        return collapsed ? (
          <Tooltip key={item.to} title={item.label} placement="right">
            {link}
          </Tooltip>
        ) : (
          link
        )
      })}
    </nav>
  )
}

function SidebarContent({ collapsed = false, onClose, onToggleCollapse }) {
  return (
    <aside
      className={`flex h-full flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-panel)] p-4 transition-[width] duration-200 ${
        collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-width)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <BrandBlock collapsed={collapsed} />
        {onClose ? (
          <IconButton
            aria-label="Close menu"
            onClick={onClose}
            size="small"
            sx={{ color: 'var(--text-primary)' }}
          >
            <X size={18} />
          </IconButton>
        ) : (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={onToggleCollapse}
              size="small"
              sx={{ color: 'var(--text-primary)' }}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </IconButton>
          </Tooltip>
        )}
      </div>

      <SidebarNav collapsed={collapsed} onNavigate={onClose} />

      <div
        className={`mt-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 ${
          collapsed ? 'hidden' : ''
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Workflow
        </p>
        <p className="mt-2 text-sm text-[var(--text-primary)]">
          Complete onboarding before sending recruiter emails.
        </p>
      </div>
    </aside>
  )
}

export function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--surface-page)] lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            backgroundColor: 'var(--surface-panel)',
            color: 'var(--text-primary)',
          },
        }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </Drawer>

      <div
        className={`min-w-0 flex-1 transition-[padding] duration-200 ${
          sidebarCollapsed
            ? 'lg:pl-[var(--sidebar-collapsed-width)]'
            : 'lg:pl-[var(--sidebar-width)]'
        }`}
      >
        <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--surface-panel)]/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <IconButton
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                size="small"
                sx={{
                  display: { lg: 'none' },
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Menu size={19} />
              </IconButton>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Dashboard</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {user?.email || 'Manage resume, jobs, and outreach.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="small"
                variant="outlined"
                startIcon={<LogOut size={16} />}
                onClick={signOut}
                sx={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                  textTransform: 'none',
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
