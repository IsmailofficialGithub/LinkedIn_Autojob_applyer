const fallbackMessage = 'Something went wrong. Please try again.'

const friendlyStatusMessages = {
  400: 'Please check the information and try again.',
  401: 'Please sign in again to continue.',
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  408: 'This is taking longer than expected. Please try again.',
  409: 'This already exists. Please use different information.',
  422: 'Please check the highlighted information and try again.',
  429: 'Too many attempts. Please wait a moment and try again.',
}

const technicalPatterns = [
  /database/i,
  /supabase/i,
  /postgres/i,
  /sql/i,
  /jwt/i,
  /token/i,
  /stack/i,
  /network error/i,
  /internal server/i,
  /failed to fetch/i,
  /ecconn/i,
]

const isSafeMessage = (message) =>
  typeof message === 'string' &&
  message.trim().length > 0 &&
  message.length <= 160 &&
  !technicalPatterns.some((pattern) => pattern.test(message))

export const getErrorMessage = (error) => {
  if (!error) return fallbackMessage

  if (error.code === 'ECONNABORTED') {
    return 'This is taking longer than expected. Please try again.'
  }

  if (error.code === 'ERR_NETWORK' || (error.request && !error.response)) {
    return 'We are having trouble connecting right now. Please try again in a moment.'
  }

  const status = error.response?.status || error.status
  const apiMessage = error.response?.data?.message || error.details?.message || error.message

  if (status >= 500) {
    return 'We could not complete that request right now. Please try again in a moment.'
  }

  if (status && friendlyStatusMessages[status]) {
    return friendlyStatusMessages[status]
  }

  if (isSafeMessage(apiMessage)) {
    return apiMessage.trim()
  }

  return fallbackMessage
}

export const handleError = (error) => ({
  message: getErrorMessage(error),
  status: error.response?.status || error.status || null,
  details: error.response?.data || error.details || null,
})
