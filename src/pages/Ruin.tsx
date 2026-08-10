import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard } from '../components/ui'
import type { RuinResponse } from '../types'

export function Ruin() {
  const [initialSurplus, setInitialSurplus] = useState(5000)
  const [claimRate, setClaimRate] = useState(2)
  const [severityDist, setSeverityDist] = useState<'exponential' | 'gamma' | 'lognormal'>('exponential')
  const [mean, setMean] = useState(1000)
  const [stdDev, setStdDev] = useState(500)
  const [premiumLoading, setPremiumLoading] = useState(0.2)
  const [timeHorizon, setTimeHorizon] = useState(10)
  const [result, setResult] = useState<RuinResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const severity_params: Record<string, number> =
        severityDist === 'exponential' ? { mean } : { mean, std_dev: stdDev }
      setResult(
        await api.ruin.analyze({
          initial_surplus: initialSurplus,
          claim_rate: claimRate,
          severity_dist: severityDist,
          severity_params,
          premium_loading: premiumLoading,
          time_horizon: timeHorizon,
          n_paths: 5000,
          seed: 4,
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
        title="Ruin Probability"
        description="Cramer-Lundberg model: adjustment coefficient, Lundberg bound, and a finite-horizon Monte Carlo estimate."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="Initial surplus">
              <NumberInput value={initialSurplus} onChange={setInitialSurplus} />
            </Field>
            <Field label="Claim rate (claims / period)">
              <NumberInput value={claimRate} onChange={setClaimRate} step={0.1} />
            </Field>
            <Field label="Severity distribution">
              <Select
                value={severityDist}
                onChange={(v) => setSeverityDist(v as 'exponential' | 'gamma' | 'lognormal')}
                options={[
                  { value: 'exponential', label: 'Exponential' },
                  { value: 'gamma', label: 'Gamma' },
                  { value: 'lognormal', label: 'Lognormal' },
                ]}
              />
            </Field>
            <Field label="Mean severity">
              <NumberInput value={mean} onChange={setMean} />
            </Field>
            {severityDist !== 'exponential' && (
              <Field label="Std dev">
                <NumberInput value={stdDev} onChange={setStdDev} />
              </Field>
            )}
            <Field label="Premium loading (theta)">
              <NumberInput value={premiumLoading} onChange={setPremiumLoading} step={0.05} />
            </Field>
            <Field label="Time horizon (periods)">
              <NumberInput value={timeHorizon} onChange={setTimeHorizon} />
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
            <div className="grid grid-cols-2 gap-3">
              {result.adjustment_coefficient !== null && (
                <StatCard label="Adjustment coefficient R" value={result.adjustment_coefficient.toFixed(6)} />
              )}
              {result.ruin_probability_bound !== null && (
                <StatCard label="Lundberg bound" value={result.ruin_probability_bound.toExponential(3)} />
              )}
              {result.ruin_probability_exact !== null && (
                <StatCard label="Exact (exponential)" value={result.ruin_probability_exact.toExponential(3)} />
              )}
              <StatCard
                label={`Simulated P(ruin), horizon=${timeHorizon}`}
                value={result.simulated_ruin_probability.toFixed(4)}
                sub={`${result.simulated_n_ruined} / ${result.simulated_n_paths} paths`}
              />
              {result.simulated_mean_time_to_ruin !== null && (
                <StatCard label="Mean time to ruin" value={result.simulated_mean_time_to_ruin.toFixed(2)} />
              )}
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
