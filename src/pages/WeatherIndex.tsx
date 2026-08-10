import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart, LineSeriesChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard } from '../components/ui'
import type { County, WeatherIndexRequest, WeatherIndexResponse } from '../types'

const COUNTY_DEFAULTS: Record<County, { strike_mm: number; exit_mm: number; label: string }> = {
  homabay: { strike_mm: 500, exit_mm: 300, label: 'Homa Bay' },
  westpokot: { strike_mm: 460, exit_mm: 320, label: 'West Pokot' },
  turkana: { strike_mm: 100, exit_mm: 30, label: 'Turkana' },
}

const DEFAULTS: WeatherIndexRequest = {
  county: 'turkana',
  trigger_months: [3, 4, 5],
  strike_mm: COUNTY_DEFAULTS.turkana.strike_mm,
  exit_mm: COUNTY_DEFAULTS.turkana.exit_mm,
  sum_insured: 50_000,
  risk_load: 0.2,
  expense_load: 0.15,
  simulations: 10_000,
  confidence: 0.95,
}

export function WeatherIndex() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<WeatherIndexResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setCounty(county: County) {
    setForm((f) => ({ ...f, county, strike_mm: COUNTY_DEFAULTS[county].strike_mm, exit_mm: COUNTY_DEFAULTS[county].exit_mm }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.weatherIndex.analyze(form))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const rainfallSeries = result?.years.map((y, i) => ({ year: y, rainfall: Math.round(result.historical_index_mm[i]) })) ?? []
  const payoutSeries = result?.years.map((y, i) => ({ year: y, payout: Math.round(result.historical_payouts[i]) })) ?? []

  return (
    <div>
      <PageHeader
        title="Weather-Index (Parametric) Insurance"
        description="Drought-triggered rainfall index insurance for smallholder livestock/crop cover, over real historical rainfall for three Kenyan counties."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="County" hint="March-April-May 'long rains' cumulative rainfall (real NASA POWER data, 1991-2023)">
              <Select
                value={form.county}
                onChange={(v) => setCounty(v as County)}
                options={Object.entries(COUNTY_DEFAULTS).map(([value, { label }]) => ({ value, label }))}
              />
            </Field>
            <Field label="Strike (mm)" hint="Rainfall level at/below which payouts begin">
              <NumberInput value={form.strike_mm} onChange={(v) => setForm((f) => ({ ...f, strike_mm: v }))} min={0} />
            </Field>
            <Field label="Exit (mm)" hint="Rainfall level at/below which the full sum insured is paid">
              <NumberInput value={form.exit_mm} onChange={(v) => setForm((f) => ({ ...f, exit_mm: v }))} min={0} />
            </Field>
            <Field label="Sum insured (KES)">
              <NumberInput value={form.sum_insured} onChange={(v) => setForm((f) => ({ ...f, sum_insured: v }))} min={0} />
            </Field>
            <Field label="Confidence" hint="For VaR / TVaR of the simulated payout">
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
                <StatCard label="Gross premium" value={result.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub="Burn-cost, historical" />
                <StatCard label="Payout probability" value={`${(result.payout_probability * 100).toFixed(1)}%`} sub="Simulated" />
                <StatCard label={`VaR ${(form.confidence * 100).toFixed(0)}%`} value={result.var.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label={`TVaR ${(form.confidence * 100).toFixed(0)}%`} value={result.tvar.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
              <div className="text-xs text-muted">
                Historical mean seasonal rainfall: {result.fitted_mean_mm.toFixed(0)}mm (std {result.fitted_std_mm.toFixed(0)}mm) &middot; loss ratio {(result.loss_ratio * 100).toFixed(0)}%
              </div>
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>

      {result && !loading && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-2 text-sm font-medium text-ink">Historical rainfall by year (climate shock)</div>
            <LineSeriesChart data={rainfallSeries} xKey="year" series={[{ key: 'rainfall', label: 'Rainfall (mm)' }]} xTickFormatter={(v) => String(v)} />
          </Card>
          <Card>
            <div className="mb-2 text-sm font-medium text-ink">Historical payout by year (insurance response)</div>
            <LineSeriesChart data={payoutSeries} xKey="year" series={[{ key: 'payout', label: 'Payout (KES)' }]} xTickFormatter={(v) => String(v)} />
          </Card>
          <Card className="lg:col-span-2">
            <div className="mb-2 text-sm font-medium text-ink">Simulated payout distribution ({form.simulations.toLocaleString()} seasons)</div>
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
