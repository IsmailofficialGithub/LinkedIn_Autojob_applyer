export class AppError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'AppError'
    this.details = details
  }
}

export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong'
  if (error.code === 'ECONNABORTED') {
    return 'This is taking longer than expected. Please try again.'
  }
  if (error.code === 'ERR_NETWORK' || (error.request && !error.response)) {
    return 'We are having trouble connecting right now. Please try again in a moment.'
  }
  if (error.response?.status >= 500) {
    return 'We could not complete that request right now. Please try again in a moment.'
  }
  if (error.response?.data?.message) return error.response.data.message
  if (error.message) return error.message
  return 'Something went wrong'
}

export const handleError = (error, fallback = 'Something went wrong') => ({
  message: getErrorMessage(error) || fallback,
  status: error.response?.status || null,
  details: error.response?.data || error.details || null,
})
