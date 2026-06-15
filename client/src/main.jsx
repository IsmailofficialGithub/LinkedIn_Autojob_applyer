import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider.jsx'
import { OnboardingProvider } from './providers/OnboardingProvider.jsx'
import { ThemeProvider } from './providers/ThemeProvider.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
