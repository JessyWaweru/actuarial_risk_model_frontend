export type DistName = 'normal' | 'poisson' | 'lognormal' | 'gamma'

export interface Histogram {
  bin_edges: number[]
  counts: number[]
}

export interface LossSummary {
  mean: number
  std_dev: number
  min: number
  max: number
  percentiles: Record<string, number>
  histogram: Histogram
}

export interface SimulationInput {
  dist?: DistName
  mean?: number
  std_dev?: number
  simulations?: number
  seed?: number
  raw_losses?: number[]
}

export interface PremiumRequest {
  exposure: number
  frequency: number
  severity: number
  risk_load: number
  expense_load: number
}

export interface PremiumResponse {
  gross_premium: number
  total_premium: number
}

export interface MonteCarloRequest {
  dist: DistName
  mean: number
  std_dev?: number
  simulations: number
  seed?: number
}

export interface MonteCarloResponse extends LossSummary {
  var_95: number
  var_99: number
  tvar_95: number
  tvar_99: number
}

export interface AggregateLossRequest {
  frequency: { dist: 'poisson' | 'negative_binomial'; mean: number; dispersion?: number }
  severity: { dist: 'lognormal' | 'gamma' | 'pareto'; mean?: number; std_dev?: number; alpha?: number; scale?: number }
  simulations: number
  seed?: number
}

export interface AggregateLossResponse extends LossSummary {
  mean_claim_count: number
  var_95: number
  var_99: number
  tvar_95: number
  tvar_99: number
}

export interface RiskMetricsRequest {
  simulation: SimulationInput
  confidence: number
}

export interface RiskMetricsResponse {
  mean: number
  std_dev: number
  var: number
  tvar: number
  max_loss: number
  min_loss: number
  confidence: number
}

export interface ReinsuranceLayerRequest {
  simulation: SimulationInput
  attachment: number
  limit: number
}

export interface ReinsuranceLayerResponse {
  pure_premium: number
  risk_load: number
  gross_premium: number
  loss_ratio: number
}

export interface RateOnLineResponse {
  rate_on_line: number
}

export interface XolReinstatementRequest {
  annual_occurrence_losses: number[][]
  attachment: number
  limit: number
  num_reinstatements: number
  reinstatement_cost_pct: number
  risk_load_factor: number
}

export interface XolReinstatementResponse {
  first_layer_pure_premium: number
  risk_load: number
  first_layer_premium: number
  rate_on_line: number
  expected_reinstatements_used: number
  reinstatement_premium: number
  gross_premium: number
  effective_rate_on_line: number
  expected_total_recovery: number
  loss_ratio: number
}

export type Triangle = (number | null)[][]

export interface ChainLadderResponse {
  total_reserve: number
  dev_factors: number[]
}

export interface MackChainLadderResponse {
  dev_factors: number[]
  ultimate_by_year: number[]
  reserve_by_year: number[]
  standard_error_by_year: number[]
  total_reserve: number
  total_standard_error: number
  coefficient_of_variation: number
}

export interface BornhuetterFergusonResponse {
  dev_factors: number[]
  pct_reported_by_year: number[]
  reserve_by_year: number[]
  ultimate_by_year: number[]
  total_reserve: number
}

export interface CredibilityRequest {
  claims_by_risk: number[][]
  target_index: number
}

export interface CredibilityResponse {
  epv: number
  vhm: number
  collective_mean: number
  individual_mean: number
  n: number
  z: number
  credibility_premium: number
}

export interface PortfolioLine {
  name: string
  dist: 'lognormal' | 'gamma'
  mean: number
  std_dev: number
}

export interface PortfolioRequest {
  lines: PortfolioLine[]
  correlation_matrix: number[][]
  simulations: number
  seed?: number
}

export interface PortfolioResponse {
  line_names: string[]
  per_line_mean: number[]
  per_line_std: number[]
  correlated_std: number
  sum_of_individual_std: number
  diversification_benefit_pct: number
  total_histogram: Histogram
}

export interface ExtremeValueRequest {
  simulation: SimulationInput
  threshold: number
  return_periods: number[]
  confidence: number
  events_per_period: number
}

export interface ReturnLevelPoint {
  return_period: number
  level: number
}

export interface ExtremeValueResponse {
  shape: number
  scale: number
  threshold: number
  n_exceedances: number
  exceedance_rate: number
  return_levels: ReturnLevelPoint[]
  tail_var: number
  tail_tvar: number
}

export interface RuinRequest {
  initial_surplus: number
  claim_rate: number
  severity_dist: 'exponential' | 'gamma' | 'lognormal'
  severity_params: Record<string, number>
  premium_loading: number
  time_horizon: number
  n_paths: number
  seed?: number
}

export interface RuinResponse {
  adjustment_coefficient: number | null
  ruin_probability_bound: number | null
  ruin_probability_exact: number | null
  simulated_ruin_probability: number
  simulated_n_paths: number
  simulated_n_ruined: number
  simulated_mean_time_to_ruin: number | null
}

export interface SensitivityPoint {
  value: number
  output: number
}

export interface SensitivityResponse {
  parameter: string
  base_value: number | null
  base_output: number
  results: SensitivityPoint[]
}

export type County = 'homabay' | 'westpokot' | 'turkana'

export interface WeatherIndexRequest {
  county: County
  trigger_months: number[]
  strike_mm: number
  exit_mm: number
  sum_insured: number
  risk_load: number
  expense_load: number
  simulations: number
  seed?: number
  confidence: number
}

export interface WeatherIndexResponse {
  county: string
  years: number[]
  historical_index_mm: number[]
  historical_payouts: number[]
  fitted_mean_mm: number
  fitted_std_mm: number
  pure_premium: number
  risk_load: number
  gross_premium: number
  loss_ratio: number
  payout_probability: number
  simulated_mean_payout: number
  var: number
  tvar: number
  histogram: Histogram
}

export interface AreaYieldRequest {
  coverage_level: number
  price_per_kg: number
  risk_load: number
  expense_load: number
  simulations: number
  seed?: number
  confidence: number
}

export interface AreaYieldResponse {
  years: number[]
  actual_yield: number[]
  trend_yield: number[]
  historical_indemnities: number[]
  trend_slope: number
  residual_std: number
  pure_premium: number
  risk_load: number
  gross_premium: number
  loss_ratio: number
  var: number
  tvar: number
  histogram: Histogram
}

export interface CatBondRequest {
  threshold_percentile: number
  attachment_mm: number
  exhaustion_mm: number
  principal: number
  risk_multiple: number
  n_years: number
  seed?: number
}

export interface CatBondResponse {
  threshold_mm: number
  shape: number
  scale: number
  exceedance_rate: number
  n_exceedances: number
  expected_loss_pct: number
  expected_loss_amount: number
  probability_of_attachment: number
  probability_of_exhaustion: number
  coupon_spread_pct: number
  annual_coupon_amount: number
  histogram: Histogram
}

export type VehicleClassName = 'private' | 'psv' | 'commercial' | 'motorcycle'

export interface MotorPremiumRequest {
  vehicle_class: VehicleClassName
  risk_load: number
  expense_load: number
  claim_free_years: number
}

export interface MotorPremiumResponse {
  vehicle_class: string
  pure_premium: number
  risk_load: number
  gross_premium: number
  discount_pct: number
  adjusted_premium: number
}

export interface MotorFleetSimulationRequest {
  vehicle_class: VehicleClassName
  n_vehicles: number
  n_years: number
  seed?: number
  confidence: number
}

export interface MotorFleetSimulationResponse {
  mean_annual_claims: number
  var: number
  tvar: number
  histogram: Histogram
}

export interface HealthTriangleRequest {
  n_years: number
  base_claims: number
  growth: number
  seed?: number
}

export interface HealthTriangleResponse {
  triangle: (number | null)[][]
  dev_factors: number[]
  ultimate_by_year: number[]
  reserve_by_year: number[]
  standard_error_by_year: number[]
  total_reserve: number
  total_standard_error: number
  coefficient_of_variation: number
}

export interface HealthCatCoverRequest {
  mean_annual_claims: number
  cv: number
  n_years: number
  deductible: number
  limit: number
  seed?: number
}

export interface HealthCatCoverResponse {
  pure_premium: number
  risk_load: number
  gross_premium: number
  loss_ratio: number
  histogram: Histogram
}

export interface RunSummary {
  id: number
  kind: string
  name: string
  created_at: string
}

export interface RunDetail extends RunSummary {
  input: Record<string, unknown>
  result: Record<string, unknown>
}
