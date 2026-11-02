import React, { useState, useEffect, useMemo } from 'react'
import {
  PieChart as PieIcon,
  AlertTriangle,
  ShieldCheck,
  Users,
  Calendar,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Layers,
  Percent,
  Check,
  ChevronRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts'
import { advisorService, budgetService, notificationService } from '../services/api'
import { formatCurrency } from '../utils/formatters'

// Theme-adaptive custom tooltip
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#171714] border border-[#D4AF37]/50 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold text-[#F5F1E6] mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-xs font-medium" style={{ color: entry.color || '#D4AF37' }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const STATUS_COLORS = {
  OPTIMAL: '#10B981', // Emerald
  WARNING: '#F59E0B', // Amber
  EXCEEDED: '#EF4444' // Red
}

export const AdvisorBudgetsDashboard = () => {
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingClients, setLoadingClients] = useState(true)

  // Month & Year state
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  // Grid filter states
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | OPTIMAL | WARNING | EXCEEDED
  const [categorySearch, setCategorySearch] = useState('')

  // Advice Modal State
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false)
  const [targetedBudget, setTargetedBudget] = useState(null)
  const [adviceClientName, setAdviceClientName] = useState('')
  const [adviceClientId, setAdviceClientId] = useState('')
  const [adviceTitle, setAdviceTitle] = useState('')
  const [adviceMessage, setAdviceMessage] = useState('')
  const [adviceCategory, setAdviceCategory] = useState('Better Budgeting')
  const [advicePriority, setAdvicePriority] = useState('Urgent Action Required')
  const [sendingAdvice, setSendingAdvice] = useState(false)
  const [adviceSuccess, setAdviceSuccess] = useState('')
  const [adviceError, setAdviceError] = useState('')

  // 1. Fetch Client List
  useEffect(() => {
    setLoadingClients(true)
    advisorService.getAssignedClients()
      .then(res => {
        if (res.data?.success) {
          setClients(res.data.data || [])
        }
      })
      .catch(err => console.error('Failed to load clients:', err))
      .finally(() => setLoadingClients(false))
  }, [])

  // 2. Fetch Budgets
  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
      }
      if (selectedClientId) {
        params.user_id = selectedClientId
      }
      const res = await budgetService.getBudgets(params)
      if (res.data?.success) {
        setBudgets(res.data.data)
      } else if (Array.isArray(res.data)) {
        setBudgets(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [selectedClientId, selectedMonth, selectedYear])

  // Executive KPI Calculations
  const metrics = useMemo(() => {
    let totalLimit = 0
    let totalSpent = 0
    let exceededCount = 0
    let warningCount = 0
    let optimalCount = 0

    budgets.forEach(b => {
      const limit = parseFloat(b.monthly_limit) || 0
      const spent = parseFloat(b.spent_amount) || 0
      totalLimit += limit
      totalSpent += spent

      if (b.status === 'EXCEEDED' || (limit > 0 && spent >= limit)) {
        exceededCount += 1
      } else if (b.status === 'WARNING' || (limit > 0 && spent / limit >= 0.75)) {
        warningCount += 1
      } else {
        optimalCount += 1
      }
    })

    const remainingBuffer = Math.max(0, totalLimit - totalSpent)
    const adherenceRate = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0

    return {
      totalLimit,
      totalSpent,
      remainingBuffer,
      adherenceRate,
      exceededCount,
      warningCount,
      optimalCount,
      totalBudgets: budgets.length
    }
  }, [budgets])

  // Filtered Budgets based on status and search
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const isExceeded = b.status === 'EXCEEDED' || parseFloat(b.spent_amount) > parseFloat(b.monthly_limit)
      const isWarning = !isExceeded && (b.status === 'WARNING' || b.usage_percentage >= 70)
      const isOptimal = !isExceeded && !isWarning

      if (statusFilter === 'OPTIMAL' && !isOptimal) return false
      if (statusFilter === 'WARNING' && !isWarning) return false
      if (statusFilter === 'EXCEEDED' && !isExceeded) return false

      if (categorySearch.trim()) {
        const q = categorySearch.toLowerCase()
        const cat = (b.category || '').toLowerCase()
        const user = (b.user_full_name || '').toLowerCase()
        if (!cat.includes(q) && !user.includes(q)) return false
      }

      return true
    })
  }, [budgets, statusFilter, categorySearch])

  // Overspending Category Breaches
  const overspentBudgets = useMemo(() => {
    return budgets.filter(b => b.status === 'EXCEEDED' || parseFloat(b.spent_amount) > parseFloat(b.monthly_limit))
  }, [budgets])

  // Comparison Chart Data (Limit vs Spent per Category)
  const comparisonChartData = useMemo(() => {
    return budgets.map(b => ({
      category: `${b.category}${b.user_full_name ? ` (${b.user_full_name.split(' ')[0]})` : ''}`,
      Limit: parseFloat(b.monthly_limit) || 0,
      Spent: parseFloat(b.spent_amount) || 0
    })).slice(0, 8)
  }, [budgets])

  // Status Distribution Chart Data
  const statusChartData = useMemo(() => {
    return [
      { name: 'Optimal (≤70%)', value: metrics.optimalCount, color: STATUS_COLORS.OPTIMAL },
      { name: 'Caution (70-99%)', value: metrics.warningCount, color: STATUS_COLORS.WARNING },
      { name: 'Exceeded (≥100%)', value: metrics.exceededCount, color: STATUS_COLORS.EXCEEDED }
    ].filter(d => d.value > 0)
  }, [metrics])

  // Open Coach/Advice Modal
  const handleOpenCoachModal = (budget) => {
    setTargetedBudget(budget)
    setAdviceClientId(budget.user)
    setAdviceClientName(budget.user_full_name || 'Client')
    const pct = budget.usage_percentage || Math.round((budget.spent_amount / budget.monthly_limit) * 100)
    const isOver = budget.status === 'EXCEEDED'

    setAdviceTitle(
      isOver
        ? `Budget Breach Alert: ${budget.category} (${pct}% Utilized)`
        : `Budget Optimization Review: ${budget.category}`
    )
    setAdviceMessage(
      isOver
        ? `You have exceeded your ${budget.category} budget of ${formatCurrency(budget.monthly_limit)} by ${formatCurrency(budget.overspending_amount)}. We recommend temporarily capping non-essential purchases in this category for the remainder of this cycle.`
        : `Your ${budget.category} spending is at ${formatCurrency(budget.spent_amount)} (${pct}% of the ${formatCurrency(budget.monthly_limit)} limit). Pace remaining outlays to stay within target milestones.`
    )
    setAdviceCategory('Better Budgeting')
    setAdvicePriority(isOver ? 'Urgent Action Required' : 'Strategic Advice')
    setAdviceSuccess('')
    setAdviceError('')
    setIsAdviceModalOpen(true)
  }

  // Send Advice
  const handleSendAdvice = async (e) => {
    e.preventDefault()
    setSendingAdvice(true)
    setAdviceSuccess('')
    setAdviceError('')

    try {
      const payload = {
        user_id: adviceClientId,
        title: adviceTitle,
        message: adviceMessage,
        category: adviceCategory,
        priority: advicePriority,
      }
      const res = await notificationService.sendAdvisorRecommendation(payload)
      if (res.data?.success) {
        setAdviceSuccess(`Budget coaching guidance dispatched to ${adviceClientName}!`)
        setTimeout(() => {
          setIsAdviceModalOpen(false)
          setTargetedBudget(null)
        }, 1200)
      }
    } catch (err) {
      setAdviceError(err.response?.data?.message || 'Failed to dispatch budget advice.')
    } finally {
      setSendingAdvice(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              Advisor Surveillance Suite
            </span>
            <span className="text-xs text-[#A9A59A]">Fiduciary Budget Oversight</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1 flex items-center gap-2.5">
            <PieIcon className="w-6 h-6 text-[#D4AF37]" /> Client Budget Tracker &amp; Compliance Console
          </h1>
          <p className="text-xs text-[#A9A59A] mt-1">
            Surveillance of category spending limits, burn-rate velocity &amp; client overspending breach detection
          </p>
        </div>

        {/* Client Selector & Month Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Client Selector */}
          <div className="flex items-center gap-2 bg-[#171714] border border-[#2B2A24] rounded-2xl px-3 py-1.5">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#F5F1E6] focus:outline-none cursor-pointer pr-2"
            >
              <option value="" className="bg-[#171714] text-[#F5F1E6]">
                All Assigned Clients ({clients.length})
              </option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#171714] text-[#F5F1E6]">
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-[#171714] border border-[#2B2A24] rounded-2xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-xs font-semibold text-[#F5F1E6] focus:outline-none cursor-pointer pr-2"
            >
              {[
                { m: 1, name: 'Jan' }, { m: 2, name: 'Feb' }, { m: 3, name: 'Mar' },
                { m: 4, name: 'Apr' }, { m: 5, name: 'May' }, { m: 6, name: 'Jun' },
                { m: 7, name: 'Jul' }, { m: 8, name: 'Aug' }, { m: 9, name: 'Sep' },
                { m: 10, name: 'Oct' }, { m: 11, name: 'Nov' }, { m: 12, name: 'Dec' },
              ].map(item => (
                <option key={item.m} value={item.m} className="bg-[#171714] text-[#F5F1E6]">
                  {item.name} {selectedYear}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fiduciary Limited Access Governance Banner */}
      <div className="bg-[#171714] border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F5F1E6]">Fiduciary Budget Advisory Protocol</h4>
            <p className="text-[11px] text-[#A9A59A] mt-0.5">
              Advisors review category pacing and formulate corrective coaching. Fiduciary guidelines prohibit modifying client account allocations directly without customer mandate.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 whitespace-nowrap">
          ADVISORY OVERSIGHT
        </span>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Budget Limit */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Total Budget Limit</span>
            <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {formatCurrency(metrics.totalLimit)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">{metrics.totalBudgets} Active Limits</p>
        </div>

        {/* Total Spent */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Realized Spending</span>
            <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-red-400 font-['Space_Grotesk']">
            {formatCurrency(metrics.totalSpent)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Month-to-Date Outlays</p>
        </div>

        {/* Remaining Buffer */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Remaining Buffer</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-emerald-400 font-['Space_Grotesk']">
            {formatCurrency(metrics.remainingBuffer)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Available Headroom</p>
        </div>

        {/* Adherence Rate */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Portfolio Burn Rate</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {metrics.adherenceRate}%
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Of Total Limit Absorbed</p>
        </div>

        {/* Overruns Count */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-red-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Active Breaches</span>
            <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-red-400 font-['Space_Grotesk']">
            {metrics.exceededCount}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Exceeded Categories</p>
        </div>
      </div>

      {/* Active Overspending Warning Alerts Banner */}
      {overspentBudgets.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider">
              Surveillance Warning: Active Budget Limit Breaches
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overspentBudgets.map(b => (
              <div
                key={b.id}
                className="bg-[#171714] border border-red-500/40 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#F5F1E6]">{b.category}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                      {b.usage_percentage}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A9A59A] mt-0.5">
                    {b.user_full_name || 'Client'} • Limit: {formatCurrency(b.monthly_limit)}
                  </p>
                  <p className="text-xs font-bold text-red-400 font-['Space_Grotesk'] mt-1">
                    Over by {formatCurrency(b.overspending_amount || (b.spent_amount - b.monthly_limit))}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenCoachModal(b)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-white text-[11px] font-bold transition-all shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Coach
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts: Limit vs Spent Comparison & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Category Comparison Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#F5F1E6]">Category Spending vs. Monthly Limit</h3>
              <p className="text-xs text-[#A9A59A]">Variance between allocated budget ceilings and client outlays</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] inline-block" /> Limit Ceiling
              </span>
              <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Realized Spend
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {comparisonChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A9A59A]">
                No budget comparison records available for this cycle
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#A9A59A" fontSize={10} tickLine={false} />
                  <YAxis stroke="#A9A59A" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="Limit" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Budget Compliance Distribution (1 col) */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F1E6]">Compliance Health</h3>
            <p className="text-xs text-[#A9A59A] mb-3">Portfolio category adherence status</p>
          </div>

          <div className="h-48 w-full">
            {statusChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A9A59A]">
                No budget compliance data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#2B2A24]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Optimal (≤70%)
              </span>
              <span className="font-bold text-[#F5F1E6]">{metrics.optimalCount} Categories</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Caution (70-99%)
              </span>
              <span className="font-bold text-[#F5F1E6]">{metrics.warningCount} Categories</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Exceeded (≥100%)
              </span>
              <span className="font-bold text-red-400">{metrics.exceededCount} Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Compliance Matrix / Grid */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#F5F1E6]">Monitored Category Budgets</h3>
            <p className="text-xs text-[#A9A59A]">
              Showing {filteredBudgets.length} of {budgets.length} categories monitored
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0B0B0A] p-1 rounded-xl border border-[#2B2A24] text-xs">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'OPTIMAL', label: 'Optimal' },
              { id: 'WARNING', label: 'Caution' },
              { id: 'EXCEEDED', label: 'Breached' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#D4AF37] text-[#0B0B0A] shadow'
                    : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input for category/client */}
        <div className="pt-1">
          <input
            type="text"
            placeholder="Search category name or client..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full sm:w-80 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3.5 py-2 text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#A9A59A] animate-pulse">
            Loading client budget compliance data...
          </div>
        ) : budgets.length === 0 ? (
          <div className="py-16 text-center">
            <PieIcon className="w-10 h-10 text-[#2B2A24] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#F5F1E6]">No category budgets set for this period</p>
            <p className="text-[11px] text-[#A9A59A] mt-1">
              Select another month or client filter to review compliance history.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBudgets.map(b => {
              const isExceeded = b.status === 'EXCEEDED' || parseFloat(b.spent_amount) > parseFloat(b.monthly_limit)
              const isWarning = !isExceeded && (b.status === 'WARNING' || b.usage_percentage >= 70)
              const pct = Math.min(100, b.usage_percentage || Math.round((b.spent_amount / b.monthly_limit) * 100))

              return (
                <div
                  key={b.id}
                  className={`bg-[#0B0B0A] border rounded-2xl p-5 relative overflow-hidden transition-all shadow-md ${
                    isExceeded
                      ? 'border-red-500/50 bg-red-500/[0.04]'
                      : isWarning
                      ? 'border-amber-500/50 bg-amber-500/[0.04]'
                      : 'border-[#2B2A24] hover:border-[#D4AF37]/40'
                  }`}
                >
                  {/* Top: Category & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#F5F1E6]">{b.category}</h4>
                      {b.user_full_name && (
                        <p className="text-[11px] text-[#A9A59A] mt-0.5">{b.user_full_name}</p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        isExceeded
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {isExceeded ? 'EXCEEDED' : isWarning ? 'CAUTION' : 'OPTIMAL'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#A9A59A]">Spent: {formatCurrency(b.spent_amount)}</span>
                      <span className="text-[#F5F1E6] font-['Space_Grotesk']">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#171714] rounded-full overflow-hidden border border-[#2B2A24]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Details & Action */}
                  <div className="pt-3 border-t border-[#2B2A24] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-[#A9A59A]">Limit: {formatCurrency(b.monthly_limit)}</span>
                      <p className={`font-bold text-xs mt-0.5 ${isExceeded ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isExceeded
                          ? `Over: ${formatCurrency(b.overspending_amount || (b.spent_amount - b.monthly_limit))}`
                          : `Headroom: ${formatCurrency(b.remaining_amount)}`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenCoachModal(b)}
                      className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0B0A] border border-[#D4AF37]/30 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" /> Coach Client
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Advisor Budget Coaching Dispatch Modal */}
      {isAdviceModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#D4AF37]/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-[#F5F1E6]">
                  Budget Coaching Guidance for {adviceClientName}
                </h3>
              </div>
              <button
                onClick={() => setIsAdviceModalOpen(false)}
                className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {targetedBudget && (
              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#A9A59A]">Target Category:</span>
                  <p className="font-semibold text-[#F5F1E6]">{targetedBudget.category}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#A9A59A]">Limit vs Spent:</span>
                  <p className="font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    {formatCurrency(targetedBudget.spent_amount)} / {formatCurrency(targetedBudget.monthly_limit)}
                  </p>
                </div>
              </div>
            )}

            {adviceSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {adviceSuccess}
              </div>
            )}

            {adviceError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {adviceError}
              </div>
            )}

            <form onSubmit={handleSendAdvice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#A9A59A] mb-1">Guidance Category</label>
                <select
                  value={adviceCategory}
                  onChange={(e) => setAdviceCategory(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Better Budgeting">Better Budgeting Guidance</option>
                  <option value="Excessive Spending Alert">Excessive Spending Alert</option>
                  <option value="Savings Targets">Savings Cushion Strategy</option>
                  <option value="Investment Guidance">Investment Reallocation Strategy</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A9A59A] mb-1">Priority Level</label>
                <select
                  value={advicePriority}
                  onChange={(e) => setAdvicePriority(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Urgent Action Required">Urgent Action Required</option>
                  <option value="Strategic Advice">Strategic Advice</option>
                  <option value="Routine Check-in">Routine Optimization</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#A9A59A] mb-1">Recommendation Subject</label>
                <input
                  type="text"
                  required
                  value={adviceTitle}
                  onChange={(e) => setAdviceTitle(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A9A59A] mb-1">Coaching Message &amp; Strategy</label>
                <textarea
                  rows={4}
                  required
                  value={adviceMessage}
                  onChange={(e) => setAdviceMessage(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdviceModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#2B2A24] font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAdvice}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {sendingAdvice ? 'Dispatching...' : 'Dispatch Coaching Advice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

