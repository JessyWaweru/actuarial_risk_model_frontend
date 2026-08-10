import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { LineSeriesChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Spinner, StatCard, TextInput } from '../components/ui'
import type { ExtremeValueResponse } from '../types'

export function ExtremeValue() {
  const [mean, setMean] = useState(1000)
  const [stdDev, setStdDev] = useState(800)
  const [simulations, setSimulations] = useState(20000)
  const [threshold, setThreshold] = useState(2000)
  const [confidence, setConfidence] = useState(0.99)
  const [returnPeriodsText, setReturnPeriodsText] = useState('10,50,100,250')
  const [result, setResult] = useState<ExtremeValueResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const return_periods = returnPeriodsText.split(',').map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v))
      setResult(
        await api.extremeValue.analyze({
          simulation: { dist: 'lognormal', mean, std_dev: stdDev, simulations, seed: 3 },
          threshold,
          return_periods,
          confidence,
          events_per_period: 1,
        })
      )
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Extreme Value / Tail Risk"
        description="Fit a Generalized Pareto Distribution to loss exceedances (peaks-over-threshold) for catastrophe-tail risk."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Underlying loss simulation</div>
            <Field label="Mean">
              <NumberInput value={mean} onChange={setMean} />
            </Field>
            <Field label="Std dev">
              <NumberInput value={stdDev} onChange={setStdDev} />
            </Field>
            <Field label="Simulations">
              <NumberInput value={simulations} onChange={setSimulations} step={1000} />
            </Field>
            <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Tail fit</div>
            <Field label="Threshold" hint="Losses above this are used as exceedances">
              <NumberInput value={threshold} onChange={setThreshold} />
            </Field>
            <Field label="Return periods" hint="Comma-separated">
              <TextInput value={returnPeriodsText} onChange={setReturnPeriodsText} />
            </Field>
            <Field label="Tail confidence">
              <NumberInput value={confidence} onChange={setConfidence} step={0.001} min={0.9} max={0.9999} />
            </Field>
            <Button onClick={handleSubmit} disabled={loading}>
              Fit tail
            </Button>
          </div>
        </Card>
        <Card>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {result && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Shape (xi)" value={result.shape.toFixed(4)} />
                <StatCard label="Scale" value={result.scale.toFixed(1)} />
                <StatCard label="Exceedances" value={String(result.n_exceedances)} />
                <StatCard label="Exceedance rate" value={`${(result.exceedance_rate * 100).toFixed(2)}%`} />
                <StatCard label={`Tail VaR @ ${(confidence * 100).toFixed(1)}%`} value={result.tail_var.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label={`Tail TVaR @ ${(confidence * 100).toFixed(1)}%`} value={result.tail_tvar.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
              <LineSeriesChart
                data={result.return_levels.map((p) => ({ period: p.return_period, level: p.level }))}
                xKey="period"
                series={[{ key: 'level', label: 'Return level' }]}
              />
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
