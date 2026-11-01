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
  DollarSign,
  Bell,
  Radio,
  CheckCircle2,
  Pencil,
  X,
  Target,
  ArrowRightLeft,
  Compass
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardService, analyticsService, transactionService, goalService, customerService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { formatCurrency, formatDate, maskAccountNumber } from '../utils/formatters'

const CategoryTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-[#171714] border border-[#D4AF37] px-3.5 py-2 rounded-xl shadow-2xl text-xs z-50 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload?.fill || '#D4AF37' }} />
          <span className="font-bold text-[#F5F1E6]">{item.name}</span>
        </div>
        <p className="text-sm font-extrabold text-[#D4AF37] font-['Space_Grotesk']">
          {formatCurrency(item.value)}
        </p>
        {item.payload?.percentage !== undefined && (
          <p className="text-[10px] text-[#A9A59A] mt-0.5 font-medium">
            {item.payload.percentage}% of spending
          </p>
        )}
      </div>
    )
  }
  return null
}

export const Dashboard = () => {
  const { refreshKey } = useOutletContext() || { refreshKey: 0 }
  const { notifications, unreadCount, markAsRead } = useNotification()
  const [data, setData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isCustomer } = useAuth()
  const [advisor, setAdvisor] = useState(null)
  const [pendingRequest, setPendingRequest] = useState(null)
  const [advisorLoading, setAdvisorLoading] = useState(true)

  // Transaction Edit Modal State
  const [editingTxn, setEditingTxn] = useState(null)
  const [txnDesc, setTxnDesc] = useState('')
  const [txnAmount, setTxnAmount] = useState('')
  const [txnCategory, setTxnCategory] = useState('Food')
  const [txnType, setTxnType] = useState('EXPENSE')
  const [txnMethod, setTxnMethod] = useState('UPI')
  const [txnDate, setTxnDate] = useState('')
  const [txnError, setTxnError] = useState('')

  // Goal Edit Modal State
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalCurrent, setGoalCurrent] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [goalContrib, setGoalContrib] = useState('')
  const [goalError, setGoalError] = useState('')

  const handleOpenEditTxn = (txn) => {
    setEditingTxn(txn)
    setTxnDesc(txn.description || '')
    setTxnAmount(txn.amount || '')
    setTxnCategory(txn.category || 'Food')
    setTxnType(txn.transaction_type || 'EXPENSE')
    setTxnMethod(txn.payment_method || 'UPI')
    setTxnDate(txn.transaction_date ? txn.transaction_date.split('T')[0] : '')
    setTxnError('')
  }

  const handleSaveTxn = async (e) => {
    e.preventDefault()
    setTxnError('')
    try {
      const res = await transactionService.updateTransaction(editingTxn.id, {
        description: txnDesc,
        amount: parseFloat(txnAmount),
        category: txnCategory,
        transaction_type: txnType,
        payment_method: txnMethod,
        transaction_date: txnDate,
      })
      if (res.data?.success) {
        setEditingTxn(null)
        loadDashboard()
      }
    } catch (err) {
      setTxnError(err.response?.data?.message || 'Failed to update transaction.')
    }
  }

  const handleOpenEditGoal = (g) => {
    setEditingGoal(g)
    setGoalName(g.name || '')
    setGoalTarget(g.target_amount || '')
    setGoalCurrent(g.current_amount || '')
    setGoalDate(g.target_date || '')
    setGoalContrib(g.monthly_contribution || '')
    setGoalError('')
  }

  const handleSaveGoal = async (e) => {
    e.preventDefault()
    setGoalError('')
    try {
      const res = await goalService.updateGoal(editingGoal.id, {
        name: goalName,
        target_amount: parseFloat(goalTarget),
        current_amount: parseFloat(goalCurrent || 0),
        target_date: goalDate,
        monthly_contribution: parseFloat(goalContrib || 0),
      })
      if (res.data?.success) {
        setEditingGoal(null)
        loadDashboard()
      }
    } catch (err) {
      setGoalError(err.response?.data?.message || 'Failed to update goal.')
    }
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [dashRes, analyticRes] = await Promise.all([
        dashboardService.getDashboardData(),
        analyticsService.getAnalyticsData({ range: '6M' })
      ])
      if (dashRes.data?.success) setData(dashRes.data.data)
      if (analyticRes.data?.success) setAnalytics(analyticRes.data.data)

      if (isCustomer) {
        try {
          const advRes = await customerService.getMyAdvisor()
          if (advRes.data?.success) {
            if (advRes.data.assigned && advRes.data.data) {
              setAdvisor(advRes.data.data)
              setPendingRequest(null)
            } else if (advRes.data.has_pending_request && advRes.data.pending_request) {
              setPendingRequest(advRes.data.pending_request)
              setAdvisor(null)
            } else {
              setAdvisor(null)
              setPendingRequest(null)
            }
          }
        } catch (e) {
          setAdvisor(null)
          setPendingRequest(null)
        } finally {
          setAdvisorLoading(false)
        }
      }
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
    goals = [],
    is_admin_overview = false,
    total_users = 0,
    total_accounts = 0,
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
                {financial_health_score > 0
                  ? (financial_health_score >= 80 ? 'Excellent Stability' : 'Good Progress')
                  : 'No Data Yet'} • Savings Rate <span className="text-[#D4AF37] font-bold">{savings_rate}%</span>
              </p>
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
          <p className="text-[11px] text-[#A9A59A] mt-1">
            {Number(monthly_income) > 0 ? '+12% vs previous month' : 'No income recorded'}
          </p>
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
          <p className="text-[11px] text-[#A9A59A] mt-1">
            {Number(monthly_expenses) > 0 ? (
              <>Budget usage at <span className="text-[#D4AF37] font-semibold">{budget_usage}%</span></>
            ) : (
              'No expenses recorded'
            )}
          </p>
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
            {Number(investment_summary.current_value) > 0
              ? `+${investment_summary.return_percentage || 0}% overall return`
              : 'No active positions'}
          </p>
        </div>
      </div>

            {/* Financial Coach & Advisor Guidance Card for Customer */}
      {isCustomer && (
        <div className="bg-gradient-to-r from-[#171714] via-[#21201B] to-[#171714] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {advisor ? (
            /* Case 3: Customer Has an Assigned Advisor */
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center text-[#0B0B0A] font-bold text-lg shadow-lg shadow-[#D4AF37]/20 shrink-0 mt-1">
                  {advisor.profile_image ? (
                    <img src={advisor.profile_image} alt={advisor.full_name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    advisor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FA'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                      YOUR ADVISOR
                    </span>
                    <span className="text-xs text-[#A9A59A] flex items-center gap-1.5">
                      <span className="font-semibold text-[#F5F1E6]">{advisor.full_name}</span>
                      <span>•</span>
                      <span>{advisor.email}</span>
                      {advisor.phone && <span>• {advisor.phone}</span>}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {advisor.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
                    Specialization: {advisor.specialization || 'Private Wealth Management'}
                  </h3>
                  <p className="text-xs text-[#A9A59A] mt-0.5 max-w-2xl leading-relaxed">
                    Your assigned advisor is actively monitoring your financial health, asset compounding (+{investment_summary.return_percentage || 0}%), and family milestones.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/my-advisor"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C9A227] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> View Advisor Profile
                </Link>
                <Link
                  to="/goals"
                  className="px-4 py-2 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] text-[#F5F1E6] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-[#D4AF37]" /> Track Goals
                </Link>
              </div>
            </div>
          ) : pendingRequest ? (
            /* Case 2: Customer Has a Pending Advisor Request */
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[#0B0B0A] font-bold text-lg shadow-lg shadow-amber-500/20 shrink-0 mt-1">
                  {pendingRequest.advisor_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Advisor Request Pending
                    </span>
                    <span className="text-xs text-[#A9A59A] flex items-center gap-1.5">
                      <span className="font-semibold text-[#F5F1E6]">{pendingRequest.advisor_name}</span>
                      <span>•</span>
                      <span>{pendingRequest.advisor_email}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
                      Pending Review
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
                    Specialization: {pendingRequest.advisor_specialization}
                  </h3>
                  <p className="text-xs text-[#A9A59A] mt-0.5 max-w-2xl leading-relaxed">
                    Your advisor request has been submitted. Waiting for the advisor to review your request.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/my-advisor"
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> Manage Request
                </Link>
              </div>
            </div>
          ) : (
            /* Case 1: Customer Has No Assigned Advisor */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#21201B] border border-[#2B2A24] flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                  <Compass className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                      My Financial Advisor
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2B2A24] text-[#A9A59A] font-semibold border border-[#3E3C34]">
                      Status: No Advisor Assigned
                    </span>
                  </div>
                  <p className="text-xs text-[#A9A59A] mt-0.5 max-w-xl">
                    You don't have a financial advisor yet. Browse our available advisors and request one to manage your financial planning.
                  </p>
                </div>
              </div>
              <Link
                to="/my-advisor"
                className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all shrink-0"
              >
                Find Financial Advisor
              </Link>
            </div>
          )}
        </div>
      )}

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
            {(analytics?.cash_flow_timeline || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center border border-dashed border-[#2B2A24] rounded-2xl text-center p-6">
                <TrendingUp className="w-8 h-8 text-[#A9A59A] opacity-40 mb-2" />
                <p className="text-xs font-semibold text-[#F5F1E6]">No cash flow history</p>
                <p className="text-[11px] text-[#A9A59A] mt-0.5">Record income and expenses to generate real-time analytics.</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Category Spending Donut Chart */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-1">Expense Categories</h3>
            <p className="text-xs text-[#A9A59A] mb-4">Current month spending distribution</p>

            <div className="h-48 w-full flex items-center justify-center">
              {(analytics?.category_spending || []).length === 0 ? (
                <div className="text-center">
                  <PieChart className="w-8 h-8 text-[#A9A59A] opacity-40 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#F5F1E6]">No expense categories</p>
                  <p className="text-[11px] text-[#A9A59A] mt-0.5">Expenses will appear grouped by category.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(analytics?.category_spending || []).map(item => ({
                        ...item,
                        amount: Number(item.amount) || 0
                      }))}
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
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-[#2B2A24]">
            {(analytics?.category_spending || []).length === 0 ? (
              <p className="text-[11px] text-[#A9A59A] text-center py-2">No category spending recorded yet.</p>
            ) : (
              (analytics?.category_spending || []).slice(0, 3).map((item, idx) => (
                <div key={item.category} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#A9A59A]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD_PALETTE[idx % GOLD_PALETTE.length] }} />
                    {item.category}
                  </span>
                  <span className="font-bold text-[#F5F1E6]">{formatCurrency(item.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Live Notification Feed Bar */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#2B2A24]">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D4AF37]" /> Real-Time Security & Financial Telemetry
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37] text-[#0B0B0A]">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <Link
            to="/notifications"
            className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            All Notifications ({notifications.length}) →
          </Link>
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-[#A9A59A] py-2">No active alerts. All systems and transactions operating smoothly.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.is_read
                    ? 'bg-[#0B0B0A] border-[#2B2A24] text-[#A9A59A]'
                    : 'bg-[#0B0B0A] border-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37]">
                    {n.notification_type}
                  </span>
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-[10px] font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Read
                    </button>
                  )}
                </div>
                <h4 className="text-xs font-bold text-[#F5F1E6] line-clamp-1">{n.title}</h4>
                <p className="text-[11px] text-[#A9A59A] mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        )}
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
            {accounts.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-[#2B2A24] rounded-2xl p-6">
                <Wallet className="w-8 h-8 text-[#A9A59A] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#F5F1E6]">No bank accounts linked</p>
                <p className="text-[11px] text-[#A9A59A] mt-0.5">Link an account to start tracking liquid assets.</p>
                <Link to="/accounts" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl text-xs font-bold hover:bg-[#D4AF37]/20 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Link Account
                </Link>
              </div>
            ) : (
              accounts.map((acc) => (
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
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions Data Table */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Recent Activity</h3>
            <Link to="/transactions" className="text-xs font-bold text-[#D4AF37] hover:underline">View All</Link>
          </div>

          <div className="divide-y divide-[#2B2A24]">
            {recent_transactions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#2B2A24] rounded-2xl p-6">
                <ArrowRightLeft className="w-8 h-8 text-[#A9A59A] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#F5F1E6]">No transactions recorded yet</p>
                <p className="text-[11px] text-[#A9A59A] mt-0.5">Your incoming and outgoing payments will appear here.</p>
              </div>
            ) : (
              recent_transactions.map((txn) => {
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
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`text-xs font-bold font-['Space_Grotesk'] ${
                          isIncome ? 'text-emerald-400' : 'text-[#F5F1E6]'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
                        </p>
                        <p className="text-[9px] text-[#A9A59A] font-mono">{txn.reference_id}</p>
                      </div>
                      <button
                        onClick={() => handleOpenEditTxn(txn)}
                        className="p-1.5 rounded-lg text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                        title="Edit Transaction"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
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

        {goals.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#2B2A24] rounded-2xl p-6">
            <Target className="w-8 h-8 text-[#A9A59A] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#F5F1E6]">No financial goals created yet</p>
            <p className="text-[11px] text-[#A9A59A] mt-0.5">Set milestone savings targets to grow your net worth.</p>
            <Link to="/goals" className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl text-xs font-bold hover:bg-[#D4AF37]/20 transition-all">
              <Plus className="w-3.5 h-3.5" /> Create Goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F1E6] truncate">{g.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#D4AF37]">{g.progress_percentage}%</span>
                    <button
                      onClick={() => handleOpenEditGoal(g)}
                      className="p-1 rounded-md text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                      title="Edit Goal"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
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
        )}
      </div>

      {/* Edit Transaction Modal on Dashboard */}
      {editingTxn && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6]">Edit Transaction</h3>
                <p className="text-[10px] text-[#A9A59A] font-mono mt-0.5">Ref: {editingTxn.reference_id}</p>
              </div>
              <button onClick={() => setEditingTxn(null)} className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {txnError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {txnError}
              </div>
            )}

            <form onSubmit={handleSaveTxn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={txnDesc}
                  onChange={(e) => setTxnDesc(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Type</label>
                  <select
                    value={txnType}
                    onChange={(e) => setTxnType(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Category</label>
                  <select
                    value={txnCategory}
                    onChange={(e) => setTxnCategory(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Food">Food &amp; Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Method</label>
                  <select
                    value={txnMethod}
                    onChange={(e) => setTxnMethod(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="CASH">Cash</option>
                    <option value="WIRE">Wire Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={txnDate}
                  onChange={(e) => setTxnDate(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTxn(null)}
                  className="flex-1 px-4 py-2.5 border border-[#2B2A24] text-xs font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal on Dashboard */}
      {editingGoal && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6]">Edit Financial Goal</h3>
              <button onClick={() => setEditingGoal(null)} className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {goalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {goalError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Target (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Monthly (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalContrib}
                    onChange={(e) => setGoalContrib(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 px-4 py-2.5 border border-[#2B2A24] text-xs font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
