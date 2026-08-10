import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { HistogramChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, StatCard } from '../components/ui'
import type {
  MotorFleetSimulationRequest, MotorFleetSimulationResponse,
  MotorPremiumRequest, MotorPremiumResponse, VehicleClassName,
} from '../types'

const VEHICLE_CLASSES: { value: VehicleClassName; label: string }[] = [
  { value: 'private', label: 'Private car' },
  { value: 'psv', label: 'PSV / matatu' },
  { value: 'commercial', label: 'Commercial / haulage' },
  { value: 'motorcycle', label: 'Motorcycle / boda boda' },
]

const PREMIUM_DEFAULTS: MotorPremiumRequest = {
  vehicle_class: 'private',
  risk_load: 0.25,
  expense_load: 0.2,
  claim_free_years: 0,
}

const FLEET_DEFAULTS: MotorFleetSimulationRequest = {
  vehicle_class: 'psv',
  n_vehicles: 200,
  n_years: 10_000,
  confidence: 0.95,
}

export function Motor() {
  const [premiumForm, setPremiumForm] = useState(PREMIUM_DEFAULTS)
  const [premiumResult, setPremiumResult] = useState<MotorPremiumResponse | null>(null)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [premiumError, setPremiumError] = useState<string | null>(null)

  const [fleetForm, setFleetForm] = useState(FLEET_DEFAULTS)
  const [fleetResult, setFleetResult] = useState<MotorFleetSimulationResponse | null>(null)
  const [fleetLoading, setFleetLoading] = useState(false)
  const [fleetError, setFleetError] = useState<string | null>(null)

  async function handlePremium() {
    setPremiumLoading(true)
    setPremiumError(null)
    try {
      setPremiumResult(await api.motor.premium(premiumForm))
    } catch (e) {
      setPremiumError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setPremiumLoading(false)
    }
  }

  async function handleFleet() {
    setFleetLoading(true)
    setFleetError(null)
    try {
      setFleetResult(await api.motor.fleetSimulation(fleetForm))
    } catch (e) {
      setFleetError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setFleetLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Motor Insurance (Kenya)"
        description="Frequency/severity pricing by vehicle class with a bonus-malus no-claims discount, and fleet-level aggregate loss simulation."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-medium text-ink">Per-vehicle premium quote</div>
          <div className="space-y-4">
            <Field label="Vehicle class">
              <Select value={premiumForm.vehicle_class} onChange={(v) => setPremiumForm((f) => ({ ...f, vehicle_class: v as VehicleClassName }))} options={VEHICLE_CLASSES} />
            </Field>
            <Field label="Claim-free years" hint="Bonus-malus no-claims discount">
              <NumberInput value={premiumForm.claim_free_years} onChange={(v) => setPremiumForm((f) => ({ ...f, claim_free_years: v }))} min={0} max={10} />
            </Field>
            <Button onClick={handlePremium} disabled={premiumLoading}>
              Quote
            </Button>
          </div>
        </Card>
        <Card>
          {premiumLoading && <Spinner />}
          {premiumError && <ErrorBanner message={premiumError} />}
          {premiumResult && !premiumLoading && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Base gross premium" value={premiumResult.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub={premiumResult.vehicle_class} />
              <StatCard label="After bonus-malus" value={premiumResult.adjusted_premium.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub={`${(premiumResult.discount_pct * 100).toFixed(0)}% discount`} />
            </div>
          )}
          {!premiumResult && !premiumLoading && !premiumError && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-medium text-ink">Fleet aggregate loss simulation</div>
          <div className="space-y-4">
            <Field label="Vehicle class">
              <Select value={fleetForm.vehicle_class} onChange={(v) => setFleetForm((f) => ({ ...f, vehicle_class: v as VehicleClassName }))} options={VEHICLE_CLASSES} />
            </Field>
            <Field label="Fleet size (vehicles)">
              <NumberInput value={fleetForm.n_vehicles} onChange={(v) => setFleetForm((f) => ({ ...f, n_vehicles: v }))} min={1} />
            </Field>
            <Field label="Confidence">
              <NumberInput value={fleetForm.confidence} onChange={(v) => setFleetForm((f) => ({ ...f, confidence: v }))} step={0.01} min={0} max={0.999} />
            </Field>
            <Button onClick={handleFleet} disabled={fleetLoading}>
              Simulate
            </Button>
          </div>
        </Card>
        <Card>
          {fleetLoading && <Spinner />}
          {fleetError && <ErrorBanner message={fleetError} />}
          {fleetResult && !fleetLoading && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Mean annual claims" value={fleetResult.mean_annual_claims.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              <StatCard label={`VaR ${(fleetForm.confidence * 100).toFixed(0)}%`} value={fleetResult.var.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              <StatCard label={`TVaR ${(fleetForm.confidence * 100).toFixed(0)}%`} value={fleetResult.tvar.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
            </div>
          )}
          {!fleetResult && !fleetLoading && !fleetError && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>

      {fleetResult && !fleetLoading && (
        <Card className="mt-6">
          <div className="mb-2 text-sm font-medium text-ink">Simulated aggregate annual claims distribution</div>
          <HistogramChart
            histogram={fleetResult.histogram}
            markers={[{ label: `VaR ${(fleetForm.confidence * 100).toFixed(0)}%`, value: fleetResult.var, color: '#f59e0b' }]}
          />
        </Card>
      )}
    </div>
  )
}
