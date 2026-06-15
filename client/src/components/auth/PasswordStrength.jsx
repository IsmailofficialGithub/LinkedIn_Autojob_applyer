import { Check, Circle } from 'lucide-react'
import { getPasswordStrength } from '../../lib/passwordStrength'

export function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password)
  const missingCount = strength.results.filter((rule) => !rule.passed).length

  return (
    <div className="-mt-1 mb-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-secondary)]">
          {password.length < 8 ? `${8 - password.length} chars left` : 'Length ok'}
          {missingCount > 0 ? `, ${missingCount} rule${missingCount > 1 ? 's' : ''} left` : ''}
        </p>
        <p className="text-xs font-semibold" style={{ color: strength.color }}>
          {strength.label}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {strength.results.map((rule) => {
          const Icon = rule.passed ? Check : Circle
          return (
            <div
              key={rule.id}
              className={`flex items-center gap-1.5 text-[11px] ${
                rule.passed ? 'text-green-600 dark:text-green-300' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Icon size={12} />
              <span>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
