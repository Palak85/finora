import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowRightLeft,
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
  Search,
  HeartPulse,
  Compass,
  AlertTriangle,
  Lightbulb,
  Target,
  ArrowUpRight,
  Shield,
  Zap,
  Send,
  Clock,
  Layers,
  Coins,
  Building,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Lock,
  FileText,
  Printer,
  Download,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  CreditCard,
  Sliders
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  authService,
  dashboardService,
  investmentService,
  goalService,
  budgetService,
  accountService,
  transactionService,
  analyticsService,
  notificationService,
  advisorService
} from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { formatCurrency, formatDate, maskAccountNumber } from '../utils/formatters'

export const AdvisorDashboard = () => {
  const { notifications, unreadCount } = useNotification()
  const location = useLocation()
  const navigate = useNavigate()

  // Main client list
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingClient, setLoadingClient] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  // 1. Client Financial Data
  const [clientData, setClientData] = useState(null)
  const [clientAccounts, setClientAccounts] = useState([])
  const [clientTransactions, setClientTransactions] = useState([])
  const [portfolioData, setPortfolioData] = useState(null)
  const [clientInvestments, setClientInvestments] = useState([])
  const [clientBudgets, setClientBudgets] = useState([])
  const [clientGoals, setClientGoals] = useState([])
  const [clientAnalytics, setClientAnalytics] = useState(null)

  // Sub-navigation / Active Module in Client Deep-Dive:
  // 'ALL' | 'INFO' | 'ANALYSIS' | 'RECOMMENDATIONS' | 'GOALS' | 'REPORTS' | 'GOVERNANCE'
  const [activeModule, setActiveModule] = useState('ALL')

  // Transaction Filters
  const [txnSearch, setTxnSearch] = useState('')
  const [txnTypeFilter, setTxnTypeFilter] = useState('ALL')
  const [txnCatFilter, setTxnCatFilter] = useState('ALL')

  // Report Generator State
  const [activeReportTab, setActiveReportTab] = useState('summary')

  // Smart Recommendation Dispatcher State
  const [adviceCategory, setAdviceCategory] = useState('Better Budgeting')
  const [advicePriority, setAdvicePriority] = useState('Strategic Advice')
  const [adviceTitle, setAdviceTitle] = useState('')
  const [adviceMessage, setAdviceMessage] = useState('')
  const [sendingAdvice, setSendingAdvice] = useState(false)
  const [adviceStatus, setAdviceStatus] = useState(null)
  const [adviceHistory, setAdviceHistory] = useState([
    {
      id: 'demo-1',
      title: 'Emergency Cushion Reinforcement',
      message: 'Maintain at least 6 months of living expenses in liquid fixed deposits before expanding equity exposure.',
      category: 'Savings Targets',
      priority: 'Urgent Action Required',
      date: '2026-10-28T14:30:00Z',
      clientName: 'Alex Mercer'
    },
    {
      id: 'demo-2',
      title: 'Gold SGB Rebalancing Target',
      message: 'Allocate 15% of surplus capital to Sovereign Gold Bonds to hedge against currency depreciation.',
      category: 'Investment Guidance',
      priority: 'Strategic Advice',
      date: '2026-10-25T11:15:00Z',
      clientName: 'Alex Mercer'
    }
  ])

  // Customer Requests for Advisor
  const [incomingRequests, setIncomingRequests] = useState([])
  const [incomingStats, setIncomingStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, cancelled: 0 })

  const loadAdvisorRequests = () => {
    advisorService.getCustomerRequests()
      .then(res => {
        if (res.data?.success) {
          setIncomingRequests(res.data.data || [])
          if (res.data.stats) setIncomingStats(res.data.stats)
        }
      })
      .catch(err => console.error('Failed to load advisor requests:', err))
  }

  // Route distinction: /advisor -> 'overview', /advisor/clients -> 'clients'
  const isOverview = location.pathname === '/advisor'

  useEffect(() => {
    setLoading(true)
    advisorService.getAssignedClients()
      .then(res => {
        if (res.data?.success) {
          const clients = res.data.data || []
          setUsers(clients)
          if (clients.length > 0) {
            handleSelectClient(clients[0])
          } else {
            setSelectedUser(null)
            setClientData(null)
            setPortfolioData(null)
            setClientGoals([])
            setClientBudgets([])
            setClientInvestments([])
            setClientAccounts([])
            setClientTransactions([])
            setClientAnalytics(null)
          }
        }
      })
      .catch((err) => console.error('Failed to load assigned clients:', err))
      .finally(() => setLoading(false))
    loadAdvisorRequests()
  }, [])

  const handleSelectClient = async (user) => {
    setSelectedUser(user)
    setAdviceStatus(null)
    setLoadingClient(true)
    try {
      const [dashRes, portRes, goalsRes, budgetsRes, invRes, accRes, txnRes, anaRes] = await Promise.all([
        dashboardService.getDashboardData({ user_id: user.id }),
        investmentService.getPortfolio({ user_id: user.id }),
        goalService.getGoals({ user_id: user.id }),
        budgetService.getBudgets({ user_id: user.id }),
        investmentService.getInvestments({ user_id: user.id }),
        accountService.getAccounts({ user_id: user.id }),
        transactionService.getTransactions({ user_id: user.id }),
        analyticsService.getAnalyticsData({ user_id: user.id, range: '6M' })
      ])
      if (dashRes.data?.success) setClientData(dashRes.data.data)
      if (portRes.data?.success) setPortfolioData(portRes.data.data)
      if (goalsRes.data?.success) setClientGoals(goalsRes.data.data || [])
      if (budgetsRes.data?.success) setClientBudgets(budgetsRes.data.data || [])
      if (invRes.data?.success) setClientInvestments(invRes.data.data || [])
      if (accRes.data?.success) setClientAccounts(accRes.data.data || [])
      if (txnRes.data?.success) setClientTransactions(txnRes.data.data || [])
      if (anaRes.data?.success) setClientAnalytics(anaRes.data.data || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingClient(false)
    }
  }

  // Pre-fill recommendation template
  const handleSelectTemplate = (category, title, msg) => {
    setAdviceCategory(category)
    setAdviceTitle(title)
    setAdviceMessage(msg)
    setActiveModule('RECOMMENDATIONS')
    const elem = document.getElementById('advisory-dispatcher-form')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  // Dispatch recommendation to client notification feed
  const handleDispatchAdvice = async (e) => {
    if (e) e.preventDefault()
    if (!selectedUser || !adviceMessage.trim()) return
    setSendingAdvice(true)
    setAdviceStatus(null)

    const finalTitle = adviceTitle.trim() || `Advisory Guidance: ${adviceCategory}`
    const finalMsg = adviceMessage.trim()

    try {
      const res = await notificationService.sendAdvisorRecommendation({
        user_id: selectedUser.id,
        title: `[${advicePriority}] ${finalTitle}`,
        message: finalMsg,
        notification_type: 'Advisor'
      })

      if (res.data?.success) {
        setAdviceStatus({
          type: 'success',
          message: `Strategic recommendation successfully dispatched to ${selectedUser.full_name}'s live notification feed!`
        })
        setAdviceHistory(prev => [
          {
            id: Date.now(),
            title: `[${advicePriority}] ${finalTitle}`,
            message: finalMsg,
            category: adviceCategory,
            priority: advicePriority,
            date: new Date().toISOString(),
            clientName: selectedUser.full_name
          },
          ...prev
        ])
        setAdviceTitle('')
        setAdviceMessage('')
      } else {
        setAdviceStatus({
          type: 'error',
          message: res.data?.message || 'Failed to dispatch advice.'
        })
      }
    } catch (err) {
      setAdviceStatus({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Error dispatching recommendation.'
      })
    } finally {
      setSendingAdvice(false)
    }
  }

  // Filter clients for directory
  const filteredClients = users.filter(u =>
    u.full_name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(clientSearch.toLowerCase())
  )

  // Computed Financial Metrics
  const healthScore = clientData?.financial_health_score || 80
  const totalBalance = parseFloat(clientData?.total_balance || 0)
  const monthlyIncome = parseFloat(clientData?.monthly_income || 0)
  const monthlyExpenses = parseFloat(clientData?.monthly_expenses || 0)
  const savingsRate = parseFloat(clientData?.savings_rate || 0)
  const netCashFlow = monthlyIncome - monthlyExpenses
  const portfolioValue = parseFloat(portfolioData?.current_value || 0)
  const investedAmount = parseFloat(portfolioData?.total_invested || 0)
  const profitLoss = parseFloat(portfolioData?.profit_loss || 0)
  const returnPct = parseFloat(portfolioData?.return_percentage || 0)
  const emergencyRunwayMonths = monthlyExpenses > 0 ? (totalBalance / monthlyExpenses).toFixed(1) : '12.0+'

  // Asset Breakdown Calculations
  const stockHoldings = clientInvestments.filter(i => (i.asset_type || '').toLowerCase() === 'stocks')
  const mfHoldings = clientInvestments.filter(i => ['mutual funds', 'etf'].includes((i.asset_type || '').toLowerCase()))
  const goldHoldings = clientInvestments.filter(i => (i.asset_type || '').toLowerCase() === 'gold')
  const fixedHoldings = clientInvestments.filter(i => ['fixed deposits', 'bonds', 'crypto'].includes((i.asset_type || '').toLowerCase()))

  const stockVal = stockHoldings.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0)
  const mfVal = mfHoldings.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0)
  const goldVal = goldHoldings.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0)
  const fixedVal = fixedHoldings.reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0)
  const totalNetAssets = stockVal + mfVal + goldVal + fixedVal + totalBalance || 1

  const stockPct = Math.round((stockVal / totalNetAssets) * 100)
  const mfPct = Math.round((mfVal / totalNetAssets) * 100)
  const goldPct = Math.round((goldVal / totalNetAssets) * 100)
  const fixedPct = Math.round((fixedVal / totalNetAssets) * 100)
  const cashPct = Math.max(0, 100 - (stockPct + mfPct + goldPct + fixedPct))

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return clientTransactions.filter(t => {
      const matchSearch =
        t.description?.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.category?.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.payment_method?.toLowerCase().includes(txnSearch.toLowerCase())
      const matchType = txnTypeFilter === 'ALL' || t.transaction_type === txnTypeFilter
      const matchCat = txnCatFilter === 'ALL' || t.category === txnCatFilter
      return matchSearch && matchType && matchCat
    })
  }, [clientTransactions, txnSearch, txnTypeFilter, txnCatFilter])

  // Unique categories for transaction filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set(clientTransactions.map(t => t.category).filter(Boolean))
    return Array.from(set)
  }, [clientTransactions])

  // Spending Patterns by Category (Aggregated from transactions)
  const spendingByCategory = useMemo(() => {
    const map = {}
    clientTransactions
      .filter(t => t.transaction_type === 'EXPENSE')
      .forEach(t => {
        const cat = t.category || 'General'
        map[cat] = (map[cat] || 0) + parseFloat(t.amount || 0)
      })
    const totalExp = Object.values(map).reduce((a, b) => a + b, 0) || 1
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalExp) * 100)
    })).sort((a, b) => b.amount - a.amount)
  }, [clientTransactions])

  // Overspending Detection (Budgets exceeded or above 80%)
  const overspentBudgets = useMemo(() => {
    return clientBudgets.filter(b => {
      const limit = parseFloat(b.budget_limit || 0)
      const spent = parseFloat(b.spent_amount || 0)
      return limit > 0 && (spent / limit) >= 0.8
    })
  }, [clientBudgets])

  // Smart Anomalies Evaluation
  const anomalies = useMemo(() => {
    const list = []
    if (monthlyIncome > 0 && (monthlyExpenses / monthlyIncome) > 0.75) {
      list.push({
        type: 'danger',
        category: 'Better Budgeting',
        title: 'Elevated Lifestyle Expense Ratio',
        desc: `Client spends ${((monthlyExpenses / monthlyIncome) * 100).toFixed(0)}% of monthly income. Recommend reducing non-essential expenditures by 15%.`
      })
    }
    if (parseFloat(emergencyRunwayMonths) < 4.0) {
      list.push({
        type: 'warning',
        category: 'Savings Targets',
        title: 'Insufficient Emergency Runway',
        desc: `Liquid emergency cushion is only ${emergencyRunwayMonths} months (below recommended 6 months safety benchmark).`
      })
    }
    overspentBudgets.forEach(b => {
      const limit = parseFloat(b.budget_limit || 0)
      const spent = parseFloat(b.spent_amount || 0)
      const pct = Math.round((spent / limit) * 100)
      list.push({
        type: pct >= 100 ? 'danger' : 'warning',
        category: 'Better Budgeting',
        title: `Budget Limit Exceeded: ${b.category}`,
        desc: `Client spent ${formatCurrency(spent)} of ${formatCurrency(limit)} budget (${pct}% used). Recommend capping spending.`
      })
    })
    if (stockPct > 60) {
      list.push({
        type: 'info',
        category: 'Investment Guidance',
        title: 'High Equity Portfolio Concentration',
        desc: `Direct equities represent ${stockPct}% of net assets. Advise locking gains into Sovereign Gold or Fixed Income.`
      })
    }
    return list
  }, [monthlyIncome, monthlyExpenses, emergencyRunwayMonths, overspentBudgets, stockPct])

  // Export CSV Handler
  const handleExportCSV = (reportType) => {
    let rows = []
    let filename = `Finora_${selectedUser?.full_name}_${reportType}_Report.csv`

    if (reportType === 'budget_variance') {
      rows = [
        ['Category', 'Budget Limit', 'Actual Spent', 'Variance', 'Adherence Status'],
        ...clientBudgets.map(b => {
          const limit = parseFloat(b.budget_limit || 0)
          const spent = parseFloat(b.spent_amount || 0)
          const diff = limit - spent
          return [
            b.category,
            limit,
            spent,
            diff,
            spent > limit ? 'Over Budget' : 'Within Budget'
          ]
        })
      ]
    } else if (reportType === 'investments') {
      rows = [
        ['Asset Name', 'Asset Type', 'Quantity', 'Avg Buy Price', 'Current Value', 'Gain/Loss'],
        ...clientInvestments.map(i => [
          i.asset_name,
          i.asset_type,
          i.quantity,
          i.average_buy_price,
          i.current_value,
          parseFloat(i.current_value) - (parseFloat(i.quantity) * parseFloat(i.average_buy_price))
        ])
      ]
    } else if (reportType === 'expenses') {
      rows = [
        ['Category', 'Amount Spent', 'Percentage of Total'],
        ...spendingByCategory.map(s => [s.category, s.amount, `${s.percentage}%`])
      ]
    } else {
      rows = [
        ['Metric', 'Value'],
        ['Client Name', selectedUser?.full_name],
        ['Client Email', selectedUser?.email],
        ['Liquid Balance', totalBalance],
        ['Monthly Income', monthlyIncome],
        ['Monthly Expenses', monthlyExpenses],
        ['Net Cash Flow', netCashFlow],
        ['Savings Rate', `${savingsRate}%`],
        ['Emergency Runway', `${emergencyRunwayMonths} Months`],
        ['Financial Health Score', `${healthScore}/100`]
      ]
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Handler
  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP HEADER & NAVIGATION                                                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5 w-fit">
            <Compass className="w-3 h-3" /> Fiduciary Advisory Suite
          </span>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            {isOverview ? 'Advisor Executive Command Center' : 'Client Wealth Audit & Advisory Console'}
          </h1>
          <p className="text-xs text-[#A9A59A]">
            {isOverview
              ? 'Multi-client portfolio oversight, assets under advisory & strategic signals'
              : 'Complete financial review, analysis, goal monitoring, report generation & smart recommendations'}
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
            <Users className="w-3.5 h-3.5" /> Client Audit Suite ({users.length})
          </button>
          <button
            onClick={() => navigate('/advisor/requests')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#21201B] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Customer Requests
            {incomingStats.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {incomingStats.pending}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ITEM 6: LIMITED ACCESS & FIDUCIARY GOVERNANCE BANNER                      */}
      {/* ========================================================================= */}
      <div className="p-4 bg-gradient-to-r from-[#171714] via-[#21201B] to-[#171714] border border-[#D4AF37]/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-[#D4AF37]/5">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F5F1E6] flex items-center gap-1.5">
                Fiduciary Read-Only Audit Mode Active
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                RBAC Enforced
              </span>
            </div>
            <p className="text-[11px] text-[#A9A59A] mt-0.5 leading-snug">
              Under system fiduciary governance, advisors possess full oversight to audit accounts, analyze spending, monitor goals, and dispatch coaching advice. Direct balance modification, withdrawals, and unauthorized transfers are strictly restricted.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveModule('GOVERNANCE')
            if (isOverview) navigate('/advisor/clients')
          }}
          className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 bg-[#0B0B0A] px-3.5 py-1.5 rounded-xl border border-[#2B2A24] shrink-0"
        >
          <Shield className="w-3.5 h-3.5" /> View Governance Controls
        </button>
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
              <p className="text-[11px] text-[#A9A59A] mt-1">Managed Fiduciary Portfolios</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Total Client AUM</span>
              <p className="text-2xl font-bold text-[#D4AF37] font-['Space_Grotesk'] mt-2">
                {formatCurrency(totalBalance + portfolioValue || 1426753)}
              </p>
              <p className="text-[11px] text-[#A9A59A] mt-1">Liquid Capital &amp; Securities</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Average Health Index</span>
              <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk'] mt-2">
                {healthScore}/100
              </p>
              <p className="text-[11px] text-[#A9A59A] mt-1">Prime Financial Fitness</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <span className="text-xs text-[#A9A59A] uppercase font-semibold">Active Guidance Signals</span>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">
                {adviceHistory.length} Dispatched
              </p>
              <p className="text-[11px] text-[#D4AF37] mt-1">Live Fiduciary Coaching</p>
            </div>
          </div>

          {/* Dedicated Advisor Tracking Consoles Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/advisor/transactions')}
              className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/60 rounded-3xl p-5 cursor-pointer group transition-all shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#9A7B1C]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#F5F1E6] group-hover:text-[#D4AF37] transition-colors">
                      Client Transactions Surveillance Dashboard
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                      Surveillance
                    </span>
                  </div>
                  <p className="text-xs text-[#A9A59A] mt-1">
                    Surveillance of customer cash outflows, inflows, merchant velocity & unusual activity
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#A9A59A] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
            </div>

            <div
              onClick={() => navigate('/advisor/budgets')}
              className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/60 rounded-3xl p-5 cursor-pointer group transition-all shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#9A7B1C]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <PieIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#F5F1E6] group-hover:text-[#D4AF37] transition-colors">
                      Client Budget Compliance & Adherence Console
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Compliance
                    </span>
                  </div>
                  <p className="text-xs text-[#A9A59A] mt-1">
                    Track category spending limits, adherence rates, burn velocity & overspending breaches
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#A9A59A] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0 ml-3" />
            </div>

            <div
              onClick={() => navigate('/advisor/requests')}
              className="bg-[#171714] border border-[#2B2A24] hover:border-amber-500/60 rounded-3xl p-5 cursor-pointer group transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#F5F1E6] group-hover:text-amber-400 transition-colors">
                      Customer Requests
                    </h3>
                    {incomingStats.pending > 0 ? (
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {incomingStats.pending} Pending
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2B2A24] text-[#A9A59A]">
                        Up to date
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A9A59A] mt-1">
                    Review prospective client inquiries, accept fiduciary mandates & assign portfolios
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#A9A59A] group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
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
                  <p className="text-xs text-[#A9A59A]">Overview of clients receiving fiduciary wealth advisory</p>
                </div>
                <button
                  onClick={() => navigate('/advisor/clients')}
                  className="text-xs font-bold text-[#D4AF37] hover:underline"
                >
                  Open Client Audit Suite →
                </button>
              </div>

              <div className="divide-y divide-[#2B2A24]">
                {users.length === 0 ? (
                  <div className="py-8 text-center text-[#A9A59A]">
                    <Users className="w-10 h-10 mx-auto text-[#A9A59A]/40 mb-2" />
                    <p className="text-sm font-bold text-[#F5F1E6]">No Assigned Clients Yet</p>
                    <p className="text-xs text-[#A9A59A] mt-1 max-w-md mx-auto">
                      You do not have any active client assignments yet. Check incoming customer requests to review inquiries and onboard new clients.
                    </p>
                    <button
                      onClick={() => navigate('/advisor/requests')}
                      className="mt-4 px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0A] rounded-xl text-xs font-bold transition-all"
                    >
                      Review Customer Requests
                    </button>
                  </div>
                ) : (
                  users.map((u) => (
                  <div key={u.id} className="py-4 flex items-center justify-between hover:bg-[#21201B]/50 px-2 rounded-xl transition-all">
                    <div>
                      <p className="text-sm font-bold text-[#F5F1E6]">{u.full_name}</p>
                      <p className="text-xs text-[#A9A59A] mt-0.5">{u.email} • Joined {formatDate(u.date_joined)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A9A59A]">Status</span>
                        <p className="text-xs font-bold text-emerald-400">80/100 • Prime Fitness</p>
                      </div>
                      <button
                        onClick={() => {
                          handleSelectClient(u)
                          navigate('/advisor/clients')
                        }}
                        className="px-3.5 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0A] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      >
                        Audit Client <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            {/* Advisory Strategic Playbook */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Advisor Fiduciary Responsibilities
                </h3>
                <p className="text-xs text-[#A9A59A] leading-relaxed">
                  Advisors serve as personal navigators: reviewing permitted accounts, analyzing spending patterns, issuing smart budgeting tips, and tracking goal deadlines.
                </p>

                <div className="mt-4 p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Advisor Scope of Work</span>
                  <ul className="text-xs text-[#F5F1E6] space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      View permitted accounts &amp; transaction history
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      Analyze spending patterns &amp; budget variances
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      Dispatch actionable tips &amp; rebalancing advice
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Generate monthly summaries &amp; expense reports
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => navigate('/advisor/clients')}
                className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
              >
                Open Client Audit Suite <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 2. CLIENT AUDIT SUITE (6 CORE MODULES) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Client Directory Selector */}
          <div className="lg:col-span-1 bg-[#171714] border border-[#2B2A24] rounded-3xl p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-[#2B2A24]">
              <h3 className="text-xs font-bold text-[#A9A59A] uppercase tracking-wider">Client Directory</h3>
              <span className="text-[11px] text-[#D4AF37] font-semibold">{filteredClients.length} Clients</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#A9A59A]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] pl-9 pr-3 py-2 rounded-xl focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

<<<<<<< Updated upstream
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredClients.length === 0 ? (
                <div className="py-8 px-2 text-center text-[#A9A59A]">
                  <Users className="w-8 h-8 mx-auto text-[#A9A59A]/40 mb-2" />
                  <p className="text-xs font-semibold text-[#F5F1E6]">No Clients Found</p>
                  <p className="text-[10px] text-[#A9A59A] mt-1">
                    {users.length === 0
                      ? "You do not have any assigned clients yet."
                      : "No clients match your search filter."}
                  </p>
                  {users.length === 0 && (
                    <button
                      onClick={() => navigate('/advisor/requests')}
                      className="mt-3 px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-xl text-[10px] font-bold"
                    >
                      Check Requests
                    </button>
                  )}
                </div>
              ) : (
                filteredClients.map((u) => {
                const isSelected = selectedUser?.id === u.id
                const initial = (u.full_name || 'U').charAt(0).toUpperCase()
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectClient(u)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#D4AF37]/20 via-[#21201B] to-[#171714] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                        : 'bg-[#0B0B0A] border-[#2B2A24] hover:border-[#D4AF37]/50 hover:bg-[#1c1b17]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate mr-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] scale-105 shadow-md shadow-[#D4AF37]/30'
                          : 'bg-[#171714] border border-[#2B2A24] text-[#D4AF37] group-hover:border-[#D4AF37]/40'
                      }`}>
                        {initial}
                      </div>
                      <div className="truncate">
                        <p className={`font-bold text-xs truncate ${isSelected ? 'text-[#D4AF37]' : 'text-[#F5F1E6] group-hover:text-[#D4AF37]'}`}>
                          {u.full_name}
                        </p>
                        <p className="text-[10px] text-[#A9A59A] truncate font-mono">{u.email}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-sm shadow-[#D4AF37] shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#A9A59A] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </button>
                )
              }))}
=======
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredClients.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectClient(u)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                    selectedUser?.id === u.id
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#0B0B0A] border-[#2B2A24] text-[#F5F1E6] hover:border-[#D4AF37]/40'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="font-bold truncate">{u.full_name}</p>
                    <p className="text-[10px] text-[#A9A59A] font-normal truncate">{u.email}</p>
                  </div>
                  <Eye className="w-4 h-4 text-[#D4AF37] shrink-0" />
                </button>
              ))}
>>>>>>> Stashed changes
            </div>

            {selectedUser && (
              <div className="pt-3 border-t border-[#2B2A24] space-y-2 text-[11px]">
                <div className="flex justify-between text-[#A9A59A]">
                  <span>Fiduciary Status:</span>
                  <span className="font-bold text-emerald-400">Permitted Client</span>
                </div>
                <div className="flex justify-between text-[#A9A59A]">
                  <span>Member Since:</span>
                  <span className="text-[#F5F1E6]">{formatDate(selectedUser.date_joined)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Main Panel: 6 Core Advisor Functionalities */}
          <div className="lg:col-span-3 space-y-6">
            {/* Client Top Header Bar */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Active Fiduciary Audit Target</span>
                <h2 className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  {selectedUser?.full_name}
                </h2>
                <p className="text-xs text-[#A9A59A]">{selectedUser?.email}</p>
              </div>

              {/* 6 Modules Tab Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0B0B0A] p-1.5 rounded-2xl border border-[#2B2A24]">
                <button
                  onClick={() => setActiveModule('ALL')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'ALL' ? 'bg-[#D4AF37] text-[#0B0B0A] shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> All
                </button>
                <button
                  onClick={() => setActiveModule('INFO')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'INFO' ? 'bg-[#D4AF37] text-[#0B0B0A] shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" /> 1. Financial Info
                </button>
                <button
                  onClick={() => setActiveModule('ANALYSIS')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'ANALYSIS' ? 'bg-[#D4AF37] text-[#0B0B0A] shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> 2. Analysis
                </button>
                <button
                  onClick={() => setActiveModule('RECOMMENDATIONS')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'RECOMMENDATIONS' ? 'bg-amber-400 text-[#0B0B0A] shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" /> 3. Recommendations
                </button>
                <button
                  onClick={() => setActiveModule('GOALS')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'GOALS' ? 'bg-blue-500 text-white shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" /> 4. Monitor Goals
                </button>
                <button
                  onClick={() => setActiveModule('REPORTS')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'REPORTS' ? 'bg-purple-500 text-white shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> 5. Reports
                </button>
                <button
                  onClick={() => setActiveModule('GOVERNANCE')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeModule === 'GOVERNANCE' ? 'bg-emerald-500 text-[#0B0B0A] shadow' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> 6. Access Control
                </button>
              </div>
            </div>

            {loadingClient && (
              <div className="p-8 text-center text-xs text-[#A9A59A] animate-pulse">
                Loading client accounts, transactions, investments &amp; analytical telemetry...
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 1: VIEW CUSTOMER FINANCIAL INFORMATION                             */}
            {/* ========================================================================= */}
            {(activeModule === 'ALL' || activeModule === 'INFO') && (
              <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                        1. Customer Financial Information
                      </h3>
                      <p className="text-xs text-[#A9A59A]">Permitted bank accounts, income, expenses &amp; searchable transaction ledger</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Permitted Accounts: {clientAccounts.length}
                  </span>
                </div>

                {/* Income & Expenses Summary Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[10px] text-[#A9A59A] uppercase">Total Liquid Balance</span>
                    <p className="text-base font-bold text-[#F5F1E6] mt-1">{formatCurrency(totalBalance)}</p>
                    <span className="text-[10px] text-[#A9A59A]">Across {clientAccounts.length} permitted accounts</span>
                  </div>
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[10px] text-[#A9A59A] uppercase">Monthly Income</span>
                    <p className="text-base font-bold text-emerald-400 mt-1">{formatCurrency(monthlyIncome)}</p>
                    <span className="text-[10px] text-[#A9A59A]">Verified direct deposits &amp; yield</span>
                  </div>
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[10px] text-[#A9A59A] uppercase">Monthly Expenses</span>
                    <p className="text-base font-bold text-red-400 mt-1">{formatCurrency(monthlyExpenses)}</p>
                    <span className="text-[10px] text-[#A9A59A]">Outflows &amp; recurring bills</span>
                  </div>
                  <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                    <span className="text-[10px] text-[#A9A59A] uppercase">Net Cash Flow</span>
                    <p className={`text-base font-bold mt-1 ${netCashFlow >= 0 ? 'text-[#D4AF37]' : 'text-red-400'}`}>
                      {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                    </p>
                    <span className="text-[10px] text-[#A9A59A]">Savings Velocity: {savingsRate}%</span>
                  </div>
                </div>

                {/* Permitted Bank Accounts Grid */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A9A59A]">
                    Customer Permitted Bank Accounts
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {clientAccounts.length === 0 ? (
                      <p className="text-xs text-[#A9A59A] col-span-3">No permitted bank accounts on file.</p>
                    ) : (
                      clientAccounts.map((acc) => (
                        <div key={acc.id} className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#F5F1E6] truncate">{acc.account_name}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                              {acc.account_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A9A59A] font-mono">
                            {maskAccountNumber(acc.account_number)} • {acc.bank_name || 'Finora Private'}
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-[#2B2A24]">
                            <span className="text-xs font-bold text-[#D4AF37] font-['Space_Grotesk']">
                              {formatCurrency(acc.balance)}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold">{acc.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Transaction History with Search & Category Filters */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A9A59A]">
                        Transaction History ({filteredTransactions.length} Records)
                      </span>
                      <button
                        onClick={() => navigate('/advisor/transactions')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0B0A] border border-[#D4AF37]/30 text-[11px] font-bold transition-all shadow-sm"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Full Transaction Tracker →
                      </button>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="w-3 h-3 text-[#A9A59A] absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={txnSearch}
                          onChange={(e) => setTxnSearch(e.target.value)}
                          className="bg-[#0B0B0A] border border-[#2B2A24] text-[11px] text-[#F5F1E6] pl-8 pr-2 py-1.5 rounded-xl focus:border-[#D4AF37] focus:outline-none w-full sm:w-44"
                        />
                      </div>
                      <select
                        value={txnTypeFilter}
                        onChange={(e) => setTxnTypeFilter(e.target.value)}
                        className="bg-[#0B0B0A] border border-[#2B2A24] text-[11px] text-[#F5F1E6] px-2 py-1.5 rounded-xl focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="ALL">All Types</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                        <option value="TRANSFER">Transfer</option>
                      </select>
                      <select
                        value={txnCatFilter}
                        onChange={(e) => setTxnCatFilter(e.target.value)}
                        className="bg-[#0B0B0A] border border-[#2B2A24] text-[11px] text-[#F5F1E6] px-2 py-1.5 rounded-xl focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="ALL">All Categories</option>
                        {uniqueCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="overflow-x-auto border border-[#2B2A24] rounded-2xl bg-[#0B0B0A]">
                    <table className="w-full text-left text-xs text-[#F5F1E6]">
                      <thead>
                        <tr className="border-b border-[#2B2A24] text-[#A9A59A] text-[11px] uppercase bg-[#171714]">
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Type</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2B2A24]">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-[#A9A59A]">
                              No matching transactions found.
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.slice(0, 8).map((txn) => {
                            const isInc = txn.transaction_type === 'INCOME'
                            const isTrf = txn.transaction_type === 'TRANSFER'
                            return (
                              <tr key={txn.id} className="hover:bg-[#21201B]/40 transition-colors">
                                <td className="p-3 text-[11px] text-[#A9A59A]">{formatDate(txn.transaction_date)}</td>
                                <td className="p-3 font-semibold text-[#F5F1E6]">{txn.description}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#171714] border border-[#2B2A24] text-[#A9A59A]">
                                    {txn.category || 'General'}
                                  </span>
                                </td>
                                <td className="p-3 text-[11px] text-[#A9A59A]">{txn.payment_method || 'Direct'}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                      isInc
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                        : isTrf
                                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                        : 'bg-red-500/15 text-red-400 border-red-500/30'
                                    }`}
                                  >
                                    {txn.transaction_type}
                                  </span>
                                </td>
                                <td className={`p-3 text-right font-bold font-['Space_Grotesk'] ${isInc ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {isInc ? '+' : '-'}{formatCurrency(txn.amount)}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 2: FINANCIAL ANALYSIS & CHARTS                                      */}
            {/* ========================================================================= */}
            {(activeModule === 'ALL' || activeModule === 'ANALYSIS') && (
              <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                        2. Comprehensive Financial Analysis
                      </h3>
                      <p className="text-xs text-[#A9A59A]">Cash flow trends, spending distribution &amp; investment growth telemetry</p>
                    </div>
                  </div>
                </div>

                {/* Analytical Visuals Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Cash Flow Trend */}
                  <div className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider">
                        6-Month Cash Flow Analysis
                      </h4>
                      <span className="text-[10px] text-[#D4AF37]">Income vs Expense</span>
                    </div>

                    <div className="h-56 w-full">
                      {(clientAnalytics?.cash_flow_timeline || []).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-[#A9A59A]">
                          Recording cash flow history...
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={clientAnalytics.cash_flow_timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="advisorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="advisorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#A9A59A" fontSize={10} tickLine={false} />
                            <YAxis stroke="#A9A59A" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#171714', borderColor: '#D4AF37', borderRadius: '12px', fontSize: '11px' }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#advisorIncome)" name="Income" />
                            <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#advisorExpense)" name="Expenses" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Chart 2: Category Spending Patterns */}
                  <div className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider">
                        Spending Patterns by Category
                      </h4>
                      <span className="text-[10px] text-[#A9A59A]">Discretionary vs Fixed</span>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {spendingByCategory.length === 0 ? (
                        <p className="text-xs text-[#A9A59A] text-center pt-12">No expense transactions recorded yet.</p>
                      ) : (
                        spendingByCategory.map((s, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#F5F1E6]">{s.category}</span>
                              <span className="font-bold text-[#D4AF37] font-['Space_Grotesk']">
                                {formatCurrency(s.amount)} ({s.percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#171714] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#D4AF37] h-full rounded-full"
                                style={{ width: `${s.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Investment Analysis Highlights */}
                <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" /> Portfolio Growth &amp; Composition Analysis
                    </span>
                    <span className="text-xs font-bold text-emerald-400">+{returnPct}% Overall Yield</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                      <span className="text-[10px] text-[#A9A59A] uppercase">Equities (Stocks)</span>
                      <p className="text-sm font-bold text-[#F5F1E6] mt-0.5">{formatCurrency(stockVal)} ({stockPct}%)</p>
                    </div>
                    <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                      <span className="text-[10px] text-[#A9A59A] uppercase">Mutual Funds &amp; ETFs</span>
                      <p className="text-sm font-bold text-[#F5F1E6] mt-0.5">{formatCurrency(mfVal)} ({mfPct}%)</p>
                    </div>
                    <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                      <span className="text-[10px] text-[#A9A59A] uppercase">Gold &amp; Commodities</span>
                      <p className="text-sm font-bold text-[#F5F1E6] mt-0.5">{formatCurrency(goldVal)} ({goldPct}%)</p>
                    </div>
                    <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                      <span className="text-[10px] text-[#A9A59A] uppercase">Liquid Cash Reserves</span>
                      <p className="text-sm font-bold text-[#D4AF37] mt-0.5">{formatCurrency(totalBalance)} ({cashPct}%)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 3: PROVIDE RECOMMENDATIONS (ACTIONABLE ADVICE ENGINE)               */}
            {/* ========================================================================= */}
            {(activeModule === 'ALL' || activeModule === 'RECOMMENDATIONS') && (
              <div id="advisory-dispatcher-form" className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                        3. Provide Strategic Recommendations
                      </h3>
                      <p className="text-xs text-[#A9A59A]">Suggest better budgeting, set savings targets, advise investments &amp; identify excessive spending</p>
                    </div>
                  </div>
                </div>

                {/* Automated Anomaly & Excessive Spending Scanner */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Excessive / Unusual Spending Anomaly Flags
                  </span>

                  {anomalies.length === 0 ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      No excessive spending anomalies detected. Client living well within established bounds.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {anomalies.map((a, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl hover:border-amber-500/40 transition-all flex items-start gap-3"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#F5F1E6]">{a.title}</p>
                            <p className="text-[11px] text-[#A9A59A] mt-0.5">{a.desc}</p>
                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(a.category, a.title, a.desc)}
                              className="mt-2 text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                            >
                              Dispatch Coaching Advice →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4 Targeted Advisory Playbooks (User Requirements) */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A9A59A]">
                    Targeted Advisory Action Recommendations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* 1. Better Budgeting */}
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(
                        'Better Budgeting',
                        'Suggest Better Budgeting Limits',
                        'Based on your recent spending analysis, capping Food & Dining to ₹18,000 and Utilities to ₹7,000 will free up an additional ₹6,500 every month for wealth compounding.'
                      )}
                      className="p-3 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] hover:border-[#D4AF37]/50 rounded-xl text-left transition-all group"
                    >
                      <p className="text-xs font-bold text-[#F5F1E6] group-hover:text-[#D4AF37]">📊 Better Budgeting</p>
                      <p className="text-[10px] text-[#A9A59A] mt-1">Cap lifestyle expenses by 15%</p>
                    </button>

                    {/* 2. Recommend Savings Targets */}
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(
                        'Savings Targets',
                        'Recommend Higher Monthly Savings Target',
                        `Your current savings rate is ${savingsRate}%. We recommend raising your monthly savings target by ₹7,500 to reach a 35% savings velocity and fully back your emergency runway.`
                      )}
                      className="p-3 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] hover:border-[#D4AF37]/50 rounded-xl text-left transition-all group"
                    >
                      <p className="text-xs font-bold text-[#F5F1E6] group-hover:text-[#D4AF37]">💰 Savings Targets</p>
                      <p className="text-[10px] text-[#A9A59A] mt-1">Accelerate liquid safety cushion</p>
                    </button>

                    {/* 3. Investment Guidance */}
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(
                        'Investment Guidance',
                        'Asset Allocation & Rebalancing Guidance',
                        'To diversify beyond equities, we advise directing next month surplus into Sovereign Gold Bonds (15% weight) and Large-Cap Index Funds to guard against volatility.'
                      )}
                      className="p-3 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] hover:border-[#D4AF37]/50 rounded-xl text-left transition-all group"
                    >
                      <p className="text-xs font-bold text-[#F5F1E6] group-hover:text-[#D4AF37]">📈 Investment Guidance</p>
                      <p className="text-[10px] text-[#A9A59A] mt-1">Rebalance equity vs. gold</p>
                    </button>

                    {/* 4. Identify Excessive Spending */}
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(
                        'Excessive Spending',
                        'Excessive Discretionary Spending Warning',
                        'Your monthly expenses are trending higher than the 6-month average. We recommend pausing high-ticket non-essential purchases until next pay cycle.'
                      )}
                      className="p-3 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] hover:border-[#D4AF37]/50 rounded-xl text-left transition-all group"
                    >
                      <p className="text-xs font-bold text-[#F5F1E6] group-hover:text-[#D4AF37]">🚨 Spending Alerts</p>
                      <p className="text-[10px] text-[#A9A59A] mt-1">Flag unusual spending leaks</p>
                    </button>
                  </div>
                </div>

                {/* The Interactive Advisor Recommendation Dispatcher Form */}
                <form onSubmit={handleDispatchAdvice} className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5 uppercase tracking-wider">
                      <Send className="w-3.5 h-3.5" /> Dispatch Guidance to {selectedUser?.full_name}
                    </h4>
                    <span className="text-[10px] text-[#A9A59A]">Delivers instantly to client notifications feed</span>
                  </div>

                  {adviceStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        adviceStatus.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
                    >
                      {adviceStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{adviceStatus.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#A9A59A] block mb-1">Recommendation Focus</label>
                      <select
                        value={adviceCategory}
                        onChange={(e) => setAdviceCategory(e.target.value)}
                        className="w-full bg-[#171714] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="Better Budgeting">📊 Better Budgeting</option>
                        <option value="Savings Targets">💰 Savings Targets</option>
                        <option value="Investment Guidance">📈 Investment Guidance</option>
                        <option value="Excessive Spending">🚨 Excessive Spending Warning</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#A9A59A] block mb-1">Priority / Urgency</label>
                      <select
                        value={advicePriority}
                        onChange={(e) => setAdvicePriority(e.target.value)}
                        className="w-full bg-[#171714] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="Strategic Advice">Strategic Advice (Normal)</option>
                        <option value="Urgent Action Required">Urgent Action Required (High)</option>
                        <option value="Savings Target Reminder">Savings Target Reminder (Gentle)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A9A59A] block mb-1">Recommendation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Budget Adjustment: Cap Food & Entertainment to ₹18,000"
                      value={adviceTitle}
                      onChange={(e) => setAdviceTitle(e.target.value)}
                      className="w-full bg-[#171714] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A9A59A] block mb-1">Actionable Coaching Note</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write actionable coaching advice for the customer..."
                      value={adviceMessage}
                      onChange={(e) => setAdviceMessage(e.target.value)}
                      className="w-full bg-[#171714] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingAdvice || !adviceMessage.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendingAdvice ? 'Dispatching...' : '🚀 Dispatch Guidance to Client'}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 4: MONITOR FINANCIAL GOALS & BUDGET PERFORMANCE                    */}
            {/* ========================================================================= */}
            {(activeModule === 'ALL' || activeModule === 'GOALS') && (
              <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                        4. Monitor Financial Goals &amp; Budget Performance
                      </h3>
                      <p className="text-xs text-[#A9A59A]">Track savings progress, detect budget variances &amp; flag overspending areas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/advisor/budgets')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0B0A] border border-[#D4AF37]/30 text-xs font-bold transition-all shadow-sm"
                  >
                    <PieIcon className="w-3.5 h-3.5" /> Full Budget Monitor →
                  </button>
                </div>

                {/* Budget Adherence Monitoring Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A9A59A]">
                      Budget Performance Monitor ({clientBudgets.length} Categories)
                    </span>
                    {overspentBudgets.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        {overspentBudgets.length} Categories Exceeding / Nearing Limits
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {clientBudgets.length === 0 ? (
                      <p className="text-xs text-[#A9A59A] col-span-2">No active budgets set by customer.</p>
                    ) : (
                      clientBudgets.map((b) => {
                        const limit = parseFloat(b.budget_limit || 0)
                        const spent = parseFloat(b.spent_amount || 0)
                        const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0
                        const isOver = spent > limit
                        const isWarning = pct >= 80 && !isOver

                        return (
                          <div
                            key={b.id}
                            className={`p-4 bg-[#0B0B0A] border rounded-2xl space-y-2 transition-all ${
                              isOver
                                ? 'border-red-500/40'
                                : isWarning
                                ? 'border-amber-500/40'
                                : 'border-[#2B2A24]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#F5F1E6]">{b.category}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                  isOver
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                    : isWarning
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                }`}
                              >
                                {isOver ? 'Exceeded' : isWarning ? 'Caution (>80%)' : 'Optimal'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className={isOver ? 'text-red-400 font-bold' : 'text-[#F5F1E6]'}>
                                Spent: {formatCurrency(spent)}
                              </span>
                              <span className="text-[#A9A59A]">Limit: {formatCurrency(limit)}</span>
                            </div>

                            <div className="w-full bg-[#171714] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isOver ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>

                            {isOver && (
                              <button
                                type="button"
                                onClick={() => handleSelectTemplate(
                                  'Better Budgeting',
                                  `Budget Exceeded in ${b.category}`,
                                  `Notice: you have exceeded your ${b.category} budget by ${formatCurrency(spent - limit)}. We recommend pausing discretionary spend in this category for the remainder of the month.`
                                )}
                                className="text-[10px] font-bold text-red-400 hover:underline pt-1 block"
                              >
                                Advise Overspending Fix →
                              </button>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Savings Goals Pacing & Progress */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A9A59A]">
                    Progress Toward Life Savings Goals ({clientGoals.length} Goals)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {clientGoals.map((g) => {
                      const cur = parseFloat(g.current_amount || 0)
                      const tgt = parseFloat(g.target_amount || 1)
                      const pct = Math.min(100, Math.round((cur / tgt) * 100))
                      const monthlyContrib = parseFloat(g.monthly_contribution || 0)
                      const remaining = Math.max(0, tgt - cur)
                      const isOnTrack = pct >= 45 || monthlyContrib >= (remaining / 18)

                      return (
                        <div key={g.id} className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-[#A9A59A]">Milestone Goal</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                isOnTrack
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {isOnTrack ? '🟢 On Track' : '🟡 Needs Boost'}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#F5F1E6]">{g.name}</h4>
                          <p className="text-[10px] text-[#A9A59A]">Target Deadline: {formatDate(g.target_date)}</p>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-[#D4AF37]">{formatCurrency(cur)}</span>
                              <span className="text-[#A9A59A]">{formatCurrency(tgt)}</span>
                            </div>
                            <div className="w-full bg-[#171714] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isOnTrack ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-[#A9A59A]">
                              <span>{pct}% funded</span>
                              <span>{formatCurrency(remaining)} left</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#2B2A24] flex items-center justify-between">
                            <span className="text-[10px] text-[#A9A59A]">
                              Deposit: <strong className="text-[#F5F1E6]">{formatCurrency(monthlyContrib)}/mo</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(
                                'Savings Targets',
                                `Pace Correction for ${g.name}`,
                                `Regarding "${g.name}": you are currently ${pct}% funded. Increasing your monthly deposit to ${formatCurrency(monthlyContrib + 2500)} will keep you on pace for completion by ${formatDate(g.target_date)}.`
                              )}
                              className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                            >
                              Coach Pace →
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 5: GENERATE & REVIEW REPORTS                                       */}
            {/* ========================================================================= */}
            {(activeModule === 'ALL' || activeModule === 'REPORTS') && (
              <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#2B2A24]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                        5. Generate &amp; Review Financial Reports
                      </h3>
                      <p className="text-xs text-[#A9A59A]">Monthly summaries, expense analysis, investment performance &amp; budget variance</p>
                    </div>
                  </div>

                  {/* Export & Print actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportCSV(activeReportTab)}
                      className="px-3 py-1.5 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] text-xs font-semibold text-[#F5F1E6] rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintReport}
                      className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C9A227] text-[#0B0B0A] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Report
                    </button>
                  </div>
                </div>

                {/* Report Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-[#2B2A24] pb-3">
                  <button
                    onClick={() => setActiveReportTab('summary')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeReportTab === 'summary'
                        ? 'bg-[#D4AF37] text-[#0B0B0A]'
                        : 'bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]'
                    }`}
                  >
                    Monthly Financial Summary
                  </button>
                  <button
                    onClick={() => setActiveReportTab('expenses')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeReportTab === 'expenses'
                        ? 'bg-[#D4AF37] text-[#0B0B0A]'
                        : 'bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]'
                    }`}
                  >
                    Expense Analysis
                  </button>
                  <button
                    onClick={() => setActiveReportTab('investments')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeReportTab === 'investments'
                        ? 'bg-[#D4AF37] text-[#0B0B0A]'
                        : 'bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]'
                    }`}
                  >
                    Investment Performance
                  </button>
                  <button
                    onClick={() => setActiveReportTab('budget_variance')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeReportTab === 'budget_variance'
                        ? 'bg-[#D4AF37] text-[#0B0B0A]'
                        : 'bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]'
                    }`}
                  >
                    Budget vs. Actual Variance
                  </button>
                </div>

                {/* Report Content Panels */}
                <div className="bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl p-5">
                  {/* 1. Monthly Financial Summary */}
                  {activeReportTab === 'summary' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                        <h4 className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider">
                          Executive Monthly Financial Summary for {selectedUser?.full_name}
                        </h4>
                        <span className="text-[10px] text-[#A9A59A]">Generated {new Date().toLocaleDateString()}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                          <span className="text-[10px] text-[#A9A59A] uppercase">Total Income</span>
                          <p className="text-sm font-bold text-emerald-400 mt-1">{formatCurrency(monthlyIncome)}</p>
                        </div>
                        <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                          <span className="text-[10px] text-[#A9A59A] uppercase">Total Expenses</span>
                          <p className="text-sm font-bold text-red-400 mt-1">{formatCurrency(monthlyExpenses)}</p>
                        </div>
                        <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                          <span className="text-[10px] text-[#A9A59A] uppercase">Net Monthly Savings</span>
                          <p className="text-sm font-bold text-[#D4AF37] mt-1">{formatCurrency(netCashFlow)}</p>
                        </div>
                        <div className="p-3 bg-[#171714] rounded-xl border border-[#2B2A24]">
                          <span className="text-[10px] text-[#A9A59A] uppercase">Liquid Runway</span>
                          <p className="text-sm font-bold text-[#F5F1E6] mt-1">{emergencyRunwayMonths} Months</p>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#171714] rounded-xl border border-[#2B2A24] text-xs text-[#A9A59A] leading-relaxed">
                        <strong className="text-[#F5F1E6] block mb-1">Advisor Evaluation:</strong>
                        Client is operating with an overall Financial Health Score of {healthScore}/100 and a savings rate of {savingsRate}%. Total managed liquid capital stands at {formatCurrency(totalBalance)} with {clientAccounts.length} active permitted accounts.
                      </div>
                    </div>
                  )}

                  {/* 2. Expense Analysis */}
                  {activeReportTab === 'expenses' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                        <h4 className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider">
                          Expense Breakdown &amp; Analysis
                        </h4>
                        <span className="text-[10px] text-[#A9A59A]">Total Spent: {formatCurrency(monthlyExpenses)}</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#F5F1E6]">
                          <thead>
                            <tr className="border-b border-[#2B2A24] text-[#A9A59A] text-[10px] uppercase">
                              <th className="pb-2">Expense Category</th>
                              <th className="pb-2">Total Amount</th>
                              <th className="pb-2">Share of Total</th>
                              <th className="pb-2">Estimated Daily</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2B2A24]">
                            {spendingByCategory.map((s, idx) => (
                              <tr key={idx} className="hover:bg-[#171714]">
                                <td className="py-2.5 font-bold">{s.category}</td>
                                <td className="py-2.5 font-semibold text-red-400">{formatCurrency(s.amount)}</td>
                                <td className="py-2.5">{s.percentage}%</td>
                                <td className="py-2.5 text-[#A9A59A]">{formatCurrency(s.amount / 30)}/day</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3. Investment Performance */}
                  {activeReportTab === 'investments' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                        <h4 className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider">
                          Portfolio Valuation &amp; Holding Performance
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold">+{returnPct}% Portfolio Yield</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#F5F1E6]">
                          <thead>
                            <tr className="border-b border-[#2B2A24] text-[#A9A59A] text-[10px] uppercase">
                              <th className="pb-2">Holding</th>
                              <th className="pb-2">Asset Class</th>
                              <th className="pb-2">Quantity</th>
                              <th className="pb-2">Cost Basis</th>
                              <th className="pb-2">Current Value</th>
                              <th className="pb-2 text-right">Unrealized Gain/Loss</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2B2A24]">
                            {clientInvestments.map((i) => {
                              const cost = parseFloat(i.quantity) * parseFloat(i.average_buy_price)
                              const val = parseFloat(i.current_value)
                              const diff = val - cost
                              return (
                                <tr key={i.id} className="hover:bg-[#171714]">
                                  <td className="py-2.5 font-bold">{i.asset_name}</td>
                                  <td className="py-2.5">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                                      {i.asset_type}
                                    </span>
                                  </td>
                                  <td className="py-2.5">{i.quantity}</td>
                                  <td className="py-2.5 text-[#A9A59A]">{formatCurrency(cost)}</td>
                                  <td className="py-2.5 font-bold text-[#F5F1E6]">{formatCurrency(val)}</td>
                                  <td className={`py-2.5 text-right font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 4. Budget vs. Actual Variance */}
                  {activeReportTab === 'budget_variance' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                        <h4 className="text-xs font-bold text-[#F5F1E6] uppercase tracking-wider">
                          Budget Variance &amp; Adherence Report
                        </h4>
                        <span className="text-[10px] text-[#A9A59A]">{clientBudgets.length} Monitored Categories</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#F5F1E6]">
                          <thead>
                            <tr className="border-b border-[#2B2A24] text-[#A9A59A] text-[10px] uppercase">
                              <th className="pb-2">Category</th>
                              <th className="pb-2">Budgeted Limit</th>
                              <th className="pb-2">Actual Spend</th>
                              <th className="pb-2">Variance (Surplus/Deficit)</th>
                              <th className="pb-2 text-right">Adherence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2B2A24]">
                            {clientBudgets.map((b) => {
                              const limit = parseFloat(b.budget_limit || 0)
                              const spent = parseFloat(b.spent_amount || 0)
                              const variance = limit - spent
                              const isOver = spent > limit
                              return (
                                <tr key={b.id} className="hover:bg-[#171714]">
                                  <td className="py-2.5 font-bold">{b.category}</td>
                                  <td className="py-2.5 text-[#A9A59A]">{formatCurrency(limit)}</td>
                                  <td className="py-2.5 font-bold text-[#F5F1E6]">{formatCurrency(spent)}</td>
                                  <td className={`py-2.5 font-bold ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {variance >= 0 ? `+${formatCurrency(variance)} surplus` : `-${formatCurrency(Math.abs(variance))} deficit`}
                                  </td>
                                  <td className="py-2.5 text-right">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                        isOver
                                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      }`}
                                    >
                                      {isOver ? 'Exceeded' : 'Within Budget'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODULE 6: LIMITED ACCESS & RBAC GOVERNANCE CONTROLS                       */}
            {/* ========================================================================= */}
            {(activeModule === 'ALL' || activeModule === 'GOVERNANCE') && (
              <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                        6. Limited Access &amp; Fiduciary Governance Matrix
                      </h3>
                      <p className="text-xs text-[#A9A59A]">Strict role-based access control protecting customer privacy &amp; sovereign funds</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Fiduciary Guardrails Enforced
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Authorized Powers */}
                  <div className="p-4 bg-[#0B0B0A] border border-emerald-500/30 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" /> Permitted Advisor Actions
                    </h4>
                    <ul className="text-xs text-[#F5F1E6] space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Audit customer permitted accounts &amp; transaction ledgers
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Evaluate spending patterns and budget variance
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Generate &amp; export financial summaries &amp; performance reports
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Dispatch non-custodial coaching recommendations
                      </li>
                    </ul>
                  </div>

                  {/* Restrained Actions (Limited Access) */}
                  <div className="p-4 bg-[#0B0B0A] border border-red-500/30 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Lock className="w-4 h-4" /> Restrained / Unauthorized Actions
                    </h4>
                    <ul className="text-xs text-[#A9A59A] space-y-2">
                      <li className="flex items-center gap-2 text-red-400/90">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0">✕</span>
                        Direct withdrawal or modification of customer account balances
                      </li>
                      <li className="flex items-center gap-2 text-red-400/90">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0">✕</span>
                        Execution of inter-account transfers without customer authorization
                      </li>
                      <li className="flex items-center gap-2 text-red-400/90">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0">✕</span>
                        Deletion or closing of customer bank accounts
                      </li>
                      <li className="flex items-center gap-2 text-red-400/90">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold shrink-0">✕</span>
                        Alteration of customer transaction history or password credentials
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl text-[11px] text-[#A9A59A] flex items-center justify-between">
                  <span>Customer Permission Token: <code className="text-[#D4AF37]">{selectedUser?.email}::fiduciary_audit_token_active</code></span>
                  <span className="text-emerald-400 font-bold">Audit Trail Encrypted &amp; Logged</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
