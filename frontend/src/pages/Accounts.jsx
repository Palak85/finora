import React, { useState, useEffect } from 'react'
import { Wallet, Plus, CreditCard, Building2, ShieldCheck, Trash2, X, CheckCircle2 } from 'lucide-react'
import { accountService } from '../services/api'
import { formatCurrency } from '../utils/formatters'

export const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // New Account Form State
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('Savings')
  const [bankName, setBankName] = useState('Finora Bank')
  const [balance, setBalance] = useState('')
  const [currency, setCurrency] = useState('INR')

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const res = await accountService.getAccounts()
      if (res.data?.success) {
        setAccounts(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await accountService.createAccount({
        account_name: accountName,
        account_type: accountType,
        bank_name: bankName,
        balance: parseFloat(balance || 0),
        currency: currency,
      })

      if (res.data?.success) {
        setSuccessMsg('Account created successfully!')
        fetchAccounts()
        setTimeout(() => {
          setIsModalOpen(false)
          setAccountName('')
          setBalance('')
        }, 800)
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create account.')
    }
  }

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Are you sure you want to remove this bank account?')) {
      try {
        await accountService.deleteAccount(id)
        fetchAccounts()
      } catch (e) {}
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">My Bank Accounts</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Manage linked bank accounts, credit cards & wallets</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Link New Account
        </button>
      </div>

      {/* Account Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] flex items-center justify-center text-[#D4AF37]">
                  {acc.account_type === 'Credit Card' ? <CreditCard className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                    {acc.account_type}
                  </span>
                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-1.5 rounded-lg text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] truncate">{acc.account_name}</h3>
                <p className="text-xs text-[#A9A59A] mt-0.5">{acc.bank_name}</p>
                <p className="text-xs font-mono text-[#D4AF37] mt-3 tracking-widest">{acc.masked_account_number}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2B2A24] flex items-baseline justify-between">
                <span className="text-xs text-[#A9A59A]">Balance</span>
                <span className="text-xl font-extrabold text-[#F5F1E6] font-['Space_Grotesk']">
                  {formatCurrency(acc.balance, acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6]">Link Bank Account</h3>
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

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Salary">Salary</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Initial Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="50000.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
