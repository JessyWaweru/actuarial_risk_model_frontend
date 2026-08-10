import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../components/ui'

const TOOLS = [
  { to: '/premium', title: 'Premium Calculator', desc: 'Gross premium from frequency, severity and loadings.' },
  { to: '/monte-carlo', title: 'Monte Carlo Simulator', desc: 'Simulate losses from a single distribution with VaR/TVaR.' },
  { to: '/aggregate-loss', title: 'Aggregate Loss Model', desc: 'Compound frequency x severity Monte Carlo simulation.' },
  { to: '/risk-metrics', title: 'Risk Metrics', desc: 'VaR / TVaR from a simulation or raw loss data.' },
  { to: '/reinsurance', title: 'Reinsurance Pricing', desc: 'Layer pricing, rate on line, XoL with reinstatements.' },
  { to: '/reserving', title: 'Loss Reserving', desc: 'Chain ladder, Mack stochastic reserve, Bornhuetter-Ferguson.' },
  { to: '/credibility', title: 'Buhlmann Credibility', desc: 'Blend individual and collective experience.' },
  { to: '/portfolio', title: 'Portfolio Correlation', desc: 'Correlated multi-line aggregation via Gaussian copula.' },
  { to: '/extreme-value', title: 'Extreme Value / Tail Risk', desc: 'GPD tail fit, return levels, tail VaR/TVaR.' },
  { to: '/ruin', title: 'Ruin Probability', desc: 'Cramer-Lundberg adjustment coefficient and simulated ruin.' },
  { to: '/sensitivity', title: 'Sensitivity Analysis', desc: 'Stress-test premium or VaR across a parameter sweep.' },
  { to: '/weather-index', title: 'Weather-Index Insurance', desc: 'Drought-triggered rainfall index cover over real Kenyan county rainfall data.' },
  { to: '/area-yield', title: 'Area-Yield Crop Insurance', desc: 'Region-yield-triggered indemnity over Kenya\'s real cereal yield series.' },
  { to: '/cat-bond', title: 'Flood Catastrophe Bond', desc: 'EVT-driven cat bond pricing over real Tana River basin rainfall extremes.' },
  { to: '/motor', title: 'Motor Insurance (Kenya)', desc: 'Vehicle-class pricing with a bonus-malus no-claims discount.' },
  { to: '/health-micro', title: 'Health Microinsurance', desc: 'IBNR reserving and catastrophic cover pricing for a microinsurance scheme.' },
  { to: '/runs', title: 'Saved Runs', desc: 'History of saved calculations for comparison.' },
]

export function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Actuarial Risk Model"
        description="A Monte Carlo-based actuarial toolkit — pricing, reserving, tail risk, and reinsurance, all in one place."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link key={tool.to} to={tool.to}>
            <Card className="h-full transition hover:border-accent">
              <div className="font-medium text-ink">{tool.title}</div>
              <div className="mt-1 text-sm text-ink-secondary">{tool.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
