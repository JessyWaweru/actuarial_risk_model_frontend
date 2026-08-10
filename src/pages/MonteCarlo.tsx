import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart } from '../components/charts'
import { SaveRun } from '../components/SaveRun'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard } from '../components/ui'
import { status } from '../theme'
import type { DistName, MonteCarloRequest, MonteCarloResponse } from '../types'

const DEFAULTS: MonteCarloRequest = { dist: 'lognormal', mean: 10000, std_dev: 4000, simulations: 10000, seed: 42 }

export function MonteCarlo() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<MonteCarloResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsStdDev = form.dist === 'normal' || form.dist === 'lognormal' || form.dist === 'gamma'

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.simulation.monteCarlo(form))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Monte Carlo Simulator"
        description="Simulate a single loss distribution and compute VaR / TVaR at 95% and 99%."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="Distribution">
              <Select
                value={form.dist}
                onChange={(v) => setForm((f) => ({ ...f, dist: v as DistName }))}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'poisson', label: 'Poisson' },
                  { value: 'lognormal', label: 'Lognormal' },
                  { value: 'gamma', label: 'Gamma' },
                ]}
              />
            </Field>
            <Field label="Mean">
              <NumberInput value={form.mean} onChange={(v) => setForm((f) => ({ ...f, mean: v }))} />
            </Field>
            {needsStdDev && (
              <Field label="Standard deviation">
                <NumberInput value={form.std_dev ?? 0} onChange={(v) => setForm((f) => ({ ...f, std_dev: v }))} />
              </Field>
            )}
            <Field label="Simulations">
              <NumberInput value={form.simulations} onChange={(v) => setForm((f) => ({ ...f, simulations: v }))} step={1000} />
            </Field>
            <Field label="Random seed" hint="Optional, for reproducibility">
              <NumberInput value={form.seed ?? 0} onChange={(v) => setForm((f) => ({ ...f, seed: v }))} />
            </Field>
            <Button onClick={handleSubmit} disabled={loading}>
              Run simulation
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
                <StatCard label="95% VaR" value={result.var_95.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="99% VaR" value={result.var_99.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="95% TVaR" value={result.tvar_95.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                <StatCard label="99% TVaR" value={result.tvar_99.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
              <HistogramChart
                histogram={result.histogram}
                markers={[
                  { label: '95% VaR', value: result.var_95, color: status.warning },
                  { label: '99% VaR', value: result.var_99, color: status.critical },
                ]}
              />
              <SaveRun kind="monte_carlo" input={form} result={result} />
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
