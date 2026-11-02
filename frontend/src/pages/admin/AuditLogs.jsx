import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Code,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { adminService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

export const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Selected Log Modal
  const [selectedLog, setSelectedLog] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchLogs = async () => {
    try {
      setRefreshing(true)
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (actionFilter !== 'ALL') params.action = actionFilter

      const res = await adminService.getAuditLogs(params)
      if (res.data?.success) {
        setLogs(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [dateFrom, dateTo, actionFilter])

  // Extract unique actions & modules for filter dropdowns
  const availableActions = useMemo(() => {
    const set = new Set()
    logs.forEach((l) => {
      if (l.action) set.add(l.action)
    })
    return Array.from(set)
  }, [logs])

  const availableModules = useMemo(() => {
    const set = new Set()
    logs.forEach((l) => {
      if (l.module) set.add(l.module)
    })
    return Array.from(set)
  }, [logs])

  // Client-side search and module filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        l.action?.toLowerCase().includes(searchLower) ||
        l.user_email?.toLowerCase().includes(searchLower) ||
        l.user_name?.toLowerCase().includes(searchLower) ||
        l.description?.toLowerCase().includes(searchLower) ||
        l.ip_address?.includes(searchTerm) ||
        String(l.id).includes(searchTerm)

      const matchesModule = moduleFilter === 'ALL' || l.module === moduleFilter

      return matchesSearch && matchesModule
    })
  }, [logs, searchTerm, moduleFilter])

  // Paginated records
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(start, start + itemsPerPage)
  }, [filteredLogs, currentPage, itemsPerPage])

  const clearFilters = () => {
    setSearchTerm('')
    setActionFilter('ALL')
    setModuleFilter('ALL')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  // Get action styling optimized for both Light Mode & Dark Mode
  const getActionBadgeClass = (action) => {
    const act = (action || '').toUpperCase()
    if (act.includes('DELETE')) {
      return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
    }
    if (act.includes('DEACTIVATE')) {
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
    }
    if (act.includes('CREATE') || act.includes('ACTIVATE')) {
      return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
    }
    if (act.includes('ROLE')) {
      return 'bg-[#D4AF37]/15 text-[#8B6508] dark:text-[#D4AF37] border-[#D4AF37]/40'
    }
    if (act.includes('LOGIN') || act.includes('LOGOUT')) {
      return 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30'
    }
    if (act.includes('PASSWORD')) {
      return 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30'
    }
    if (act.includes('SETTING') || act.includes('CONFIG') || act.includes('UPDATE')) {
      return 'bg-amber-600/15 text-amber-900 dark:text-amber-300 border-amber-500/30'
    }
    if (act.includes('ADVISOR') || act.includes('ASSIGN')) {
      return 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30'
    }
    if (act.includes('SECURITY') || act.includes('POLICY')) {
      return 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30'
    }
    return 'bg-stone-500/15 text-stone-900 dark:text-stone-300 border-stone-500/30'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#8B6508] dark:text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Security &amp; Compliance Trail
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
              Read-Only Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1F1C18] dark:text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            System Audit Trail Logs
          </h1>
          <p className="text-xs text-[#6E675F] dark:text-[#A9A59A]">
            Cryptographically recorded administrative operations, authenticated sessions &amp; permission changes
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={refreshing}
          className="px-3.5 py-2 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37] text-xs font-semibold text-[#1F1C18] dark:text-[#F5F1E6] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6E675F] dark:text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, email, name, description or IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1F1C18] dark:text-[#F5F1E6] placeholder-[#6E675F] dark:placeholder-[#A9A59A]/60 focus:border-[#D4AF37] outline-none"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-transparent text-xs text-[#1F1C18] dark:text-[#F5F1E6] outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              {availableActions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-transparent text-xs text-[#1F1C18] dark:text-[#F5F1E6] outline-none cursor-pointer"
            >
              <option value="ALL">All Modules</option>
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2B2A24]/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#6E675F] dark:text-[#A9A59A] flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Date Range:
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-[#0B0B0A] border border-[#2B2A24] text-[#1F1C18] dark:text-[#F5F1E6] rounded-xl px-2.5 py-1 text-xs outline-none focus:border-[#D4AF37]"
            />
            <span className="text-[#6E675F] dark:text-[#A9A59A] text-xs">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-[#0B0B0A] border border-[#2B2A24] text-[#1F1C18] dark:text-[#F5F1E6] rounded-xl px-2.5 py-1 text-xs outline-none focus:border-[#D4AF37]"
            />

            {(searchTerm || actionFilter !== 'ALL' || moduleFilter !== 'ALL' || dateFrom || dateTo) && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-[#8B6508] dark:text-[#D4AF37] hover:underline px-2 cursor-pointer font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>

          <span className="text-[11px] text-[#6E675F] dark:text-[#A9A59A]">
            Showing {filteredLogs.length} matching events
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[11px] font-bold text-[#6E675F] dark:text-[#A9A59A] uppercase tracking-wider">
                <th className="py-4 px-4">Log ID</th>
                <th className="py-4 px-4">User / Actor</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Module</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-4">Date &amp; Time</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2A24] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6E675F] dark:text-[#A9A59A] animate-pulse">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6E675F] dark:text-[#A9A59A]">
                    No audit log records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#21201B]/50 transition-colors">
                    {/* Log ID */}
                    <td className="py-3.5 px-4 font-mono text-[#6E675F] dark:text-[#A9A59A] font-semibold text-[11px]">
                      #{log.id}
                    </td>

                    {/* User / Actor */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-[#1F1C18] dark:text-[#F5F1E6] block">
                          {log.user_name || 'System Actor'}
                        </span>
                        <span className="text-[10px] text-[#6E675F] dark:text-[#A9A59A]">
                          {log.user_email || 'System'}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0B0B0A] border border-[#2B2A24] text-[#3E3A32] dark:text-[#A9A59A]">
                        {log.module}
                      </span>
                    </td>

                    {/* Description - High Contrast in both Light & Dark Mode */}
                    <td
                      className="py-3.5 px-4 audit-log-desc text-[#F5F1E6] max-w-xs truncate font-medium text-xs"
                      title={log.description}
                    >
                      {log.description}
                    </td>

                    {/* Date and Time */}
                    <td className="py-3.5 px-4 text-[#6E675F] dark:text-[#A9A59A] whitespace-nowrap text-[11px]">
                      {formatDate(log.timestamp)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {log.status || 'Success'}
                      </span>
                    </td>

                    {/* View Details Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] hover:border-[#D4AF37] text-xs text-[#8B6508] dark:text-[#D4AF37] font-semibold flex items-center gap-1 ml-auto transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#2B2A24] flex items-center justify-between text-xs text-[#6E675F] dark:text-[#A9A59A]">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} events
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#0B0B0A] border border-[#2B2A24] text-[#1F1C18] dark:text-[#F5F1E6] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D4AF37]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-[#1F1C18] dark:text-[#F5F1E6]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-[#0B0B0A] border border-[#2B2A24] text-[#1F1C18] dark:text-[#F5F1E6] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D4AF37]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW LOG DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1F1C18] dark:text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#D4AF37]" /> Log Entry Inspection: #{selectedLog.id}
                </h3>
                <p className="text-xs text-[#6E675F] dark:text-[#A9A59A]">{selectedLog.action}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-full bg-[#0B0B0A] text-[#6E675F] dark:text-[#A9A59A] hover:text-[#1F1C18] dark:hover:text-[#F5F1E6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl">
                <div>
                  <span className="text-[#6E675F] dark:text-[#A9A59A] block text-[10px] uppercase">Actor</span>
                  <span className="font-bold text-[#1F1C18] dark:text-[#F5F1E6]">{selectedLog.user_name || 'System'}</span>
                  <span className="text-[#6E675F] dark:text-[#A9A59A] block text-[11px]">{selectedLog.user_email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#6E675F] dark:text-[#A9A59A] block text-[10px] uppercase">IP Address</span>
                  <span className="font-mono text-[#8B6508] dark:text-[#D4AF37] font-semibold">{selectedLog.ip_address || '127.0.0.1'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#6E675F] dark:text-[#A9A59A] block text-[10px] uppercase">Module</span>
                  <span className="font-semibold text-[#1F1C18] dark:text-[#F5F1E6]">{selectedLog.module}</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#6E675F] dark:text-[#A9A59A] block text-[10px] uppercase">Timestamp</span>
                  <span className="text-[#6E675F] dark:text-[#A9A59A]">{formatDate(selectedLog.timestamp)}</span>
                </div>
              </div>

              <div>
                <span className="block text-[#6E675F] dark:text-[#A9A59A] font-semibold mb-1">Description</span>
                <p className="p-2.5 rounded-xl bg-[#0B0B0A] border border-[#2B2A24] audit-log-desc text-[#F5F1E6] leading-relaxed font-medium">
                  {selectedLog.description}
                </p>
              </div>

              <div>
                <span className="block text-[#6E675F] dark:text-[#A9A59A] font-semibold mb-1">Raw Payload Details</span>
                <pre className="p-3 rounded-xl bg-[#0B0B0A] border border-[#2B2A24] font-mono text-[11px] text-emerald-800 dark:text-emerald-400 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2B2A24]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogs
