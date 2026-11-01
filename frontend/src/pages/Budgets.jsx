import React, { useState, useEffect } from 'react'
import { PieChart, Plus, AlertTriangle, ShieldCheck, AlertCircle, Trash2, X, CheckCircle2, Users, Pencil } from 'lucide-react'
import { budgetService, authService } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export const Budgets = () => {
  const { isAdmin } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [category, setCategory] = useState('Food')
  const [limit, setLimit] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Admin: list of all users for filtering
  const [allUsers, setAllUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const params = {}
      if (isAdmin && selectedUserId) params.user_id = selectedUserId
      const res = await budgetService.getBudgets(params)
      if (res.data?.success) {
        setBudgets(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await authService.getUsers()
      if (res.data?.success) setAllUsers(res.data.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

  useEffect(() => {
    fetchBudgets()
  }, [selectedUserId])

  const handleOpenCreate = () => {
    setEditingBudget(null)
    setCategory('Food')
    setLimit('')
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget)
    setCategory(budget.category || 'Food')
    setLimit(budget.monthly_limit || '')
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  const handleSubmitBudget = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    try {
      if (editingBudget) {
        const res = await budgetService.updateBudget(editingBudget.id, {
          category,
          monthly_limit: parseFloat(limit),
        })
        if (res.data?.success) {
          setSuccessMsg('Budget updated!')
          fetchBudgets()
          setTimeout(() => {
            setIsModalOpen(false)
            setEditingBudget(null)
            setLimit('')
          }, 800)
        }
      } else {
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
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors?.monthly_limit?.[0] || 'Failed to save budget.')
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
          <p className="text-xs text-[#A9A59A] mt-1">Real-time category spending limits &amp; threshold alerts</p>
        </div>
        {!isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Category Budget
          </button>
        )}
      </div>

      {/* Admin: User Filter */}
      {isAdmin && (
        <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
            <Users className="w-4 h-4" />
            <span>Viewing budgets for:</span>
          </div>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] font-medium rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none min-w-[220px]"
          >
            <option value="">All Users ({budgets.length} budgets)</option>
            {allUsers.filter((u) => u.role !== 'ADMINISTRATOR').map((u) => (
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

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PieChart className="w-12 h-12 text-[#2B2A24] mb-4" />
          <p className="text-sm font-semibold text-[#F5F1E6]">No budgets found</p>
          <p className="text-xs text-[#A9A59A] mt-1">
            {isAdmin
              ? selectedUserId
                ? 'This user has no budgets set for the current month.'
                : 'No budgets exist across any users yet.'
              : 'Create your first category budget to start tracking spending.'}
          </p>
          {!isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Category Budget
            </button>
          )}
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
                  <div>
                    <span className="text-sm font-bold text-[#F5F1E6]">{b.category}</span>
                    {isAdmin && b.user_full_name && (
                      <p className="text-[10px] text-[#A9A59A] mt-0.5">{b.user_full_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                      isExceeded
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                    }`}>
                      {b.status}
                    </span>
                    {!isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                          title="Edit Budget"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
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

      {/* Create / Edit Budget Modal — only for non-admin users */}
      {isModalOpen && !isAdmin && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6]">
                {editingBudget ? 'Edit Category Budget' : 'Set Monthly Budget'}
              </h3>
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

            <form onSubmit={handleSubmitBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Food">Food &amp; Dining</option>
                  <option value="Transport">Transport &amp; Fuel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities &amp; Bills</option>
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
                  {editingBudget ? 'Save Changes' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
