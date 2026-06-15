export class AppError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'AppError'
    this.details = details
  }
}

export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong'
  if (error.response?.data?.message) return error.response.data.message
  if (error.message) return error.message
  return 'Something went wrong'
}

export const handleError = (error, fallback = 'Something went wrong') => ({
  message: getErrorMessage(error) || fallback,
  status: error.response?.status || null,
  details: error.response?.data || error.details || null,
})
