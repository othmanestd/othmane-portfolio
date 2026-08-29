import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { Button, PageLoader, Spinner } from '@/components/ui'
import { AdminField, AdminHeader, EmptyState, LocalizedInput, Panel } from './parts'
import { cn } from '@/lib/utils'
import type { Award, Experience, LinkItem, Localized, Profile, SkillGroup } from '@/lib/types'

const EMPTY: Localized = { fr: '', en: '', ar: '' }
type TabKey = 'profile' | 'experiences' | 'skills' | 'awards' | 'links'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'experiences', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'awards', label: 'Awards' },
  { key: 'links', label: 'Links' },
]

export default function ContentAdmin() {
  const { tr } = useI18n()
  const [tab, setTab] = useState<TabKey>('profile')

  return (
    <>
      <AdminHeader
        title={tr('admin.content')}
        action={
          <div className="flex flex-wrap gap-2">
            {TABS.map((entry) => (
              <button
                key={entry.key}
                onClick={() => setTab(entry.key)}
                className={cn('label-tight border-2 px-3 py-2',
                  tab === entry.key ? 'invert-block' : 'opacity-60')}
                style={{ borderColor: tab === entry.key ? 'var(--edge)' : 'var(--edge-soft)' }}
              >
                {entry.label}
              </button>
            ))}
          </div>
        }
      />

      {tab === 'profile' && <ProfileEditor />}
      {tab === 'experiences' && <ExperienceEditor />}
      {tab === 'skills' && <SkillsEditor />}
      {tab === 'awards' && <AwardsEditor />}
      {tab === 'links' && <LinksEditor />}
    </>
  )
}

/* ---------------- profile ---------------- */
function ProfileEditor() {
  const { tr } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.profile()
      .then((d) => setProfile(d.item as unknown as Profile))
      .catch(() => setProfile(null))
      .finally(() => setLoaded(true))
  }, [])

  async function save() {
    if (!profile) return
    setSaving(true)
    setDone(false)
    setError('')
    try {
      await adminApi.saveProfile(profile)
      setDone(true)
      setTimeout(() => setDone(false), 2200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Never spin forever: once the request settles with no data, the database is
  // down (the banner above explains why), so show a clear state instead.
  if (!loaded) return <PageLoader label={tr('common.loading')} />
  if (!profile) return <EmptyState label={tr('admin.dbEmpty')} />

  return (
    <Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Name">
          <input value={profile.name} className="field-box"
                 onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </AdminField>
        <AdminField label="Location">
          <input value={profile.location} className="field-box"
                 onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
        </AdminField>
        <AdminField label="Email">
          <input value={profile.email} className="field-box"
                 onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </AdminField>
        <AdminField label="Phone">
          <input value={profile.phone} className="field-box"
                 onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </AdminField>
        <AdminField label="Photo URL">
          <input value={profile.photo_url} className="field-box"
                 onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })} />
        </AdminField>
        <AdminField label="CV URL (FR)">
          <input value={profile.cv_url_fr} className="field-box"
                 onChange={(e) => setProfile({ ...profile, cv_url_fr: e.target.value })} />
        </AdminField>
      </div>

      <div className="mt-5 grid gap-5">
        <AdminField label="Headline">
          <LocalizedInput value={profile.headline ?? EMPTY}
                          onChange={(v) => setProfile({ ...profile, headline: v })} />
        </AdminField>
        <AdminField label="Short bio">
          <LocalizedInput value={profile.bio ?? EMPTY} rows={3}
                          onChange={(v) => setProfile({ ...profile, bio: v })} />
        </AdminField>
        <AdminField label="Long bio" hint="blank line separates paragraphs">
          <LocalizedInput value={profile.long_bio ?? EMPTY} rows={9}
                          onChange={(v) => setProfile({ ...profile, long_bio: v })} />
        </AdminField>
        <AdminField label="Availability note">
          <LocalizedInput value={profile.availability_note ?? EMPTY}
                          onChange={(v) => setProfile({ ...profile, availability_note: v })} />
        </AdminField>
      </div>

      <div className="mt-6 flex items-center gap-5 border-t pt-5" style={{ borderColor: 'var(--edge-soft)' }}>
        <label className="label-tight flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={profile.available}
                 onChange={(e) => setProfile({ ...profile, available: e.target.checked })} />
          Available for work
        </label>
        <div className="ms-auto flex items-center gap-3">
          {error && <span className="label-tight" style={{ color: 'var(--fg-dim)' }}>{error}</span>}
          {done && <span className="label-tight">{tr('admin.saved')}</span>}
          <Button variant="solid" magnetic={false} onClick={save} disabled={saving}>
            {saving ? <><Spinner /> …</> : <><Save size={13} strokeWidth={2.3} /> {tr('admin.save')}</>}
          </Button>
        </div>
      </div>
    </Panel>
  )
}

/* ---------------- generic collection editor ---------------- */
function useCollection<T extends { id?: string }>(name: string) {
  const [items, setItems] = useState<T[] | null>(null)
  const load = () => adminApi.list<T>(name).then((d) => setItems(d.items)).catch(() => setItems([]))
  useEffect(() => { load() }, [])
  return { items, load }
}

function CollectionShell<T extends { id?: string }>({
  items, draft, setDraft, blank, name, load, children, describe,
}: {
  items: T[] | null
  draft: T | null
  setDraft: (v: T | null) => void
  blank: T
  name: string
  load: () => void
  children: React.ReactNode
  describe: (item: T) => { title: string; sub: string }
}) {
  const { tr } = useI18n()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      const { id, ...payload } = draft as T & { id?: string }
      if (id) await adminApi.update(name, id, payload)
      else await adminApi.create(name, payload)
      setDraft(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(item: T) {
    if (!item.id || !confirm(tr('admin.confirmDelete'))) return
    await adminApi.remove(name, item.id)
    load()
  }

  if (!items) return <PageLoader label={tr('common.loading')} />

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="solid" magnetic={false} onClick={() => setDraft({ ...blank })}>
          <Plus size={14} strokeWidth={2.4} /> {tr('admin.new')}
        </Button>
      </div>

      {draft && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center justify-between border-b pb-4"
               style={{ borderColor: 'var(--edge-soft)' }}>
            <h2 className="display text-lg">{draft.id ? tr('admin.edit') : tr('admin.new')}</h2>
            <button onClick={() => setDraft(null)} aria-label={tr('admin.cancel')}
                    className="flex h-8 w-8 items-center justify-center border-2"
                    style={{ borderColor: 'var(--edge-soft)' }}>
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>

          {children}

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-5"
               style={{ borderColor: 'var(--edge-soft)' }}>
            {error && <span className="label-tight me-auto">{error}</span>}
            <Button variant="outline" magnetic={false} onClick={() => setDraft(null)}>
              {tr('admin.cancel')}
            </Button>
            <Button variant="solid" magnetic={false} onClick={save} disabled={saving}>
              {saving ? <><Spinner /> …</> : <><Save size={13} strokeWidth={2.3} /> {tr('admin.save')}</>}
            </Button>
          </div>
        </Panel>
      )}

      {items.length === 0 ? <EmptyState label={tr('admin.empty')} /> : (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const info = describe(item)
            return (
              <li key={item.id ?? index}>
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-bold">{info.title}</p>
                      <p className="label-tight mt-1" style={{ color: 'var(--fg-faint)' }}>{info.sub}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" magnetic={false} onClick={() => setDraft(item)}>
                        {tr('admin.edit')}
                      </Button>
                      <button onClick={() => remove(item)} aria-label={tr('admin.delete')}
                              className="flex w-10 items-center justify-center border-2"
                              style={{ borderColor: 'var(--edge-soft)' }}>
                        <Trash2 size={13} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                </Panel>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

/* ---------------- experience ---------------- */
const BLANK_EXPERIENCE: Experience = {
  company: '', role: { ...EMPTY }, location: '', period: { ...EMPTY },
  start: '', end: '', bullets: [], stack: [], kind: 'work', order: 99,
}

function ExperienceEditor() {
  const { tr } = useI18n()
  const { items, load } = useCollection<Experience>('experiences')
  const [draft, setDraft] = useState<Experience | null>(null)

  return (
    <CollectionShell
      items={items} draft={draft} setDraft={setDraft} blank={BLANK_EXPERIENCE}
      name="experiences" load={load}
      describe={(item) => ({
        title: item.company,
        sub: `${item.role?.en || ''} · ${item.period?.en || ''} · ${item.kind} · order ${item.order}`,
      })}
    >
      {draft && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminField label="Company">
              <input value={draft.company} className="field-box"
                     onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
            </AdminField>
            <AdminField label="Location">
              <input value={draft.location} className="field-box"
                     onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
            </AdminField>
            <AdminField label="Kind">
              <select value={draft.kind} className="field-box"
                      onChange={(e) => setDraft({ ...draft, kind: e.target.value as 'work' | 'education' })}>
                <option value="work">work</option>
                <option value="education">education</option>
              </select>
            </AdminField>
            <AdminField label="Order">
              <input type="number" value={draft.order} className="field-box"
                     onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} />
            </AdminField>
            <AdminField label="Stack" hint="comma separated">
              <input value={draft.stack.join(', ')} className="field-box"
                     onChange={(e) => setDraft({
                       ...draft, stack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                     })} />
            </AdminField>
          </div>

          <div className="mt-5 grid gap-5">
            <AdminField label="Role title">
              <LocalizedInput value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} />
            </AdminField>
            <AdminField label="Period">
              <LocalizedInput value={draft.period} onChange={(v) => setDraft({ ...draft, period: v })} />
            </AdminField>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="label">Bullets</span>
              <button type="button" className="label-tight link-rule"
                      onClick={() => setDraft({ ...draft, bullets: [...draft.bullets, { ...EMPTY }] })}>
                + add
              </button>
            </div>
            <div className="space-y-3">
              {draft.bullets.map((bullet, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <LocalizedInput value={bullet} onChange={(v) => {
                      const next = [...draft.bullets]; next[index] = v
                      setDraft({ ...draft, bullets: next })
                    }} />
                  </div>
                  <button type="button" aria-label={tr('admin.delete')}
                          className="mt-7 flex w-10 shrink-0 items-center justify-center border-2 py-2"
                          style={{ borderColor: 'var(--edge-soft)' }}
                          onClick={() => setDraft({
                            ...draft, bullets: draft.bullets.filter((_, i) => i !== index),
                          })}>
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </CollectionShell>
  )
}

/* ---------------- skills ---------------- */
const BLANK_SKILL: SkillGroup = { key: '', label: { ...EMPTY }, items: [], order: 99 }

function SkillsEditor() {
  const { items, load } = useCollection<SkillGroup>('skills')
  const [draft, setDraft] = useState<SkillGroup | null>(null)

  return (
    <CollectionShell
      items={items} draft={draft} setDraft={setDraft} blank={BLANK_SKILL}
      name="skills" load={load}
      describe={(item) => ({
        title: item.label?.en || item.key,
        sub: `${item.items.length} items · order ${item.order}`,
      })}
    >
      {draft && (
        <div className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <AdminField label="Key">
              <input value={draft.key} className="field-box"
                     onChange={(e) => setDraft({ ...draft, key: e.target.value })} />
            </AdminField>
            <AdminField label="Order">
              <input type="number" value={draft.order} className="field-box"
                     onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} />
            </AdminField>
          </div>
          <AdminField label="Label">
            <LocalizedInput value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} />
          </AdminField>
          <AdminField label="Items" hint="comma separated">
            <textarea rows={3} value={draft.items.join(', ')} className="field-box resize-y"
                      onChange={(e) => setDraft({
                        ...draft, items: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })} />
          </AdminField>
        </div>
      )}
    </CollectionShell>
  )
}

/* ---------------- awards ---------------- */
const BLANK_AWARD: Award = {
  title: '', issuer: '', year: '', rank: '', kind: 'award', url: '', order: 99,
}

function AwardsEditor() {
  const { items, load } = useCollection<Award>('awards')
  const [draft, setDraft] = useState<Award | null>(null)

  return (
    <CollectionShell
      items={items} draft={draft} setDraft={setDraft} blank={BLANK_AWARD}
      name="awards" load={load}
      describe={(item) => ({
        title: item.title,
        sub: [item.rank, item.issuer, item.year, item.kind].filter(Boolean).join(' · '),
      })}
    >
      {draft && (
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Title">
            <input value={draft.title} className="field-box"
                   onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </AdminField>
          <AdminField label="Issuer">
            <input value={draft.issuer} className="field-box"
                   onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} />
          </AdminField>
          <AdminField label="Rank">
            <input value={draft.rank} className="field-box"
                   onChange={(e) => setDraft({ ...draft, rank: e.target.value })} />
          </AdminField>
          <AdminField label="Year">
            <input value={draft.year} className="field-box"
                   onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
          </AdminField>
          <AdminField label="Kind">
            <select value={draft.kind} className="field-box"
                    onChange={(e) => setDraft({ ...draft, kind: e.target.value as Award['kind'] })}>
              <option value="award">award</option>
              <option value="certification">certification</option>
            </select>
          </AdminField>
          <AdminField label="Order">
            <input type="number" value={draft.order} className="field-box"
                   onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} />
          </AdminField>
        </div>
      )}
    </CollectionShell>
  )
}

/* ---------------- links ---------------- */
const BLANK_LINK: LinkItem = {
  label: '', url: '', icon: 'link', description: '', primary: false, order: 99,
}

function LinksEditor() {
  const { items, load } = useCollection<LinkItem>('links')
  const [draft, setDraft] = useState<LinkItem | null>(null)

  return (
    <CollectionShell
      items={items} draft={draft} setDraft={setDraft} blank={BLANK_LINK}
      name="links" load={load}
      describe={(item) => ({ title: item.label, sub: `${item.url} · order ${item.order}` })}
    >
      {draft && (
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Label">
            <input value={draft.label} className="field-box"
                   onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </AdminField>
          <AdminField label="URL">
            <input value={draft.url} className="field-box"
                   onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          </AdminField>
          <AdminField label="Icon">
            <input value={draft.icon} className="field-box"
                   onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
          </AdminField>
          <AdminField label="Description">
            <input value={draft.description} className="field-box"
                   onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </AdminField>
          <AdminField label="Order">
            <input type="number" value={draft.order} className="field-box"
                   onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} />
          </AdminField>
          <label className="label-tight flex cursor-pointer items-center gap-2 self-end pb-3">
            <input type="checkbox" checked={draft.primary}
                   onChange={(e) => setDraft({ ...draft, primary: e.target.checked })} />
            Primary
          </label>
        </div>
      )}
    </CollectionShell>
  )
}
