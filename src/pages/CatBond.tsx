import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Spinner, StatCard } from '../components/ui'
import type { CatBondRequest, CatBondResponse } from '../types'

const DEFAULTS: CatBondRequest = {
  threshold_percentile: 98,
  attachment_mm: 40,
  exhaustion_mm: 100,
  principal: 10_000_000,
  risk_multiple: 3.0,
  n_years: 10_000,
}

export function CatBond() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<CatBondResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.catBond.price(form))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Flood Catastrophe Bond"
        description="Excess-of-loss cat bond pricing driven by a GPD tail fit to real daily rainfall in the lower Tana River basin (Garissa), 2001-2023 -- used as a public proxy for flood severity."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="GPD threshold percentile" hint="Daily rainfall percentile above which the tail is fitted">
              <NumberInput value={form.threshold_percentile} onChange={(v) => setForm((f) => ({ ...f, threshold_percentile: v }))} min={80} max={99.9} step={0.5} />
            </Field>
            <Field label="Attachment (mm)" hint="Annual-max daily rainfall at which the bond starts to lose principal">
              <NumberInput value={form.attachment_mm} onChange={(v) => setForm((f) => ({ ...f, attachment_mm: v }))} min={0} />
            </Field>
            <Field label="Exhaustion (mm)" hint="Annual-max daily rainfall at which the bond loses 100% of principal">
              <NumberInput value={form.exhaustion_mm} onChange={(v) => setForm((f) => ({ ...f, exhaustion_mm: v }))} min={0} />
            </Field>
            <Field label="Principal (KES)">
              <NumberInput value={form.principal} onChange={(v) => setForm((f) => ({ ...f, principal: v }))} min={0} />
            </Field>
            <Field label="Risk multiple" hint="Coupon spread as a multiple of modeled expected loss (cat bonds historically ~2-5x)">
              <NumberInput value={form.risk_multiple} onChange={(v) => setForm((f) => ({ ...f, risk_multiple: v }))} step={0.5} min={1} />
            </Field>
            <Button onClick={handleSubmit} disabled={loading}>
              Price bond
            </Button>
          </div>
        </Card>
        <Card>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {result && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Expected loss" value={`${(result.expected_loss_pct * 100).toFixed(2)}%`} sub={result.expected_loss_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="Coupon spread" value={`${(result.coupon_spread_pct * 100).toFixed(2)}%`} sub={result.annual_coupon_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="P(attachment)" value={`${(result.probability_of_attachment * 100).toFixed(1)}%`} />
                <StatCard label="P(exhaustion)" value={`${(result.probability_of_exhaustion * 100).toFixed(1)}%`} />
              </div>
              <div className="text-xs text-muted">
                GPD fit: shape {result.shape.toFixed(3)}, scale {result.scale.toFixed(2)}, threshold {result.threshold_mm.toFixed(1)}mm ({result.n_exceedances} exceedances, rate {(result.exceedance_rate * 100).toFixed(2)}%/day)
              </div>
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>

      {result && !loading && (
        <Card className="mt-6">
          <div className="mb-2 text-sm font-medium text-ink">Simulated annual principal loss ({form.n_years.toLocaleString()} years)</div>
          <HistogramChart histogram={result.histogram} />
        </Card>
      )}
    </div>
  )
}
