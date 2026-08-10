import type {
  AggregateLossRequest,
  AggregateLossResponse,
  AreaYieldRequest,
  AreaYieldResponse,
  BornhuetterFergusonResponse,
  CatBondRequest,
  CatBondResponse,
  ChainLadderResponse,
  CredibilityRequest,
  CredibilityResponse,
  ExtremeValueRequest,
  ExtremeValueResponse,
  HealthCatCoverRequest,
  HealthCatCoverResponse,
  HealthTriangleRequest,
  HealthTriangleResponse,
  MackChainLadderResponse,
  MonteCarloRequest,
  MonteCarloResponse,
  MotorFleetSimulationRequest,
  MotorFleetSimulationResponse,
  MotorPremiumRequest,
  MotorPremiumResponse,
  PortfolioRequest,
  PortfolioResponse,
  PremiumRequest,
  PremiumResponse,
  RateOnLineResponse,
  ReinsuranceLayerRequest,
  ReinsuranceLayerResponse,
  RiskMetricsRequest,
  RiskMetricsResponse,
  RuinRequest,
  RuinResponse,
  RunDetail,
  RunSummary,
  SensitivityResponse,
  Triangle,
  WeatherIndexRequest,
  WeatherIndexResponse,
  XolReinstatementRequest,
  XolReinstatementResponse,
} from '../types'

class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : JSON.stringify(detail))
    this.status = status
    this.detail = detail
  }
}

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => res.statusText)
    throw new ApiError(res.status, detail.detail ?? detail)
  }
  return res.json()
}

async function get<TResponse>(path: string): Promise<TResponse> {
  const res = await fetch(`/api${path}`)
  if (!res.ok) {
    const detail = await res.json().catch(() => res.statusText)
    throw new ApiError(res.status, detail.detail ?? detail)
  }
  return res.json()
}

async function del(path: string): Promise<void> {
  const res = await fetch(`/api${path}`, { method: 'DELETE' })
  if (!res.ok) {
    const detail = await res.json().catch(() => res.statusText)
    throw new ApiError(res.status, detail.detail ?? detail)
  }
}

export const api = {
  premium: {
    calculate: (req: PremiumRequest) => post<PremiumResponse>('/premium/calculate', req),
  },
  simulation: {
    monteCarlo: (req: MonteCarloRequest) => post<MonteCarloResponse>('/simulation/monte-carlo', req),
    aggregateLoss: (req: AggregateLossRequest) => post<AggregateLossResponse>('/simulation/aggregate-loss', req),
  },
  riskMetrics: {
    calculate: (req: RiskMetricsRequest) => post<RiskMetricsResponse>('/risk-metrics', req),
  },
  reinsurance: {
    layer: (req: ReinsuranceLayerRequest) => post<ReinsuranceLayerResponse>('/reinsurance/layer', req),
    rateOnLine: (premium: number, limit: number) =>
      post<RateOnLineResponse>('/reinsurance/rate-on-line', { premium, limit }),
    xolReinstatements: (req: XolReinstatementRequest) =>
      post<XolReinstatementResponse>('/reinsurance/xol-reinstatements', req),
  },
  reserving: {
    chainLadder: (triangle: Triangle) => post<ChainLadderResponse>('/reserving/chain-ladder', { triangle }),
    chainLadderMack: (triangle: Triangle) =>
      post<MackChainLadderResponse>('/reserving/chain-ladder-mack', { triangle }),
    bornhuetterFerguson: (triangle: Triangle, expected_loss_ratio: number, premium: number[]) =>
      post<BornhuetterFergusonResponse>('/reserving/bornhuetter-ferguson', {
        triangle,
        expected_loss_ratio,
        premium,
      }),
  },
  credibility: {
    calculate: (req: CredibilityRequest) => post<CredibilityResponse>('/credibility/calculate', req),
  },
  portfolio: {
    simulate: (req: PortfolioRequest) => post<PortfolioResponse>('/portfolio/simulate', req),
  },
  extremeValue: {
    analyze: (req: ExtremeValueRequest) => post<ExtremeValueResponse>('/extreme-value/analyze', req),
  },
  ruin: {
    analyze: (req: RuinRequest) => post<RuinResponse>('/ruin/analyze', req),
  },
  sensitivity: {
    premium: (req: unknown) => post<SensitivityResponse>('/sensitivity/premium', req),
    varSensitivity: (req: unknown) => post<SensitivityResponse>('/sensitivity/var', req),
  },
  weatherIndex: {
    analyze: (req: WeatherIndexRequest) => post<WeatherIndexResponse>('/weather-index/analyze', req),
  },
  areaYield: {
    analyze: (req: AreaYieldRequest) => post<AreaYieldResponse>('/area-yield/analyze', req),
  },
  catBond: {
    price: (req: CatBondRequest) => post<CatBondResponse>('/cat-bond/price', req),
  },
  motor: {
    premium: (req: MotorPremiumRequest) => post<MotorPremiumResponse>('/motor/premium', req),
    fleetSimulation: (req: MotorFleetSimulationRequest) =>
      post<MotorFleetSimulationResponse>('/motor/fleet-simulation', req),
  },
  healthMicro: {
    triangle: (req: HealthTriangleRequest) => post<HealthTriangleResponse>('/health-micro/triangle', req),
    catastrophicCover: (req: HealthCatCoverRequest) =>
      post<HealthCatCoverResponse>('/health-micro/catastrophic-cover', req),
  },
  runs: {
    list: (kind?: string) => get<RunSummary[]>(kind ? `/runs?kind=${kind}` : '/runs'),
    get: (id: number) => get<RunDetail>(`/runs/${id}`),
    create: (kind: string, name: string, input: unknown, result: unknown) =>
      post<RunSummary>('/runs', { kind, name, input, result }),
    delete: (id: number) => del(`/runs/${id}`),
  },
}

export { ApiError }
