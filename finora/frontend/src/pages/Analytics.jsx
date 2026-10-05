import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { analyticsService } from '../services/api'
import { formatCurrency } from '../utils/formatters'

export const Analytics = () => {
  const [range, setRange] = useState('6M')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await analyticsService.getAnalyticsData({ range })
      if (res.data?.success) setAnalytics(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [range])

  const ranges = ['1M', '3M', '6M', '1Y', 'ALL']

  return (
    <div className="space-y-6">
      {/* Header & Date Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Financial Analytics</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Deep-dive financial trends, net worth growth & savings performance</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#171714] border border-[#2B2A24] rounded-2xl">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                range === r
                  ? 'bg-[#D4AF37] text-[#0B0B0A] shadow-md'
                  : 'text-[#A9A59A] hover:text-[#F5F1E6]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Net Worth Growth Chart */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6">
        <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-4">Net Worth Trajectory</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.net_worth_trend || []}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#A9A59A" fontSize={11} tickLine={false} />
              <YAxis stroke="#A9A59A" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="net_worth" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#nwGrad)" name="Net Worth (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Income vs Expense Bar Chart */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6">
        <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mb-4">Monthly Income vs Expense</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.cash_flow_timeline || []}>
              <XAxis dataKey="month" stroke="#A9A59A" fontSize={11} tickLine={false} />
              <YAxis stroke="#A9A59A" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0B0B0A', borderColor: '#2B2A24', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="income" fill="#D4AF37" name="Income (₹)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#EF4444" name="Expense (₹)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
