import { useState } from 'react'
import { Lock } from 'lucide-react'
import { adminApi, setToken } from '@/lib/api'
import { useI18n } from '@/i18n'
import { Button, Spinner } from '@/components/ui'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const { tr } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const result = await adminApi.login(email, password)
      setToken(result.access_token)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('admin.invalid'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4">
      <div className="grain" aria-hidden />
      <div className="mesh" aria-hidden />

      <form
        onSubmit={submit}
        className="glass glass-strong relative z-10 w-full max-w-sm border-2 p-8"
        style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard)' }}
      >
        <div className="mb-8 flex items-center gap-3">
          <Lock size={16} strokeWidth={2.2} />
          <h1 className="display text-xl">{tr('admin.login')}</h1>
        </div>

        <label className="mb-6 block">
          <span className="label mb-1.5 block">{tr('admin.email')}</span>
          <input
            type="email" required autoFocus autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </label>

        <label className="mb-8 block">
          <span className="label mb-1.5 block">{tr('admin.password')}</span>
          <input
            type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </label>

        {error && (
          <p className="label-tight mb-6 border-2 p-3" style={{ borderColor: 'var(--edge)' }}>
            {error}
          </p>
        )}

        <Button type="submit" variant="solid" className="w-full" disabled={busy} magnetic={false}>
          {busy ? <><Spinner /> …</> : tr('admin.signin')}
        </Button>
      </form>
    </div>
  )
}
