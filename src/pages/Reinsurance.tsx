import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Spinner, StatCard } from '../components/ui'
import type { ReinsuranceLayerResponse, XolReinstatementResponse } from '../types'

function LayerPricing() {
  const [mean, setMean] = useState(1_000_000)
  const [stdDev, setStdDev] = useState(500_000)
  const [attachment, setAttachment] = useState(500_000)
  const [limit, setLimit] = useState(2_000_000)
  const [result, setResult] = useState<ReinsuranceLayerResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(
        await api.reinsurance.layer({
          simulation: { dist: 'lognormal', mean, std_dev: stdDev, simulations: 20000, seed: 1 },
          attachment,
          limit,
        })
      )
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="mb-3 font-medium text-ink">Layer pricing</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Loss mean ($)">
          <NumberInput value={mean} onChange={setMean} />
        </Field>
        <Field label="Loss std dev ($)">
          <NumberInput value={stdDev} onChange={setStdDev} />
        </Field>
        <Field label="Attachment ($)">
          <NumberInput value={attachment} onChange={setAttachment} />
        </Field>
        <Field label="Limit ($)">
          <NumberInput value={limit} onChange={setLimit} />
        </Field>
      </div>
      <Button onClick={handleSubmit} disabled={loading}>
        Price layer
      </Button>
      <div className="mt-4">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Pure premium" value={result.pure_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            <StatCard label="Risk load" value={result.risk_load.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            <StatCard label="Gross premium" value={result.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            <StatCard label="Loss ratio" value={`${(result.loss_ratio * 100).toFixed(1)}%`} />
          </div>
        )}
      </div>
    </Card>
  )
}

function RateOnLineCalc() {
  const [premium, setPremium] = useState(200_000)
  const [limit, setLimit] = useState(1_000_000)
  const [rol, setRol] = useState<number | null>(null)

  async function handleSubmit() {
    const res = await api.reinsurance.rateOnLine(premium, limit)
    setRol(res.rate_on_line)
  }

  return (
    <Card>
      <div className="mb-3 font-medium text-ink">Rate on line</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Premium ($)">
          <NumberInput value={premium} onChange={setPremium} />
        </Field>
        <Field label="Limit ($)">
          <NumberInput value={limit} onChange={setLimit} />
        </Field>
      </div>
      <Button onClick={handleSubmit}>Calculate</Button>
      {rol !== null && (
        <div className="mt-4">
          <StatCard label="Rate on line" value={`${(rol * 100).toFixed(2)}%`} />
        </div>
      )}
    </Card>
  )
}

function XolReinstatements() {
  const [yearsText, setYearsText] = useState('6000000,6000000\n0\n2000000')
  const [attachment, setAttachment] = useState(1_000_000)
  const [limit, setLimit] = useState(5_000_000)
  const [numReinstatements, setNumReinstatements] = useState(1)
  const [reinstatementCostPct, setReinstatementCostPct] = useState(1.0)
  const [result, setResult] = useState<XolReinstatementResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const annual_occurrence_losses = yearsText
        .split('\n')
        .map((line) => line.split(',').map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v)))
        .filter((row) => row.length > 0)
      setResult(
        await api.reinsurance.xolReinstatements({
          annual_occurrence_losses,
          attachment,
          limit,
          num_reinstatements: numReinstatements,
          reinstatement_cost_pct: reinstatementCostPct,
          risk_load_factor: 0.2,
        })
      )
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="mb-3 font-medium text-ink">Excess-of-loss with reinstatements</div>
      <Field label="Occurrence losses per year" hint="One line per simulated year, comma-separated occurrence losses">
        <textarea
          value={yearsText}
          onChange={(e) => setYearsText(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gridline bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </Field>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Attachment ($)">
          <NumberInput value={attachment} onChange={setAttachment} />
        </Field>
        <Field label="Limit ($)">
          <NumberInput value={limit} onChange={setLimit} />
        </Field>
        <Field label="Reinstatements">
          <NumberInput value={numReinstatements} onChange={setNumReinstatements} min={0} />
        </Field>
        <Field label="Reinstatement cost %" hint="1.0 = full pro-rata cost">
          <NumberInput value={reinstatementCostPct} onChange={setReinstatementCostPct} step={0.1} />
        </Field>
      </div>
      <div className="mt-3">
        <Button onClick={handleSubmit} disabled={loading}>
          Price treaty
        </Button>
      </div>
      <div className="mt-4">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="First layer premium" value={result.first_layer_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            <StatCard label="Reinstatement premium" value={result.reinstatement_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            <StatCard label="Gross premium" value={result.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            <StatCard label="Effective rate on line" value={`${(result.effective_rate_on_line * 100).toFixed(2)}%`} />
            <StatCard label="Expected reinstatements used" value={result.expected_reinstatements_used.toFixed(2)} />
            <StatCard label="Loss ratio" value={`${(result.loss_ratio * 100).toFixed(1)}%`} />
          </div>
        )}
      </div>
    </Card>
  )
}

export function Reinsurance() {
  return (
    <div>
      <PageHeader title="Reinsurance Pricing" description="Layer pricing, rate on line, and excess-of-loss treaty pricing with reinstatements." />
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LayerPricing />
          <RateOnLineCalc />
        </div>
        <XolReinstatements />
      </div>
    </div>
  )
}

