import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { SingleSeriesBarChart } from '../components/charts'
import { emptyTriangle, TriangleInput } from '../components/TriangleInput'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard, TextInput } from '../components/ui'
import type { BornhuetterFergusonResponse, ChainLadderResponse, MackChainLadderResponse, Triangle } from '../types'

const SAMPLE_TRIANGLE: Triangle = [
  [100, 150, 175, 180],
  [120, 180, 200, null],
  [140, 200, null, null],
  [130, null, null, null],
]

type Method = 'chain-ladder' | 'mack' | 'bornhuetter-ferguson'
type AnyResult = ChainLadderResponse | MackChainLadderResponse | BornhuetterFergusonResponse

export function Reserving() {
  const [triangle, setTriangle] = useState<Triangle>(SAMPLE_TRIANGLE)
  const [method, setMethod] = useState<Method>('mack')
  const [expectedLossRatio, setExpectedLossRatio] = useState(0.6)
  const [premiumText, setPremiumText] = useState('1000,1100,1200,1300')
  const [result, setResult] = useState<AnyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      if (method === 'chain-ladder') {
        setResult(await api.reserving.chainLadder(triangle))
      } else if (method === 'mack') {
        setResult(await api.reserving.chainLadderMack(triangle))
      } else {
        const premium = premiumText.split(',').map((v) => parseFloat(v.trim()))
        setResult(await api.reserving.bornhuetterFerguson(triangle, expectedLossRatio, premium))
      }
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const reserveByYear = 'reserve_by_year' in (result ?? {}) ? (result as MackChainLadderResponse).reserve_by_year : null

  return (
    <div>
      <PageHeader
        title="Loss Reserving"
        description="Deterministic chain ladder, Mack's stochastic chain ladder, or Bornhuetter-Ferguson IBNR."
      />
      <Card className="mb-6">
        <TriangleInput triangle={triangle} onChange={setTriangle} />
        <div className="mt-3">
          <Button variant="secondary" onClick={() => setTriangle(emptyTriangle(triangle.length))}>
            Clear
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="Method">
              <Select
                value={method}
                onChange={(v) => setMethod(v as Method)}
                options={[
                  { value: 'chain-ladder', label: 'Deterministic chain ladder' },
                  { value: 'mack', label: "Mack's stochastic chain ladder" },
                  { value: 'bornhuetter-ferguson', label: 'Bornhuetter-Ferguson' },
                ]}
              />
            </Field>
            {method === 'bornhuetter-ferguson' && (
              <>
                <Field label="Expected loss ratio">
                  <NumberInput value={expectedLossRatio} onChange={setExpectedLossRatio} step={0.05} />
                </Field>
                <Field label="Earned premium by accident year" hint="Comma-separated, one value per year">
                  <TextInput value={premiumText} onChange={setPremiumText} />
                </Field>
              </>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
              Calculate reserve
            </Button>
          </div>
        </Card>
        <Card>
          {loading && <Spinner />}
          {error && <ErrorBanner message={error} />}
          {result && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total reserve" value={result.total_reserve.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
                {'total_standard_error' in result && (
                  <StatCard
                    label="Standard error"
                    value={(result as MackChainLadderResponse).total_standard_error.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    sub={`CV: ${((result as MackChainLadderResponse).coefficient_of_variation * 100).toFixed(1)}%`}
                  />
                )}
              </div>
              {reserveByYear && (
                <SingleSeriesBarChart
                  data={reserveByYear.map((v, i) => ({ year: `Y${i}`, reserve: Math.round(v) }))}
                  xKey="year"
                  yKey="reserve"
                />
              )}
              <div className="text-xs text-muted">
                Dev factors: {result.dev_factors.map((f) => f.toFixed(3)).join(', ')}
              </div>
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
