import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { SaveRun } from '../components/SaveRun'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard } from '../components/ui'
import type { DistName, RiskMetricsResponse } from '../types'

export function RiskMetrics() {
  const [dist, setDist] = useState<DistName>('lognormal')
  const [mean, setMean] = useState(10000)
  const [stdDev, setStdDev] = useState(4000)
  const [simulations, setSimulations] = useState(10000)
  const [confidence, setConfidence] = useState(0.95)
  const [result, setResult] = useState<RiskMetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsStdDev = dist !== 'poisson'

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const req = { simulation: { dist, mean, std_dev: needsStdDev ? stdDev : undefined, simulations, seed: 1 }, confidence }
    try {
      setResult(await api.riskMetrics.calculate(req))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Risk Metrics" description="VaR and TVaR from a regenerated Monte Carlo simulation." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="Distribution">
              <Select
                value={dist}
                onChange={(v) => setDist(v as DistName)}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'poisson', label: 'Poisson' },
                  { value: 'lognormal', label: 'Lognormal' },
                  { value: 'gamma', label: 'Gamma' },
                ]}
              />
            </Field>
            <Field label="Mean">
              <NumberInput value={mean} onChange={setMean} />
            </Field>
            {needsStdDev && (
              <Field label="Standard deviation">
                <NumberInput value={stdDev} onChange={setStdDev} />
              </Field>
            )}
            <Field label="Simulations">
              <NumberInput value={simulations} onChange={setSimulations} step={1000} />
            </Field>
            <Field label="Confidence level">
              <NumberInput value={confidence} onChange={setConfidence} step={0.01} min={0.5} max={0.999} />
            </Field>
            <Button onClick={handleSubmit} disabled={loading}>
              Calculate
            </Button>
          </div>
        </Card>
        <Card>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {result && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Mean" value={result.mean.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="Std dev" value={result.std_dev.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label={`VaR @ ${(result.confidence * 100).toFixed(0)}%`} value={result.var.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label={`TVaR @ ${(result.confidence * 100).toFixed(0)}%`} value={result.tvar.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="Max loss" value={result.max_loss.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="Min loss" value={result.min_loss.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
              <SaveRun kind="risk_metrics" input={{ dist, mean, stdDev, simulations, confidence }} result={result} />
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
