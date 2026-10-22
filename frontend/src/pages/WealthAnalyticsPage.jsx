import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Compass,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  ArrowLeft
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export const WealthAnalyticsPage = () => {
  const { isAuthenticated } = useAuth()
  const [monthlyInvest, setMonthlyInvest] = useState(25000)
  const [expectedReturn, setExpectedReturn] = useState(14)
  const [timeHorizon, setTimeHorizon] = useState(10)

  // Calculate future value (SIP formula)
  const months = timeHorizon * 12
  const r = (expectedReturn / 100) / 12
  const projectedFutureVal = monthlyInvest * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  const totalInvested = monthlyInvest * months
  const wealthGain = projectedFutureVal - totalInvested

  // Projection timeline curve
  const projectionData = Array.from({ length: timeHorizon + 1 }, (_, i) => {
    const yrMonths = i * 12
    const fv = yrMonths === 0 ? 0 : monthlyInvest * ((Math.pow(1 + r, yrMonths) - 1) / r) * (1 + r)
    const invested = monthlyInvest * yrMonths
    return {
      year: `Yr ${i}`,
      invested: Math.round(invested),
      projected: Math.round(fv)
    }
  })

  // Sample Institutional Model Portfolio Allocation
  const assetAllocation = [
    { name: 'Large Cap Equities', value: 40, color: '#D4AF37' },
    { name: 'Mid & Small Cap Flexi', value: 25, color: '#FFF0B3' },
    { name: 'Sovereign Gold & Hedging', value: 15, color: '#9A7B1C' },
    { name: 'High-Yield Debt & Liquid', value: 15, color: '#3B82F6' },
    { name: 'Alternative Assets', value: 5, color: '#10B981' }
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#F5F1E6] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-xl border-b border-[#2B2A24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Sparkles className="w-5 h-5 text-[#0B0B0A]" />
            </div>
            <div>
              <span className="text-xl font-bold font-['Space_Grotesk'] tracking-wider text-[#F5F1E6] flex items-center gap-1.5">
                FINORA <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">ANALYTICS</span>
              </span>
              <p className="text-[9px] text-[#A9A59A] tracking-widest uppercase font-semibold">Institutional Wealth Intelligence</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#A9A59A] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
            >
              {isAuthenticated ? "My Dashboard" : "Sign In to Platform"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/10 blur-[130px] pointer-events-none -z-10" />

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> High-Precision Wealth Analytics Engine
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] text-[#F5F1E6] mt-4 mb-4 leading-tight">
          Algorithmic Portfolio Intelligence <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#D4AF37] via-[#FFF0B3] to-[#9A7B1C] bg-clip-text text-transparent">
            Built for Sovereign Capital Growth
          </span>
        </h1>
        <p className="text-sm sm:text-base text-[#A9A59A] max-w-3xl mx-auto mb-8 leading-relaxed">
          Finora Wealth Analytics merges real-time transaction telemetry, rolling Sharpe ratio analysis, and high-precision Decimal cash-flow forecasting into an executive private wealth command center.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left my-12">
          <div className="p-6 bg-[#171714] border border-[#2B2A24] rounded-3xl hover:border-[#D4AF37]/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Rolling Net Worth Trajectory</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Consolidated real-time asset tracking across multi-currency bank accounts, equity demat holdings, physical gold, and mutual funds.
            </p>
          </div>

          <div className="p-6 bg-[#171714] border border-[#2B2A24] rounded-3xl hover:border-[#D4AF37]/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <PieIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Dynamic Asset Allocation</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Automatic divergence monitoring comparing your current portfolio against targeted risk-adjusted benchmark ratios.
            </p>
          </div>

          <div className="p-6 bg-[#171714] border border-[#2B2A24] rounded-3xl hover:border-[#D4AF37]/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Adherence & Health Score</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Proprietary financial health algorithm scoring debt-to-income, liquidity runway, and budget conformance on a 0-100 index.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Wealth Compounding Simulator */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-10 shadow-2xl gold-border-glow">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-[#2B2A24]">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1">
                <Calculator className="w-3 h-3" /> Live Simulator
              </span>
              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-[#F5F1E6] mt-2">
                Wealth Compounding & Growth Forecast
              </h2>
              <p className="text-xs text-[#A9A59A] mt-1">
                Adjust parameters to simulate your expected capital accumulation trajectory
              </p>
            </div>

            <div className="text-right bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-[#A9A59A]">Estimated Future Portfolio Value</span>
              <p className="text-2xl lg:text-3xl font-extrabold text-[#D4AF37] font-['Space_Grotesk'] mt-0.5">
                {formatCurrency(projectedFutureVal)}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                +{formatCurrency(wealthGain)} estimated wealth created
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            {/* Input Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-[#A9A59A]">Monthly Investment</span>
                  <span className="text-[#F5F1E6] font-bold">{formatCurrency(monthlyInvest)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="250000"
                  step="5000"
                  value={monthlyInvest}
                  onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-[#2B2A24] rounded-lg h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-[#A9A59A]">Expected Annual CAGR</span>
                  <span className="text-[#D4AF37] font-bold">{expectedReturn}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-[#2B2A24] rounded-lg h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-[#A9A59A]">Investment Horizon</span>
                  <span className="text-[#F5F1E6] font-bold">{timeHorizon} Years</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] bg-[#2B2A24] rounded-lg h-2"
                />
              </div>

              <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A9A59A]">Total Capital Invested:</span>
                  <span className="text-[#F5F1E6] font-bold">{formatCurrency(totalInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A59A]">Wealth Compounding Gain:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(wealthGain)}</span>
                </div>
              </div>
            </div>

            {/* Growth Curve Chart */}
            <div className="lg:col-span-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#A9A59A" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#A9A59A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v) => [formatCurrency(v), '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    name="Projected Value"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#projGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    name="Invested Capital"
                    stroke="#A9A59A"
                    strokeWidth={1.5}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Model Asset Allocation Showcase */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Institutional Asset Allocation Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#F5F1E6]">
              All-Weather Strategic Portfolio Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[#A9A59A] leading-relaxed">
              Designed to preserve capital during market drawdown cycles while aggressively capturing upside during expansionary economic regimes.
            </p>

            <div className="space-y-2.5 pt-2">
              {assetAllocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-[#171714] border border-[#2B2A24] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-[#F5F1E6]">{item.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#D4AF37]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-8 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-[#A9A59A] uppercase tracking-wider mb-4">Target Weightings</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-[#A9A59A]">Targeted Annual Sharpe Ratio: <span className="text-[#D4AF37] font-bold">1.82</span></p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Maximum Simulated Drawdown: -8.4%</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-[#2B2A24] mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#F5F1E6] mb-3">
          Experience Live Institutional Analytics for Your Portfolio
        </h2>
        <p className="text-xs sm:text-sm text-[#A9A59A] max-w-xl mx-auto mb-6">
          Connect your accounts securely and unlock real-time financial tracking, budget adherence and portfolio intelligence.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-xl shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
        >
          Open Your Private Wealth Account <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
