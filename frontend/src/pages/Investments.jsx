import React, { useState, useEffect } from 'react'
import { TrendingUp, Plus, Award, Trash2, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { investmentService, authService } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

const AllocationTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-[#171714] border border-[#D4AF37] px-3.5 py-2 rounded-xl shadow-2xl text-xs z-50 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload?.fill || '#D4AF37' }} />
          <span className="font-bold text-[#F5F1E6]">{item.name}</span>
        </div>
        <p className="text-sm font-extrabold text-[#D4AF37] font-['Space_Grotesk']">
          {item.value}%
        </p>
        {item.payload?.value && (
          <p className="text-[10px] text-[#A9A59A] mt-0.5">
            Value: {formatCurrency(item.payload.value)}
          </p>
        )}
      </div>
    )
  }
  return null
}

export const Investments = () => {
  const { isAdmin } = useAuth()
  const [investments, setInvestments] = useState([])
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')

  const fetchInvestments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (isAdmin && selectedUserId) params.user_id = selectedUserId

      const [invRes, portRes] = await Promise.all([
        investmentService.getInvestments(params),
        investmentService.getPortfolio(params),
      ])
      if (invRes.data?.success) setInvestments(invRes.data.data)
      if (portRes.data?.success) setPortfolio(portRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await authService.getUsers()
      if (res.data?.success) {
        setAllUsers(res.data.data.filter((u) => u.role !== 'ADMINISTRATOR'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

  useEffect(() => {
    fetchInvestments()
  }, [selectedUserId])

  const handleDelete = async (id) => {
    if (window.confirm('Remove this asset from portfolio?')) {
      try {
        await investmentService.deleteInvestment(id)
        fetchInvestments()
      } catch (e) {}
    }
  }

  const { total_invested, current_value, total_profit_loss, return_percentage, allocation = [] } = portfolio || {}
  const isPositivePL = parseFloat(total_profit_loss || 0) >= 0

  const GOLD_COLORS = ['#D4AF37', '#FFF0B3', '#C9A227', '#9A7B1C', '#E5C158', '#3B82F6', '#10B981']

  const activeAllocations = allocation
    .filter((a) => Number(a.percentage) > 0 || Number(a.value) > 0)
    .map((a) => ({
      ...a,
      percentage: Number(a.percentage) || 0,
      value: Number(a.value) || 0,
    }))

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {isAdmin ? 'Investment Portfolio Overview' : 'Investment Portfolio'}
          </h1>
          <p className="text-xs text-[#A9A59A] mt-1">
            {isAdmin
              ? 'Multi-asset tracking & platform wealth holdings across all clients'
              : 'Multi-asset tracking across Stocks, Mutual Funds, Gold & ETFs'}
          </p>
        </div>
      </div>

      {/* Admin User Filter Dropdown */}
      {isAdmin && (
        <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
            <Users className="w-4 h-4" />
            <span>Viewing portfolio for:</span>
          </div>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] font-medium rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none min-w-[220px]"
          >
            <option value="">All Clients ({investments.length} holdings)</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} — {u.email}
              </option>
            ))}
          </select>
          {selectedUserId && (
            <button
              onClick={() => setSelectedUserId('')}
              className="text-xs text-[#A9A59A] hover:text-[#F5F1E6] underline"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Portfolio Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5">
          <span className="text-xs text-[#A9A59A] uppercase font-semibold">Total Invested</span>
          <p className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">
            {formatCurrency(total_invested || 0)}
          </p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5">
          <span className="text-xs text-[#A9A59A] uppercase font-semibold">Current Value</span>
          <p className="text-xl font-bold text-[#D4AF37] font-['Space_Grotesk'] mt-2">
            {formatCurrency(current_value || 0)}
          </p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5">
          <span className="text-xs text-[#A9A59A] uppercase font-semibold">Total Profit / Loss</span>
          <p className={`text-xl font-bold font-['Space_Grotesk'] mt-2 ${isPositivePL ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositivePL ? '+' : ''}{formatCurrency(total_profit_loss || 0)}
          </p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5">
          <span className="text-xs text-[#A9A59A] uppercase font-semibold">Overall Return</span>
          <p className={`text-xl font-bold font-['Space_Grotesk'] mt-2 ${isPositivePL ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositivePL ? '+' : ''}{return_percentage || 0}%
          </p>
        </div>
      </div>

      {/* Portfolio Breakdown & Asset List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Donut Chart */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-1">Asset Allocation</h3>
            <p className="text-xs text-[#A9A59A] mb-4">Capital distribution by investment class</p>

            <div className="h-52 w-full flex items-center justify-center">
              {activeAllocations.length === 0 ? (
                <p className="text-xs text-[#A9A59A]">No active holdings recorded.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeAllocations}
                      dataKey="percentage"
                      nameKey="asset_type"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {activeAllocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<AllocationTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-2.5 mt-4 pt-4 border-t border-[#2B2A24]">
            {activeAllocations.map((item, idx) => (
              <div key={item.asset_type} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#A9A59A]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD_COLORS[idx % GOLD_COLORS.length] }} />
                  {item.asset_type}
                </span>
                <span className="font-bold text-[#F5F1E6]">
                  {formatCurrency(item.value)} <span className="text-[#D4AF37] font-semibold">({item.percentage}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Asset Holdings List */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Holdings Detail</h3>
            <span className="text-xs text-[#A9A59A]">{investments.length} Active Positions</span>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl" />
              ))}
            </div>
          ) : investments.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#A9A59A]">
              No investment assets found for this selection.
            </div>
          ) : (
            <div className="divide-y divide-[#2B2A24]">
              {investments.map((inv) => {
                const invPL = parseFloat(inv.profit_loss || 0)
                const isProfit = invPL >= 0
                return (
                  <div key={inv.id} className="py-4 flex items-center justify-between hover:bg-[#21201B]/50 px-2 rounded-xl transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#F5F1E6]">{inv.asset_name}</p>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                          {inv.asset_type}
                        </span>
                        {isAdmin && inv.user_full_name && (
                          <span className="text-[10px] text-[#A9A59A] font-medium">
                            • {inv.user_full_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A9A59A] mt-1">
                        Qty: {inv.quantity} • Avg Buy: {formatCurrency(inv.average_buy_price)} • Acquired {formatDate(inv.purchase_date)}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk']">{formatCurrency(inv.current_value)}</p>
                        <p className={`text-xs font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(inv.profit_loss)} ({inv.profit_loss_percentage}%)
                        </p>
                      </div>
                      {!isAdmin && (
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-[#A9A59A] hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
