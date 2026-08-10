import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart } from '../components/charts'
import { Button, Card, ErrorBanner, NumberInput, PageHeader, Select, Spinner, StatCard, TextInput } from '../components/ui'
import type { PortfolioLine, PortfolioResponse } from '../types'

function defaultCorrelation(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0.3)))
}

const DEFAULT_LINES: PortfolioLine[] = [
  { name: 'Property', dist: 'lognormal', mean: 1_000_000, std_dev: 300_000 },
  { name: 'Liability', dist: 'gamma', mean: 500_000, std_dev: 200_000 },
]

export function Portfolio() {
  const [lines, setLines] = useState<PortfolioLine[]>(DEFAULT_LINES)
  const [correlation, setCorrelation] = useState<number[][]>(defaultCorrelation(2))
  const [result, setResult] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateLine(i: number, patch: Partial<PortfolioLine>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }

  function addLine() {
    const next = [...lines, { name: `Line ${lines.length + 1}`, dist: 'lognormal' as const, mean: 100_000, std_dev: 30_000 }]
    setLines(next)
    setCorrelation(defaultCorrelation(next.length))
  }

  function removeLine(i: number) {
    const next = lines.filter((_, idx) => idx !== i)
    setLines(next)
    setCorrelation(defaultCorrelation(next.length))
  }

  function setCorr(i: number, j: number, value: number) {
    setCorrelation((c) => {
      const next = c.map((row) => [...row])
      next[i][j] = value
      next[j][i] = value
      return next
    })
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.portfolio.simulate({ lines, correlation_matrix: correlation, simulations: 20000, seed: 1 }))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Portfolio Correlation"
        description="Simulate correlated lines of business via a Gaussian copula and quantify the diversification benefit."
      />
      <Card className="mb-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Lines of business</div>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-3">
                <TextInput value={line.name} onChange={(v) => updateLine(i, { name: v })} />
              </div>
              <div className="col-span-3">
                <Select
                  value={line.dist}
                  onChange={(v) => updateLine(i, { dist: v as 'lognormal' | 'gamma' })}
                  options={[
                    { value: 'lognormal', label: 'Lognormal' },
                    { value: 'gamma', label: 'Gamma' },
                  ]}
                />
              </div>
              <div className="col-span-2">
                <NumberInput value={line.mean} onChange={(v) => updateLine(i, { mean: v })} placeholder="mean" />
              </div>
              <div className="col-span-2">
                <NumberInput value={line.std_dev} onChange={(v) => updateLine(i, { std_dev: v })} placeholder="std dev" />
              </div>
              <div className="col-span-2">
                <Button variant="secondary" onClick={() => removeLine(i)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button variant="secondary" onClick={addLine}>
            + Add line
          </Button>
        </div>

        <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Correlation matrix</div>
        <table className="mt-2 border-separate border-spacing-1">
          <tbody>
            {correlation.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td key={j}>
                    <input
                      type="number"
                      step={0.1}
                      min={-1}
                      max={1}
                      disabled={i === j}
                      value={v}
                      onChange={(e) => setCorr(i, j, e.target.valueAsNumber)}
                      className="w-16 rounded-md border border-gridline bg-surface-raised px-1.5 py-1 text-xs text-ink outline-none focus:border-accent disabled:opacity-50"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            Simulate portfolio
          </Button>
        </div>
      </Card>

      <Card>
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {result && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Correlated std dev" value={result.correlated_std.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              <StatCard label="Sum of individual std dev" value={result.sum_of_individual_std.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              <StatCard label="Diversification benefit" value={`${result.diversification_benefit_pct.toFixed(1)}%`} />
            </div>
            <HistogramChart histogram={result.total_histogram} />
          </div>
        )}
        {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
      </Card>
    </div>
  )
}
