import type {
  AdminStats, Appointment, ChatReply, Locale, Message, Notification, Project, SiteContent,
} from './types'

const TOKEN_KEY = 'os.admin.token'

export function getToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export function setToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token) } catch { /* private mode */ }
}
export function clearToken(): void {
  try { localStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(path, { ...init, headers })

  if (response.status === 401 && auth) {
    clearToken()
    throw new ApiError(401, 'Session expired')
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') detail = body.detail
      else if (Array.isArray(body.detail) && body.detail[0]?.msg) detail = body.detail[0].msg
    } catch { /* non-JSON error body */ }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/* --- public --------------------------------------------------------------- */
export const api = {
  content: () => request<SiteContent>('/api/content'),
  project: (slug: string) => request<{ item: Project | null; found: boolean }>(`/api/projects/${slug}`),

  chat: (payload: {
    message: string
    locale: Locale
    history: { role: 'user' | 'assistant'; content: string }[]
    session_id: string
  }) => request<ChatReply>('/api/chat', { method: 'POST', body: JSON.stringify(payload) }),

  contact: (payload: Record<string, unknown>) =>
    request<{ ok: boolean; id: string }>('/api/contact', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  availability: () =>
    request<{ slots: string[]; duration_minutes: number; timezone: string; working_hours: string }>(
      '/api/appointments/availability',
    ),

  book: (payload: Record<string, unknown>) =>
    request<{ ok: boolean; id: string; slot_start: string }>('/api/appointments', {
      method: 'POST', body: JSON.stringify(payload),
    }),
}

/* --- admin ---------------------------------------------------------------- */
export const adminApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; expires_in: number }>('/api/admin/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ email: string; role: string }>('/api/admin/me', {}, true),
  dbStatus: () =>
    request<{ healthy: boolean; error: string; hint: string }>('/api/admin/db-status', {}, true),
  stats: () => request<AdminStats>('/api/admin/stats', {}, true),
  analytics: (days = 30) =>
    request<{
      range_days: number; total_events: number; unique_visitors: number
      by_locale: { locale: string; count: number }[]
      by_event: { name: string; count: number }[]
      recent_questions: { question: string; provider: string; degraded: boolean; created_at: string }[]
    }>(`/api/admin/analytics?days=${days}`, {}, true),

  notifications: () => request<{ items: Notification[] }>('/api/admin/notifications', {}, true),
  readAllNotifications: () =>
    request<{ ok: boolean }>('/api/admin/notifications/read-all', { method: 'POST' }, true),
  deleteNotification: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/notifications/${id}`, { method: 'DELETE' }, true),

  messages: (archived = false) =>
    request<{ items: Message[] }>(`/api/admin/messages?archived=${archived}`, {}, true),
  patchMessage: (id: string, patch: Record<string, boolean>) =>
    request<{ ok: boolean }>(`/api/admin/messages/${id}`, {
      method: 'PATCH', body: JSON.stringify(patch),
    }, true),
  replyMessage: (id: string, body: string, subject?: string) =>
    request<{ ok: boolean }>(`/api/admin/messages/${id}/reply`, {
      method: 'POST', body: JSON.stringify({ body, subject }),
    }, true),
  deleteMessage: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/messages/${id}`, { method: 'DELETE' }, true),

  appointments: (status = '') =>
    request<{ items: Appointment[] }>(`/api/admin/appointments?status=${status}`, {}, true),
  updateAppointment: (id: string, status: string, adminNote = '', notify = true) =>
    request<{ ok: boolean }>(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_note: adminNote, notify }),
    }, true),
  deleteAppointment: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/appointments/${id}`, { method: 'DELETE' }, true),

  list: <T>(collection: string) =>
    request<{ items: T[] }>(`/api/admin/${collection}`, {}, true),
  create: <T>(collection: string, payload: unknown) =>
    request<{ ok: boolean; item: T }>(`/api/admin/${collection}`, {
      method: 'POST', body: JSON.stringify(payload),
    }, true),
  update: <T>(collection: string, id: string, payload: unknown) =>
    request<{ ok: boolean; item: T }>(`/api/admin/${collection}/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }, true),
  remove: (collection: string, id: string) =>
    request<{ ok: boolean }>(`/api/admin/${collection}/${id}`, { method: 'DELETE' }, true),

  profile: () => request<{ item: Record<string, unknown> }>('/api/admin/profile', {}, true),
  saveProfile: (payload: unknown) =>
    request<{ ok: boolean }>('/api/admin/profile', {
      method: 'PUT', body: JSON.stringify(payload),
    }, true),

  kb: () => request<{
    base: { chunk_id: string; title: string; kind: string; text: string }[]
    custom: { chunk_id: string; title: string; kind: string; text: string; id?: string }[]
  }>('/api/admin/kb', {}, true),
  saveKb: (payload: unknown) =>
    request<{ ok: boolean }>('/api/admin/kb', { method: 'POST', body: JSON.stringify(payload) }, true),
  deleteKb: (chunkId: string) =>
    request<{ ok: boolean }>(`/api/admin/kb/${encodeURIComponent(chunkId)}`, { method: 'DELETE' }, true),

  seed: (force = false) =>
    request<{ ok: boolean; report: Record<string, string> }>(
      `/api/admin/seed?force=${force}`, { method: 'POST' }, true,
    ),
}
