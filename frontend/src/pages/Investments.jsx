import React, { useState, useEffect } from 'react'
import { TrendingUp, Plus, Award, Trash2, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { investmentService } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'

export const Investments = () => {
  const [investments, setInvestments] = useState([])
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchInvestments = async () => {
    setLoading(true)
    try {
      const [invRes, portRes] = await Promise.all([
        investmentService.getInvestments(),
        investmentService.getPortfolio(),
      ])
      if (invRes.data?.success) setInvestments(invRes.data.data)
      if (portRes.data?.success) setPortfolio(portRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [])

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

  const GOLD_COLORS = ['#D4AF37', '#FFF0B3', '#C9A227', '#9A7B1C', '#E5C158', '#3B82F6']

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Investment Portfolio</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Multi-asset tracking across Stocks, Mutual Funds, Gold & ETFs</p>
        </div>
      </div>

      {/* Portfolio Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5">
          <span className="text-xs text-[#A9A59A] uppercase font-semibold">Total Invested</span>
          <p className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">{formatCurrency(total_invested || 0)}</p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5">
          <span className="text-xs text-[#A9A59A] uppercase font-semibold">Current Value</span>
          <p className="text-xl font-bold text-[#D4AF37] font-['Space_Grotesk'] mt-2">{formatCurrency(current_value || 0)}</p>
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
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6">
          <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-4">Asset Allocation</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocation} dataKey="percentage" nameKey="asset_type" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t border-[#2B2A24]">
            {allocation.map((item, idx) => (
              <div key={item.asset_type} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#A9A59A]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD_COLORS[idx % GOLD_COLORS.length] }} />
                  {item.asset_type}
                </span>
                <span className="font-bold text-[#F5F1E6]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Asset Holdings List */}
        <div className="lg:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">Holdings Detail</h3>
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
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-1.5 text-[#A9A59A] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
