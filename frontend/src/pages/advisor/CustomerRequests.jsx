import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Shield,
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { advisorService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

export const CustomerRequests = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Accept Modal State
  const [acceptModalRequest, setAcceptModalRequest] = useState(null)
  const [acceptLoading, setAcceptLoading] = useState(false)

  // Reject Modal State
  const [rejectModalRequest, setRejectModalRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  // View Customer Modal State
  const [viewCustomer, setViewCustomer] = useState(null)

  const fetchRequests = async () => {
    setLoading(true)
    setActionError('')
    try {
      const res = await advisorService.getCustomerRequests()
      if (res.data?.success) {
        setRequests(res.data.data || [])
        if (res.data.stats) {
          setStats(res.data.stats)
        }
      }
    } catch (err) {
      console.error('Failed to load requests:', err)
      setActionError('Failed to load customer requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleConfirmAccept = async () => {
    if (!acceptModalRequest) return
    setAcceptLoading(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await advisorService.acceptCustomerRequest(acceptModalRequest.id)
      if (res.data?.success) {
        setActionSuccess(res.data.message || 'Customer request accepted successfully. The customer is now assigned to you.')
        setAcceptModalRequest(null)
        await fetchRequests()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to accept customer request.')
    } finally {
      setAcceptLoading(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectModalRequest) return
    setRejectLoading(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await advisorService.rejectCustomerRequest(rejectModalRequest.id, { reason: rejectReason })
      if (res.data?.success) {
        setActionSuccess('Customer advisor request has been declined.')
        setRejectModalRequest(null)
        setRejectReason('')
        await fetchRequests()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to decline customer request.')
    } finally {
      setRejectLoading(false)
    }
  }

  // Filter and search logic
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus
    const customerName = r.customer?.full_name?.toLowerCase() || ''
    const customerEmail = r.customer?.email?.toLowerCase() || ''
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = !query || customerName.includes(query) || customerEmail.includes(query)
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Accepted
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            Rejected
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#A9A59A]" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#21201B] text-[#A9A59A]">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Fiduciary Client Management
            </span>
            {stats.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                {stats.pending} Action Required
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            Customer Requests
          </h1>
          <p className="text-xs text-[#A9A59A]">
            Review, evaluate, and accept incoming portfolio management requests from private wealth clients
          </p>
        </div>

        <button
          onClick={() => navigate('/advisor/clients')}
          className="flex items-center gap-2 px-4 py-2 bg-[#21201B] hover:bg-[#2B2A24] border border-[#2B2A24] text-xs font-bold text-[#F5F1E6] rounded-xl transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Open Client Navigator
        </button>
      </div>

      {/* Success & Error Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-emerald-200">
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#A9A59A] font-semibold uppercase">
            <span>Total Requests</span>
            <Users className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">
            {stats.total}
          </p>
          <span className="text-[11px] text-[#A9A59A]">All incoming inquiries</span>
        </div>

        <div className="bg-[#171714] border border-amber-500/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold uppercase">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-['Space_Grotesk'] mt-2">
            {stats.pending}
          </p>
          <span className="text-[11px] text-[#A9A59A]">Awaiting your decision</span>
        </div>

        <div className="bg-[#171714] border border-emerald-500/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase">
            <span>Accepted Clients</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk'] mt-2">
            {stats.accepted}
          </p>
          <span className="text-[11px] text-[#A9A59A]">Active advisory assignments</span>
        </div>

        <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#A9A59A] font-semibold uppercase">
            <span>Declined / Closed</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">
            {stats.rejected + stats.cancelled}
          </p>
          <span className="text-[11px] text-[#A9A59A]">Closed request history</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Requests', count: stats.total },
            { id: 'PENDING', label: 'Pending', count: stats.pending },
            { id: 'ACCEPTED', label: 'Accepted', count: stats.accepted },
            { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
            { id: 'CANCELLED', label: 'Cancelled', count: stats.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterStatus === tab.id ? 'bg-[#0B0B0A]/30 text-[#0B0B0A]' : 'bg-[#0B0B0A] text-[#A9A59A]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#A9A59A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#0B0B0A] rounded-2xl" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/20">
              <UserCheck className="w-7 h-7 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
              No Customer Requests Found
            </h3>
            <p className="text-xs text-[#A9A59A] max-w-sm mx-auto">
              {filterStatus === 'PENDING'
                ? 'You currently have zero pending requests awaiting review.'
                : 'No customer requests matching your active filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2B2A24] text-[11px] font-bold text-[#A9A59A] uppercase tracking-wider bg-[#0B0B0A]/40">
                  <th className="py-3.5 px-5">Request ID</th>
                  <th className="py-3.5 px-5">Customer Information</th>
                  <th className="py-3.5 px-5">Request Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A24]/60 text-xs">
                {filteredRequests.map((req) => {
                  const c = req.customer || {}
                  const isPending = req.status === 'PENDING'
                  const isAccepted = req.status === 'ACCEPTED'

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-[#21201B]/50 transition-colors"
                    >
                      {/* Request ID */}
                      <td className="py-4 px-5 font-mono text-[#D4AF37] font-bold">
                        #REQ-{String(req.id).padStart(3, '0')}
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {c.profile_image ? (
                            <img
                              src={c.profile_image}
                              alt={c.full_name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#2B2A24]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-extrabold flex items-center justify-center shrink-0">
                              {c.full_name?.charAt(0) || 'C'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#F5F1E6] flex items-center gap-1.5">
                              <span>{c.full_name}</span>
                              <button
                                onClick={() => setViewCustomer(c)}
                                className="text-[10px] text-[#A9A59A] hover:text-[#D4AF37] underline cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                            <p className="text-[11px] text-[#A9A59A] flex items-center gap-2 mt-0.5">
                              <span>{c.email}</span>
                              {c.phone && <span>• {c.phone}</span>}
                            </p>
                            {req.message && (
                              <p className="text-[11px] text-[#D4AF37]/80 italic mt-1 bg-[#0B0B0A] px-2 py-1 rounded-lg border border-[#2B2A24] max-w-md">
                                "{req.message}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Request Date */}
                      <td className="py-4 px-5 text-[#A9A59A]">
                        <div>{formatDate(req.request_date)}</div>
                        {req.accepted_at && (
                          <span className="text-[10px] text-emerald-400 block mt-0.5">
                            Accepted {formatDate(req.accepted_at)}
                          </span>
                        )}
                        {req.rejected_at && (
                          <span className="text-[10px] text-red-400 block mt-0.5">
                            Declined {formatDate(req.rejected_at)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setAcceptModalRequest(req)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#0B0B0A] font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalRequest(req)
                                setRejectReason('')
                              }}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : isAccepted ? (
                          <button
                            onClick={() => navigate('/advisor/clients')}
                            className="px-3 py-1.5 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] text-[#D4AF37] font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <span>Open in Navigator</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#A9A59A] italic">
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACCEPT CONFIRMATION MODAL */}
      {acceptModalRequest && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Accept Customer Request
                </h3>
                <p className="text-xs text-[#A9A59A]">
                  Establish fiduciary advisory engagement
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
              <p className="text-xs text-[#F5F1E6] leading-relaxed">
                Are you sure you want to accept this customer and become their financial advisor?
              </p>
              <div className="pt-2 border-t border-[#2B2A24] text-[11px] space-y-1 text-[#A9A59A]">
                <p>
                  <strong className="text-[#F5F1E6]">Client:</strong> {acceptModalRequest.customer?.full_name}
                </p>
                <p>
                  <strong className="text-[#F5F1E6]">Email:</strong> {acceptModalRequest.customer?.email}
                </p>
                <p>
                  <strong className="text-[#F5F1E6]">Request Date:</strong> {formatDate(acceptModalRequest.request_date)}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[#A9A59A]">
              Upon confirmation, this customer will be permanently assigned to your advisory portfolio, and a real-time notification will be dispatched to their account.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAcceptModalRequest(null)}
                disabled={acceptLoading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={acceptLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#0B0B0A] text-xs font-bold shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {acceptLoading ? 'Assigning...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-red-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Reject Customer Request
                </h3>
                <p className="text-xs text-[#A9A59A]">
                  Decline private wealth engagement
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
              <p className="text-xs text-[#F5F1E6] leading-relaxed">
                Are you sure you want to reject this customer advisor request?
              </p>
              <div className="pt-2 border-t border-[#2B2A24] text-[11px] space-y-1 text-[#A9A59A]">
                <p>
                  <strong className="text-[#F5F1E6]">Client:</strong> {rejectModalRequest.customer?.full_name}
                </p>
                <p>
                  <strong className="text-[#F5F1E6]">Email:</strong> {rejectModalRequest.customer?.email}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">
                Optional Reason (Internal or Client Notice)
              </label>
              <textarea
                rows={3}
                placeholder="E.g., Portfolio size threshold or current client capacity reached..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-red-400 focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-[#A9A59A]">
              The client will be notified and given the option to select another available wealth advisor. This request record will be retained in history.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalRequest(null)}
                disabled={rejectLoading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {rejectLoading ? 'Declining...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER MODAL */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-4">
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                Customer Profile
              </h3>
              <button
                onClick={() => setViewCustomer(null)}
                className="text-xs text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-extrabold text-xl flex items-center justify-center shrink-0">
                {viewCustomer.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  {viewCustomer.full_name}
                </h4>
                <p className="text-xs text-[#A9A59A]">{viewCustomer.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Client
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#A9A59A]">
                <span>Registered Phone:</span>
                <span className="text-[#F5F1E6] font-mono">{viewCustomer.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center justify-between text-[#A9A59A]">
                <span>Member Since:</span>
                <span className="text-[#F5F1E6]">{formatDate(viewCustomer.date_joined)}</span>
              </div>
            </div>

            <button
              onClick={() => setViewCustomer(null)}
              className="w-full py-2.5 bg-[#21201B] hover:bg-[#2B2A24] border border-[#2B2A24] text-xs font-bold text-[#F5F1E6] rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

