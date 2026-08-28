import { useEffect, useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { Button, PageLoader, Spinner } from '@/components/ui'
import { AdminHeader, AdminField, EmptyState, LocalizedInput, Panel, Pill } from './parts'
import type { Localized, Project } from '@/lib/types'

const EMPTY_LOCALIZED: Localized = { fr: '', en: '', ar: '' }

const BLANK: Project = {
  slug: '', title: '', tagline: { ...EMPTY_LOCALIZED }, summary: { ...EMPTY_LOCALIZED },
  body: { ...EMPTY_LOCALIZED }, role: { ...EMPTY_LOCALIZED }, year: String(new Date().getFullYear()),
  category: 'data-engineering', stack: [], highlights: [], metrics: [],
  repo_url: '', live_url: '', featured: false, published: true, order: 99,
}

export default function ProjectsAdmin() {
  const { tr } = useI18n()
  const [items, setItems] = useState<Project[] | null>(null)
  const [draft, setDraft] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    adminApi.list<Project>('projects')
      .then((d) => setItems(d.items))
      .catch(() => setItems([]))
  }

  useEffect(load, [])

  async function save() {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      // Strip the server-side id before sending — it is not part of the payload schema.
      const { id, ...payload } = draft
      if (id) await adminApi.update('projects', id, payload)
      else await adminApi.create('projects', payload)
      setDraft(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(project: Project) {
    if (!project.id || !confirm(tr('admin.confirmDelete'))) return
    await adminApi.remove('projects', project.id)
    load()
  }

  if (!items) return <PageLoader label={tr('common.loading')} />

  return (
    <>
      <AdminHeader
        title={tr('admin.projects')}
        subtitle={`${items.length} total`}
        action={
          <Button variant="solid" magnetic={false} onClick={() => setDraft({ ...BLANK })}>
            <Plus size={14} strokeWidth={2.4} /> {tr('admin.new')}
          </Button>
        }
      />

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

          <div className="grid gap-5 md:grid-cols-2">
            <AdminField label="Slug" hint="a-z, dashes">
              <input value={draft.slug} className="field-box"
                     onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </AdminField>
            <AdminField label="Title">
              <input value={draft.title} className="field-box"
                     onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </AdminField>
            <AdminField label="Year">
              <input value={draft.year} className="field-box"
                     onChange={(e) => setDraft({ ...draft, year: e.target.value })} />
            </AdminField>
            <AdminField label="Category">
              <input value={draft.category} className="field-box"
                     onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            </AdminField>
            <AdminField label="Repo URL">
              <input value={draft.repo_url} className="field-box"
                     onChange={(e) => setDraft({ ...draft, repo_url: e.target.value })} />
            </AdminField>
            <AdminField label="Live URL">
              <input value={draft.live_url} className="field-box"
                     onChange={(e) => setDraft({ ...draft, live_url: e.target.value })} />
            </AdminField>
            <AdminField label="Stack" hint="comma separated">
              <input value={draft.stack.join(', ')} className="field-box"
                     onChange={(e) => setDraft({
                       ...draft,
                       stack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                     })} />
            </AdminField>
            <AdminField label="Order">
              <input type="number" value={draft.order} className="field-box"
                     onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} />
            </AdminField>
          </div>

          <div className="mt-5 grid gap-5">
            <AdminField label="Tagline"><LocalizedInput value={draft.tagline}
              onChange={(v) => setDraft({ ...draft, tagline: v })} /></AdminField>
            <AdminField label="Summary"><LocalizedInput value={draft.summary} rows={3}
              onChange={(v) => setDraft({ ...draft, summary: v })} /></AdminField>
            <AdminField label="Role"><LocalizedInput value={draft.role}
              onChange={(v) => setDraft({ ...draft, role: v })} /></AdminField>
            <AdminField label="Body" hint="markdown: ## heading, - bullet, **bold**">
              <LocalizedInput value={draft.body} rows={10}
                onChange={(v) => setDraft({ ...draft, body: v })} />
            </AdminField>
          </div>

          {/* metrics */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="label">Metrics</span>
              <button type="button" className="label-tight link-rule"
                      onClick={() => setDraft({
                        ...draft, metrics: [...draft.metrics, { label: '', value: '' }],
                      })}>
                + add
              </button>
            </div>
            <div className="space-y-2">
              {draft.metrics.map((metric, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={metric.label} placeholder="label" className="field-box flex-1"
                    onChange={(e) => {
                      const next = [...draft.metrics]
                      next[index] = { ...next[index], label: e.target.value }
                      setDraft({ ...draft, metrics: next })
                    }} />
                  <input
                    value={metric.value} placeholder="value" className="field-box flex-1"
                    onChange={(e) => {
                      const next = [...draft.metrics]
                      next[index] = { ...next[index], value: e.target.value }
                      setDraft({ ...draft, metrics: next })
                    }} />
                  <button type="button" aria-label={tr('admin.delete')}
                          className="flex w-10 shrink-0 items-center justify-center border-2"
                          style={{ borderColor: 'var(--edge-soft)' }}
                          onClick={() => setDraft({
                            ...draft, metrics: draft.metrics.filter((_, i) => i !== index),
                          })}>
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* highlights */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="label">Highlights</span>
              <button type="button" className="label-tight link-rule"
                      onClick={() => setDraft({
                        ...draft, highlights: [...draft.highlights, { ...EMPTY_LOCALIZED }],
                      })}>
                + add
              </button>
            </div>
            <div className="space-y-3">
              {draft.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <LocalizedInput
                      value={highlight}
                      onChange={(v) => {
                        const next = [...draft.highlights]
                        next[index] = v
                        setDraft({ ...draft, highlights: next })
                      }} />
                  </div>
                  <button type="button" aria-label={tr('admin.delete')}
                          className="mt-7 flex w-10 shrink-0 items-center justify-center border-2 py-2"
                          style={{ borderColor: 'var(--edge-soft)' }}
                          onClick={() => setDraft({
                            ...draft, highlights: draft.highlights.filter((_, i) => i !== index),
                          })}>
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5 border-t pt-5"
               style={{ borderColor: 'var(--edge-soft)' }}>
            <label className="label-tight flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={draft.featured}
                     onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
              Featured
            </label>
            <label className="label-tight flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={draft.published}
                     onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              Published
            </label>

            <div className="ms-auto flex items-center gap-3">
              {error && <span className="label-tight">{error}</span>}
              <Button variant="outline" magnetic={false} onClick={() => setDraft(null)}>
                {tr('admin.cancel')}
              </Button>
              <Button variant="solid" magnetic={false} onClick={save} disabled={saving}>
                {saving ? <><Spinner /> …</> : <><Save size={13} strokeWidth={2.3} /> {tr('admin.save')}</>}
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {items.length === 0 ? <EmptyState label={tr('admin.empty')} /> : (
        <ul className="space-y-2">
          {items.map((project) => (
            <li key={project.id ?? project.slug}>
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                      <span className="display text-lg">{project.title}</span>
                      {project.featured && <Pill>featured</Pill>}
                      {!project.published && <Pill>draft</Pill>}
                    </div>
                    <p className="label-tight" style={{ color: 'var(--fg-faint)' }}>
                      /{project.slug} · {project.category} · {project.year} · order {project.order}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" magnetic={false} onClick={() => setDraft(project)}>
                      {tr('admin.edit')}
                    </Button>
                    <button onClick={() => remove(project)} aria-label={tr('admin.delete')}
                            className="flex w-10 items-center justify-center border-2"
                            style={{ borderColor: 'var(--edge-soft)' }}>
                      <Trash2 size={13} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
