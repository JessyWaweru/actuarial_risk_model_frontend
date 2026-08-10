import { useState } from 'react'
import { api, ApiError } from '../api/client'
import { LineSeriesChart } from '../components/charts'
import { Button, Card, ErrorBanner, Field, NumberInput, PageHeader, Select, Spinner, TextInput } from '../components/ui'
import type { SensitivityResponse } from '../types'

function parseValues(text: string): number[] {
  return text.split(',').map((v) => parseFloat(v.trim())).filter((v) => !Number.isNaN(v))
}

function PremiumSensitivity() {
  const [exposure, setExposure] = useState(100)
  const [frequency, setFrequency] = useState(0.1)
  const [severity, setSeverity] = useState(5000)
  const [riskLoad, setRiskLoad] = useState(0.2)
  const [expenseLoad, setExpenseLoad] = useState(0.15)
  const [paramName, setParamName] = useState<'exposure' | 'frequency' | 'severity' | 'risk_load' | 'expense_load'>('frequency')
  const [valuesText, setValuesText] = useState('0.05,0.075,0.1,0.125,0.15')
  const [result, setResult] = useState<SensitivityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(
        await api.sensitivity.premium({
          base: { exposure, frequency, severity, risk_load: riskLoad, expense_load: expenseLoad },
          param_name: paramName,
          values: parseValues(valuesText),
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
      <div className="mb-3 font-medium text-ink">Premium sensitivity</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Exposure"><NumberInput value={exposure} onChange={setExposure} /></Field>
        <Field label="Frequency"><NumberInput value={frequency} onChange={setFrequency} step={0.01} /></Field>
        <Field label="Severity"><NumberInput value={severity} onChange={setSeverity} /></Field>
        <Field label="Risk load"><NumberInput value={riskLoad} onChange={setRiskLoad} step={0.01} /></Field>
        <Field label="Expense load"><NumberInput value={expenseLoad} onChange={setExpenseLoad} step={0.01} /></Field>
        <Field label="Vary parameter">
          <Select
            value={paramName}
            onChange={(v) => setParamName(v as typeof paramName)}
            options={[
              { value: 'exposure', label: 'Exposure' },
              { value: 'frequency', label: 'Frequency' },
              { value: 'severity', label: 'Severity' },
              { value: 'risk_load', label: 'Risk load' },
              { value: 'expense_load', label: 'Expense load' },
            ]}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Values to sweep" hint="Comma-separated">
          <TextInput value={valuesText} onChange={setValuesText} />
        </Field>
      </div>
      <div className="mt-3">
        <Button onClick={handleSubmit} disabled={loading}>
          Run sweep
        </Button>
      </div>
      <div className="mt-4">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {result && (
          <LineSeriesChart
            data={result.results.map((r) => ({ value: r.value, output: r.output }))}
            xKey="value"
            series={[{ key: 'output', label: 'Gross premium' }]}
          />
        )}
      </div>
    </Card>
  )
}

function VarSensitivity() {
  const [mean, setMean] = useState(1000)
  const [stdDev, setStdDev] = useState(200)
  const [simulations, setSimulations] = useState(5000)
  const [paramName, setParamName] = useState<'mean' | 'std_dev'>('mean')
  const [valuesText, setValuesText] = useState('800,900,1000,1100,1200')
  const [confidence, setConfidence] = useState(0.95)
  const [result, setResult] = useState<SensitivityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      setResult(
        await api.sensitivity.varSensitivity({
          base: { dist: 'normal', mean, std_dev: stdDev, simulations, seed: 1 },
          param_name: paramName,
          values: parseValues(valuesText),
          confidence,
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
      <div className="mb-3 font-medium text-ink">VaR sensitivity</div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mean"><NumberInput value={mean} onChange={setMean} /></Field>
        <Field label="Std dev"><NumberInput value={stdDev} onChange={setStdDev} /></Field>
        <Field label="Simulations"><NumberInput value={simulations} onChange={setSimulations} step={1000} /></Field>
        <Field label="Confidence"><NumberInput value={confidence} onChange={setConfidence} step={0.01} /></Field>
        <Field label="Vary parameter">
          <Select
            value={paramName}
            onChange={(v) => setParamName(v as typeof paramName)}
            options={[
              { value: 'mean', label: 'Mean' },
              { value: 'std_dev', label: 'Std dev' },
            ]}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Values to sweep" hint="Comma-separated">
          <TextInput value={valuesText} onChange={setValuesText} />
        </Field>
      </div>
      <div className="mt-3">
        <Button onClick={handleSubmit} disabled={loading}>
          Run sweep
        </Button>
      </div>
      <div className="mt-4">
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {result && (
          <LineSeriesChart
            data={result.results.map((r) => ({ value: r.value, output: r.output }))}
            xKey="value"
            series={[{ key: 'output', label: 'VaR' }]}
          />
        )}
      </div>
    </Card>
  )
}

export function Sensitivity() {
  return (
    <div>
      <PageHeader title="Sensitivity Analysis" description="Stress-test premium or VaR by sweeping one input parameter across a range." />
      <div className="space-y-6">
        <PremiumSensitivity />
        <VarSensitivity />
      </div>
    </div>
  )
}
