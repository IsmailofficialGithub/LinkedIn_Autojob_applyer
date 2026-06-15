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
    return 'The server is taking longer than expected. Please try again.'
  }
  if (error.code === 'ERR_NETWORK' || (error.request && !error.response)) {
    return 'We cannot reach the server right now. Check that the backend is running and try again.'
  }
  if (error.response?.status >= 500) {
    return 'The server had a problem while processing this request. Please try again in a moment.'
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
