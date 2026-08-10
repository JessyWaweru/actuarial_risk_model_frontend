import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gridline bg-surface p-5 ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-secondary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | ''
  onChange: (value: number) => void
}

export function NumberInput({ value, onChange, ...rest }: NumberFieldProps) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.valueAsNumber)}
      className="w-full rounded-lg border border-gridline bg-surface-raised px-3 py-2 text-sm text-ink
                 outline-none focus:border-accent"
      {...rest}
    />
  )
}

export function TextInput({
  value,
  onChange,
  ...rest
}: { value: string; onChange: (v: string) => void } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
>) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gridline bg-surface-raised px-3 py-2 text-sm text-ink
                 outline-none focus:border-accent"
      {...rest}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gridline bg-surface-raised px-3 py-2 text-sm text-ink
                 outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
}) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-white hover:brightness-110'
      : 'border border-gridline text-ink-secondary hover:text-ink hover:border-muted'
  return (
    <button type={type} className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gridline bg-surface-raised p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold text-ink tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-secondary">{sub}</div>}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-secondary">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gridline border-t-accent" />
      Calculating…
    </div>
  )
}
