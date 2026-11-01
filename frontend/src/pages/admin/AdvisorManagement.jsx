import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Sparkles,
  Edit,
  Power,
  ChevronRight,
  Eye,
  X,
  UserCheck,
  Plus,
  Compass,
  Award
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { adminService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

export const AdvisorManagement = () => {
  const location = useLocation()
  const [advisors, setAdvisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Add Advisor Modal State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Wealth Management',
    experience: '8+ Years Fiduciary Advisory',
    bio: '',
  })
  const [addSubmitting, setAddSubmitting] = useState(false)

  // Edit Modal State
  const [editAdvisor, setEditAdvisor] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSpec, setEditSpec] = useState('')
  const [editExp, setEditExp] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Assigned Clients Modal
  const [clientModalAdvisor, setClientModalAdvisor] = useState(null)

  // Toggle Status Modal
  const [toggleAdvisor, setToggleAdvisor] = useState(null)
  const [toggleSubmitting, setToggleSubmitting] = useState(false)

  const fetchAdvisors = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getAdvisors()
      if (res.data?.success) {
        setAdvisors(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to load advisors:', err)
      setError('Failed to load financial advisors list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvisors()
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'add') {
      setAddModalOpen(true)
    }
  }, [location.search])

  const handleOpenAdd = () => {
    setAddForm({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      specialization: 'Wealth Management',
      experience: '8+ Years Fiduciary Advisory',
      bio: '',
    })
    setActionError('')
    setAddModalOpen(true)
  }

  const handleCreateAdvisor = async (e) => {
    e.preventDefault()
    setAddSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.createUser({
        ...addForm,
        role: 'FINANCIAL_ADVISOR',
      })
      if (res.data?.success) {
        setActionSuccess(`Advisor ${addForm.full_name} registered successfully.`)
        setAddModalOpen(false)
        await fetchAdvisors()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register advisor.')
    } finally {
      setAddSubmitting(false)
    }
  }

  const handleOpenEdit = (adv) => {
    setEditAdvisor(adv)
    setEditName(adv.full_name || '')
    setEditPhone(adv.phone || '')
    setEditSpec(adv.specialization || '')
    setEditExp(adv.experience || '')
    setEditBio(adv.bio || '')
    setActionError('')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editAdvisor) return
    setEditSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.updateAdvisor(editAdvisor.id, {
        full_name: editName,
        phone: editPhone,
        specialization: editSpec,
        experience: editExp,
        bio: editBio,
      })
      if (res.data?.success) {
        setActionSuccess(`Advisor ${editName} updated successfully.`)
        setEditAdvisor(null)
        await fetchAdvisors()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update advisor.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!toggleAdvisor) return
    setToggleSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.toggleAdvisorStatus(toggleAdvisor.id)
      if (res.data?.success) {
        setActionSuccess(res.data.message)
        setToggleAdvisor(null)
        await fetchAdvisors()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to toggle advisor status.')
    } finally {
      setToggleSubmitting(false)
    }
  }

  // Filter advisors
  const filteredAdvisors = advisors.filter((adv) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      adv.full_name?.toLowerCase().includes(q) ||
      adv.email?.toLowerCase().includes(q) ||
      adv.specialization?.toLowerCase().includes(q)

    let matchesStatus = true
    if (statusFilter === 'ACTIVE') {
      matchesStatus = adv.is_active === true
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = adv.is_active === false
    }

    return matchesSearch && matchesStatus
  })

  // Metrics
  const totalCount = advisors.length
  const activeCount = advisors.filter((a) => a.is_active).length
  const totalAssignedClients = advisors.reduce((acc, a) => acc + (a.assigned_customer_count || 0), 0)
  const totalPendingInquiries = advisors.reduce((acc, a) => acc + (a.pending_request_count || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Fiduciary Oversight
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
              Staff Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            Advisor Management
          </h1>
          <p className="text-xs text-[#A9A59A]">
            View all advisors, their profiles, active status, customer assignments and capacity.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Financial Advisor
        </button>
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

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">Total Advisors</div>
          <div className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{totalCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Licensed platform staff</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Advisors</div>
          <div className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">{activeCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Accepting client mandates</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">Assigned Clients</div>
          <div className="text-2xl font-bold text-[#D4AF37] font-['Space_Grotesk']">{totalAssignedClients}</div>
          <div className="text-[10px] text-[#A9A59A]">Active fiduciary accounts</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Inquiries</div>
          <div className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">{totalPendingInquiries}</div>
          <div className="text-[10px] text-[#A9A59A]">Awaiting advisor response</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#171714] border border-[#2B2A24] p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A9A59A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search advisors by name, email, specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 rounded-xl pl-9 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F5F1E6] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="INACTIVE">Deactivated Staff</option>
            </select>
          </div>

          <div className="text-xs text-[#A9A59A]">
            Showing <strong className="text-[#D4AF37]">{filteredAdvisors.length}</strong> of {totalCount}
          </div>
        </div>
      </div>

      {/* Main Advisors Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#A9A59A] animate-pulse bg-[#171714] border border-[#2B2A24] rounded-3xl">
          Loading Financial Advisors Directory...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-red-400 bg-[#171714] border border-red-500/30 rounded-3xl space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <p>{error}</p>
          <button
            onClick={fetchAdvisors}
            className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl mt-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredAdvisors.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#A9A59A] bg-[#171714] border border-[#2B2A24] rounded-3xl space-y-2">
          <Users className="w-8 h-8 text-[#A9A59A] mx-auto opacity-40" />
          <p className="font-semibold text-[#F5F1E6]">No Financial Advisors Found</p>
          <p>No advisor records match your search query.</p>
        </div>
      ) : (
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Advisor Profile</th>
                  <th className="py-3.5 px-4">Specialization & Experience</th>
                  <th className="py-3.5 px-4">Customer Assignments & Capacity</th>
                  <th className="py-3.5 px-4">Pending Requests</th>
                  <th className="py-3.5 px-4">Active Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A24]/60">
                {filteredAdvisors.map((adv) => {
                  const maxCap = adv.max_capacity || 15
                  const assignedCount = adv.assigned_customer_count || 0
                  const capPercent = Math.min(100, Math.round((assignedCount / maxCap) * 100))

                  return (
                    <tr key={adv.id} className="hover:bg-[#1c1b17] transition-colors">
                      {/* Advisor Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-[#0B0B0A] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md">
                            {adv.full_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-[#F5F1E6]">{adv.full_name}</div>
                            <div className="text-[11px] text-[#A9A59A] flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-[#D4AF37]" />
                              <span>{adv.email}</span>
                            </div>
                            <div className="text-[11px] text-[#A9A59A] flex items-center gap-1.5 font-mono">
                              <Phone className="w-3 h-3 text-[#A9A59A]" />
                              <span>{adv.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specialization & Experience */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-semibold text-[#F5F1E6] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{adv.specialization}</span>
                        </div>
                        <div className="text-[11px] text-[#A9A59A] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#A9A59A]" />
                          <span>{adv.experience}</span>
                        </div>
                      </td>

                      {/* Customer Assignments & Capacity */}
                      <td className="py-3.5 px-4 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-bold text-[#F5F1E6]">
                            {assignedCount} / {maxCap} Clients
                          </span>
                          <span className="text-[#A9A59A] font-mono text-[10px]">
                            {capPercent}% Capacity
                          </span>
                        </div>
                        <div className="w-32 bg-[#0B0B0A] h-2 rounded-full overflow-hidden border border-[#2B2A24]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              capPercent >= 90
                                ? 'bg-red-500'
                                : capPercent >= 70
                                ? 'bg-amber-400'
                                : 'bg-[#D4AF37]'
                            }`}
                            style={{ width: `${capPercent}%` }}
                          />
                        </div>
                        <button
                          onClick={() => setClientModalAdvisor(adv)}
                          className="text-[10px] text-[#D4AF37] hover:underline block pt-0.5 cursor-pointer"
                        >
                          View Assigned Clients ({assignedCount}) →
                        </button>
                      </td>

                      {/* Pending Inquiries */}
                      <td className="py-3.5 px-4">
                        {adv.pending_request_count > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {adv.pending_request_count} Pending Review
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#A9A59A]">None pending</span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        {adv.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Active Staff
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle className="w-3 h-3 text-red-400" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(adv)}
                            title="Edit Advisor Profile"
                            className="p-1.5 rounded-lg bg-[#21201B] hover:bg-[#2B2A24] text-[#A9A59A] hover:text-[#F5F1E6] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setToggleAdvisor(adv)}
                            title={adv.is_active ? 'Deactivate Advisor Staff' : 'Activate Advisor Staff'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              adv.is_active
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD FINANCIAL ADVISOR ================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Add New Financial Advisor
                </h3>
                <p className="text-xs text-[#A9A59A]">
                  Register a licensed fiduciary advisor with advisory profile & capacity
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdvisor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Sarah Jenkins"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="advisor@finora.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 11111"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="Wealth Management, Equities..."
                    value={addForm.specialization}
                    onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="8+ Years Fiduciary Advisory"
                    value={addForm.experience}
                    onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  placeholder="Professional background, portfolio governance expertise, certifications..."
                  value={addForm.bio}
                  onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  disabled={addSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {addSubmitting ? 'Creating Advisor...' : 'Create Advisor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ADVISOR PROFILE ================= */}
      {editAdvisor && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Edit Advisor Profile
                </h3>
                <p className="text-xs text-[#A9A59A]">{editAdvisor.email}</p>
              </div>
              <button
                onClick={() => setEditAdvisor(null)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={editSpec}
                  onChange={(e) => setEditSpec(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Experience</label>
                <input
                  type="text"
                  value={editExp}
                  onChange={(e) => setEditExp(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl p-3 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditAdvisor(null)}
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {editSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGNED CLIENTS INSPECTION ================= */}
      {clientModalAdvisor && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Assigned Wealth Clients
                </h3>
                <p className="text-xs text-[#A9A59A]">Advisor: {clientModalAdvisor.full_name}</p>
              </div>
              <button
                onClick={() => setClientModalAdvisor(null)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(!clientModalAdvisor.assigned_customers || clientModalAdvisor.assigned_customers.length === 0) ? (
              <div className="py-8 text-center text-xs text-[#A9A59A] space-y-1">
                <Users className="w-8 h-8 text-[#A9A59A] mx-auto opacity-40" />
                <p className="font-semibold text-[#F5F1E6]">No Clients Assigned</p>
                <p>This advisor currently has 0 active customer assignments.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clientModalAdvisor.assigned_customers.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#F5F1E6]">{c.full_name}</div>
                      <div className="text-[11px] text-[#A9A59A]">{c.email}</div>
                      {c.assigned_date && (
                        <div className="text-[10px] text-[#D4AF37]">
                          Assigned: {formatDate(c.assigned_date)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setClientModalAdvisor(null)}
                className="w-full py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#F5F1E6] hover:bg-[#21201B] cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOGGLE ACTIVE STATUS ================= */}
      {toggleAdvisor && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  toggleAdvisor.is_active
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Power className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                {toggleAdvisor.is_active ? 'Deactivate Advisor Staff?' : 'Activate Advisor Staff?'}
              </h3>
              <p className="text-xs text-[#A9A59A]">
                {toggleAdvisor.is_active
                  ? `Deactivating ${toggleAdvisor.full_name} will suspend their login access and client requests immediately.`
                  : `Activating ${toggleAdvisor.full_name} will enable login and allow wealth clients to select them.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setToggleAdvisor(null)}
                disabled={toggleSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={toggleSubmitting}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer ${
                  toggleAdvisor.is_active
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                {toggleSubmitting
                  ? 'Processing...'
                  : toggleAdvisor.is_active
                  ? 'Yes, Deactivate'
                  : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvisorManagement

