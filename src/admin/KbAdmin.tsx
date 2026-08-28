import { useEffect, useState } from 'react'
import { Brain, Plus, Save, Trash2, X } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useI18n } from '@/i18n'
import { Button, PageLoader, Spinner } from '@/components/ui'
import { AdminField, AdminHeader, Panel, Pill } from './parts'

interface Chunk { chunk_id: string; title: string; kind: string; text: string; id?: string }

const BLANK: Chunk = { chunk_id: '', title: '', kind: 'note', text: '' }

export default function KbAdmin() {
  const { tr } = useI18n()
  const [base, setBase] = useState<Chunk[] | null>(null)
  const [custom, setCustom] = useState<Chunk[]>([])
  const [draft, setDraft] = useState<Chunk | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    adminApi.kb()
      .then((d) => { setBase(d.base); setCustom(d.custom) })
      .catch(() => { setBase([]); setCustom([]) })
  }

  useEffect(load, [])

  async function save() {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      await adminApi.saveKb({
        chunk_id: draft.chunk_id, title: draft.title, kind: draft.kind,
        text: draft.text, locale: 'all',
      })
      setDraft(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(chunk: Chunk) {
    if (!confirm(tr('admin.confirmDelete'))) return
    await adminApi.deleteKb(chunk.chunk_id)
    load()
  }

  if (!base) return <PageLoader label={tr('common.loading')} />

  return (
    <>
      <AdminHeader
        title={tr('admin.kb')}
        subtitle={`${base.length} generated · ${custom.length} custom`}
        action={
          <Button variant="solid" magnetic={false} onClick={() => setDraft({ ...BLANK })}>
            <Plus size={14} strokeWidth={2.4} /> {tr('admin.new')}
          </Button>
        }
      />

      <Panel className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold">
          <Brain size={15} strokeWidth={2} /> How the chatbot retrieves
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-dim)' }}>
          Chunks below are indexed with BM25 — no embedding API required, so retrieval keeps
          working even when the language model is unavailable. Put all three languages in the
          same chunk so a question in any language matches it. Overriding a generated
          <code className="mono mx-1 text-xs">chunk_id</code> replaces that chunk.
        </p>
      </Panel>

      {draft && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center justify-between border-b pb-4"
               style={{ borderColor: 'var(--edge-soft)' }}>
            <h2 className="display text-lg">{tr('admin.new')}</h2>
            <button onClick={() => setDraft(null)} aria-label={tr('admin.cancel')}
                    className="flex h-8 w-8 items-center justify-center border-2"
                    style={{ borderColor: 'var(--edge-soft)' }}>
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <AdminField label="Chunk ID" hint="unique">
              <input value={draft.chunk_id} className="field-box"
                     onChange={(e) => setDraft({ ...draft, chunk_id: e.target.value })} />
            </AdminField>
            <AdminField label="Title">
              <input value={draft.title} className="field-box"
                     onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </AdminField>
            <AdminField label="Kind">
              <input value={draft.kind} className="field-box"
                     onChange={(e) => setDraft({ ...draft, kind: e.target.value })} />
            </AdminField>
          </div>

          <div className="mt-5">
            <AdminField label="Text" hint="include FR + EN + AR">
              <textarea rows={10} value={draft.text} className="field-box resize-y"
                        onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
            </AdminField>
          </div>

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

      {custom.length > 0 && (
        <>
          <p className="label mb-3">Custom chunks</p>
          <ul className="mb-8 space-y-2">
            {custom.map((chunk) => (
              <li key={chunk.chunk_id}>
                <Panel>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <span className="font-bold">{chunk.title}</span>
                        <Pill>{chunk.kind}</Pill>
                      </div>
                      <p className="mono mb-2 text-xs" style={{ color: 'var(--fg-faint)' }}>
                        {chunk.chunk_id}
                      </p>
                      <p className="line-clamp-2 text-sm" style={{ color: 'var(--fg-dim)' }}>
                        {chunk.text}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" magnetic={false} onClick={() => setDraft(chunk)}>
                        {tr('admin.edit')}
                      </Button>
                      <button onClick={() => remove(chunk)} aria-label={tr('admin.delete')}
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
        </>
      )}

      <p className="label mb-3">Generated from content ({base.length})</p>
      <ul className="space-y-2">
        {base.map((chunk) => (
          <li key={chunk.chunk_id}>
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2.5">
                    <span className="font-bold">{chunk.title}</span>
                    <Pill>{chunk.kind}</Pill>
                  </div>
                  <p className="mono mb-2 text-xs" style={{ color: 'var(--fg-faint)' }}>
                    {chunk.chunk_id}
                  </p>
                  <p className="line-clamp-2 text-sm" style={{ color: 'var(--fg-dim)' }}>
                    {chunk.text}
                  </p>
                </div>
                <Button variant="outline" magnetic={false}
                        onClick={() => setDraft({ ...chunk, id: undefined })}>
                  Override
                </Button>
              </div>
            </Panel>
          </li>
        ))}
      </ul>
    </>
  )
}
