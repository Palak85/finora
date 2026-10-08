import React, { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  HeartPulse,
  Plus,
  ArrowRight,
  Activity,
  Award,
  Sparkles,
  DollarSign
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardService, analyticsService } from '../services/api'
import { formatCurrency, formatDate, maskAccountNumber } from '../utils/formatters'

export const Dashboard = () => {
  const { refreshKey } = useOutletContext() || { refreshKey: 0 }
  const [data, setData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [dashRes, analyticRes] = await Promise.all([
        dashboardService.getDashboardData(),
        analyticsService.getAnalyticsData({ range: '6M' })
      ])
      if (dashRes.data?.success) setData(dashRes.data.data)
      if (analyticRes.data?.success) setAnalytics(analyticRes.data.data)
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [refreshKey])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-[#171714] border border-[#2B2A24] rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-[#171714] border border-[#2B2A24] rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  const {
    total_balance,
    monthly_income,
    monthly_expenses,
    net_worth,
    savings_rate,
    budget_usage,
    financial_health_score,
    accounts = [],
    recent_transactions = [],
    investment_summary = {},
    goals = []
  } = data || {}

  // Chart Color System
  const GOLD_PALETTE = ['#D4AF37', '#FFF0B3', '#C9A227', '#9A7B1C', '#E5C158', '#3B82F6', '#10B981']

  return (
    <div className="space-y-8">
      {/* Hero Financial Banner */}
      <div className="relative bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 lg:p-8 overflow-hidden shadow-2xl gold-border-glow">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Portfolio
              </span>
              <span className="text-xs text-[#A9A59A]">Updated just now</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#F5F1E6] font-['Space_Grotesk'] tracking-tight">
              {formatCurrency(total_balance)}
            </h1>
            <p className="text-xs text-[#A9A59A] mt-1 font-medium">
              Total Combined Liquid Balance across <span className="text-[#D4AF37] font-semibold">{accounts.length} Accounts</span>
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-4 bg-[#0B0B0A]/80 border border-[#2B2A24] p-4 rounded-2xl">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#9A7B1C]/20 border border-[#D4AF37]/40 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-[#D4AF37] font-['Space_Grotesk']">{financial_health_score}</span>
              <span className="text-[9px] uppercase font-bold text-[#A9A59A]">/100</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#F5F1E6] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" /> Financial Health
              </p>
              <p className="text-[11px] text-[#A9A59A] mt-0.5">
                {financial_health_score >= 80 ? 'Excellent Stability' : 'Good Progress'} • Savings Rate <span className="text-[#D4AF37] font-bold">{savings_rate}%</span>
              </p>
              <Link to="/financial-health" className="text-[11px] text-[#D4AF37] font-semibold hover:underline mt-1 inline-block">
                View Health Breakdown →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Net Worth */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Worth</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{formatCurrency(net_worth)}</p>
          <p className="text-[11px] text-[#A9A59A] mt-1">Assets minus total liabilities</p>
        </div>

        {/* Monthly Income */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-400 font-['Space_Grotesk']">{formatCurrency(monthly_income)}</p>
          <p className="text-[11px] text-[#A9A59A] mt-1">+12% vs previous month</p>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-400 font-['Space_Grotesk']">{formatCurrency(monthly_expenses)}</p>
          <p className="text-[11px] text-[#A9A59A] mt-1">Budget usage at <span className="text-[#D4AF37] font-semibold">{budget_usage}%</span></p>
        </div>

        {/* Investments Value */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Investments</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{formatCurrency(investment_summary.current_value || 0)}</p>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
            +{investment_summary.return_percentage || 0}% overall return
          </p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Line/Area Chart */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Cash Flow Trend</h3>
              <p className="text-xs text-[#A9A59A]">Income vs Expenses timeline over last 6 months</p>
            </div>
            <Link to="/analytics" className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.cash_flow_timeline || []}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#A9A59A" fontSize={11} tickLine={false} />
                <YAxis stroke="#A9A59A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" name="Income (₹)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" name="Expense (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Donut Chart */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-1">Expense Categories</h3>
            <p className="text-xs text-[#A9A59A] mb-4">Current month spending distribution</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.category_spending || []}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(analytics?.category_spending || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GOLD_PALETTE[index % GOLD_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-[#2B2A24]">
            {(analytics?.category_spending || []).slice(0, 3).map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#A9A59A]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD_PALETTE[idx % GOLD_PALETTE.length] }} />
                  {item.category}
                </span>
                <span className="font-bold text-[#F5F1E6]">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Bank Accounts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Accounts Slider/List */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">My Bank Accounts</h3>
            <Link to="/accounts" className="text-xs font-bold text-[#D4AF37] hover:underline">Manage</Link>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl hover:border-[#D4AF37]/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-[#F5F1E6]">{acc.account_name}</p>
                    <p className="text-[10px] text-[#A9A59A]">{acc.bank_name} • {acc.masked_account_number}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                    {acc.account_type}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-xs text-[#A9A59A]">Available Balance</span>
                  <span className="text-sm font-bold text-[#D4AF37] font-['Space_Grotesk']">{formatCurrency(acc.balance, acc.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Data Table */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Recent Activity</h3>
            <Link to="/transactions" className="text-xs font-bold text-[#D4AF37] hover:underline">View All</Link>
          </div>

          <div className="divide-y divide-[#2B2A24]">
            {recent_transactions.map((txn) => {
              const isIncome = txn.transaction_type === 'INCOME'
              return (
                <div key={txn.id} className="py-3.5 flex items-center justify-between hover:bg-[#21201B]/50 px-2 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#F5F1E6] line-clamp-1">{txn.description}</p>
                      <p className="text-[10px] text-[#A9A59A]">
                        {txn.category} • {formatDate(txn.transaction_date)} • {txn.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold font-['Space_Grotesk'] ${
                      isIncome ? 'text-emerald-400' : 'text-[#F5F1E6]'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <p className="text-[9px] text-[#A9A59A] font-mono">{txn.reference_id}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Financial Goals Grid */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Financial Goals</h3>
            <p className="text-xs text-[#A9A59A]">Automated goal progress tracking</p>
          </div>
          <Link to="/goals" className="text-xs font-bold text-[#D4AF37] hover:underline">Manage Goals</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((g) => (
            <div key={g.id} className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5F1E6] truncate">{g.name}</span>
                <span className="text-xs font-extrabold text-[#D4AF37]">{g.progress_percentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#2B2A24] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, g.progress_percentage)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#A9A59A]">
                <span>{formatCurrency(g.current_amount)}</span>
                <span className="text-[#F5F1E6] font-semibold">Target: {formatCurrency(g.target_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
