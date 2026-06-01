import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  const institutionId = Cookies.get('institution_id')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (institutionId) config.headers['X-Institution-ID'] = institutionId
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = Cookies.get('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh })
          Cookies.set('access_token', data.accessToken, { expires: 1 / 96 }) // 15 min
          error.config.headers.Authorization = `Bearer ${data.accessToken}`
          return api.request(error.config)
        } catch {
          clearAuth()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export function saveAuth(tokens: { accessToken: string; refreshToken: string }, institutionId: string) {
  Cookies.set('access_token',  tokens.accessToken,  { expires: 1 / 96, secure: true, sameSite: 'strict' })
  Cookies.set('refresh_token', tokens.refreshToken, { expires: 7,      secure: true, sameSite: 'strict' })
  Cookies.set('institution_id', institutionId,      { expires: 7,      secure: true, sameSite: 'strict' })
}

export function clearAuth() {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
  Cookies.remove('institution_id')
}
