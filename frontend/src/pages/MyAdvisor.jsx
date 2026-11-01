import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Compass,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Award,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
  X,
  XCircle,
  ArrowRight,
  Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { customerService } from '../services/api'
import { formatDate } from '../utils/formatters'

export const MyAdvisor = () => {
  // Main data states
  const [advisor, setAdvisor] = useState(null)
  const [pendingRequest, setPendingRequest] = useState(null)
  const [requestHistory, setRequestHistory] = useState([])
  const [availableAdvisors, setAvailableAdvisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDirectory, setLoadingDirectory] = useState(false)
  const [error, setError] = useState(null)

  // Feedback states
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Directory search & filter
  const [directorySearch, setDirectorySearch] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL')

  // Modals
  const [selectedAdvisorDetail, setSelectedAdvisorDetail] = useState(null)
  const [requestModalAdvisor, setRequestModalAdvisor] = useState(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  // Consultation Modal
  const [consultModalOpen, setConsultModalOpen] = useState(false)
  const [consultSubject, setConsultSubject] = useState('')
  const [consultMessage, setConsultMessage] = useState('')
  const [consultSent, setConsultSent] = useState(false)

  const fetchAdvisorData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await customerService.getMyAdvisor()
      if (res.data?.success) {
        if (res.data.assigned && res.data.data) {
          setAdvisor(res.data.data)
          setPendingRequest(null)
        } else if (res.data.has_pending_request && res.data.pending_request) {
          setPendingRequest(res.data.pending_request)
          setAdvisor(null)
        } else {
          setAdvisor(null)
          setPendingRequest(null)
        }
        if (res.data.request_history) {
          setRequestHistory(res.data.request_history)
        }
      }
    } catch (err) {
      console.error('Failed to load advisor details:', err)
      setError('Unable to load advisor profile at this time.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDirectory = async () => {
    setLoadingDirectory(true)
    try {
      const res = await customerService.getAvailableAdvisors()
      if (res.data?.success) {
        setAvailableAdvisors(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to load advisors directory:', err)
    } finally {
      setLoadingDirectory(false)
    }
  }

  useEffect(() => {
    fetchAdvisorData()
    fetchDirectory()
  }, [])

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'email') {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    }
  }

  const handleOpenRequestModal = (adv) => {
    setRequestModalAdvisor(adv)
    setRequestMessage('')
    setActionError('')
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!requestModalAdvisor) return
    setRequestSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await customerService.submitAdvisorRequest({
        advisor_id: requestModalAdvisor.id,
        message: requestMessage.trim(),
      })
      if (res.data?.success) {
        setActionSuccess('Advisor request submitted successfully. Your advisor will review your request.')
        setRequestModalAdvisor(null)
        setSelectedAdvisorDetail(null)
        await fetchAdvisorData()
        await fetchDirectory()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit advisor request.')
    } finally {
      setRequestSubmitting(false)
    }
  }

  const handleCancelPendingRequest = async () => {
    if (!pendingRequest) return
    setCancelSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await customerService.cancelAdvisorRequest(pendingRequest.id)
      if (res.data?.success) {
        setActionSuccess('Advisor request has been cancelled successfully.')
        setCancelModalOpen(false)
        await fetchAdvisorData()
        await fetchDirectory()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel advisor request.')
    } finally {
      setCancelSubmitting(false)
    }
  }

  const handleSendInquiry = (e) => {
    e.preventDefault()
    setConsultSent(true)
    setTimeout(() => {
      setConsultSent(false)
      setConsultModalOpen(false)
      setConsultSubject('')
      setConsultMessage('')
    }, 1800)
  }

  // Filtered available advisors
  const filteredAdvisors = availableAdvisors.filter((adv) => {
    const q = directorySearch.toLowerCase().trim()
    const matchesSearch =
      !q ||
      adv.full_name?.toLowerCase().includes(q) ||
      adv.email?.toLowerCase().includes(q) ||
      adv.specialization?.toLowerCase().includes(q)
    const matchesSpec =
      selectedSpecialization === 'ALL' ||
      adv.specialization?.toLowerCase().includes(selectedSpecialization.toLowerCase())
    return matchesSearch && matchesSpec
  })

  const specializations = Array.from(
    new Set(availableAdvisors.map((a) => a.specialization).filter(Boolean))
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Accepted
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            Declined
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34] flex items-center gap-1">
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
    <div className="space-y-8 max-w-6xl mx-auto pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Fiduciary Wealth Management
            </span>
            {advisor ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" /> YOUR ADVISOR
              </span>
            ) : pendingRequest ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" /> REQUEST PENDING
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
                NO ADVISOR ASSIGNED
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            My Financial Advisor
          </h1>
          <p className="text-xs text-[#A9A59A]">
            Dedicated private wealth manager and fiduciary steward assigned to your portfolio
          </p>
        </div>

        {advisor && (
          <button
            onClick={() => setConsultModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" /> Schedule Consultation
          </button>
        )}
      </div>

      {/* Action Notification Banners */}
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

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-64 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-8 rounded-3xl bg-[#171714] border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-[#F5F1E6]">Error Loading Advisor Profile</h3>
          <p className="text-xs text-[#A9A59A]">{error}</p>
          <button
            onClick={fetchAdvisorData}
            className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl hover:brightness-110"
          >
            Retry Connection
          </button>
        </div>
      ) : advisor ? (
        /* ================= CASE 3: ASSIGNED ADVISOR PROFILE ================= */
        <div className="space-y-8">
          {/* Main Hero Profile Card */}
          <div className="bg-gradient-to-br from-[#171714] via-[#1c1b17] to-[#121210] border border-[#D4AF37]/35 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                {/* Advisor Avatar */}
                <div className="relative">
                  {advisor.profile_image ? (
                    <img
                      src={advisor.profile_image}
                      alt={advisor.full_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-[#0B0B0A] font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-xl shadow-[#D4AF37]/20 border-2 border-[#FFF0B3]/40">
                      {advisor.full_name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#171714] flex items-center justify-center shadow-md" title="Advisor Active">
                    <CheckCircle2 className="w-3 h-3 text-[#0B0B0A]" />
                  </span>
                </div>

                {/* Identity & Status */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                      {advisor.designation || 'Financial Advisor'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {advisor.status || 'Active'}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      YOUR ADVISOR
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    {advisor.full_name}
                  </h2>
                  <p className="text-xs text-[#A9A59A] flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Specialization: <strong className="text-[#F5F1E6]">{advisor.specialization || 'Private Wealth Management'}</strong></span>
                  </p>
                  {advisor.experience && (
                    <p className="text-[11px] text-[#A9A59A]">
                      Professional Experience: <strong className="text-[#F5F1E6]">{advisor.experience}</strong>
                    </p>
                  )}
                  {advisor.assigned_date && (
                    <p className="text-[11px] text-[#A9A59A]">
                      Assigned Date: <strong className="text-[#F5F1E6]">{formatDate(advisor.assigned_date)}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setConsultModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Message Advisor
                </button>
                <Link
                  to="/notifications"
                  className="px-4 py-2.5 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] text-[#F5F1E6] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-[#D4AF37]" /> View Advisory Signals
                </Link>
              </div>
            </div>

            {/* Direct Contact Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#2B2A24]/70">
              {/* Email Card */}
              <div className="p-3.5 bg-[#0B0B0A]/70 border border-[#2B2A24] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#21201B] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A9A59A] uppercase tracking-wider font-semibold block">Official Email</span>
                    <a href={`mailto:${advisor.email}`} className="text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-colors">
                      {advisor.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(advisor.email, 'email')}
                  className="p-2 text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B] rounded-lg transition-colors cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Phone Card */}
              <div className="p-3.5 bg-[#0B0B0A]/70 border border-[#2B2A24] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#21201B] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A9A59A] uppercase tracking-wider font-semibold block">Direct Phone</span>
                    <a href={`tel:${advisor.phone || '+91 98765 11111'}`} className="text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-colors font-mono">
                      {advisor.phone || '+91 98765 11111'}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(advisor.phone || '+91 98765 11111', 'phone')}
                  className="p-2 text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B] rounded-lg transition-colors cursor-pointer"
                  title="Copy phone"
                >
                  {copiedPhone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : pendingRequest ? (
        /* ================= CASE 2: PENDING ADVISOR REQUEST ================= */
        <div className="bg-gradient-to-br from-[#171714] via-[#1d1b14] to-[#121210] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-[#0B0B0A] font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                {pendingRequest.advisor_name?.charAt(0) || 'A'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400 animate-spin" /> Pending Advisor Review
                  </span>
                  <span className="text-[11px] text-[#A9A59A]">Submitted {formatDate(pendingRequest.request_date)}</span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Advisor Request Pending: {pendingRequest.advisor_name}
                </h3>
                <p className="text-xs text-[#A9A59A] max-w-xl">
                  {pendingRequest.message || 'Your advisor request has been submitted. Waiting for the advisor to review your request.'}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[#A9A59A] pt-1">
                  <span>Specialization: <strong className="text-[#F5F1E6]">{pendingRequest.advisor_specialization}</strong></span>
                  <span>Email: <strong className="text-[#F5F1E6]">{pendingRequest.advisor_email}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
            >
              Cancel Request
            </button>
          </div>

          <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl text-xs text-[#A9A59A] flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your advisor has received your request and portfolio details. Once reviewed, you will receive an instant alert and this dashboard will unlock complete fiduciary services.
            </span>
          </div>
        </div>
      ) : (
        /* ================= CASE 1: NO ADVISOR ASSIGNED ================= */
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/5">
            <UserCheck className="w-8 h-8 opacity-70" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
              Status: No Advisor Assigned
            </span>
            <h3 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-2">
              My Financial Advisor
            </h3>
            <p className="text-xs text-[#A9A59A] max-w-lg mx-auto leading-relaxed">
              You don't have a financial advisor yet. Browse our available advisors and request one to manage your financial planning.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#advisors-directory"
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" /> Find Financial Advisor
            </a>
            <Link
              to="/dashboard"
              className="px-4 py-2.5 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] text-[#F5F1E6] font-semibold text-xs rounded-xl transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* ================= AVAILABLE FINANCIAL ADVISORS DIRECTORY ================= */}
      {(!advisor || pendingRequest) && (
        <div id="advisors-directory" className="space-y-5 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Available Financial Advisors Directory
              </h2>
              <p className="text-xs text-[#A9A59A]">
                Select a licensed fiduciary advisor tailored to your private banking & investment objectives
              </p>
            </div>

            <div className="text-xs text-[#A9A59A]">
              Showing <strong className="text-[#D4AF37]">{filteredAdvisors.length}</strong> eligible advisors
            </div>
          </div>

          {/* Directory Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#171714] border border-[#2B2A24] p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A9A59A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search advisor by name, email, or specialization..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 rounded-xl pl-9 pr-3 py-2 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {specializations.length > 0 && (
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] font-medium rounded-xl px-3 py-2 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Directory Grid */}
          {loadingDirectory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-56 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
              ))}
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#171714] border border-[#2B2A24] text-center space-y-2">
              <Users className="w-8 h-8 text-[#A9A59A] mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-[#F5F1E6]">No Financial Advisors Found</h4>
              <p className="text-xs text-[#A9A59A]">No active advisors match your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAdvisors.map((adv) => {
                const isPendingToThis = pendingRequest?.advisor_id === adv.id
                const isAssignedToThis = advisor?.id === adv.id
                const isActionDisabled = Boolean(advisor) || Boolean(pendingRequest)

                return (
                  <div
                    key={adv.id}
                    className="bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37]/50 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          {adv.profile_image ? (
                            <img
                              src={adv.profile_image}
                              alt={adv.full_name}
                              className="w-14 h-14 rounded-2xl object-cover border border-[#D4AF37]/30"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-extrabold text-xl flex items-center justify-center shrink-0">
                              {adv.full_name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                                {adv.full_name}
                              </h3>
                            </div>
                            <span className="text-[10px] text-[#A9A59A] block">{adv.email}</span>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {adv.availability_status || 'Accepting Clients'}
                            </span>
                          </div>
                        </div>

                        {isPendingToThis ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Requested
                          </span>
                        ) : isAssignedToThis ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                            Current Advisor
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[#A9A59A]">
                          <span>Specialization:</span>
                          <span className="text-[#F5F1E6] font-semibold">{adv.specialization}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#A9A59A]">
                          <span>Experience:</span>
                          <span className="text-[#D4AF37] font-semibold">{adv.experience}</span>
                        </div>
                      </div>

                      {adv.bio && (
                        <p className="text-[11px] text-[#A9A59A] mt-3 line-clamp-2 leading-relaxed">
                          {adv.bio}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#2B2A24] flex items-center gap-2.5">
                      <button
                        onClick={() => setSelectedAdvisorDetail(adv)}
                        className="flex-1 py-2 bg-[#21201B] hover:bg-[#2B2A24] border border-[#2B2A24] text-xs font-bold text-[#F5F1E6] rounded-xl transition-all cursor-pointer"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => handleOpenRequestModal(adv)}
                        disabled={isActionDisabled}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isActionDisabled
                            ? 'bg-[#21201B] text-[#A9A59A] opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] shadow-md shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isPendingToThis ? 'Pending' : 'Request Advisor'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= REQUEST HISTORY SECTION ================= */}
      {requestHistory.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#2B2A24]">
          <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" /> Advisor Request History
          </h3>

          <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl overflow-hidden divide-y divide-[#2B2A24]/60">
            {requestHistory.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F5F1E6]">{item.advisor_name}</span>
                    <span className="text-[11px] text-[#A9A59A]">({item.advisor_specialization})</span>
                  </div>
                  <p className="text-[11px] text-[#A9A59A]">
                    Submitted: {formatDate(item.request_date)}
                    {item.accepted_at && <span className="text-emerald-400"> • Accepted {formatDate(item.accepted_at)}</span>}
                    {item.rejected_at && <span className="text-red-400"> • Declined {formatDate(item.rejected_at)}</span>}
                    {item.cancelled_at && <span className="text-[#A9A59A]"> • Cancelled {formatDate(item.cancelled_at)}</span>}
                  </p>
                  {item.rejection_reason && (
                    <p className="text-[10px] text-red-300 italic">
                      Advisor note: "{item.rejection_reason}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {getStatusBadge(item.status)}
                  {item.status === 'PENDING' && (
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW ADVISOR PROFILE DETAIL ================= */}
      {selectedAdvisorDetail && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-extrabold text-2xl flex items-center justify-center shrink-0">
                  {selectedAdvisorDetail.full_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    {selectedAdvisorDetail.full_name}
                  </h3>
                  <p className="text-xs text-[#D4AF37]">{selectedAdvisorDetail.designation || 'Senior Financial Advisor'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdvisorDetail(null)}
                className="p-1 text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[#A9A59A]">
                  <span>Specialization:</span>
                  <span className="font-bold text-[#F5F1E6]">{selectedAdvisorDetail.specialization}</span>
                </div>
                <div className="flex items-center justify-between text-[#A9A59A]">
                  <span>Track Record:</span>
                  <span className="font-bold text-[#D4AF37]">{selectedAdvisorDetail.experience}</span>
                </div>
                <div className="flex items-center justify-between text-[#A9A59A]">
                  <span>Availability:</span>
                  <span className="font-bold text-emerald-400">{selectedAdvisorDetail.availability_status}</span>
                </div>
                <div className="flex items-center justify-between text-[#A9A59A]">
                  <span>Official Email:</span>
                  <span className="font-mono text-[#F5F1E6]">{selectedAdvisorDetail.email}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#A9A59A] uppercase tracking-wider mb-1">
                  Professional Bio & Philosophy
                </h4>
                <p className="text-xs text-[#F5F1E6] bg-[#0B0B0A] border border-[#2B2A24] p-3 rounded-xl leading-relaxed">
                  {selectedAdvisorDetail.bio}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedAdvisorDetail(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={Boolean(advisor) || Boolean(pendingRequest)}
                onClick={() => {
                  handleOpenRequestModal(selectedAdvisorDetail)
                  setSelectedAdvisorDetail(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                Request This Advisor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMIT ADVISOR REQUEST ================= */}
      {requestModalAdvisor && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitRequest}
            className="bg-[#171714] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    Request Financial Advisor
                  </h3>
                  <p className="text-xs text-[#A9A59A]">
                    {requestModalAdvisor.full_name} ({requestModalAdvisor.specialization})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalAdvisor(null)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#F5F1E6] leading-relaxed">
                By submitting this request, <strong className="text-[#D4AF37]">{requestModalAdvisor.full_name}</strong> will receive your private wealth profile and will review your advisory request.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">
                  Optional Message to Advisor
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g., Seeking wealth coaching for equity compounding and family retirement milestones..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRequestModalAdvisor(null)}
                disabled={requestSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {requestSubmitting ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: CANCEL PENDING REQUEST ================= */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-red-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Cancel Advisor Request
                </h3>
                <p className="text-xs text-[#A9A59A]">Revoke pending submission</p>
              </div>
            </div>

            <p className="text-xs text-[#F5F1E6] leading-relaxed">
              Are you sure you want to cancel your pending advisor request to <strong className="text-[#D4AF37]">{pendingRequest?.advisor_name}</strong>? You will be able to select and request another advisor immediately.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleCancelPendingRequest}
                disabled={cancelSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {cancelSubmitting ? 'Cancelling...' : 'Yes, Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SCHEDULE CONSULTATION ================= */}
      {consultModalOpen && advisor && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    Consultation with {advisor.full_name}
                  </h3>
                  <p className="text-xs text-[#A9A59A]">{advisor.specialization}</p>
                </div>
              </div>
              <button
                onClick={() => setConsultModalOpen(false)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {consultSent ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-[#F5F1E6]">Message Dispatched</h4>
                <p className="text-xs text-[#A9A59A]">
                  Your message has been sent to {advisor.full_name}. They will respond to {advisor.email} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Quarterly Portfolio Rebalance Review"
                    value={consultSubject}
                    onChange={(e) => setConsultSubject(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Message Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detail your financial query, target timeline, or capital allocation question..."
                    value={consultMessage}
                    onChange={(e) => setConsultMessage(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
