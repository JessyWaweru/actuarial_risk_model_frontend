import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { Button, Card, ErrorBanner, Field, PageHeader, Select, Spinner, StatCard, TextInput } from '../components/ui'
import type { CredibilityResponse } from '../types'

const DEFAULT_RISKS = ['100,120,110', '500,520,480', '200,210,190']

export function Credibility() {
  const [risksText, setRisksText] = useState(DEFAULT_RISKS)
  const [targetIndex, setTargetIndex] = useState(0)
  const [result, setResult] = useState<CredibilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateRisk(i: number, value: string) {
    setRisksText((rows) => rows.map((r, idx) => (idx === i ? value : r)))
  }

  function addRisk() {
    setRisksText((rows) => [...rows, ''])
  }

  function removeRisk(i: number) {
    setRisksText((rows) => rows.filter((_, idx) => idx !== i))
    if (targetIndex >= risksText.length - 1) setTargetIndex(0)
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const claims_by_risk = risksText.map((row) => row.split(',').map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v)))
      setResult(await api.credibility.calculate({ claims_by_risk, target_index: targetIndex }))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Buhlmann Credibility"
        description="Blend an individual risk's experience with the collective mean, weighted by a credibility factor Z."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Historical claims per risk (comma-separated periods)
            </div>
            {risksText.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs text-muted">Risk {i}</span>
                <TextInput value={row} onChange={(v) => updateRisk(i, v)} />
                <Button variant="secondary" onClick={() => removeRisk(i)}>
                  &times;
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addRisk}>
              + Add risk
            </Button>
            <Field label="Price which risk?">
              <Select
                value={String(targetIndex)}
                onChange={(v) => setTargetIndex(Number(v))}
                options={risksText.map((_, i) => ({ value: String(i), label: `Risk ${i}` }))}
              />
            </Field>
            <Button onClick={handleSubmit} disabled={loading}>
              Calculate credibility premium
            </Button>
          </div>
        </Card>
        <Card>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {result && !loading && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Credibility (Z)" value={result.z.toFixed(3)} />
              <StatCard
                label="Credibility premium"
                value={result.credibility_premium.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              />
              <StatCard label="Individual mean" value={result.individual_mean.toFixed(1)} />
              <StatCard label="Collective mean" value={result.collective_mean.toFixed(1)} />
              <StatCard label="EPV" value={result.epv.toFixed(1)} />
              <StatCard label="VHM" value={result.vhm.toFixed(1)} />
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
