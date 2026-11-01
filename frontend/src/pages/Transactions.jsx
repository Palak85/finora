import React, { useState, useEffect } from 'react'
import {
  ArrowRightLeft,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Calendar,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Wallet
} from 'lucide-react'
import { transactionService, reportService, accountService } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'

export const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Accounts list for expense funding
  const [accounts, setAccounts] = useState([])

  // Add Expense Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [addAccountId, setAddAccountId] = useState('')
  const [addCategory, setAddCategory] = useState('Food')
  const [addDescription, setAddDescription] = useState('')
  const [addPaymentMethod, setAddPaymentMethod] = useState('UPI')
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0])
  const [addNotes, setAddNotes] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTxn, setEditingTxn] = useState(null)
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('Food')
  const [editType, setEditType] = useState('EXPENSE')
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI')
  const [editDate, setEditDate] = useState('')
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const fetchTxns = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        search,
        category: categoryFilter || undefined,
        transaction_type: typeFilter || undefined,
      }
      const res = await transactionService.getTransactions(params)
      if (res.data?.results) {
        setTransactions(res.data.results)
        setTotalPages(Math.ceil((res.data.count || 20) / 20))
      } else if (res.data?.success) {
        setTransactions(res.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTxns()
  }, [page, categoryFilter, typeFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTxns()
  }

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getAccounts()
      if (res.data?.success && res.data.data.length > 0) {
        setAccounts(res.data.data)
        if (!addAccountId) setAddAccountId(res.data.data[0].id)
      }
    } catch (e) {}
  }

  const handleOpenAddExpense = () => {
    fetchAccounts()
    setAddAmount('')
    setAddDescription('')
    setAddCategory('Food')
    setAddPaymentMethod('UPI')
    setAddDate(new Date().toISOString().split('T')[0])
    setAddNotes('')
    setAddError('')
    setAddSuccess('')
    setIsAddModalOpen(true)
  }

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    setAddSuccess('')

    const expAmount = parseFloat(addAmount)
    if (!expAmount || expAmount <= 0) {
      setAddError('Expense amount must be greater than zero.')
      setAddLoading(false)
      return
    }

    const selectedAcc = accounts.find(a => String(a.id) === String(addAccountId))
    if (!selectedAcc) {
      setAddError('Please select a valid bank account to pay from.')
      setAddLoading(false)
      return
    }

    if (parseFloat(selectedAcc.balance) < expAmount) {
      setAddError(`Insufficient balance in ${selectedAcc.account_name}. Available: ${formatCurrency(selectedAcc.balance)}, Required: ${formatCurrency(expAmount)}`)
      setAddLoading(false)
      return
    }

    try {
      const payload = {
        account: addAccountId,
        transaction_type: 'EXPENSE',
        amount: expAmount,
        category: addCategory,
        description: addDescription || `${addCategory} Expense`,
        payment_method: addPaymentMethod,
        transaction_date: addDate,
        notes: addNotes,
      }
      const res = await transactionService.createTransaction(payload)
      if (res.data?.success) {
        setAddSuccess(`Expense of ${formatCurrency(expAmount)} recorded and deducted from ${selectedAcc.account_name}!`)
        fetchTxns()
        fetchAccounts()
        setTimeout(() => {
          setIsAddModalOpen(false)
        }, 900)
      }
    } catch (err) {
      setAddError(err.response?.data?.message || err.response?.data?.errors?.amount?.[0] || 'Failed to record expense.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleOpenEdit = (txn) => {
    setEditingTxn(txn)
    setEditDescription(txn.description || '')
    setEditAmount(txn.amount || '')
    setEditCategory(txn.category || 'Food')
    setEditType(txn.transaction_type || 'EXPENSE')
    setEditPaymentMethod(txn.payment_method || 'UPI')
    setEditDate(txn.transaction_date ? txn.transaction_date.split('T')[0] : '')
    setEditError('')
    setEditSuccess('')
    setIsEditModalOpen(true)
  }

  const handleUpdateTxn = async (e) => {
    e.preventDefault()
    setEditError('')
    setEditSuccess('')
    try {
      const payload = {
        description: editDescription,
        amount: parseFloat(editAmount),
        category: editCategory,
        transaction_type: editType,
        payment_method: editPaymentMethod,
        transaction_date: editDate,
      }
      const res = await transactionService.updateTransaction(editingTxn.id, payload)
      if (res.data?.success) {
        setEditSuccess('Transaction updated successfully!')
        fetchTxns()
        setTimeout(() => {
          setIsEditModalOpen(false)
          setEditingTxn(null)
        }, 800)
      }
    } catch (err) {
      setEditError(err.response?.data?.message || err.response?.data?.errors?.amount?.[0] || 'Failed to update transaction.')
    }
  }

  const totalInflows = transactions
    .filter(t => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

  const totalOutflows = transactions
    .filter(t => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

  const netCashFlow = totalInflows - totalOutflows

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id)
        fetchTxns()
      } catch (e) {}
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Transactions Ledger</h1>
          <p className="text-xs text-[#A9A59A] mt-1">Real-time audit log of income, expenses & transfers</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddExpense}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
          <a
            href={reportService.exportCSVUrl('expense')}
            download
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#171714] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37] font-semibold text-xs rounded-xl transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Executive Transaction Tracking KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171714] border border-[#2B2A24] hover:border-emerald-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Total Inflows</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-emerald-400 font-['Space_Grotesk']">
            {formatCurrency(totalInflows)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Income & Deposits</p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] hover:border-red-500/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Total Outflows</span>
            <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-red-400 font-['Space_Grotesk']">
            {formatCurrency(totalOutflows)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Recorded Expenses</p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Net Cash Flow</span>
            <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className={`text-lg font-bold font-['Space_Grotesk'] ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Period Net Position</p>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/40 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between text-[#A9A59A] text-xs mb-2">
            <span>Transactions Volume</span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            {transactions.length}
          </h3>
          <p className="text-[11px] text-[#A9A59A] mt-1 font-medium">Audited Records</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, reference ID or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl pl-10 pr-4 py-2.5 focus:border-[#D4AF37] focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="TRANSFER">Transfer</option>
            <option value="INVESTMENT">Investment</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none flex-1 md:flex-none"
          >
            <option value="">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Salary">Salary</option>
            <option value="Investment">Investment</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[11px] font-bold text-[#A9A59A] uppercase tracking-wider">
                <th className="py-4 px-6">Transaction</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2A24] text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#A9A59A]">Loading transaction history...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#A9A59A]">
                    <div className="flex flex-col items-center justify-center">
                      <ArrowRightLeft className="w-10 h-10 text-[#A9A59A] opacity-40 mb-2" />
                      <p className="font-semibold text-[#F5F1E6]">No transactions recorded yet</p>
                      <p className="text-[11px] text-[#A9A59A] mt-0.5">Start logging your expenses or income to track cash flow.</p>
                      <button
                        onClick={handleOpenAddExpense}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold rounded-xl shadow-lg hover:brightness-110 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Record First Expense
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isInc = t.transaction_type === 'INCOME'
                  return (
                    <tr key={t.id} className="hover:bg-[#21201B]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isInc ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {isInc ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-[#F5F1E6]">{t.description}</p>
                            <p className="text-[10px] text-[#A9A59A] font-mono">{t.reference_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-[#0B0B0A] border border-[#2B2A24] text-[#D4AF37] font-semibold text-[11px]">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#A9A59A]">{t.payment_method}</td>
                      <td className="py-4 px-6 text-[#A9A59A]">{formatDate(t.transaction_date)}</td>
                      <td className={`py-4 px-6 text-right font-bold font-['Space_Grotesk'] ${
                        isInc ? 'text-emerald-400' : 'text-[#F5F1E6]'
                      }`}>
                        {isInc ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                            title="Edit Transaction"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 rounded-lg text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#0B0B0A] border-t border-[#2B2A24] flex items-center justify-between text-xs text-[#A9A59A]">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl bg-[#171714] border border-[#2B2A24] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl bg-[#171714] border border-[#2B2A24] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {isEditModalOpen && editingTxn && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6]">Edit Transaction</h3>
                <p className="text-[10px] text-[#A9A59A] font-mono mt-0.5">Ref: {editingTxn.reference_id}</p>
              </div>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingTxn(null); }}
                className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {editSuccess}
              </div>
            )}

            {editError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateTxn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Food">Food &amp; Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Payment Method</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="CASH">Cash</option>
                    <option value="WIRE">Wire Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingTxn(null); }}
                  className="flex-1 px-4 py-2.5 border border-[#2B2A24] text-xs font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#2B2A24] flex items-center justify-between bg-[#0B0B0A]">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-400" /> Record New Expense
                </h3>
                <p className="text-[11px] text-[#A9A59A]">Deduct payment directly from your selected bank account</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full bg-[#171714] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {addSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {addSuccess}
                </div>
              )}

              {addError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {addError}
                </div>
              )}

              {accounts.length === 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs">
                  ⚠️ No linked bank accounts found. Please link an account on the Accounts page first.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Expense Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-base font-bold text-red-400 rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A9A59A]">Deduct From Bank</label>
                    {accounts.find(a => String(a.id) === String(addAccountId)) && (
                      <span className="text-[10px] text-emerald-400 font-semibold truncate max-w-[90px]">
                        Bal: ₹{parseFloat(accounts.find(a => String(a.id) === String(addAccountId)).balance).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <select
                    required
                    value={addAccountId}
                    onChange={(e) => setAddAccountId(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-2.5 py-3 focus:border-[#D4AF37] focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} ({acc.masked_account_number}) — Bal: ₹{parseFloat(acc.balance).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remaining Balance Preview */}
              {accounts.find(a => String(a.id) === String(addAccountId)) && parseFloat(addAmount) > 0 && (
                <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#A9A59A]">Balance After Deduction:</span>
                  <span className={`font-bold font-['Space_Grotesk'] ${
                    parseFloat(accounts.find(a => String(a.id) === String(addAccountId)).balance) - parseFloat(addAmount) >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {formatCurrency(Math.max(0, parseFloat(accounts.find(a => String(a.id) === String(addAccountId)).balance) - parseFloat(addAmount)))}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Category</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Food">Food &amp; Dining</option>
                    <option value="Transport">Transport &amp; Fuel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities &amp; Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Bills">Bills</option>
                    <option value="Other">Other Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Payment Method</label>
                  <select
                    value={addPaymentMethod}
                    onChange={(e) => setAddPaymentMethod(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Description / Merchant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Order / Fuel at Shell / Supermarket"
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Work reimbursement pending"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2B2A24] text-xs font-bold text-[#A9A59A] rounded-xl hover:bg-[#21201B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading || accounts.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {addLoading ? 'Deducting...' : 'Confirm & Deduct Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
