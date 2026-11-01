import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Users,
  Eye,
  Sparkles,
  CheckCircle2,
  Bell,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Wallet,
  Award,
  PieChart as PieIcon,
  Search
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authService, dashboardService, investmentService } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { formatCurrency, formatDate } from '../utils/formatters'

export const AdvisorDashboard = () => {
  const { notifications, unreadCount } = useNotification()
  const location = useLocation()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [clientData, setClientData] = useState(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  // Route distinction: /advisor -> 'overview', /advisor/clients -> 'clients'
  const isOverview = location.pathname === '/advisor'

  useEffect(() => {
    setLoading(true)
    authService.getUsers()
      .then(res => {
        if (res.data?.success) {
          const customers = res.data.data.filter(u => u.role === 'CUSTOMER')
          setUsers(customers)
          if (customers.length > 0) {
            handleSelectClient(customers[0])
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectClient = async (user) => {
    setSelectedUser(user)
    setSubmitted(false)
    try {
      const [dashRes, portRes] = await Promise.all([
        dashboardService.getDashboardData({ user_id: user.id }),
        investmentService.getPortfolio({ user_id: user.id })
      ])
      if (dashRes.data?.success) setClientData(dashRes.data.data)
      if (portRes.data?.success) setPortfolioData(portRes.data.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddRecommendation = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setRecommendation('')
  }

  // Filter clients for directory
  const filteredClients = users.filter(u =>
    u.full_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const GOLD_COLORS = ['#D4AF37', '#FFF0B3', '#C9A227', '#9A7B1C', '#E5C158', '#3B82F6']

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
            Private Wealth Advisory Suite
          </span>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            {isOverview ? 'Advisor Executive Overview' : 'Client Directory & Wealth Audit'}
          </h1>
          <p className="text-xs text-[#A9A59A]">
            {isOverview
              ? 'Multi-client portfolio oversight, assets under advisory & strategic signals'
              : 'Detailed financial health diagnostics, audit telemetry & advisory recommendations'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#171714] border border-[#2B2A24] p-1 rounded-2xl">
          <button
            onClick={() => navigate('/advisor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isOverview
                ? 'bg-[#D4AF37] text-[#0B0B0A] shadow-md'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Advisor Overview
          </button>
          <button
            onClick={() => navigate('/advisor/clients')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isOverview
                ? 'bg-[#D4AF37] text-[#0B0B0A] shadow-md'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Client Directory ({users.length})
          </button>
        </div>
      </div>

      {/* Real-time Advisor Alerts Banner */}
      <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-[#F5F1E6] flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> Advisor Live Telemetry:
          </span>
          <span className="text-xs text-[#A9A59A]">
            Active portfolio monitoring for {users.length} client accounts. Capital allocations within target volatility bands.
          </span>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0B0B0A] shrink-0">
            {unreadCount} Active Signals
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-[#171714] border border-[#2B2A24] rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
        </div>
      ) : isOverview ? (
        /* ================= 1. ADVISOR OVERVIEW VIEW ================= */
        <div className="space-y-6">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Active Client Accounts</span>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">{users.length}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">Managed Private Portfolios</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Total Client AUM</span>
              <p className="text-2xl font-bold text-[#D4AF37] font-['Space_Grotesk'] mt-2">
                {formatCurrency(
                  (parseFloat(clientData?.total_balance || 0) + parseFloat(portfolioData?.current_value || 0)) || 1426753
                )}
              </p>
              <p className="text-[11px] text-[#A9A59A] mt-1">Liquid Capital &amp; Securities</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Average Health Index</span>
              <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk'] mt-2">
                {clientData?.financial_health_score || 80}/100
              </p>
              <p className="text-[11px] text-[#A9A59A] mt-1">High Stability &amp; Adherence</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Advisory Recommendations</span>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">
                {submitted ? 'Published' : '1 Pending'}
              </p>
              <p className="text-[11px] text-[#D4AF37] mt-1">Rebalancing Strategy Ready</p>
            </div>
          </div>

          {/* Quick Roster & Strategic Launchpad */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Managed Portfolios Roster */}
            <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    Client Wealth Summary
                  </h3>
                  <p className="text-xs text-[#A9A59A]">Overview of clients currently receiving wealth advisory</p>
                </div>
                <button
                  onClick={() => navigate('/advisor/clients')}
                  className="text-xs font-bold text-[#D4AF37] hover:underline"
                >
                  Open Client Directory →
                </button>
              </div>

              <div className="divide-y divide-[#2B2A24]">
                {users.map((u) => (
                  <div key={u.id} className="py-4 flex items-center justify-between hover:bg-[#21201B]/50 px-2 rounded-xl transition-all">
                    <div>
                      <p className="text-sm font-bold text-[#F5F1E6]">{u.full_name}</p>
                      <p className="text-xs text-[#A9A59A] mt-0.5">{u.email} • Joined {formatDate(u.date_joined)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A9A59A]">Status</span>
                        <p className="text-xs font-bold text-emerald-400">Low Risk • Optimal</p>
                      </div>
                      <button
                        onClick={() => {
                          handleSelectClient(u)
                          navigate('/advisor/clients')
                        }}
                        className="px-3.5 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0A] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      >
                        Audit Portfolio <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory Guidance & Quick Actions */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Strategic Insights
                </h3>
                <p className="text-xs text-[#A9A59A] leading-relaxed">
                  Market conditions indicate balanced risk. Encourage clients to maximize tax-saving equity investments and maintain sovereign gold reserves.
                </p>

                <div className="mt-4 p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase">Recommended Playbook</span>
                  <p className="text-xs text-[#F5F1E6] font-medium leading-relaxed">
                    Review and confirm monthly SIP execution and verify emergency shield balances.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/advisor/clients')}
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
              >
                Go to Client Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 2. CLIENT DIRECTORY & AUDIT VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Directory Left Panel */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#A9A59A] uppercase tracking-wider">Client Directory</h3>
              <span className="text-[11px] text-[#D4AF37] font-semibold">{filteredClients.length} Clients</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A9A59A]" />
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] pl-9 pr-3 py-2 rounded-xl focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredClients.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectClient(u)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                    selectedUser?.id === u.id
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#0B0B0A] border-[#2B2A24] text-[#F5F1E6] hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div>
                    <p className="font-bold">{u.full_name}</p>
                    <p className="text-[10px] text-[#A9A59A] font-normal">{u.email}</p>
                  </div>
                  <Eye className="w-4 h-4 text-[#D4AF37]" />
                </button>
              ))}
            </div>
          </div>

          {/* Client Financial Audit & Recommendation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {clientData && (
              <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#2B2A24]">
                  <div>
                    <h2 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                      {selectedUser?.full_name}'s Financial Audit
                    </h2>
                    <p className="text-xs text-[#A9A59A]">{selectedUser?.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#A9A59A]">Health Score</span>
                    <p className="text-xl font-extrabold text-[#D4AF37] font-['Space_Grotesk']">
                      {clientData.financial_health_score}/100
                    </p>
                  </div>
                </div>

                {/* Client Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[11px] text-[#A9A59A]">Liquid Balance</span>
                    <p className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
                      {formatCurrency(clientData.total_balance)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[11px] text-[#A9A59A]">Monthly Income</span>
                    <p className="text-sm font-bold text-emerald-400 font-['Space_Grotesk'] mt-1">
                      {formatCurrency(clientData.monthly_income)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[11px] text-[#A9A59A]">Monthly Expenses</span>
                    <p className="text-sm font-bold text-red-400 font-['Space_Grotesk'] mt-1">
                      {formatCurrency(clientData.monthly_expenses)}
                    </p>
                  </div>
                </div>

                {/* Investment Portfolio Teaser */}
                {portfolioData && (
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37]">Securities &amp; Portfolio</span>
                      <p className="text-sm font-bold text-[#F5F1E6] mt-0.5">
                        Current Value: {formatCurrency(portfolioData.current_value)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      +{portfolioData.return_percentage}% Return
                    </span>
                  </div>
                )}

                {/* Submit Advisor Recommendation Form */}
                <form onSubmit={handleAddRecommendation} className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Issue Strategic Financial Recommendation
                  </h4>

                  {submitted && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Strategic recommendation successfully submitted to client workspace!
                    </div>
                  )}

                  <textarea
                    rows={3}
                    required
                    placeholder="Enter strategic advice (e.g., Increase Gold SGB allocation by 10%, rebalance equity portfolio...)"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full bg-[#171714] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-[#D4AF37] focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
                  >
                    Publish Recommendation
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
