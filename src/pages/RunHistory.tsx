import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Button, Card, ErrorBanner, PageHeader, Spinner } from '../components/ui'
import type { RunDetail, RunSummary } from '../types'

export function RunHistory() {
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [expanded, setExpanded] = useState<Record<number, RunDetail>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setRuns(await api.runs.list())
    } catch {
      setError('Failed to load saved runs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleExpand(id: number) {
    if (expanded[id]) {
      setExpanded((e) => {
        const next = { ...e }
        delete next[id]
        return next
      })
      return
    }
    const detail = await api.runs.get(id)
    setExpanded((e) => ({ ...e, [id]: detail }))
  }

  async function handleDelete(id: number) {
    await api.runs.delete(id)
    setRuns((r) => r.filter((run) => run.id !== id))
  }

  return (
    <div>
      <PageHeader title="Saved Runs" description="History of calculations you've saved from other pages, for later comparison." />
      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {!loading && runs.length === 0 && <div className="text-sm text-muted">No saved runs yet.</div>}
      <div className="space-y-3">
        {runs.map((run) => (
          <Card key={run.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-ink">{run.name}</div>
                <div className="text-xs text-muted">
                  {run.kind} &middot; {new Date(run.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggleExpand(run.id)}>
                  {expanded[run.id] ? 'Hide' : 'Details'}
                </Button>
                <Button variant="secondary" onClick={() => handleDelete(run.id)}>
                  Delete
                </Button>
              </div>
            </div>
            {expanded[run.id] && (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Input</div>
                  <pre className="overflow-x-auto rounded-md bg-surface-raised p-2 text-xs text-ink-secondary">
                    {JSON.stringify(expanded[run.id].input, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Result</div>
                  <pre className="overflow-x-auto rounded-md bg-surface-raised p-2 text-xs text-ink-secondary">
                    {JSON.stringify(expanded[run.id].result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
