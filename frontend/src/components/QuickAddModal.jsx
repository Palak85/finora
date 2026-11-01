import React, { useState, useEffect } from 'react'
import { X, ArrowDownRight, ArrowUpRight, ArrowRightLeft, TrendingUp, CheckCircle2, AlertCircle, Wallet } from 'lucide-react'
import { accountService, transactionService, investmentService } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'

export const QuickAddModal = ({ isOpen, onClose, onSuccess }) => {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('EXPENSE') // EXPENSE, INCOME, TRANSFER, INVESTMENT
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form Fields
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('Stocks')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg('')
      setErrorMsg('')
      accountService.getAccounts()
        .then(res => {
          if (res.data?.success && res.data.data.length > 0) {
            const list = res.data.data
            setAccounts(list)
            setAccountId(list[0].id)
            if (list.length > 1) {
              setToAccountId(list[1].id)
            } else {
              setToAccountId('')
            }
          } else {
            setAccounts([])
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  if (!isOpen || isAdmin) return null

  const selectedAccount = accounts.find(a => String(a.id) === String(accountId))
  const selectedToAccount = accounts.find(a => String(a.id) === String(toAccountId))

  const totalInvestmentCost = (parseFloat(quantity) || 0) * (parseFloat(amount) || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (accounts.length === 0) {
      setErrorMsg('Please link at least one bank account first before recording actions.')
      setLoading(false)
      return
    }

    try {
      if (activeTab === 'TRANSFER') {
        if (!toAccountId) {
          setErrorMsg('Please select a destination account to transfer money to.')
          setLoading(false)
          return
        }
        if (String(accountId) === String(toAccountId)) {
          setErrorMsg('Source and Destination accounts must be different.')
          setLoading(false)
          return
        }
        const transferAmt = parseFloat(amount)
        if (selectedAccount && parseFloat(selectedAccount.balance) < transferAmt) {
          setErrorMsg(`Insufficient funds in ${selectedAccount.account_name}. Available: ${formatCurrency(selectedAccount.balance)}`)
          setLoading(false)
          return
        }

        const payload = {
          from_account: accountId,
          to_account: toAccountId,
          amount: transferAmt,
          description: description || `Transfer from ${selectedAccount?.account_name} to ${selectedToAccount?.account_name}`,
          date,
        }
        const res = await accountService.transfer(payload)
        if (res.data?.success) {
          setSuccessMsg(res.data.message || 'Transfer completed successfully!')
          setTimeout(() => {
            onClose()
            if (onSuccess) onSuccess()
          }, 900)
        }
      } else if (activeTab === 'INVESTMENT') {
        if (!accountId) {
          setErrorMsg('Please select a bank account to deduct the investment amount from.')
          setLoading(false)
          return
        }
        if (selectedAccount && parseFloat(selectedAccount.balance) < totalInvestmentCost) {
          setErrorMsg(`Insufficient balance in ${selectedAccount.account_name}. Available: ${formatCurrency(selectedAccount.balance)}, Required: ${formatCurrency(totalInvestmentCost)}`)
          setLoading(false)
          return
        }

        const payload = {
          asset_name: assetName,
          asset_type: assetType,
          quantity: parseFloat(quantity),
          average_buy_price: parseFloat(amount),
          current_value: totalInvestmentCost,
          purchase_date: date,
          account: accountId,
        }
        const res = await investmentService.createInvestment(payload)
        if (res.data?.success) {
          setSuccessMsg(`Asset purchased! ${formatCurrency(totalInvestmentCost)} deducted from ${selectedAccount?.account_name}.`)
          setTimeout(() => {
            onClose()
            if (onSuccess) onSuccess()
          }, 900)
        }
      } else {
        const payload = {
          account: accountId,
          transaction_type: activeTab,
          amount: parseFloat(amount),
          category: activeTab === 'INCOME' ? (category === 'Food' ? 'Salary' : category) : category,
          description: description || (activeTab === 'INCOME' ? 'Income Deposit' : 'Expense Payment'),
          payment_method: paymentMethod,
          transaction_date: date,
        }
        const res = await transactionService.createTransaction(payload)
        if (res.data?.success) {
          if (activeTab === 'INCOME') {
            setSuccessMsg(`Income of ${formatCurrency(amount)} deposited into ${selectedAccount?.account_name}!`)
          } else {
            setSuccessMsg(`Expense of ${formatCurrency(amount)} deducted from ${selectedAccount?.account_name}.`)
          }
          setTimeout(() => {
            onClose()
            if (onSuccess) onSuccess()
          }, 900)
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors?.non_field_errors?.[0] || 'Transaction submission failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2B2A24] flex items-center justify-between bg-[#0B0B0A]">
          <div>
            <h2 className="text-base font-bold text-[#F5F1E6]">Quick Financial Action</h2>
            <p className="text-[11px] text-[#A9A59A]">Live transactional updates with automatic bank balance sync</p>
          </div>
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
            onClick={() => { setActiveTab('EXPENSE'); setCategory('Food'); setErrorMsg(''); }}
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
            onClick={() => { setActiveTab('INCOME'); setCategory('Salary'); setErrorMsg(''); }}
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
            onClick={() => { setActiveTab('TRANSFER'); setErrorMsg(''); }}
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
            onClick={() => { setActiveTab('INVESTMENT'); setErrorMsg(''); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'INVESTMENT'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Buy Asset
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          {accounts.length === 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs">
              ⚠️ No bank accounts found. Please link a bank account from the Accounts page first.
            </div>
          )}

          {activeTab === 'INVESTMENT' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Inc. / Sovereign Gold Bond / Nifty 50"
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
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
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
                    min="0.0001"
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
                  min="0.01"
                  placeholder="2450.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Total Investment Summary */}
              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#A9A59A]">Total Purchase Cost:</span>
                <span className="text-base font-bold text-[#D4AF37] font-['Space_Grotesk']">
                  {formatCurrency(totalInvestmentCost)}
                </span>
              </div>

              {/* Bank Account Selection for Asset Purchase */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#A9A59A]">Pay / Deduct from Bank Account</label>
                  {selectedAccount && (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Bal: {formatCurrency(selectedAccount.balance)}
                    </span>
                  )}
                </div>
                <select
                  required
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.masked_account_number}) — Bal: ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : activeTab === 'TRANSFER' ? (
            <>
              {/* Transfer: Source and Destination Accounts */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A9A59A]">Transfer From (Source Account)</label>
                    {selectedAccount && (
                      <span className="text-[11px] text-red-400 font-medium">
                        Bal: {formatCurrency(selectedAccount.balance)}
                      </span>
                    )}
                  </div>
                  <select
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A9A59A]">Transfer To (Destination Account)</label>
                    {selectedToAccount && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Bal: {formatCurrency(selectedToAccount.balance)}
                      </span>
                    )}
                  </div>
                  <select
                    required
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="">Select Destination Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id} disabled={String(acc.id) === String(accountId)}>
                        {acc.account_name} ({acc.masked_account_number}) {String(acc.id) === String(accountId) ? '(Source Account)' : `— Bal: ₹${parseFloat(acc.balance).toLocaleString('en-IN')}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Transfer Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-base font-bold text-[#D4AF37] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Transfer Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Savings allocation, Rent reserve"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Expense or Income Form */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-base font-bold text-[#D4AF37] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A9A59A]">
                      {activeTab === 'INCOME' ? 'Deposit Into Bank' : 'Pay From Bank'}
                    </label>
                    {selectedAccount && (
                      <span className="text-[10px] text-emerald-400 font-semibold truncate max-w-[90px]">
                        Bal: ₹{parseFloat(selectedAccount.balance).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-2.5 py-3 focus:border-[#D4AF37] focus:outline-none"
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
                    {activeTab === 'INCOME' ? (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Investment">Investment Returns / Dividend</option>
                        <option value="Other">Freelance / Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Food">Food & Dining</option>
                        <option value="Transport">Transport & Fuel</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Utilities">Utilities & Bills</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other Expense</option>
                      </>
                    )}
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
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'INCOME' ? "e.g. October Client Retainer / Monthly Salary" : "e.g. Grocery payment / Dining with family"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Transaction Date</label>
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
              disabled={loading || accounts.length === 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Processing...' : activeTab === 'INVESTMENT' ? 'Confirm & Buy Asset' : activeTab === 'TRANSFER' ? 'Confirm Transfer' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
