import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AggregateLoss } from './pages/AggregateLoss'
import { AreaYield } from './pages/AreaYield'
import { CatBond } from './pages/CatBond'
import { Credibility } from './pages/Credibility'
import { Dashboard } from './pages/Dashboard'
import { ExtremeValue } from './pages/ExtremeValue'
import { HealthMicro } from './pages/HealthMicro'
import { Motor } from './pages/Motor'
import { MonteCarlo } from './pages/MonteCarlo'
import { Portfolio } from './pages/Portfolio'
import { Premium } from './pages/Premium'
import { Reinsurance } from './pages/Reinsurance'
import { Reserving } from './pages/Reserving'
import { RiskMetrics } from './pages/RiskMetrics'
import { Ruin } from './pages/Ruin'
import { RunHistory } from './pages/RunHistory'
import { Sensitivity } from './pages/Sensitivity'
import { WeatherIndex } from './pages/WeatherIndex'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="premium" element={<Premium />} />
          <Route path="monte-carlo" element={<MonteCarlo />} />
          <Route path="aggregate-loss" element={<AggregateLoss />} />
          <Route path="risk-metrics" element={<RiskMetrics />} />
          <Route path="reinsurance" element={<Reinsurance />} />
          <Route path="reserving" element={<Reserving />} />
          <Route path="credibility" element={<Credibility />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="extreme-value" element={<ExtremeValue />} />
          <Route path="ruin" element={<Ruin />} />
          <Route path="sensitivity" element={<Sensitivity />} />
          <Route path="weather-index" element={<WeatherIndex />} />
          <Route path="area-yield" element={<AreaYield />} />
          <Route path="cat-bond" element={<CatBond />} />
          <Route path="motor" element={<Motor />} />
          <Route path="health-micro" element={<HealthMicro />} />
          <Route path="runs" element={<RunHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
