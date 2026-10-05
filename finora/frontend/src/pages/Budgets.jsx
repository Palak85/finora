import React, { useState, useEffect } from 'react'
import { PieChart, Plus, AlertTriangle, ShieldCheck, AlertCircle, Trash2, X, CheckCircle2 } from 'lucide-react'
import { budgetService } from '../services/api'
import { formatCurrency } from '../utils/formatters'

export const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [category, setCategory] = useState('Food')
  const [limit, setLimit] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const res = await budgetService.getBudgets()
      if (res.data?.success) {
        setBudgets(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleCreateBudget = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await budgetService.createBudget({
        category,
        monthly_limit: parseFloat(limit),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      })
      if (res.data?.success) {
        setSuccessMsg('Budget created!')
        fetchBudgets()
        setTimeout(() => {
          setIsModalOpen(false)
          setLimit('')
        }, 800)
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create budget.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget?')) {
      try {
        await budgetService.deleteBudget(id)
        fetchBudgets()
      } catch (e) {}
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Monthly Budget Allocations</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Real-time category spending limits & threshold alerts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Category Budget
        </button>
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isExceeded = b.status === 'EXCEEDED'
            const isWarning = b.status === 'WARNING'
            return (
              <div
                key={b.id}
                className={`bg-[#171714] border rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all ${
                  isExceeded
                    ? 'border-red-500/50 bg-red-500/5'
                    : isWarning
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-[#2B2A24] hover:border-[#D4AF37]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#F5F1E6]">{b.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                      isExceeded
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                    }`}>
                      {b.status}
                    </span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1 text-[#A9A59A] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#A9A59A]">Spent: {formatCurrency(b.spent_amount)}</span>
                    <span className="text-[#F5F1E6] font-['Space_Grotesk']">{b.usage_percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#0B0B0A] rounded-full overflow-hidden border border-[#2B2A24]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-[#D4AF37]'
                      }`}
                      style={{ width: `${Math.min(100, b.usage_percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2B2A24] flex items-center justify-between text-xs">
                  <span className="text-[#A9A59A]">Limit: {formatCurrency(b.monthly_limit)}</span>
                  <span className={isExceeded ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isExceeded ? `Over by ${formatCurrency(b.overspending_amount)}` : `Remaining: ${formatCurrency(b.remaining_amount)}`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6]">Set Monthly Budget</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Transport">Transport & Fuel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Monthly Limit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="15000.00"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2B2A24] text-xs font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
