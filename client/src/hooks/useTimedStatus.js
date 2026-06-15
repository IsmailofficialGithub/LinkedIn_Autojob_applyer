import { useEffect, useState } from 'react'

const defaultMessages = [
  { after: 0, text: 'Connecting securely...' },
  { after: 3000, text: 'Still connecting. This can take a few seconds.' },
  { after: 5000, text: 'Almost there. Waiting for a secure response.' },
  { after: 9000, text: 'This is taking longer than usual. Please keep this page open.' },
]

export const useTimedStatus = (active, messages = defaultMessages) => {
  const [message, setMessage] = useState(messages[0]?.text || '')

  useEffect(() => {
    if (!active) {
      return undefined
    }

    const timers = messages.map((item) =>
      window.setTimeout(() => {
        setMessage(item.text)
      }, item.after),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [active, messages])

  return message
}
