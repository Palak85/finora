import React, { useState, useEffect } from 'react'
import { Target, Plus, CheckCircle2, Trash2, X, Pencil, Coins, AlertCircle, Wallet } from 'lucide-react'
import { goalService, accountService } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export const Goals = () => {
  const { isAdmin } = useAuth()
  const [goals, setGoals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  
  // Create / Edit Goal State
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [fundingAccountId, setFundingAccountId] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [contribution, setContribution] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Add Money / Contribute Modal State
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)
  const [contributingGoal, setContributingGoal] = useState(null)
  const [contributeAmount, setContributeAmount] = useState('')
  const [contributeAccountId, setContributeAccountId] = useState('')
  const [contributeLoading, setContributeLoading] = useState(false)
  const [contributeError, setContributeError] = useState('')
  const [contributeSuccess, setContributeSuccess] = useState('')

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const [goalRes, accRes] = await Promise.all([
        goalService.getGoals(),
        accountService.getAccounts(),
      ])
      if (goalRes.data?.success) setGoals(goalRes.data.data)
      if (accRes.data?.success && accRes.data.data.length > 0) {
        setAccounts(accRes.data.data)
        if (!contributeAccountId) setContributeAccountId(accRes.data.data[0].id)
        if (!fundingAccountId) setFundingAccountId(accRes.data.data[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleOpenCreate = () => {
    setEditingGoal(null)
    setName('')
    setTargetAmount('')
    setCurrentAmount('')
    setTargetDate('')
    setContribution('')
    setErrorMsg('')
    if (accounts.length > 0) setFundingAccountId(accounts[0].id)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal)
    setName(goal.name || '')
    setTargetAmount(goal.target_amount || '')
    setCurrentAmount(goal.current_amount || '')
    setTargetDate(goal.target_date || '')
    setContribution(goal.monthly_contribution || '')
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleOpenContribute = (goal) => {
    setContributingGoal(goal)
    setContributeAmount('')
    setContributeError('')
    setContributeSuccess('')
    if (accounts.length > 0 && !contributeAccountId) {
      setContributeAccountId(accounts[0].id)
    }
    setIsContributeModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const payload = {
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || 0),
        target_date: targetDate,
        monthly_contribution: parseFloat(contribution || 0),
      }
      if (parseFloat(currentAmount) > 0 && fundingAccountId) {
        payload.account = fundingAccountId
      }
      if (editingGoal) {
        const res = await goalService.updateGoal(editingGoal.id, payload)
        if (res.data?.success) {
          fetchGoals()
          setIsModalOpen(false)
          setEditingGoal(null)
        }
      } else {
        const res = await goalService.createGoal(payload)
        if (res.data?.success) {
          fetchGoals()
          setIsModalOpen(false)
          setName('')
          setTargetAmount('')
          setCurrentAmount('')
          setTargetDate('')
          setContribution('')
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Operation failed.')
    }
  }

  const handleContributeSubmit = async (e) => {
    e.preventDefault()
    setContributeLoading(true)
    setContributeError('')
    setContributeSuccess('')

    const amt = parseFloat(contributeAmount)
    if (!amt || amt <= 0) {
      setContributeError('Please enter a valid contribution amount.')
      setContributeLoading(false)
      return
    }

    const selectedAcc = accounts.find(a => String(a.id) === String(contributeAccountId))
    if (!selectedAcc) {
      setContributeError('Please select a valid bank account to deduct money from.')
      setContributeLoading(false)
      return
    }

    if (parseFloat(selectedAcc.balance) < amt) {
      setContributeError(`Insufficient balance in ${selectedAcc.account_name}. Available: ${formatCurrency(selectedAcc.balance)}, Required: ${formatCurrency(amt)}`)
      setContributeLoading(false)
      return
    }

    try {
      const res = await goalService.contribute(contributingGoal.id, {
        account_id: contributeAccountId,
        amount: amt,
      })
      if (res.data?.success) {
        setContributeSuccess(`Successfully added ${formatCurrency(amt)} to ${contributingGoal.name} from ${selectedAcc.account_name}!`)
        fetchGoals()
        setTimeout(() => {
          setIsContributeModalOpen(false)
        }, 900)
      }
    } catch (err) {
      setContributeError(err.response?.data?.message || 'Failed to add money to goal.')
    } finally {
      setContributeLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await goalService.deleteGoal(id)
        fetchGoals()
      } catch (e) {}
    }
  }

  const selectedContributeAccount = accounts.find(a => String(a.id) === String(contributeAccountId))
  const remainingNeeded = contributingGoal
    ? Math.max(0, parseFloat(contributingGoal.target_amount || 0) - parseFloat(contributingGoal.current_amount || 0))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Financial Goals</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Set, track, and directly fund milestone savings targets</p>
        </div>
        {isAdmin ? (
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> View Only Mode (Admin)
          </span>
        ) : (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Goal Target
          </button>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#2B2A24] rounded-3xl p-8 bg-[#171714]/50">
          <Target className="w-12 h-12 text-[#A9A59A] opacity-40 mb-3" />
          <h3 className="text-base font-bold text-[#F5F1E6]">No Financial Goals Yet</h3>
          <p className="text-xs text-[#A9A59A] mt-1 max-w-sm">
            Create milestone savings targets such as Emergency Reserve, Vacation, or Real Estate.
          </p>
          {!isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" /> Create First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const isCompleted = parseFloat(g.current_amount || 0) >= parseFloat(g.target_amount || 0)
            return (
              <div key={g.id} className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#F5F1E6] truncate">{g.name}</h3>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Achieved
                        </span>
                      )}
                    </div>
                    {!isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 rounded-lg text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                          title="Edit Goal"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1.5 rounded-lg text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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

                  <div className="pt-2 border-t border-[#2B2A24] flex items-center justify-between text-xs text-[#A9A59A]">
                    <span>Target: <strong className="text-[#F5F1E6]">{formatCurrency(g.target_amount)}</strong></span>
                    <span>Target Date: {formatDate(g.target_date)}</span>
                  </div>
                </div>

                {/* Add Money Button - Only for non-admin */}
                {!isAdmin && (
                  <button
                    onClick={() => handleOpenContribute(g)}
                    className="w-full mt-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 to-[#9A7B1C]/15 hover:from-[#D4AF37]/25 hover:to-[#9A7B1C]/25 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Money to Goal
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Money / Contribute Modal */}
      {isContributeModalOpen && contributingGoal && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#D4AF37]" /> Add Money to Goal
                </h3>
                <p className="text-[11px] text-[#A9A59A] mt-0.5">
                  Target: {contributingGoal.name}
                </p>
              </div>
              <button
                onClick={() => setIsContributeModalOpen(false)}
                className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contributeSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {contributeSuccess}
              </div>
            )}

            {contributeError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {contributeError}
              </div>
            )}

            {/* Goal Progress Banner */}
            <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A9A59A]">Target Amount:</span>
                <span className="font-bold text-[#F5F1E6]">{formatCurrency(contributingGoal.target_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A9A59A]">Current Saved:</span>
                <span className="font-bold text-[#D4AF37]">{formatCurrency(contributingGoal.current_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-[#2B2A24] pt-1">
                <span className="text-[#A9A59A]">Remaining Needed:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(remainingNeeded)}</span>
              </div>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#A9A59A]">Deduct from Bank Account</label>
                  {selectedContributeAccount && (
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Available: {formatCurrency(selectedContributeAccount.balance)}
                    </span>
                  )}
                </div>
                <select
                  required
                  value={contributeAccountId}
                  onChange={(e) => setContributeAccountId(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.masked_account_number}) — Bal: ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Amount to Add (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-base font-bold text-[#D4AF37] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Quick Chip Shortcuts */}
              <div className="flex flex-wrap gap-1.5">
                {[1000, 5000, 10000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setContributeAmount(String(quickAmt))}
                    className="px-2.5 py-1 rounded-lg bg-[#0B0B0A] border border-[#2B2A24] text-[11px] text-[#A9A59A] hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all font-medium"
                  >
                    +₹{quickAmt.toLocaleString('en-IN')}
                  </button>
                ))}
                {remainingNeeded > 0 && (
                  <button
                    type="button"
                    onClick={() => setContributeAmount(String(remainingNeeded))}
                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/20 transition-all"
                  >
                    Fill Remaining ({formatCurrency(remainingNeeded)})
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2B2A24] text-xs font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contributeLoading || accounts.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {contributeLoading ? 'Transferring...' : 'Confirm & Deduct Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6]">
                {editingGoal ? 'Edit Financial Goal' : 'New Financial Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    min="1"
                    placeholder="200000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Initial Saved (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* If Initial Saved > 0, choose which account to fund from */}
              {parseFloat(currentAmount) > 0 && accounts.length > 0 && !editingGoal && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A9A59A]">Deduct Initial Funding from Bank</label>
                    {accounts.find(a => String(a.id) === String(fundingAccountId)) && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Bal: {formatCurrency(accounts.find(a => String(a.id) === String(fundingAccountId)).balance)}
                      </span>
                    )}
                  </div>
                  <select
                    value={fundingAccountId}
                    onChange={(e) => setFundingAccountId(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} ({acc.masked_account_number}) — Bal: ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Monthly Contrib (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5000.00"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
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
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
