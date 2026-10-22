import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  UserCheck,
  PieChart as PieIcon,
  Award,
  Lock,
  Send,
  Sliders,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export const AdvisorSuitePage = () => {
  const { isAuthenticated, user } = useAuth()
  const [selectedProfile, setSelectedProfile] = useState('hni')
  const [advisoryNote, setAdvisoryNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const clientProfiles = {
    hni: {
      name: 'High Net-Worth Individual (HNI)',
      aum: 18500000,
      liquid: 4200000,
      risk: 'Balanced Aggressive',
      recommendedAllocation: '50% Large Cap Equity, 20% Flexi Cap, 15% Gold Sovereign, 15% Fixed Income',
      complianceScore: '98/100 (Optimal Fiduciary Conformance)'
    },
    retiree: {
      name: 'Retirement Wealth Preservation',
      aum: 12000000,
      liquid: 3100000,
      risk: 'Conservative Growth',
      recommendedAllocation: '30% Bluechip Equity, 50% High-Yield Debt, 10% Gold, 10% Cash Runway',
      complianceScore: '96/100 (Capital Protected)'
    },
    growth: {
      name: 'Emerging Tech Founder Portfolio',
      aum: 9500000,
      liquid: 2200000,
      risk: 'Aggressive Capital Appreciation',
      recommendedAllocation: '65% Global & Domestic Equity, 15% Alternative Assets, 10% Gold, 10% Liquid',
      complianceScore: '94/100 (Growth Optimized)'
    }
  }

  const activeData = clientProfiles[selectedProfile]

  const handleSendNote = (e) => {
    e.preventDefault()
    if (!advisoryNote.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setAdvisoryNote('')
    }, 3000)
  }

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
                FINORA <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">ADVISOR SUITE</span>
              </span>
              <p className="text-[9px] text-[#A9A59A] tracking-widest uppercase font-semibold">Institutional Fiduciary Management</p>
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
              to={isAuthenticated && user?.role === 'FINANCIAL_ADVISOR' ? "/advisor" : "/login"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
            >
              {isAuthenticated && user?.role === 'FINANCIAL_ADVISOR' ? "Go to Advisor Console" : "Advisor Portal Login"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/10 blur-[130px] pointer-events-none -z-10" />

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5" /> Institutional Wealth Advisory Console
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] text-[#F5F1E6] mt-4 mb-4 leading-tight">
          Supercharge Your Advisory Practice <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#D4AF37] via-[#FFF0B3] to-[#9A7B1C] bg-clip-text text-transparent">
            With Automated Portfolio Governance
          </span>
        </h1>
        <p className="text-sm sm:text-base text-[#A9A59A] max-w-3xl mx-auto mb-8 leading-relaxed">
          Finora Advisor Suite equips certified financial planners and wealth management firms with client telemetry, real-time portfolio rebalancing suggestions, and direct digital recommendation dispatch.
        </p>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left my-10">
          <div className="p-5 bg-[#171714] border border-[#2B2A24] rounded-2xl space-y-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-xs font-bold text-[#F5F1E6]">Unified Client Directory</h3>
            <p className="text-[11px] text-[#A9A59A]">Single pane of glass across assigned family offices, trusts, and individual HNIs.</p>
          </div>

          <div className="p-5 bg-[#171714] border border-[#2B2A24] rounded-2xl space-y-2">
            <Sliders className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-xs font-bold text-[#F5F1E6]">Algorithmic Rebalancing</h3>
            <p className="text-[11px] text-[#A9A59A]">Automatic alerts when client holdings drift more than 5% from targeted allocation models.</p>
          </div>

          <div className="p-5 bg-[#171714] border border-[#2B2A24] rounded-2xl space-y-2">
            <Send className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-xs font-bold text-[#F5F1E6]">Real-Time Recommendations</h3>
            <p className="text-[11px] text-[#A9A59A]">Direct recommendation dispatch delivered instantly to client dashboards and notification feed.</p>
          </div>

          <div className="p-5 bg-[#171714] border border-[#2B2A24] rounded-2xl space-y-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-xs font-bold text-[#F5F1E6]">Executive PDF Briefings</h3>
            <p className="text-[11px] text-[#A9A59A]">One-click publication-ready PDF and Excel reports for regulatory fiduciary reviews.</p>
          </div>
        </div>
      </section>

      {/* Interactive Advisor Workbench Preview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-10 shadow-2xl gold-border-glow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2B2A24]">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                Interactive Console Simulation
              </span>
              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-[#F5F1E6] mt-2">
                Simulated Client Review Workbench
              </h2>
              <p className="text-xs text-[#A9A59A]">
                Select a client profile archetype to inspect portfolio intelligence and issue strategic guidance
              </p>
            </div>

            {/* Profile Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
              <button
                onClick={() => setSelectedProfile('hni')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedProfile === 'hni' ? 'bg-[#D4AF37] text-[#0B0B0A]' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                }`}
              >
                HNI Family
              </button>
              <button
                onClick={() => setSelectedProfile('retiree')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedProfile === 'retiree' ? 'bg-[#D4AF37] text-[#0B0B0A]' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                }`}
              >
                Retiree Wealth
              </button>
              <button
                onClick={() => setSelectedProfile('growth')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedProfile === 'growth' ? 'bg-[#D4AF37] text-[#0B0B0A]' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                }`}
              >
                Tech Founder
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            {/* Client Telemetry Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#A9A59A]">Target Profile</span>
                <h4 className="text-sm font-bold text-[#F5F1E6]">{activeData.name}</h4>
                <div className="pt-2 border-t border-[#2B2A24] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#A9A59A]">Total AUM:</span>
                    <span className="text-[#D4AF37] font-bold">{formatCurrency(activeData.aum)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A9A59A]">Liquid Balance:</span>
                    <span className="text-[#F5F1E6] font-bold">{formatCurrency(activeData.liquid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A9A59A]">Risk Appetite:</span>
                    <span className="text-emerald-400 font-semibold">{activeData.risk}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#D4AF37]">Fiduciary Compliance Score</span>
                <p className="font-semibold text-[#F5F1E6]">{activeData.complianceScore}</p>
              </div>
            </div>

            {/* Model Architecture & Dispatch Recommendation */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-[#A9A59A] uppercase tracking-wider">
                  Recommended Asset Allocation Model
                </h4>
                <p className="text-sm font-semibold text-[#F5F1E6] leading-relaxed">
                  {activeData.recommendedAllocation}
                </p>
              </div>

              {/* Recommendation Dispatch Form */}
              <form onSubmit={handleSendNote} className="space-y-3">
                <label className="block text-xs font-bold text-[#A9A59A]">
                  Issue Strategic Advisory Guidance to Client Dashboard
                </label>
                <textarea
                  rows={3}
                  value={advisoryNote}
                  onChange={(e) => setAdvisoryNote(e.target.value)}
                  placeholder="e.g. Initiate 10% rebalancing into Parag Parikh Flexi Cap Fund and increase gold hedge ahead of central bank rate decisions..."
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl p-3 text-xs text-[#F5F1E6] placeholder-[#A9A59A] focus:outline-none focus:border-[#D4AF37] transition-all"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A9A59A]">
                    {submitted && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Recommendation dispatched to client in real-time!
                      </span>
                    )}
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Guidance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center border-t border-[#2B2A24] mt-12">
        <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#F5F1E6] mb-3">
          Elevate Your Wealth Practice with Finora
        </h2>
        <p className="text-xs sm:text-sm text-[#A9A59A] max-w-xl mx-auto mb-6">
          Equip your advisory firm with end-to-end client portfolio management, automated fiduciary audit logs, and instant client reporting.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-xl shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
        >
          Join as Certified Wealth Advisor <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
