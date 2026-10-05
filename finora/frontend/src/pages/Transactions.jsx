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
  ChevronRight
} from 'lucide-react'
import { transactionService, reportService } from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'

export const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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
          <a
            href={reportService.exportCSVUrl('expense')}
            download
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#171714] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37] font-semibold text-xs rounded-xl transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
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
                  <td colSpan={6} className="py-12 text-center text-[#A9A59A]">No transactions found.</td>
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
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
    </div>
  )
}
