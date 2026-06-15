import { NavLink } from 'react-router-dom'
import { metadata } from '../../config/metadata'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Resume', to: '/resume' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Email', to: '/email' },
]

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={metadata.company.logoUrl}
              alt=""
              className="h-9 w-9 rounded-lg border border-ink-200"
            />
            <div>
              <p className="text-sm font-semibold text-ink-900">{metadata.company.shortName}</p>
              <p className="text-xs text-ink-500">{metadata.company.productStatus}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
