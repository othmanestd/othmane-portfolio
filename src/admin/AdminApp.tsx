import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { adminApi, clearToken, getToken } from '@/lib/api'
import { PageLoader } from '@/components/ui'
import Login from './Login'
import Shell from './Shell'
import Dashboard from './Dashboard'
import Messages from './Messages'
import Appointments from './Appointments'
import ProjectsAdmin from './ProjectsAdmin'
import ContentAdmin from './ContentAdmin'
import KbAdmin from './KbAdmin'
import AnalyticsAdmin from './AnalyticsAdmin'

type AuthState = 'checking' | 'authed' | 'anonymous'

export default function AdminApp() {
  const [state, setState] = useState<AuthState>('checking')

  // Validate the stored token against the server — a token in localStorage
  // proves nothing on its own.
  useEffect(() => {
    if (!getToken()) { setState('anonymous'); return }
    let cancelled = false
    adminApi.me()
      .then(() => { if (!cancelled) setState('authed') })
      .catch(() => { if (!cancelled) { clearToken(); setState('anonymous') } })
    return () => { cancelled = true }
  }, [])

  const onSignOut = useCallback(() => {
    clearToken()
    setState('anonymous')
  }, [])

  if (state === 'checking') return <PageLoader label="Admin" />
  if (state === 'anonymous') return <Login onSuccess={() => setState('authed')} />

  return (
    <Shell onSignOut={onSignOut}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="messages" element={<Messages />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
        <Route path="kb" element={<KbAdmin />} />
        <Route path="analytics" element={<AnalyticsAdmin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Shell>
  )
}
