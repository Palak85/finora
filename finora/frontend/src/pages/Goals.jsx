import React, { useState, useEffect } from 'react'
import { Target, Plus, CheckCircle2, Trash2, X } from 'lucide-react'
import { goalService } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'

export const Goals = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [contribution, setContribution] = useState('')

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await goalService.getGoals()
      if (res.data?.success) setGoals(res.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const res = await goalService.createGoal({
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || 0),
        target_date: targetDate,
        monthly_contribution: parseFloat(contribution || 0),
      })
      if (res.data?.success) {
        fetchGoals()
        setIsModalOpen(false)
        setName('')
        setTargetAmount('')
      }
    } catch (e) {}
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await goalService.deleteGoal(id)
        fetchGoals()
      } catch (e) {}
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Financial Goals</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Set and track milestone targets for wealth building</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Goal Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((g) => (
          <div key={g.id} className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F1E6]">{g.name}</h3>
              <button onClick={() => handleDelete(g.id)} className="p-1 text-[#A9A59A] hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#A9A59A]">Saved: {formatCurrency(g.current_amount)}</span>
                <span className="text-[#D4AF37] font-bold">{g.progress_percentage}%</span>
              </div>
              <div className="w-full h-3 bg-[#0B0B0A] rounded-full overflow-hidden border border-[#2B2A24]">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, g.progress_percentage)}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#2B2A24] flex items-center justify-between text-xs text-[#A9A59A]">
              <span>Target: <strong className="text-[#F5F1E6]">{formatCurrency(g.target_amount)}</strong></span>
              <span>Target Date: {formatDate(g.target_date)}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6]">New Financial Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Shield Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    placeholder="200000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Current (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
