import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart, SingleSeriesBarChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Spinner, StatCard } from '../components/ui'
import type { HealthCatCoverRequest, HealthCatCoverResponse, HealthTriangleRequest, HealthTriangleResponse } from '../types'

const TRIANGLE_DEFAULTS: HealthTriangleRequest = { n_years: 5, base_claims: 800_000, growth: 0.12, seed: 42 }
const COVER_DEFAULTS: HealthCatCoverRequest = {
  mean_annual_claims: 5_000_000,
  cv: 0.3,
  n_years: 10_000,
  deductible: 6_000_000,
  limit: 3_000_000,
}

function TriangleTable({ triangle }: { triangle: (number | null)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-14 text-left text-muted">AY \ Dev</th>
            {triangle[0].map((_, j) => (
              <th key={j} className="px-2 font-normal text-muted">{j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {triangle.map((row, i) => (
            <tr key={i}>
              <td className="pr-2 text-muted">Y{i}</td>
              {row.map((v, j) => (
                <td key={j} className="rounded-md bg-surface-raised px-2 py-1 text-ink tabular-nums">
                  {v === null ? '—' : Math.round(v).toLocaleString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function HealthMicro() {
  const [triForm, setTriForm] = useState(TRIANGLE_DEFAULTS)
  const [triResult, setTriResult] = useState<HealthTriangleResponse | null>(null)
  const [triLoading, setTriLoading] = useState(false)
  const [triError, setTriError] = useState<string | null>(null)

  const [coverForm, setCoverForm] = useState(COVER_DEFAULTS)
  const [coverResult, setCoverResult] = useState<HealthCatCoverResponse | null>(null)
  const [coverLoading, setCoverLoading] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)

  async function handleTriangle() {
    setTriLoading(true)
    setTriError(null)
    try {
      setTriResult(await api.healthMicro.triangle(triForm))
    } catch (e) {
      setTriError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setTriLoading(false)
    }
  }

  async function handleCover() {
    setCoverLoading(true)
    setCoverError(null)
    try {
      setCoverResult(await api.healthMicro.catastrophicCover(coverForm))
    } catch (e) {
      setCoverError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setCoverLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Health Microinsurance"
        description="IBNR reserving for a scheme's claims triangle (Mack's stochastic chain ladder), plus catastrophic/stop-loss cover pricing over aggregate annual claims."
      />
      <Card className="mb-6">
        <div className="mb-3 text-sm font-medium text-ink">Claims triangle & IBNR reserve</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Accident years">
              <NumberInput value={triForm.n_years} onChange={(v) => setTriForm((f) => ({ ...f, n_years: v }))} min={3} max={10} />
            </Field>
            <Field label="Base claims (year 0, KES)">
              <NumberInput value={triForm.base_claims} onChange={(v) => setTriForm((f) => ({ ...f, base_claims: v }))} min={0} />
            </Field>
            <Field label="Membership growth" hint="Year-over-year growth in ultimate claims, e.g. 0.12 = 12%">
              <NumberInput value={triForm.growth} onChange={(v) => setTriForm((f) => ({ ...f, growth: v }))} step={0.01} />
            </Field>
            <Button onClick={handleTriangle} disabled={triLoading}>
              Build triangle & reserve
            </Button>
          </div>
          <div>
            {triLoading && <Spinner />}
            {triError && <ErrorBanner message={triError} />}
            {triResult && !triLoading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Total reserve" value={triResult.total_reserve.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                  <StatCard label="Standard error" value={triResult.total_standard_error.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub={`CV ${(triResult.coefficient_of_variation * 100).toFixed(1)}%`} />
                </div>
                <SingleSeriesBarChart
                  data={triResult.reserve_by_year.map((v, i) => ({ year: `Y${i}`, reserve: Math.round(v) }))}
                  xKey="year"
                  yKey="reserve"
                />
              </div>
            )}
            {!triResult && !triLoading && !triError && <div className="text-sm text-muted">Results will appear here.</div>}
          </div>
        </div>
        {triResult && !triLoading && (
          <div className="mt-4">
            <TriangleTable triangle={triResult.triangle} />
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3 text-sm font-medium text-ink">Catastrophic / stop-loss cover pricing</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Mean annual claims (KES)">
              <NumberInput value={coverForm.mean_annual_claims} onChange={(v) => setCoverForm((f) => ({ ...f, mean_annual_claims: v }))} min={0} />
            </Field>
            <Field label="Coefficient of variation" hint="Volatility of annual claims relative to the mean">
              <NumberInput value={coverForm.cv} onChange={(v) => setCoverForm((f) => ({ ...f, cv: v }))} step={0.05} min={0} />
            </Field>
            <Field label="Deductible (KES)" hint="Scheme retains claims up to this level">
              <NumberInput value={coverForm.deductible} onChange={(v) => setCoverForm((f) => ({ ...f, deductible: v }))} min={0} />
            </Field>
            <Field label="Cover limit (KES)" hint="Catastrophic layer above the deductible">
              <NumberInput value={coverForm.limit} onChange={(v) => setCoverForm((f) => ({ ...f, limit: v }))} min={0} />
            </Field>
            <Button onClick={handleCover} disabled={coverLoading}>
              Price cover
            </Button>
          </div>
          <div>
            {coverLoading && <Spinner />}
            {coverError && <ErrorBanner message={coverError} />}
            {coverResult && !coverLoading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Pure premium" value={coverResult.pure_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                  <StatCard label="Gross premium" value={coverResult.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub={`Loss ratio ${(coverResult.loss_ratio * 100).toFixed(0)}%`} />
                </div>
                <HistogramChart histogram={coverResult.histogram} markers={[{ label: 'Deductible', value: coverForm.deductible, color: '#f59e0b' }]} />
              </div>
            )}
            {!coverResult && !coverLoading && !coverError && <div className="text-sm text-muted">Results will appear here.</div>}
          </div>
        </div>
      </Card>
    </div>
  )
}
