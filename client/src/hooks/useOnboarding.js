import { useContext } from 'react'
import { OnboardingContext } from '../providers/onboardingContext'

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used inside OnboardingProvider')
  }

  return context
}
