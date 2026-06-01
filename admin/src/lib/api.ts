import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function saveAdminAuth(accessToken: string) {
  Cookies.set('admin_token', accessToken, { expires: 1 / 96, secure: false, sameSite: 'strict' })
}

export function clearAdminAuth() {
  Cookies.remove('admin_token')
}
