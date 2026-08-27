export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export type ApiResult<T> = { data?: T; error?: string; status: number }

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('churnguard_token') : null
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    const contentType = response.headers.get('content-type') || ''
    const body = contentType.includes('application/json') ? await response.json() : await response.text()
    if (!response.ok) return { error: typeof body === 'string' ? body : body?.detail || body?.message || 'Request failed', status: response.status }
    return { data: body as T, status: response.status }
  } catch {
    return { error: 'Unable to reach the ChurnGuard API. Check your API URL and service status.', status: 0 }
  }
}

export function saveSession(token: string, user?: unknown) {
  sessionStorage.setItem('churnguard_token', token)
  if (user) sessionStorage.setItem('churnguard_user', JSON.stringify(user))
}

export function clearSession() { sessionStorage.removeItem('churnguard_token'); sessionStorage.removeItem('churnguard_user') }
export function currentUser() { try { return JSON.parse(sessionStorage.getItem('churnguard_user') || 'null') } catch { return null } }
export function hasSession() { return Boolean(typeof window !== 'undefined' && sessionStorage.getItem('churnguard_token')) }
export function displayValue(value: unknown, suffix = '') { return value === null || value === undefined || value === '' ? '—' : `${value}${suffix}` }
export function listFrom<T>(value: unknown): T[] { if (Array.isArray(value)) return value; if (value && typeof value === 'object') { const record = value as Record<string, unknown>; for (const key of ['data','items','results','customers','organizations']) if (Array.isArray(record[key])) return record[key] as T[] } return [] }
export function numeric(value: unknown) { const n = Number(value); return Number.isFinite(n) ? n : null }
