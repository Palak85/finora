import React, { useState, useEffect } from 'react'
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, TrendingUp, CheckCircle2 } from 'lucide-react'
import { accountService, transactionService, investmentService } from '../services/api'

export const QuickAddModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('EXPENSE') // EXPENSE, INCOME, TRANSFER, INVESTMENT
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form Fields
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('Stocks')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (isOpen) {
      accountService.getAccounts()
        .then(res => {
          if (res.data?.success && res.data.data.length > 0) {
            setAccounts(res.data.data)
            setAccountId(res.data.data[0].id)
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (activeTab === 'INVESTMENT') {
        const payload = {
          asset_name: assetName,
          asset_type: assetType,
          quantity: parseFloat(quantity),
          average_buy_price: parseFloat(amount),
          current_value: parseFloat(quantity) * parseFloat(amount),
          purchase_date: date,
        }
        const res = await investmentService.createInvestment(payload)
        if (res.data?.success) {
          setSuccessMsg('Investment added successfully!')
          setTimeout(() => {
            onClose()
            if (onSuccess) onSuccess()
          }, 800)
        }
      } else {
        const payload = {
          account: accountId,
          transaction_type: activeTab,
          amount: parseFloat(amount),
          category: activeTab === 'INCOME' ? 'Salary' : category,
          description: description || `${activeTab} transaction`,
          payment_method: paymentMethod,
          transaction_date: date,
        }
        const res = await transactionService.createTransaction(payload)
        if (res.data?.success) {
          setSuccessMsg(`${activeTab} recorded successfully!`)
          setTimeout(() => {
            onClose()
            if (onSuccess) onSuccess()
          }, 800)
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transaction submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2B2A24] flex items-center justify-between bg-[#0B0B0A]">
          <h2 className="text-base font-bold text-[#F5F1E6]">New Financial Action</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#171714] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 p-2 bg-[#0B0B0A]/50 border-b border-[#2B2A24] gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('EXPENSE'); setCategory('Food'); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'EXPENSE'
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" /> Expense
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('INCOME'); setCategory('Salary'); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'INCOME'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Income
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('TRANSFER'); setCategory('Other'); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'TRANSFER'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('INVESTMENT'); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'INVESTMENT'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Asset
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {activeTab === 'INVESTMENT' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Inc. / Nifty 50 ETF"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Asset Type</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Stocks">Stocks</option>
                    <option value="Mutual Funds">Mutual Funds</option>
                    <option value="Gold">Gold</option>
                    <option value="Fixed Deposits">Fixed Deposits</option>
                    <option value="Cryptocurrency">Cryptocurrency</option>
                    <option value="ETF">ETF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Buy Price per Unit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="2450.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-base font-bold text-[#D4AF37] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} ({acc.masked_account_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <option value="Salary">Salary</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery payment / Freelance payout"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110"
            >
              {loading ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
