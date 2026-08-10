import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'

const NAV = [
  { section: 'Overview', items: [{ to: '/', label: 'Dashboard' }] },
  {
    section: 'Pricing',
    items: [
      { to: '/premium', label: 'Premium Calculator' },
      { to: '/credibility', label: 'Credibility' },
      { to: '/sensitivity', label: 'Sensitivity' },
    ],
  },
  {
    section: 'Simulation',
    items: [
      { to: '/monte-carlo', label: 'Monte Carlo' },
      { to: '/aggregate-loss', label: 'Aggregate Loss' },
      { to: '/portfolio', label: 'Portfolio Correlation' },
    ],
  },
  {
    section: 'Risk & Tail',
    items: [
      { to: '/risk-metrics', label: 'Risk Metrics' },
      { to: '/extreme-value', label: 'Extreme Value' },
      { to: '/ruin', label: 'Ruin Probability' },
    ],
  },
  {
    section: 'Reinsurance & Reserving',
    items: [
      { to: '/reinsurance', label: 'Reinsurance Pricing' },
      { to: '/reserving', label: 'Loss Reserving' },
    ],
  },
  {
    section: 'Real-World Scenarios',
    items: [
      { to: '/weather-index', label: 'Weather-Index Insurance' },
      { to: '/area-yield', label: 'Area-Yield Crop Insurance' },
      { to: '/cat-bond', label: 'Flood Catastrophe Bond' },
      { to: '/motor', label: 'Motor Insurance (Kenya)' },
      { to: '/health-micro', label: 'Health Microinsurance' },
    ],
  },
  { section: 'History', items: [{ to: '/runs', label: 'Saved Runs' }] },
]

export function Layout() {
  return (
    <div className="flex min-h-screen bg-page">
      <aside className="w-64 shrink-0 border-r border-gridline bg-surface px-4 py-6">
        <div className="mb-6 px-2">
          <div className="text-sm font-semibold tracking-wide text-ink">Actuarial Risk Model</div>
          <div className="text-xs text-muted">Pricing · Reserving · Risk</div>
        </div>
        <nav className="space-y-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.section}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-md px-2 py-1.5 text-sm transition',
                        isActive
                          ? 'bg-accent/15 text-ink font-medium'
                          : 'text-ink-secondary hover:bg-surface-raised hover:text-ink'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
