import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart, LineSeriesChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Spinner, StatCard } from '../components/ui'
import type { AreaYieldRequest, AreaYieldResponse } from '../types'

const DEFAULTS: AreaYieldRequest = {
  coverage_level: 0.8,
  price_per_kg: 45,
  risk_load: 0.2,
  expense_load: 0.15,
  simulations: 10_000,
  confidence: 0.95,
}

export function AreaYield() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<AreaYieldResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.areaYield.analyze(form))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const yieldSeries =
    result?.years.map((y, i) => ({
      year: y,
      actual: Math.round(result.actual_yield[i]),
      trend: Math.round(result.trend_yield[i]),
      guaranteed: Math.round(result.trend_yield[i] * form.coverage_level),
    })) ?? []
  const indemnitySeries = result?.years.map((y, i) => ({ year: y, indemnity: Math.round(result.historical_indemnities[i]) })) ?? []

  return (
    <div>
      <PageHeader
        title="Area-Yield Crop Insurance"
        description="Payout triggered when a region's average yield falls below a guaranteed fraction of its trend yield, over Kenya's real national cereal yield series (1961-2023)."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="Coverage level" hint="Fraction of trend yield guaranteed, e.g. 0.8 = 80%">
              <NumberInput value={form.coverage_level} onChange={(v) => setForm((f) => ({ ...f, coverage_level: v }))} step={0.05} min={0} max={1} />
            </Field>
            <Field label="Price (KES / kg)">
              <NumberInput value={form.price_per_kg} onChange={(v) => setForm((f) => ({ ...f, price_per_kg: v }))} min={0} />
            </Field>
            <Field label="Confidence" hint="For VaR / TVaR of the simulated indemnity">
              <NumberInput value={form.confidence} onChange={(v) => setForm((f) => ({ ...f, confidence: v }))} step={0.01} min={0} max={0.999} />
            </Field>
            <Button onClick={handleSubmit} disabled={loading}>
              Analyze
            </Button>
          </div>
        </Card>
        <Card>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {result && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Gross premium / ha" value={result.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub="Burn-cost, historical" />
                <StatCard label="Loss ratio" value={`${(result.loss_ratio * 100).toFixed(0)}%`} />
                <StatCard label={`VaR ${(form.confidence * 100).toFixed(0)}%`} value={result.var.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label={`TVaR ${(form.confidence * 100).toFixed(0)}%`} value={result.tvar.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
              <div className="text-xs text-muted">
                Trend: {result.trend_slope >= 0 ? '+' : ''}{result.trend_slope.toFixed(1)} kg/ha/year &middot; residual std {result.residual_std.toFixed(0)} kg/ha
              </div>
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>

      {result && !loading && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <div className="mb-2 text-sm font-medium text-ink">Actual vs. trend vs. guaranteed yield</div>
            <LineSeriesChart
              data={yieldSeries}
              xKey="year"
              series={[
                { key: 'actual', label: 'Actual yield (kg/ha)' },
                { key: 'trend', label: 'Trend yield' },
                { key: 'guaranteed', label: 'Guaranteed level' },
              ]}
              xTickFormatter={(v) => String(v)}
            />
          </Card>
          <Card>
            <div className="mb-2 text-sm font-medium text-ink">Historical indemnity by year</div>
            <LineSeriesChart data={indemnitySeries} xKey="year" series={[{ key: 'indemnity', label: 'Indemnity (KES/ha)' }]} xTickFormatter={(v) => String(v)} />
          </Card>
          <Card>
            <div className="mb-2 text-sm font-medium text-ink">Simulated indemnity distribution</div>
            <HistogramChart
              histogram={result.histogram}
              markers={[{ label: `VaR ${(form.confidence * 100).toFixed(0)}%`, value: result.var, color: '#f59e0b' }]}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
