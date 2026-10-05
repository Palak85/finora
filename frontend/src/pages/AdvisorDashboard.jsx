import React, { useState, useEffect } from 'react'
import { UserCheck, Users, Eye, Sparkles, CheckCircle2 } from 'lucide-react'
import { authService, dashboardService } from '../services/api'
import { formatCurrency } from '../utils/formatters'

export const AdvisorDashboard = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [clientData, setClientData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    authService.getUsers()
      .then(res => {
        if (res.data?.success) {
          const customers = res.data.data.filter(u => u.role === 'CUSTOMER')
          setUsers(customers)
          if (customers.length > 0) handleSelectClient(customers[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelectClient = async (user) => {
    setSelectedUser(user)
    setSubmitted(false)
    try {
      const res = await dashboardService.getDashboardData({ user_id: user.id })
      if (res.data?.success) setClientData(res.data.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddRecommendation = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setRecommendation('')
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#2B2A24] pb-5">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
          Financial Advisor Console
        </span>
        <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">Client Wealth Portfolio Review</h1>
        <p className="text-xs text-[#A9A59A]">Review client analytics, budget compliance & submit recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Directory List */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-3">
          <h3 className="text-xs font-bold text-[#A9A59A] uppercase tracking-wider mb-3">Assigned Clients</h3>
          {users.map((u) => (
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

        {/* Client Analytics & Recommendation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {clientData && (
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#2B2A24]">
                <div>
                  <h2 className="text-lg font-bold text-[#F5F1E6]">{selectedUser?.full_name}'s Financial Audit</h2>
                  <p className="text-xs text-[#A9A59A]">{selectedUser?.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#A9A59A]">Health Score</span>
                  <p className="text-xl font-extrabold text-[#D4AF37]">{clientData.financial_health_score}/100</p>
                </div>
              </div>

              {/* Client Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                  <span className="text-[11px] text-[#A9A59A]">Liquid Balance</span>
                  <p className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">{formatCurrency(clientData.total_balance)}</p>
                </div>
                <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                  <span className="text-[11px] text-[#A9A59A]">Monthly Income</span>
                  <p className="text-sm font-bold text-emerald-400 font-['Space_Grotesk'] mt-1">{formatCurrency(clientData.monthly_income)}</p>
                </div>
                <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                  <span className="text-[11px] text-[#A9A59A]">Monthly Expenses</span>
                  <p className="text-sm font-bold text-red-400 font-['Space_Grotesk'] mt-1">{formatCurrency(clientData.monthly_expenses)}</p>
                </div>
              </div>

              {/* Submit Advisor Recommendation */}
              <form onSubmit={handleAddRecommendation} className="p-5 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Issue Financial Recommendation
                </h4>

                {submitted && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Recommendation published to client dashboard!
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
                  className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  Publish Recommendation
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
