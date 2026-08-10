import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { categorical, surface } from '../theme'
import type { Histogram } from '../types'

const axisStyle = { fontSize: 12, fill: surface.muted }

function fmtCompact(n: number): string {
  if (Number.isFinite(n) && Math.abs(n) > 0 && Math.abs(n) < 1000) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(n)
  }
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export interface Marker {
  label: string
  value: number
  color: string
}

export function HistogramChart({ histogram, markers = [] }: { histogram: Histogram; markers?: Marker[] }) {
  const data = histogram.counts.map((count, i) => ({
    x: (histogram.bin_edges[i] + histogram.bin_edges[i + 1]) / 2,
    count,
  }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={surface.gridline} vertical={false} />
          <XAxis
            dataKey="x"
            tickFormatter={fmtCompact}
            tick={axisStyle}
            stroke={surface.baseline}
            tickLine={false}
          />
          <YAxis tick={axisStyle} stroke={surface.baseline} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: surface.chart, border: `1px solid ${surface.gridline}`, borderRadius: 8 }}
            labelStyle={{ color: surface.textSecondary }}
            formatter={(value: unknown) => [value as number, 'count']}
            labelFormatter={(v: unknown) => `~ ${fmtCompact(Number(v))}`}
          />
          <Bar dataKey="count" fill={categorical[0]} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          {markers.map((m) => (
            <ReferenceLine
              key={m.label}
              x={data.reduce((best, d) => (Math.abs(d.x - m.value) < Math.abs(best.x - m.value) ? d : best), data[0])?.x}
              stroke={m.color}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {markers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-secondary">
          {markers.map((m) => (
            <span key={m.label} className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3" style={{ backgroundColor: m.color }} />
              {m.label}: {fmtCompact(m.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function LineSeriesChart({
  data,
  xKey,
  series,
  xTickFormatter,
}: {
  data: Record<string, number>[]
  xKey: string
  series: { key: string; label: string }[]
  xTickFormatter?: (v: number) => string
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={surface.gridline} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={axisStyle}
          stroke={surface.baseline}
          tickLine={false}
          tickFormatter={xTickFormatter ?? fmtCompact}
        />
        <YAxis tick={axisStyle} stroke={surface.baseline} tickLine={false} width={48} tickFormatter={fmtCompact} />
        <Tooltip
          contentStyle={{ background: surface.chart, border: `1px solid ${surface.gridline}`, borderRadius: 8 }}
          labelStyle={{ color: surface.textSecondary }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: surface.textSecondary }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={categorical[i % categorical.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BarByCategoryChart({
  data,
  xKey,
  series,
}: {
  data: Record<string, number | string>[]
  xKey: string
  series: { key: string; label: string }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={surface.gridline} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} stroke={surface.baseline} tickLine={false} />
        <YAxis tick={axisStyle} stroke={surface.baseline} tickLine={false} width={48} tickFormatter={fmtCompact} />
        <Tooltip
          contentStyle={{ background: surface.chart, border: `1px solid ${surface.gridline}`, borderRadius: 8 }}
          labelStyle={{ color: surface.textSecondary }}
        />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: surface.textSecondary }} />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={categorical[i % categorical.length]}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SingleSeriesBarChart({
  data,
  xKey,
  yKey,
}: {
  data: Record<string, number | string>[]
  xKey: string
  yKey: string
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={surface.gridline} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} stroke={surface.baseline} tickLine={false} />
        <YAxis tick={axisStyle} stroke={surface.baseline} tickLine={false} width={48} tickFormatter={fmtCompact} />
        <Tooltip
          contentStyle={{ background: surface.chart, border: `1px solid ${surface.gridline}`, borderRadius: 8 }}
          labelStyle={{ color: surface.textSecondary }}
        />
        <Bar dataKey={yKey} radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={categorical[0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
