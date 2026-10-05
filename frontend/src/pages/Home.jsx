import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Lock,
  ChevronRight,
  CheckCircle2,
  Users,
  Award,
  Globe,
  ArrowUpRight,
  Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Home = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#F5F1E6] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37]/10 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[600px] right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-xl border-b border-[#2B2A24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#0B0B0A]" />
            </div>
            <div>
              <span className="text-xl font-bold font-['Space_Grotesk'] tracking-wider text-[#F5F1E6] flex items-center gap-1.5">
                FINORA <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">PREMIUM</span>
              </span>
              <p className="text-[9px] text-[#A9A59A] tracking-widest uppercase font-semibold">Private Wealth & Banking</p>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A9A59A]">
            <a href="#features" className="hover:text-[#D4AF37] transition-colors">Features</a>
            <a href="#analytics" className="hover:text-[#D4AF37] transition-colors">Wealth Analytics</a>
            <a href="#security" className="hover:text-[#D4AF37] transition-colors">Security & Trust</a>
            <a href="#solutions" className="hover:text-[#D4AF37] transition-colors">Advisor Suite</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'ADMINISTRATOR' ? '/admin' : user?.role === 'FINANCIAL_ADVISOR' ? '/advisor' : '/dashboard'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Open Account <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171714] border border-[#2B2A24] text-xs text-[#D4AF37] font-semibold mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span>Next-Generation Online Banking & Wealth Engine</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-['Space_Grotesk'] tracking-tight max-w-5xl mx-auto leading-[1.15]">
          Intelligent Banking for <br />
          <span className="gold-gradient-text">Private Wealth & Growth.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base lg:text-lg text-[#A9A59A] max-w-2xl mx-auto leading-relaxed">
          Finora brings automated transaction intelligence, multi-asset portfolio tracking, smart budget guardrails, and certified financial advisor collaboration under one unified suite.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF0B3] to-[#9A7B1C] text-[#0B0B0A] font-extrabold text-sm shadow-xl shadow-[#D4AF37]/25 hover:shadow-[#D4AF37]/40 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Create Your Account Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#171714] border border-[#2B2A24] text-[#F5F1E6] hover:border-[#D4AF37]/40 font-bold text-sm hover:bg-[#21201B] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Sign In to Portal <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-[#2B2A24]/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#F5F1E6]">Bank-Grade Security</p>
              <p className="text-[11px] text-[#A9A59A]">256-Bit SSL & JWT</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#F5F1E6]">Decimal Precision</p>
              <p className="text-[11px] text-[#A9A59A]">Zero Rounding Errors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#F5F1E6]">Financial Advisor Suite</p>
              <p className="text-[11px] text-[#A9A59A]">Certified Consultations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#F5F1E6]">Multi-Asset Tracking</p>
              <p className="text-[11px] text-[#A9A59A]">Stocks, Gold, Mutual Funds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Dashboard Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-10 shadow-2xl gold-border-glow relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-[#2B2A24]">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                Live Interface Preview
              </span>
              <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[#F5F1E6] mt-2">Finora Wealth Dashboard</h3>
              <p className="text-xs text-[#A9A59A] mt-1">Real-time consolidated net worth and automated liquidity health</p>
            </div>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20"
            >
              Test Live Demo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#A9A59A]">Combined Liquid Balance</span>
              <p className="text-2xl font-extrabold text-[#F5F1E6] font-['Space_Grotesk']">₹9,29,673.00</p>
              <p className="text-[11px] text-[#D4AF37] font-semibold">Active across 4 accounts</p>
            </div>

            <div className="bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#A9A59A]">Monthly Cash Flow</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-['Space_Grotesk']">+₹1,25,000.00</p>
              <p className="text-[11px] text-emerald-400 font-semibold">+60% Net Savings Rate</p>
            </div>

            <div className="bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl p-5 space-y-2">
              <span className="text-xs font-semibold text-[#A9A59A]">Financial Health Score</span>
              <p className="text-2xl font-extrabold text-[#D4AF37] font-['Space_Grotesk']">85 / 100</p>
              <p className="text-[11px] text-[#A9A59A]">Grade: Excellent Stability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Engineered for Precision</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#F5F1E6] mt-2">
            Everything You Need for End-to-End Wealth Governance
          </h2>
          <p className="text-xs sm:text-sm text-[#A9A59A] mt-3">
            Designed for customers who demand transparent calculations, robust privacy, and intelligent financial forecasting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-7 space-y-4 group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] group-hover:border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center transition-colors">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E6]">Multi-Bank Account Aggregation</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Consolidate Savings, Current, Salary, and Credit Card balances with automatic account number masking for privacy.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-7 space-y-4 group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] group-hover:border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center transition-colors">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E6]">Dynamic Category Budgets</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Live transaction calculation prevents budget drift with proactive SAFE, WARNING, and EXCEEDED status notifications.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-7 space-y-4 group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] group-hover:border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E6]">Multi-Asset Investment Tracker</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Track Stocks, Mutual Funds, Sovereign Gold, and ETFs with automatic profit/loss computations and portfolio allocation charts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-7 space-y-4 group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] group-hover:border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center transition-colors">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E6]">Milestone Financial Goals</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Set automated target milestones for emergency reserves, property down payments, or vacation planning with progress gauges.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-7 space-y-4 group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] group-hover:border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E6]">Deep Financial Analytics</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Explore 1M, 3M, 6M, 1Y, and ALL time horizons for Income vs Expense timeline, category spending donuts, and net worth trajectory.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-7 space-y-4 group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] group-hover:border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E6]">Certified Advisor Collaboration</h3>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Dedicated Financial Advisor portal allowing wealth managers to audit assigned client portfolios and submit strategic recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Architecture Section */}
      <section id="security" className="py-20 bg-[#171714] border-y border-[#2B2A24] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Uncompromising Defense</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#F5F1E6]">
              Bank-Grade Encryption & Role-Based Authorization
            </h2>
            <p className="text-xs sm:text-sm text-[#A9A59A] leading-relaxed">
              Finora enforces strict database queryset scoping. A customer can never access another client's private accounts or statements under any circumstances.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#F5F1E6]">Short-lived JWT Access Tokens & Refresh Rotation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#F5F1E6]">PBKDF2 Password Hashing & 256-Bit SSL Transport</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#F5F1E6]">Zero Floating-Point Financial Logic (Pure Decimal Engine)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#F5F1E6]">Automated Administrator Security Audit Logging</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0B0A] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37]" /> Security Compliance Badges
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-[#A9A59A]">
              <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl">
                <p className="text-[#F5F1E6] font-bold">SQL Injection Guard</p>
                <p className="text-[10px] mt-1">Django Parameterized ORM</p>
              </div>
              <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl">
                <p className="text-[#F5F1E6] font-bold">Data Masking</p>
                <p className="text-[10px] mt-1">•••• •••• Last4 Tokenization</p>
              </div>
              <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl">
                <p className="text-[#F5F1E6] font-bold">CORS & CSRF Safe</p>
                <p className="text-[10px] mt-1">Origin-Verified Headers</p>
              </div>
              <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl">
                <p className="text-[#F5F1E6] font-bold">Audit Trails</p>
                <p className="text-[10px] mt-1">IP & Action Traceability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#171714] via-[#21201B] to-[#171714] border border-[#2B2A24] rounded-3xl p-10 lg:p-14 shadow-2xl gold-border-glow space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-['Space_Grotesk'] text-[#F5F1E6]">
            Start Managing Wealth with <span className="gold-gradient-text">Finora Today.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A9A59A] max-w-xl mx-auto">
            Experience private banking precision and take complete command of your personal finance dashboard in seconds.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-extrabold text-sm shadow-xl shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Open Your Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] font-bold text-sm hover:border-[#D4AF37]/40 transition-all"
            >
              Sign In to Existing Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0B0A] border-t border-[#2B2A24] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#A9A59A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center text-[#0B0B0A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-[#F5F1E6] font-['Space_Grotesk'] text-sm tracking-wider">FINORA</span>
            <span>&copy; {new Date().getFullYear()} Finora Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-[#D4AF37]">Login</Link>
            <Link to="/register" className="hover:text-[#D4AF37]">Register</Link>
            <a href="#features" className="hover:text-[#D4AF37]">Features</a>
            <a href="#security" className="hover:text-[#D4AF37]">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
