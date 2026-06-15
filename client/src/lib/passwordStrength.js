export const passwordRules = [
  {
    id: 'length',
    label: '8+ chars',
    test: (value) => value.length >= 8,
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'symbol',
    label: 'One symbol',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
]

export const getPasswordStrength = (value) => {
  const results = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(value),
  }))
  const score = results.filter((rule) => rule.passed).length

  if (!value) {
    return {
      score,
      percent: 0,
      label: 'Start typing',
      color: '#cbd5e1',
      results,
      isValid: false,
    }
  }

  if (score <= 2) {
    return {
      score,
      percent: 32,
      label: 'Weak',
      color: '#dc2626',
      results,
      isValid: false,
    }
  }

  if (score <= 4) {
    return {
      score,
      percent: 68,
      label: 'Good',
      color: '#d97706',
      results,
      isValid: false,
    }
  }

  return {
    score,
    percent: 100,
    label: 'Strong',
    color: '#16a34a',
    results,
    isValid: true,
  }
}
