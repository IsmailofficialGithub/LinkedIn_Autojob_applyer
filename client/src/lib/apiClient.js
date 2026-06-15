import axios from 'axios'
import { env } from '../config/env'
import { handleError } from './errorHandler'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const unauthorizedListeners = new Set()

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete apiClient.defaults.headers.common.Authorization
}

export const onUnauthorized = (listener) => {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

const shouldHandleUnauthorized = (error) => {
  const status = error.response?.status
  const url = error.config?.url || ''
  const hasAuthHeader = Boolean(error.config?.headers?.Authorization)
  const isAuthRequest = url.includes('/auth/signin') || url.includes('/auth/signup')

  return status === 401 && hasAuthHeader && !isAuthRequest
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldHandleUnauthorized(error)) {
      unauthorizedListeners.forEach((listener) => listener())
    }

    return Promise.reject(handleError(error))
  },
)
