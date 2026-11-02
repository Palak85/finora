import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Edit,
  Power,
  Eye,
  X,
  UserCheck,
  Clock,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { adminService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

export const CustomerManagement = () => {
  const location = useLocation()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [advisorFilter, setAdvisorFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Add Customer Modal State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [addSubmitting, setAddSubmitting] = useState(false)

  // Edit Modal State
  const [editCustomer, setEditCustomer] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Advisor & Request History Modal
  const [historyModalCustomer, setHistoryModalCustomer] = useState(null)

  // Direct Assign Advisor Modal
  const [assignModalCustomer, setAssignModalCustomer] = useState(null)
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('')
  const [availableAdvisorsList, setAvailableAdvisorsList] = useState([])
  const [loadingAdvisorsList, setLoadingAdvisorsList] = useState(false)
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  // Toggle Status Modal
  const [toggleCustomer, setToggleCustomer] = useState(null)
  const [toggleSubmitting, setToggleSubmitting] = useState(false)

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getCustomers()
      if (res.data?.success) {
        setCustomers(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to load customers:', err)
      setError('Failed to load client accounts list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
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
    })
    setActionError('')
    setAddModalOpen(true)
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setAddSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.createUser({
        ...addForm,
        role: 'CUSTOMER',
      })
      if (res.data?.success) {
        setActionSuccess(`Wealth Client ${addForm.full_name} registered successfully.`)
        setAddModalOpen(false)
        await fetchCustomers()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register wealth client.')
    } finally {
      setAddSubmitting(false)
    }
  }


  const handleOpenAssignModal = async (customer) => {
    setAssignModalCustomer(customer)
    setSelectedAdvisorId(customer.assigned_advisor?.id ? String(customer.assigned_advisor.id) : '')
    setLoadingAdvisorsList(true)
    try {
      const res = await adminService.getAdvisors()
      if (res.data?.success) {
        setAvailableAdvisorsList(res.data.data.filter((a) => a.is_active) || [])
      }
    } catch (err) {
      console.error('Failed to load active advisors:', err)
    } finally {
      setLoadingAdvisorsList(false)
    }
  }

  const handleConfirmAssignAdvisor = async (e) => {
    if (e) e.preventDefault()
    if (!assignModalCustomer) return
    setAssignSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.assignCustomerAdvisor(assignModalCustomer.id, {
        advisor_id: selectedAdvisorId || null
      })
      if (res.data?.success) {
        setActionSuccess(res.data.message || 'Advisor assignment updated successfully.')
        setAssignModalCustomer(null)
        if (historyModalCustomer && historyModalCustomer.id === assignModalCustomer.id) {
          setHistoryModalCustomer(null)
        }
        await fetchCustomers()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update advisor assignment.')
    } finally {
      setAssignSubmitting(false)
    }
  }

  const handleOpenEdit = (c) => {
    setEditCustomer(c)
    setEditName(c.full_name || '')
    setEditPhone(c.phone || '')
    setActionError('')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editCustomer) return
    setEditSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.updateCustomer(editCustomer.id, {
        full_name: editName,
        phone: editPhone,
      })
      if (res.data?.success) {
        setActionSuccess(`Client ${editName} updated successfully.`)
        setEditCustomer(null)
        await fetchCustomers()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update customer.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!toggleCustomer) return
    setToggleSubmitting(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.toggleCustomerStatus(toggleCustomer.id)
      if (res.data?.success) {
        setActionSuccess(res.data.message)
        setToggleCustomer(null)
        await fetchCustomers()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to toggle client account status.')
    } finally {
      setToggleSubmitting(false)
    }
  }

  // Filtered List
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)

    let matchesAdvisor = true
    if (advisorFilter === 'ASSIGNED') {
      matchesAdvisor = c.advisor_assignment_status === 'Advisor Assigned'
    } else if (advisorFilter === 'PENDING') {
      matchesAdvisor = c.advisor_assignment_status === 'Request Pending'
    } else if (advisorFilter === 'UNASSIGNED') {
      matchesAdvisor = c.advisor_assignment_status === 'No Advisor Assigned'
    }

    let matchesStatus = true
    if (statusFilter === 'ACTIVE') {
      matchesStatus = c.is_active === true
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = c.is_active === false
    }

    return matchesSearch && matchesAdvisor && matchesStatus
  })

  // Metrics
  const totalCount = customers.length
  const activeCount = customers.filter((c) => c.is_active).length
  const assignedCount = customers.filter((c) => c.advisor_assignment_status === 'Advisor Assigned').length
  const pendingCount = customers.filter((c) => c.advisor_assignment_status === 'Request Pending').length
  const unassignedCount = customers.filter((c) => c.advisor_assignment_status === 'No Advisor Assigned').length

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        )
      case 'ACCEPTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Accepted
          </span>
        )
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            Declined
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <Users className="w-3 h-3" /> System Governance
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
              Wealth Clients Registry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            Customer Management
          </h1>
          <p className="text-xs text-[#A9A59A]">
            View customer profiles, account status, assigned advisor and advisor request status.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Wealth Client
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">Total Clients</div>
          <div className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{totalCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Registered wealth users</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Accounts</div>
          <div className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">{activeCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Eligible for login & ops</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">With Advisor</div>
          <div className="text-2xl font-bold text-[#D4AF37] font-['Space_Grotesk']">{assignedCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Assigned to fiduciary</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Pending Requests</div>
          <div className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">{pendingCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Awaiting advisor decision</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171714] border border-[#2B2A24] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">Unassigned</div>
          <div className="text-2xl font-bold text-[#A9A59A] font-['Space_Grotesk']">{unassignedCount}</div>
          <div className="text-[10px] text-[#A9A59A]">Self-directed clients</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#171714] border border-[#2B2A24] p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A9A59A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 rounded-xl pl-9 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F5F1E6] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Advisor Statuses</option>
              <option value="ASSIGNED">Advisor Assigned</option>
              <option value="PENDING">Request Pending</option>
              <option value="UNASSIGNED">No Advisor Assigned</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F5F1E6] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Account Status</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Deactivated Accounts</option>
            </select>
          </div>

          <div className="text-xs text-[#A9A59A] px-2">
            Showing <strong className="text-[#D4AF37]">{filteredCustomers.length}</strong> of {totalCount}
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#A9A59A] animate-pulse bg-[#171714] border border-[#2B2A24] rounded-3xl">
          Loading Wealth Clients Directory...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-red-400 bg-[#171714] border border-red-500/30 rounded-3xl space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <p>{error}</p>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl mt-2 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#A9A59A] bg-[#171714] border border-[#2B2A24] rounded-3xl space-y-2">
          <Users className="w-8 h-8 text-[#A9A59A] mx-auto opacity-40" />
          <p className="font-semibold text-[#F5F1E6]">No Wealth Clients Found</p>
          <p>No client records match your search and filter criteria.</p>
        </div>
      ) : (
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Client Identity</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Advisor Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A24]/60">
                {filteredCustomers.map((c) => {
                  const hasAssigned = c.advisor_assignment_status === 'Advisor Assigned' && c.assigned_advisor
                  const isPending = c.advisor_assignment_status === 'Request Pending'

                  return (
                    <tr key={c.id} className="hover:bg-[#1c1b17] transition-colors">
                      {/* Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-[#0B0B0A] font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                            {c.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-[#F5F1E6]">{c.full_name}</div>
                            <div className="text-[11px] text-[#A9A59A] font-mono">ID #{c.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#F5F1E6]">
                          <Mail className="w-3 h-3 text-[#D4AF37]" />
                          <span>{c.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#A9A59A] font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-[#A9A59A]" />
                          <span>{c.phone}</span>
                        </div>
                      </td>

                      {/* Advisor Status */}
                      <td className="py-3.5 px-4">
                        {hasAssigned ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                              <UserCheck className="w-3 h-3 text-[#D4AF37]" />
                              {c.assigned_advisor.full_name}
                            </span>
                            <div className="text-[10px] text-[#A9A59A]">
                              {c.assigned_advisor.specialization}
                            </div>
                          </div>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                            Request Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
                            No Advisor
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        {c.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle className="w-3 h-3 text-red-400" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Registered */}
                      <td className="py-3.5 px-4 text-[#A9A59A] text-[11px]">
                        {formatDate(c.date_joined)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Assign / Change Advisor */}
                          <button
                            onClick={() => handleOpenAssignModal(c)}
                            title="Direct Assign / Reassign Advisor"
                            className="p-1.5 rounded-lg bg-[#21201B] hover:bg-[#2B2A24] text-indigo-400 hover:text-indigo-200 transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Advisor / History Inspection */}
                          <button
                            onClick={() => setHistoryModalCustomer(c)}
                            title="View Advisor & Request History"
                            className="p-1.5 rounded-lg bg-[#21201B] hover:bg-[#2B2A24] text-[#D4AF37] hover:text-[#FFF0B3] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Client Information"
                            className="p-1.5 rounded-lg bg-[#21201B] hover:bg-[#2B2A24] text-[#A9A59A] hover:text-[#F5F1E6] transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => setToggleCustomer(c)}
                            title={c.is_active ? 'Deactivate Client Account' : 'Activate Client Account'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              c.is_active
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

      {/* ================= MODAL: ADD WEALTH CLIENT ================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Add New Wealth Client
                </h3>
                <p className="text-xs text-[#A9A59A]">
                  Register a private banking customer account directly
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Amit Sharma"
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
                  placeholder="client@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

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
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Direct Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
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
                  {addSubmitting ? 'Creating Client...' : 'Create Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CUSTOMER DETAILS ================= */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Edit Client Profile
                </h3>
                <p className="text-xs text-[#A9A59A]">{editCustomer.email}</p>
              </div>
              <button
                onClick={() => setEditCustomer(null)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Direct Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
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
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADVISOR & REQUEST HISTORY INSPECTION ================= */}
      {historyModalCustomer && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    Fiduciary Relationship Telemetry
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
                  {historyModalCustomer.full_name}
                </h3>
                <p className="text-xs text-[#A9A59A]">{historyModalCustomer.email}</p>
              </div>
              <button
                onClick={() => setHistoryModalCustomer(null)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Assigned Advisor Card */}
            <div>
              <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider mb-2">
                Assigned Fiduciary Advisor
              </div>

              {historyModalCustomer.assigned_advisor ? (
                <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-[#D4AF37]/30 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#F5F1E6]">
                        {historyModalCustomer.assigned_advisor.full_name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37]/20 text-[#D4AF37]">
                        Active Advisor
                      </span>
                    </div>
                    <div className="text-xs text-[#A9A59A]">{historyModalCustomer.assigned_advisor.email}</div>
                    <div className="text-xs text-[#D4AF37]">
                      Specialization: {historyModalCustomer.assigned_advisor.specialization}
                    </div>
                    {historyModalCustomer.assigned_advisor.assigned_date && (
                      <div className="text-[10px] text-[#A9A59A]">
                        Assigned on {formatDate(historyModalCustomer.assigned_advisor.assigned_date)}
                      </div>
                    )}
                  </div>
                  <UserCheck className="w-8 h-8 text-[#D4AF37] shrink-0 opacity-80" />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] text-center text-xs text-[#A9A59A]">
                  No financial advisor is currently assigned to this client.
                </div>
              )}
            </div>

            {/* Request History Log */}
            <div>
              <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider mb-2 flex items-center justify-between">
                <span>Advisor Request Lifecycle History</span>
                <span className="text-[#D4AF37] font-semibold">{historyModalCustomer.request_history?.length || 0} Records</span>
              </div>

              {(!historyModalCustomer.request_history || historyModalCustomer.request_history.length === 0) ? (
                <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] text-center text-xs text-[#A9A59A]">
                  No advisor requests have been submitted by this client.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyModalCustomer.request_history.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-[#F5F1E6]">
                          Advisor: {req.advisor_name}
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="text-[11px] text-[#A9A59A] flex items-center justify-between">
                        <span>Submitted: {formatDate(req.request_date)}</span>
                        <span>{req.advisor_specialization}</span>
                      </div>

                      {req.message && (
                        <div className="p-2 rounded-xl bg-[#171714] text-[11px] text-[#A9A59A] border border-[#2B2A24]">
                          <span className="text-[#F5F1E6] font-medium">Message: </span>
                          {req.message}
                        </div>
                      )}

                      {req.rejection_reason && (
                        <div className="p-2 rounded-xl bg-red-500/10 text-[11px] text-red-300 border border-red-500/20">
                          <span className="font-semibold">Reason: </span>
                          {req.rejection_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setHistoryModalCustomer(null)}
                className="w-full py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#F5F1E6] hover:bg-[#21201B] cursor-pointer"
              >
                Close Telemetry Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ================= MODAL: DIRECT ASSIGN ADVISOR ================= */}
      {assignModalCustomer && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                    Assign Financial Advisor
                  </h3>
                  <p className="text-xs text-[#A9A59A]">Client: {assignModalCustomer.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalCustomer(null)}
                className="text-[#A9A59A] hover:text-[#F5F1E6] p-1.5 rounded-lg hover:bg-[#21201B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#A9A59A]">Current Advisor Status</div>
                <div className="font-bold text-[#F5F1E6]">
                  {assignModalCustomer.assigned_advisor
                    ? `${assignModalCustomer.assigned_advisor.full_name} (${assignModalCustomer.assigned_advisor.specialization || 'Wealth Management'})`
                    : 'No Financial Advisor Assigned'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">
                  Select Financial Advisor
                </label>
                {loadingAdvisorsList ? (
                  <div className="p-3 text-center text-[#A9A59A] bg-[#0B0B0A] rounded-xl border border-[#2B2A24]">
                    Loading active advisors...
                  </div>
                ) : (
                  <select
                    value={selectedAdvisorId}
                    onChange={(e) => setSelectedAdvisorId(e.target.value)}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#171714] text-[#A9A59A]">-- Unassign / No Advisor --</option>
                    {availableAdvisorsList.map((adv) => (
                      <option key={adv.id} value={adv.id} className="bg-[#171714] text-[#F5F1E6]">
                        {adv.full_name} — {adv.specialization || 'Wealth Management'} ({adv.assigned_customer_count || 0} clients)
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-[#A9A59A] mt-1.5">
                  Selecting an advisor immediately grants them fiduciary surveillance over this customer and dispatches an assignment alert.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2B2A24] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssignModalCustomer(null)}
                className="px-4 py-2 bg-[#21201B] hover:bg-[#2B2A24] text-[#F5F1E6] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignAdvisor}
                disabled={assignSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {assignSubmitting ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOGGLE ACTIVE STATUS ================= */}
      {toggleCustomer && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                  toggleCustomer.is_active
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Power className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                {toggleCustomer.is_active ? 'Deactivate Client Account?' : 'Activate Client Account?'}
              </h3>
              <p className="text-xs text-[#A9A59A]">
                {toggleCustomer.is_active
                  ? `Deactivating ${toggleCustomer.full_name} will suspend their login access immediately.`
                  : `Activating ${toggleCustomer.full_name} will restore their private banking workspace.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setToggleCustomer(null)}
                disabled={toggleSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={toggleSubmitting}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer ${
                  toggleCustomer.is_active
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                {toggleSubmitting
                  ? 'Processing...'
                  : toggleCustomer.is_active
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

export default CustomerManagement

