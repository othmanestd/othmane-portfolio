import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  BarChart3, Bell, Brain, Calendar, FileText, FolderKanban,
  LayoutDashboard, LogOut, Mail, Menu, Moon, Sun, X,
} from 'lucide-react'
import { useI18n } from '@/i18n'
import { useTheme } from '@/hooks/useTheme'
import { adminApi } from '@/lib/api'
import { cn, relativeTime } from '@/lib/utils'
import type { Notification } from '@/lib/types'

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, key: 'admin.dashboard' },
  { to: '/admin/messages', icon: Mail, key: 'admin.messages' },
  { to: '/admin/appointments', icon: Calendar, key: 'admin.appointments' },
  { to: '/admin/projects', icon: FolderKanban, key: 'admin.projects' },
  { to: '/admin/content', icon: FileText, key: 'admin.content' },
  { to: '/admin/kb', icon: Brain, key: 'admin.kb' },
  { to: '/admin/analytics', icon: BarChart3, key: 'admin.analytics' },
] as const

export default function Shell({
  children, onSignOut,
}: { children: ReactNode; onSignOut: () => void }) {
  const { tr, locale } = useI18n()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [bell, setBell] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unread = notifications.filter((n) => !n.read).length

  const load = () => {
    adminApi.notifications()
      .then((data) => setNotifications(data.items))
      .catch(() => setNotifications([]))
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  async function markAllRead() {
    await adminApi.readAllNotifications().catch(() => undefined)
    load()
  }

  return (
    <div className="relative min-h-[100svh]">
      <div className="grain" aria-hidden />

      {/* --- top bar --- */}
      <header
        className="glass glass-strong sticky top-0 z-50 flex items-center justify-between gap-4 border-b-2 px-4 py-3"
        style={{ borderColor: 'var(--edge)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={tr('nav.menu')}
            className="flex h-9 w-9 items-center justify-center border-2 lg:hidden"
            style={{ borderColor: 'var(--edge-soft)' }}
          >
            {open ? <X size={15} strokeWidth={2.2} /> : <Menu size={15} strokeWidth={2.2} />}
          </button>
          <Link to="/" className="flex items-baseline gap-2">
            <span className="display text-base">OTHMANE</span>
            <span className="label-tight opacity-55">/ admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => { setBell((v) => !v); if (!bell && unread) markAllRead() }}
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center border-2"
              style={{ borderColor: 'var(--edge-soft)' }}
            >
              <Bell size={14} strokeWidth={2.2} />
              {unread > 0 && (
                <span
                  className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center px-1 text-[9px] font-bold invert-block"
                  style={{ border: '1px solid var(--edge)' }}
                >
                  {unread}
                </span>
              )}
            </button>

            {bell && (
              <div
                className="glass glass-strong absolute end-0 top-11 z-50 max-h-[420px] w-[320px] overflow-y-auto border-2"
                style={{ borderColor: 'var(--edge)', boxShadow: 'var(--shadow-hard-sm)' }}
              >
                {notifications.length === 0 ? (
                  <p className="label p-5 text-center">{tr('admin.empty')}</p>
                ) : (
                  <ul>
                    {notifications.map((item) => (
                      <li key={item.id} className="border-b p-3.5"
                          style={{ borderColor: 'var(--edge-soft)' }}>
                        <p className="mb-1 text-[0.85rem] font-bold leading-snug">{item.title}</p>
                        <p className="label-tight mb-1.5 line-clamp-2" style={{ color: 'var(--fg-dim)' }}>
                          {item.body}
                        </p>
                        <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>
                          {relativeTime(item.created_at, locale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggle}
            aria-label={tr('theme.toggle')}
            className="flex h-9 w-9 items-center justify-center border-2"
            style={{ borderColor: 'var(--edge-soft)' }}
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={2.2} /> : <Moon size={14} strokeWidth={2.2} />}
          </button>

          <button
            onClick={onSignOut}
            className="label-tight flex items-center gap-2 border-2 px-3 py-2 transition-colors hover:invert-block"
            style={{ borderColor: 'var(--edge-soft)' }}
          >
            <LogOut size={13} strokeWidth={2.2} />
            <span className="hidden sm:inline">{tr('admin.signout')}</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* --- sidebar --- */}
        <aside
          className={cn(
            'fixed inset-y-0 z-40 w-[240px] border-e-2 pt-20 transition-transform duration-400 lg:sticky lg:top-[57px] lg:h-[calc(100svh-57px)] lg:translate-x-0 lg:pt-6',
            '[transition-timing-function:var(--ease-out-expo)]',
            open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
          )}
          style={{ background: 'var(--bg-raised)', borderColor: 'var(--edge)' }}
        >
          <nav className="p-3">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={'end' in item ? item.end : false}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'label-tight flex items-center gap-3 border-2 px-3.5 py-3 transition-all',
                        isActive ? 'invert-block' : 'border-transparent opacity-65 hover:opacity-100',
                      )
                    }
                  >
                    <item.icon size={15} strokeWidth={2.1} />
                    {tr(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
            style={{ background: 'color-mix(in srgb, var(--bg) 70%, transparent)' }}
          />
        )}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
