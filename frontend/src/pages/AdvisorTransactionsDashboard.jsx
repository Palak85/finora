import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowRightLeft,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  AlertTriangle,
  ShieldCheck,
  Users,
  Building,
  CreditCard,
  Wallet,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Info
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
import { advisorService, transactionService, reportService, notificationService } from '../services/api'
import { formatCurrency, formatDate, maskAccountNumber } from '../utils/formatters'

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

const CATEGORY_COLORS = [
  '#D4AF37', '#60A5FA', '#34D399', '#F87171', '#A78BFA',
  '#FBBF24', '#EC4899', '#38BDF8', '#4ADE80', '#F43F5E'
]

export const AdvisorTransactionsDashboard = () => {
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingClients, setLoadingClients] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [timeRange, setTimeRange] = useState('ALL') // ALL | 30D | 90D
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Advice Modal State
  const [isAdviceModalOpen, setIsAdviceModalOpen] = useState(false)
  const [targetedTxn, setTargetedTxn] = useState(null)
  const [adviceClientName, setAdviceClientName] = useState('')
  const [adviceClientId, setAdviceClientId] = useState('')
  const [adviceTitle, setAdviceTitle] = useState('')
  const [adviceMessage, setAdviceMessage] = useState('')
  const [adviceCategory, setAdviceCategory] = useState('Excessive Spending Alert')
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

  // 2. Fetch Transactions (filtered by client if selected)
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedClientId) {
        params.user_id = selectedClientId
      }
      const res = await transactionService.getTransactions(params)
      if (res.data?.results) {
        setTransactions(res.data.results)
      } else if (res.data?.data) {
        setTransactions(res.data.data)
      } else if (Array.isArray(res.data)) {
        setTransactions(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    setCurrentPage(1)
  }, [selectedClientId])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, categoryFilter, timeRange])

  // Filtered transactions based on UI controls
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (typeFilter !== 'ALL' && t.transaction_type !== typeFilter) return false

      // Category filter
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const desc = (t.description || '').toLowerCase()
        const ref = (t.reference_id || '').toLowerCase()
        const cat = (t.category || '').toLowerCase()
        const user = (t.user_full_name || '').toLowerCase()
        if (!desc.includes(q) && !ref.includes(q) && !cat.includes(q) && !user.includes(q)) {
          return false
        }
      }

      // Time range filter
      if (timeRange !== 'ALL' && t.transaction_date) {
        const txnDate = new Date(t.transaction_date)
        const now = new Date()
        const diffDays = (now - txnDate) / (1000 * 60 * 60 * 24)
        if (timeRange === '30D' && diffDays > 30) return false
        if (timeRange === '90D' && diffDays > 90) return false
      }

      return true
    })
  }, [transactions, typeFilter, categoryFilter, searchTerm, timeRange])

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, currentPage, pageSize])

  // KPI Calculations
  const metrics = useMemo(() => {
    let totalInflow = 0
    let totalOutflow = 0
    let highValueCount = 0

    transactions.forEach(t => {
      const amt = parseFloat(t.amount) || 0
      if (t.transaction_type === 'INCOME') {
        totalInflow += amt
      } else if (t.transaction_type === 'EXPENSE') {
        totalOutflow += amt
        if (amt >= 20000) {
          highValueCount += 1
        }
      }
    })

    const netFlow = totalInflow - totalOutflow
    const totalCount = transactions.length
    const avgTicket = totalCount > 0 ? (totalInflow + totalOutflow) / totalCount : 0

    return {
      totalInflow,
      totalOutflow,
      netFlow,
      highValueCount,
      totalCount,
      avgTicket
    }
  }, [transactions])

  // Category Breakdown for Recharts Donut
  const categoryChartData = useMemo(() => {
    const catMap = {}
    transactions
      .filter(t => t.transaction_type === 'EXPENSE')
      .forEach(t => {
        const cat = t.category || 'General'
        const amt = parseFloat(t.amount) || 0
        catMap[cat] = (catMap[cat] || 0) + amt
      })

    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [transactions])

  // Cash Velocity by Month/Period
  const cashVelocityData = useMemo(() => {
    const periodMap = {}
    transactions.forEach(t => {
      if (!t.transaction_date) return
      const date = new Date(t.transaction_date)
      const key = date.toLocaleDateString('default', { month: 'short', year: '2-digit' })
      if (!periodMap[key]) {
        periodMap[key] = { period: key, Inflow: 0, Outflow: 0 }
      }
      const amt = parseFloat(t.amount) || 0
      if (t.transaction_type === 'INCOME') periodMap[key].Inflow += amt
      if (t.transaction_type === 'EXPENSE') periodMap[key].Outflow += amt
    })
    return Object.values(periodMap).slice(-6)
  }, [transactions])

  // High-Value / Anomaly Transactions List for Advisor Alerting
  const highValueAnomalies = useMemo(() => {
    return transactions
      .filter(t => t.transaction_type === 'EXPENSE' && parseFloat(t.amount) >= 15000)
      .slice(0, 3)
  }, [transactions])

  // Open advice modal for a specific transaction
  const handleOpenAdviceForTxn = (txn) => {
    setTargetedTxn(txn)
    setAdviceClientId(txn.user)
    setAdviceClientName(txn.user_full_name || 'Client')
    setAdviceTitle(`Spending Notice: ₹${parseFloat(txn.amount).toLocaleString()} on ${txn.category}`)
    setAdviceMessage(
      `We noticed an outflow of ₹${parseFloat(txn.amount).toLocaleString()} for "${txn.description}" on ${formatDate(txn.transaction_date)}. Let's review whether this matches your quarterly cash flow milestones or if reallocating from short-term buffers is recommended.`
    )
    setAdviceCategory('Excessive Spending Alert')
    setAdvicePriority(parseFloat(txn.amount) >= 30000 ? 'Urgent Action Required' : 'Strategic Advice')
    setAdviceSuccess('')
    setAdviceError('')
    setIsAdviceModalOpen(true)
  }

  // Submit advice
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
        setAdviceSuccess(`Strategic recommendation dispatched to ${adviceClientName}!`)
        setTimeout(() => {
          setIsAdviceModalOpen(false)
          setTargetedTxn(null)
        }, 1200)
      }
    } catch (err) {
      setAdviceError(err.response?.data?.message || 'Failed to dispatch recommendation.')
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
            <span className="text-xs text-[#A9A59A]">Fiduciary Audit Console</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1 flex items-center gap-2.5">
            <ArrowRightLeft className="w-6 h-6 text-[#D4AF37]" /> Client Transactions Tracker
          </h1>
          <p className="text-xs text-[#A9A59A] mt-1">
            Real-time audit surveillance of customer cash flows, merchant transactions & high-velocity spending signals
          </p>
        </div>

        {/* Client Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
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

          <a
            href={reportService.exportCSVUrl('expense')}
            download
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#171714] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 font-semibold text-xs rounded-xl transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Fiduciary Limited Access Governance Banner */}
      <div className="bg-[#171714] border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F5F1E6]">Fiduciary Read-Only Audit Mode Enforced</h4>
            <p className="text-[11px] text-[#A9A59A] mt-0.5">
              Financial advisors hold audit and advisory permissions. In compliance with RBAC protocols, debit authorization and fund transfer execution are strictly prohibited.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
          RBAC ACTIVE: READ-ONLY
        </span>
      </div>

      {/* 5 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inflow */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Total Inflows</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {formatCurrency(metrics.totalInflow)}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">Deposits & Credits</p>
        </div>

        {/* Total Outflow */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Total Outflows</span>
            <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {formatCurrency(metrics.totalOutflow)}
          </h3>
          <p className="text-[11px] text-red-400 mt-1 font-medium">Expenses & Debits</p>
        </div>

        {/* Net Cash Position */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Net Flow Position</span>
            <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className={`text-lg font-bold font-['Space_Grotesk'] ${metrics.netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {metrics.netFlow >= 0 ? '+' : ''}{formatCurrency(metrics.netFlow)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Inflow - Outflow Surplus</p>
        </div>

        {/* High-Value / Anomaly Count */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-amber-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>High-Value Outflows</span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-amber-400 font-['Space_Grotesk']">
            {metrics.highValueCount}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">&ge; ₹20,000 threshold</p>
        </div>

        {/* Monitored Volume */}
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Ledger Records</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {metrics.totalCount}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Avg Ticket: {formatCurrency(metrics.avgTicket)}</p>
        </div>
      </div>

      {/* High-Value Anomaly Alert Banner (if any exist) */}
      {highValueAnomalies.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Surveillance Alert: High-Value Expenses Detected
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {highValueAnomalies.map(txn => (
              <div
                key={txn.id}
                className="bg-[#171714] border border-[#2B2A24] rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-[#F5F1E6]">{txn.description}</p>
                  <p className="text-[10px] text-[#A9A59A]">
                    {txn.user_full_name || 'Client'} • {txn.category} • {formatDate(txn.transaction_date)}
                  </p>
                  <p className="text-xs font-extrabold text-red-400 font-['Space_Grotesk'] mt-1">
                    -{formatCurrency(txn.amount)}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdviceForTxn(txn)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0A] text-[11px] font-bold transition-all shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Advise
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts: Cash Flow Velocity & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cash Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#F5F1E6]">Client Cash Velocity (Inflow vs. Outflow)</h3>
              <p className="text-xs text-[#A9A59A]">Monthly liquidity trend comparison across transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Inflows
              </span>
              <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Outflows
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {cashVelocityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A9A59A]">
                No transaction velocity history available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashVelocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="period" stroke="#A9A59A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#A9A59A" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Category Outflow Distribution (1 col) */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F1E6]">Outflow Distribution</h3>
            <p className="text-xs text-[#A9A59A] mb-3">Top monitored expense categories</p>
          </div>

          <div className="h-48 w-full">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#A9A59A]">
                No category expense data recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#2B2A24]">
            {categoryChartData.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[#A9A59A]">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: CATEGORY_COLORS[idx] }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Surveillance Ledger Section: Search & Filters */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#F5F1E6]">Itemized Surveillance Ledger</h3>
            <p className="text-xs text-[#A9A59A]">
              Showing {filteredTransactions.length} of {transactions.length} recorded audit transactions
            </p>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-[#0B0B0A] p-1 rounded-xl border border-[#2B2A24] text-xs">
            {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  typeFilter === type
                    ? 'bg-[#D4AF37] text-[#0B0B0A] shadow'
                    : 'text-[#A9A59A] hover:text-[#F5F1E6]'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, merchant, description or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-xs text-[#F5F1E6] focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Transport">Transport & Fuel</option>
            <option value="Shopping">Shopping</option>
            <option value="Utilities">Utilities & Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Investment">Investment</option>
            <option value="Salary">Salary / Income</option>
          </select>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-xs text-[#F5F1E6] focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="ALL">All Recorded Dates</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>
        </div>

        {/* Transactions Audit Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#A9A59A] animate-pulse">
              Loading client transaction records...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <ArrowRightLeft className="w-10 h-10 text-[#2B2A24] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#F5F1E6]">No matching transactions found</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                Try clearing search terms or selecting a different client filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B2A24] text-[11px] uppercase tracking-wider text-[#A9A59A]">
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Date &amp; Ref</th>
                  <th className="py-3 px-3">Description &amp; Category</th>
                  <th className="py-3 px-3">Funding Account</th>
                  <th className="py-3 px-3">Rail</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Fiduciary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A24]/60 text-xs">
                {paginatedTransactions.map(txn => {
                  const isExp = txn.transaction_type === 'EXPENSE'
                  const isInc = txn.transaction_type === 'INCOME'
                  const isHighVal = isExp && parseFloat(txn.amount) >= 20000

                  return (
                    <tr
                      key={txn.id}
                      className={`hover:bg-[#21201B]/40 transition-colors ${
                        isHighVal ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* Client Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] flex items-center justify-center font-bold text-xs shrink-0">
                            {(txn.user_full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#F5F1E6] truncate max-w-[120px]">
                              {txn.user_full_name || 'Client'}
                            </p>
                            <p className="text-[10px] text-[#A9A59A] truncate max-w-[120px]">
                              {txn.user_email || 'client@finora.in'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Ref */}
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-[#F5F1E6]">
                          {formatDate(txn.transaction_date)}
                        </p>
                        <p className="text-[10px] font-mono text-[#A9A59A]">
                          {txn.reference_id || `TXN-${txn.id}`}
                        </p>
                      </td>

                      {/* Description & Category */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isInc ? 'bg-emerald-500/10 text-emerald-400' : isExp ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {isInc ? <ArrowDownRight className="w-3.5 h-3.5" /> : isExp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-[#F5F1E6] truncate max-w-[160px]">
                              {txn.description}
                            </p>
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#0B0B0A] text-[#A9A59A] border border-[#2B2A24] mt-0.5">
                              {txn.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Funding Account */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-xs text-[#F5F1E6]">
                          <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{txn.account_detail?.account_name || 'Bank Account'}</span>
                        </div>
                        {txn.account_detail?.account_number && (
                          <p className="text-[10px] font-mono text-[#A9A59A]">
                            {maskAccountNumber(txn.account_detail.account_number)}
                          </p>
                        )}
                      </td>

                      {/* Rail / Payment Method */}
                      <td className="py-3.5 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0B0B0A] border border-[#2B2A24] text-[#A9A59A]">
                          {txn.payment_method || 'UPI'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right">
                        <p className={`font-bold font-['Space_Grotesk'] text-sm ${
                          isInc ? 'text-emerald-400' : isExp ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {isInc ? '+' : isExp ? '-' : ''}{formatCurrency(txn.amount)}
                        </p>
                        {isHighVal && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            High Value
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenAdviceForTxn(txn)}
                          className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0B0A] border border-[#D4AF37]/30 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                          title="Send Advisor Coaching Notification"
                        >
                          <Send className="w-3 h-3" /> Advise
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#2B2A24] text-xs">
            <span className="text-[#A9A59A]">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-[#2B2A24] text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-[#F5F1E6] px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl border border-[#2B2A24] text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advisor Coaching Dispatch Modal */}
      {isAdviceModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#D4AF37]/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-[#F5F1E6]">
                  Dispatch Strategic Advice to {adviceClientName}
                </h3>
              </div>
              <button
                onClick={() => setIsAdviceModalOpen(false)}
                className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {targetedTxn && (
              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#A9A59A]">Related Transaction:</span>
                  <p className="font-semibold text-[#F5F1E6]">{targetedTxn.description} ({targetedTxn.category})</p>
                </div>
                <span className="font-bold text-red-400 font-['Space_Grotesk']">
                  -{formatCurrency(targetedTxn.amount)}
                </span>
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
                <label className="block font-semibold text-[#A9A59A] mb-1">Advice Category</label>
                <select
                  value={adviceCategory}
                  onChange={(e) => setAdviceCategory(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Excessive Spending Alert">Excessive Spending Alert</option>
                  <option value="Better Budgeting">Better Budgeting Guidance</option>
                  <option value="Savings Targets">Savings Cushion Recommendation</option>
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
                <label className="block font-semibold text-[#A9A59A] mb-1">Recommendation Title</label>
                <input
                  type="text"
                  required
                  value={adviceTitle}
                  onChange={(e) => setAdviceTitle(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#A9A59A] mb-1">Actionable Fiduciary Guidance</label>
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
                  {sendingAdvice ? 'Dispatching...' : 'Dispatch to Client Signal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

