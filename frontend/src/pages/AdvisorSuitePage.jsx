import React from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  TrendingUp,
  Lightbulb,
  Target,
  ShieldCheck
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export const AdvisorSuitePage = () => {
  const { isAuthenticated, isAdvisor } = useAuth()

  const pillars = [
    {
      icon: HeartPulse,
      title: 'Health Checkup',
      desc: 'Advisors review your overall financial picture—savings, spending, and investments—and provide a clear 0-100 financial health score.'
    },
    {
      icon: TrendingUp,
      title: 'Guiding Investments',
      desc: 'Help figure out where to grow your money across stocks, mutual funds, gold, and fixed deposits based on your personal risk goals.'
    },
    {
      icon: Lightbulb,
      title: 'Smart Recommendations',
      desc: 'Receive proactive alerts when spending drifts or when rebalancing into higher-yield assets is recommended.'
    },
    {
      icon: Target,
      title: 'Keeping You on Target',
      desc: 'Keep your money working hard to reach big life goals like buying a home, planning a vacation, or building an emergency cushion.'
    }
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
              FINORA <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">ADVISOR</span>
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
              to={isAdvisor ? "/advisor" : "/login"}
              className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1"
            >
              {isAdvisor ? "Advisor Console" : "Sign In"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Simple Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1">
            <Compass className="w-3 h-3" /> Financial Coaching Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#F5F1E6]">
            Your Personal Financial Coach &amp; Navigator
          </h1>
          <p className="text-xs sm:text-sm text-[#A9A59A]">
            Instead of just tracking daily balances, an advisor looks at the big picture to grow and protect your money.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {pillars.map((p, idx) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-5 space-y-2.5 transition-all shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#A9A59A] uppercase tracking-wider">
                      Pillar {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                      {p.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-[#A9A59A] leading-relaxed pl-12">
                  {p.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Sample Client Overview Card */}
        <div className="max-w-3xl mx-auto bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2B2A24]">
            <div>
              <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider">Live Coaching Telemetry</span>
              <h4 className="text-base font-bold text-[#F5F1E6]">How an Advisor Reviews Your Wealth</h4>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
              Health Score: 85/100 (Prime)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0B0B0A] border border-[#2B2A24] p-3 rounded-xl">
              <span className="text-[#A9A59A] text-[10px] uppercase font-semibold">Managed Portfolio</span>
              <p className="text-sm font-bold text-[#D4AF37] font-['Space_Grotesk'] mt-0.5">{formatCurrency(1450000)}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">+14.2% Growth</p>
            </div>
            <div className="bg-[#0B0B0A] border border-[#2B2A24] p-3 rounded-xl">
              <span className="text-[#A9A59A] text-[10px] uppercase font-semibold">Emergency Runway</span>
              <p className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-0.5">8.5 Months</p>
              <p className="text-[10px] text-[#A9A59A] mt-0.5">Optimal Liquid Cushion</p>
            </div>
            <div className="bg-[#0B0B0A] border border-[#2B2A24] p-3 rounded-xl">
              <span className="text-[#A9A59A] text-[10px] uppercase font-semibold">Budget Adherence</span>
              <p className="text-sm font-bold text-emerald-400 font-['Space_Grotesk'] mt-0.5">92% On Track</p>
              <p className="text-[10px] text-[#A9A59A] mt-0.5">Within Target Limits</p>
            </div>
          </div>

          <div className="p-3 bg-[#0B0B0A] border border-[#D4AF37]/30 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#A9A59A]">Advisor Recommendation:</span>
            <span className="font-semibold text-[#D4AF37] text-right truncate ml-2">
              Maintain current SIP pacing &amp; rebalance 10% into Sovereign Gold
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          <Link
            to={isAdvisor ? "/advisor" : "/login"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-lg hover:brightness-110 transition-all"
          >
            {isAdvisor ? "Go to Advisor Executive Console" : "Sign In to Access Advisor Suite"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  )
}
