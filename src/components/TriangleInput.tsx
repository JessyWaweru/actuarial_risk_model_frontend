import type { Triangle } from '../types'
import { Button } from './ui'

export function emptyTriangle(n: number): Triangle {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j <= n - 1 - i ? 0 : null)))
}

export function TriangleInput({ triangle, onChange }: { triangle: Triangle; onChange: (t: Triangle) => void }) {
  const n = triangle.length

  function setCell(i: number, j: number, value: number) {
    const next = triangle.map((row) => [...row])
    next[i][j] = value
    onChange(next)
  }

  function resize(newN: number) {
    onChange(emptyTriangle(newN))
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-ink-secondary">Accident years:</span>
        {[3, 4, 5, 6].map((size) => (
          <Button key={size} variant={size === n ? 'primary' : 'secondary'} onClick={() => resize(size)}>
            {size}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-16 text-left text-xs text-muted">AY \ Dev</th>
              {Array.from({ length: n }, (_, j) => (
                <th key={j} className="px-1 text-xs font-normal text-muted">
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {triangle.map((row, i) => (
              <tr key={i}>
                <td className="pr-2 text-xs text-muted">Y{i}</td>
                {row.map((value, j) => {
                  const isFuture = value === null
                  return (
                    <td key={j}>
                      <input
                        type="number"
                        disabled={isFuture}
                        value={value ?? ''}
                        onChange={(e) => setCell(i, j, e.target.valueAsNumber)}
                        className="w-24 rounded-md border border-gridline bg-surface-raised px-2 py-1 text-xs
                                   text-ink outline-none focus:border-accent disabled:opacity-30"
                        placeholder={isFuture ? '—' : ''}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
