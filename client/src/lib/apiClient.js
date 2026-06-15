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

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete apiClient.defaults.headers.common.Authorization
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(handleError(error)),
)
