import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { SaveRun } from '../components/SaveRun'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Spinner, StatCard } from '../components/ui'
import type { PremiumRequest, PremiumResponse } from '../types'

const DEFAULTS: PremiumRequest = { exposure: 100, frequency: 0.1, severity: 5000, risk_load: 0.2, expense_load: 0.15 }

export function Premium() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<PremiumResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(await api.premium.calculate(form))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function set<K extends keyof PremiumRequest>(key: K, value: number) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div>
      <PageHeader
        title="Premium Calculator"
        description="Pure premium (frequency x severity) with risk and expense loadings applied."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <Field label="Exposure units">
              <NumberInput value={form.exposure} onChange={(v) => set('exposure', v)} min={0} />
            </Field>
            <Field label="Claim frequency (claims / exposure unit)">
              <NumberInput value={form.frequency} onChange={(v) => set('frequency', v)} step={0.01} min={0} />
            </Field>
            <Field label="Claim severity ($)">
              <NumberInput value={form.severity} onChange={(v) => set('severity', v)} min={0} />
            </Field>
            <Field label="Risk loading" hint="Fraction added for underwriting risk, e.g. 0.2 = 20%">
              <NumberInput value={form.risk_load} onChange={(v) => set('risk_load', v)} step={0.01} min={0} />
            </Field>
            <Field label="Expense loading" hint="Fraction added for expenses, e.g. 0.15 = 15%">
              <NumberInput value={form.expense_load} onChange={(v) => set('expense_load', v)} step={0.01} min={0} />
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
                <StatCard label="Gross premium / unit" value={`$${result.gross_premium.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                <StatCard label="Total premium" value={`$${result.total_premium.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              </div>
              <SaveRun kind="premium" input={form} result={result} />
            </div>
          )}
          {!result && !loading && !error && <div className="text-sm text-muted">Results will appear here.</div>}
        </Card>
      </div>
    </div>
  )
}
