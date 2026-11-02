import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  PieChart as PieIcon,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Compass
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

const TargetWeightingTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-[#171714] border border-[#D4AF37] px-3 py-1.5 rounded-xl shadow-2xl text-xs z-50 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload?.color || '#D4AF37' }} />
          <span className="font-bold text-[#F5F1E6]">{item.name}:</span>
          <span className="font-extrabold text-[#D4AF37]">{item.value}%</span>
        </div>
      </div>
    )
  }
  return null
}

const ProjectionTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171714] border border-[#D4AF37] px-3 py-2 rounded-xl shadow-2xl text-xs z-50 pointer-events-none space-y-1">
        <p className="font-bold text-[#A9A59A] text-[10px] uppercase">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#F5F1E6] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || '#D4AF37' }} />
              {entry.name}:
            </span>
            <span className="font-bold font-['Space_Grotesk'] text-[#D4AF37]">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const WealthAnalyticsPage = () => {
  const { isAuthenticated } = useAuth()
  const [monthlyInvest, setMonthlyInvest] = useState(25000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [timeHorizon, setTimeHorizon] = useState(10)

  // Future value calculation (SIP)
  const months = timeHorizon * 12
  const r = (expectedReturn / 100) / 12
  const projectedFutureVal = monthlyInvest * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  const totalInvested = monthlyInvest * months
  const wealthGain = projectedFutureVal - totalInvested

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

  const assetAllocation = [
    { name: 'Large Cap Equities', value: 40, color: '#D4AF37' },
    { name: 'Mid & Small Cap Flexi', value: 25, color: '#FBBF24' },
    { name: 'Sovereign Gold & Hedging', value: 15, color: '#9A7B1C' },
    { name: 'High-Yield Debt & Fixed', value: 15, color: '#3B82F6' },
    { name: 'Alternative Assets', value: 5, color: '#10B981' }
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#F5F1E6] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Simple Top Bar */}
      <nav className="border-b border-[#2B2A24] bg-[#0B0B0A]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#0B0B0A]" />
            </div>
            <span className="font-bold font-['Space_Grotesk'] text-base tracking-wider text-[#F5F1E6]">
              FINORA <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">INTELLIGENCE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-[#A9A59A] hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1"
            >
              {isAuthenticated ? "My Dashboard" : "Sign In"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Simple Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1">
            <Compass className="w-3 h-3" /> Wealth Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#F5F1E6]">
            Portfolio Allocation &amp; Growth Simulator
          </h1>
          <p className="text-xs sm:text-sm text-[#A9A59A]">
            A clean overview of recommended asset weightings and compounding projections.
          </p>
        </div>

        {/* 2-Column Clean Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Target Asset Allocation */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <div>
                <h2 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#D4AF37]" /> Target Asset Allocation
                </h2>
                <p className="text-xs text-[#A9A59A]">Recommended strategic weighting</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Balanced Model
              </span>
            </div>

            {/* Donut Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<TargetWeightingTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Percentages List */}
            <div className="space-y-2 pt-1">
              {assetAllocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-[#0B0B0A] border border-[#2B2A24]">
                  <span className="flex items-center gap-2 text-[#A9A59A]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[#F5F1E6] font-medium">{item.name}</span>
                  </span>
                  <span className="font-bold text-[#D4AF37] font-['Space_Grotesk']">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Growth Simulator */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                <div>
                  <h2 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#D4AF37]" /> Compounding Growth Forecast
                  </h2>
                  <p className="text-xs text-[#A9A59A]">Simulate expected wealth over time</p>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A9A59A]">Monthly SIP</span>
                    <span className="font-bold text-[#D4AF37]">{formatCurrency(monthlyInvest)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={monthlyInvest}
                    onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] bg-[#2B2A24] rounded-lg h-2 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A9A59A]">Horizon &amp; Return</span>
                    <span className="font-bold text-[#D4AF37]">{timeHorizon} Yrs @ {expectedReturn}%</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] bg-[#2B2A24] rounded-lg h-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Area Chart */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="simpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#A9A59A" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#A9A59A"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip content={<ProjectionTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      name="Projected Value"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fill="url(#simpleGrad)"
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

            {/* Result Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2B2A24]">
              <div className="bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#A9A59A] uppercase font-semibold">Invested Capital</span>
                <p className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-0.5">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <div className="bg-[#0B0B0A] border border-[#D4AF37]/30 rounded-2xl p-3 text-center">
                <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">Projected Value</span>
                <p className="text-sm font-bold text-[#D4AF37] font-['Space_Grotesk'] mt-0.5">
                  {formatCurrency(projectedFutureVal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Simple Action */}
        <div className="text-center pt-2">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-lg hover:brightness-110 transition-all"
          >
            {isAuthenticated ? "Open My Personal Dashboard" : "Sign In to Get Started"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  )
}
