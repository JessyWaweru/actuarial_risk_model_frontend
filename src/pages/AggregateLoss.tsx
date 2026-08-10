import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart } from '../components/charts'
import { SaveRun } from '../components/SaveRun'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard } from '../components/ui'
import { status } from '../theme'
import type { AggregateLossRequest, AggregateLossResponse } from '../types'

const DEFAULTS: AggregateLossRequest = {
  frequency: { dist: 'poisson', mean: 3 },
  severity: { dist: 'lognormal', mean: 5000, std_dev: 2000 },
  simulations: 10000,
  seed: 42,
}

export function AggregateLoss() {
  const [form, setForm] = useState<AggregateLossRequest>(DEFAULTS)
  const [result, setResult] = useState<AggregateLossResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.simulation.aggregateLoss(form))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Aggregate Loss Model"
        description="Compound frequency x severity Monte Carlo simulation — the actuarially correct way to model annual aggregate losses."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Claim frequency</div>
            <Field label="Distribution">
              <Select
                value={form.frequency.dist}
                onChange={(v) =>
                  setForm((f) => ({ ...f, frequency: { ...f.frequency, dist: v as 'poisson' | 'negative_binomial' } }))
                }
                options={[
                  { value: 'poisson', label: 'Poisson' },
                  { value: 'negative_binomial', label: 'Negative Binomial (overdispersed)' },
                ]}
              />
            </Field>
            <Field label="Mean claim count">
              <NumberInput
                value={form.frequency.mean}
                onChange={(v) => setForm((f) => ({ ...f, frequency: { ...f.frequency, mean: v } }))}
              />
            </Field>
            {form.frequency.dist === 'negative_binomial' && (
              <Field label="Dispersion" hint="Must be > 1 (variance = mean x dispersion)">
                <NumberInput
                  value={form.frequency.dispersion ?? 1.5}
                  onChange={(v) => setForm((f) => ({ ...f, frequency: { ...f.frequency, dispersion: v } }))}
                  step={0.1}
                />
              </Field>
            )}

            <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Claim severity</div>
            <Field label="Distribution">
              <Select
                value={form.severity.dist}
                onChange={(v) =>
                  setForm((f) => ({ ...f, severity: { ...f.severity, dist: v as 'lognormal' | 'gamma' | 'pareto' } }))
                }
                options={[
                  { value: 'lognormal', label: 'Lognormal' },
                  { value: 'gamma', label: 'Gamma' },
                  { value: 'pareto', label: 'Pareto' },
                ]}
              />
            </Field>
            {form.severity.dist !== 'pareto' ? (
              <>
                <Field label="Mean severity ($)">
                  <NumberInput
                    value={form.severity.mean ?? 0}
                    onChange={(v) => setForm((f) => ({ ...f, severity: { ...f.severity, mean: v } }))}
                  />
                </Field>
                <Field label="Std dev">
                  <NumberInput
                    value={form.severity.std_dev ?? 0}
                    onChange={(v) => setForm((f) => ({ ...f, severity: { ...f.severity, std_dev: v } }))}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Alpha (tail index)">
                  <NumberInput
                    value={form.severity.alpha ?? 2}
                    onChange={(v) => setForm((f) => ({ ...f, severity: { ...f.severity, alpha: v } }))}
                  />
                </Field>
                <Field label="Scale ($)">
                  <NumberInput
                    value={form.severity.scale ?? 1000}
                    onChange={(v) => setForm((f) => ({ ...f, severity: { ...f.severity, scale: v } }))}
                  />
                </Field>
              </>
            )}

            <Field label="Simulations">
              <NumberInput value={form.simulations} onChange={(v) => setForm((f) => ({ ...f, simulations: v }))} step={1000} />
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
                <StatCard label="Mean claim count" value={result.mean_claim_count.toFixed(2)} />
                <StatCard label="Mean aggregate loss" value={result.mean.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
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
              <SaveRun kind="aggregate_loss" input={form} result={result} />
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
