import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({ baseURL: API_URL })

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem('exam_token', token)
    return
  }

  delete api.defaults.headers.common.Authorization
  localStorage.removeItem('exam_token')
}

export function loadStoredToken() {
  const token = localStorage.getItem('exam_token')
  setAuthToken(token)
  return token
}
