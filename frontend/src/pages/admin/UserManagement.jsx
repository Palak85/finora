import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  RefreshCw
} from 'lucide-react'
import { adminService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatters'

export const UserManagement = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewModalUser, setViewModalUser] = useState(null)
  const [editModalUser, setEditModalUser] = useState(null)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null)
  const [statusConfirmUser, setStatusConfirmUser] = useState(null)

  // Form states
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    phone: '',
    is_active: true,
  })
  const [createError, setCreateError] = useState('')
  const [actionMessage, setActionMessage] = useState(null)

  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      const res = await adminService.getUsers()
      if (res.data?.success) {
        setUsers(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(u.id).includes(searchTerm)

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.is_active) ||
        (statusFilter === 'INACTIVE' && !u.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  // Paginated records
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(start, start + itemsPerPage)
  }, [filteredUsers, currentPage, itemsPerPage])

  const showToast = (message, type = 'success') => {
    setActionMessage({ message, type })
    setTimeout(() => setActionMessage(null), 3500)
  }

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateError('')
    try {
      const res = await adminService.createUser(createForm)
      if (res.data?.success) {
        showToast(`User ${createForm.email} created successfully.`, 'success')
        setCreateModalOpen(false)
        setCreateForm({
          full_name: '',
          email: '',
          password: '',
          role: 'CUSTOMER',
          phone: '',
          is_active: true,
        })
        fetchUsers()
      } else {
        setCreateError(res.data?.message || 'Failed to create user.')
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error occurred while creating user.')
    }
  }

  // Handle Change Role
  const handleChangeRole = async (targetUser, newRole) => {
    if (targetUser.id === currentUser?.id) {
      showToast('Security Violation: You cannot alter your own Administrator role.', 'error')
      return
    }
    try {
      const res = await adminService.updateUser(targetUser.id, { role: newRole })
      if (res.data?.success) {
        showToast(`Role for ${targetUser.email} changed to ${newRole}.`, 'success')
        fetchUsers()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role.', 'error')
    }
  }

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async () => {
    if (!statusConfirmUser) return
    if (statusConfirmUser.id === currentUser?.id) {
      showToast('Security Violation: You cannot deactivate your own account.', 'error')
      setStatusConfirmUser(null)
      return
    }

    const newStatus = !statusConfirmUser.is_active
    try {
      const res = await adminService.updateUser(statusConfirmUser.id, { is_active: newStatus })
      if (res.data?.success) {
        showToast(
          `User ${statusConfirmUser.email} has been ${newStatus ? 'activated' : 'deactivated'}.`,
          'success'
        )
        setStatusConfirmUser(null)
        fetchUsers()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error')
      setStatusConfirmUser(null)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return
    if (deleteConfirmUser.id === currentUser?.id) {
      showToast('Security Violation: You cannot delete your own Administrator account.', 'error')
      setDeleteConfirmUser(null)
      return
    }

    try {
      const res = await adminService.deleteUser(deleteConfirmUser.id)
      if (res.data?.success) {
        showToast(`User ${deleteConfirmUser.email} deleted successfully.`, 'success')
        setDeleteConfirmUser(null)
        fetchUsers()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error')
      setDeleteConfirmUser(null)
    }
  }

  // Handle Edit User Save
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editModalUser) return
    try {
      const res = await adminService.updateUser(editModalUser.id, {
        full_name: editModalUser.full_name,
        phone: editModalUser.phone,
        role: editModalUser.role,
        is_active: editModalUser.is_active,
      })
      if (res.data?.success) {
        showToast('User details updated successfully.', 'success')
        setEditModalUser(null)
        fetchUsers()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save changes.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs transition-all ${
            actionMessage.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-200'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {actionMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{actionMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <Users className="w-3 h-3" /> Access &amp; Identity Control
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            User Management Directory
          </h1>
          <p className="text-xs text-[#A9A59A]">
            Manage platform members, assign RBAC access roles, and control account activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="px-3 py-2 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37] text-xs font-semibold text-[#F5F1E6] rounded-xl flex items-center gap-1.5 transition-all"
            title="Refresh directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-[#D4AF37] hover:brightness-110 text-xs font-bold text-[#0B0B0A] rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/10"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F1E6] placeholder-[#A9A59A]/60 focus:border-[#D4AF37] outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-transparent text-xs text-[#F5F1E6] outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="FINANCIAL_ADVISOR">Financial Advisor</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-transparent text-xs text-[#F5F1E6] outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <span className="text-xs text-[#A9A59A] px-2 whitespace-nowrap">
            {filteredUsers.length} of {users.length} Users
          </span>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[11px] font-bold text-[#A9A59A] uppercase tracking-wider">
                <th className="py-4 px-5">User ID</th>
                <th className="py-4 px-5">Full Name</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Registration Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2A24] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#A9A59A] animate-pulse">
                    Loading users directory...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#A9A59A]">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isCurrentAdmin = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="hover:bg-[#21201B]/50 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-5 font-mono text-[#A9A59A] font-semibold">
                        #{u.id}
                      </td>

                      {/* Full Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-[#F5F1E6] block">{u.full_name}</span>
                            {isCurrentAdmin && (
                              <span className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1">
                                (You / Current Admin)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-5 text-[#A9A59A] font-medium">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-5">
                        {isCurrentAdmin ? (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            ADMINISTRATOR
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value)}
                            className="bg-[#0B0B0A] border border-[#2B2A24] text-xs font-semibold rounded-xl px-2.5 py-1 text-[#D4AF37] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="FINANCIAL_ADVISOR">Financial Advisor</option>
                            <option value="ADMINISTRATOR">Administrator</option>
                          </select>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.is_active
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active ? 'bg-emerald-400' : 'bg-zinc-400'
                            }`}
                          />
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-5 text-[#A9A59A]">
                        {formatDate(u.date_joined)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setViewModalUser(u)}
                            className="p-1.5 text-[#A9A59A] hover:text-[#D4AF37] hover:bg-[#0B0B0A] rounded-lg transition-all"
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit permitted details */}
                          <button
                            onClick={() => setEditModalUser({ ...u })}
                            className="p-1.5 text-[#A9A59A] hover:text-blue-400 hover:bg-[#0B0B0A] rounded-lg transition-all"
                            title="Edit user details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => setStatusConfirmUser(u)}
                            disabled={isCurrentAdmin}
                            className={`p-1.5 rounded-lg transition-all ${
                              isCurrentAdmin
                                ? 'opacity-30 cursor-not-allowed text-[#A9A59A]'
                                : u.is_active
                                ? 'text-amber-400/80 hover:text-amber-400 hover:bg-[#0B0B0A]'
                                : 'text-emerald-400/80 hover:text-emerald-400 hover:bg-[#0B0B0A]'
                            }`}
                            title={
                              isCurrentAdmin
                                ? 'Cannot deactivate self'
                                : u.is_active
                                ? 'Deactivate account'
                                : 'Activate account'
                            }
                          >
                            {u.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            disabled={isCurrentAdmin}
                            className={`p-1.5 rounded-lg transition-all ${
                              isCurrentAdmin
                                ? 'opacity-30 cursor-not-allowed text-[#A9A59A]'
                                : 'text-red-400/80 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={isCurrentAdmin ? 'Cannot delete self' : 'Delete user'}
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#2B2A24] flex items-center justify-between text-xs text-[#A9A59A]">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D4AF37]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-[#F5F1E6]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-[#0B0B0A] border border-[#2B2A24] text-[#F5F1E6] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D4AF37]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. CREATE USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-3">
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#D4AF37]" /> Create New Platform User
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="elena@finora.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  placeholder="Secure 8+ chars"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A59A] font-semibold mb-1">Assigned Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="FINANCIAL_ADVISOR">Financial Advisor</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A9A59A] font-semibold mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                    className="accent-[#D4AF37] w-4 h-4 rounded"
                  />
                  <span className="text-[#F5F1E6] font-semibold">Account Active Immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2B2A24]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-2 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl text-[#A9A59A] hover:text-[#F5F1E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl hover:brightness-110"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. VIEW USER DETAILS MODAL */}
      {viewModalUser && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-3">
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D4AF37]" /> User Profile &amp; Metadata
              </h3>
              <button
                onClick={() => setViewModalUser(null)}
                className="p-1 rounded-full bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-lg flex items-center justify-center border border-[#D4AF37]/30">
                  {viewModalUser.full_name ? viewModalUser.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#F5F1E6]">{viewModalUser.full_name}</h4>
                  <p className="text-[#A9A59A] text-[11px]">{viewModalUser.email}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37]">
                    {viewModalUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-[#2B2A24]">
                  <span className="text-[#A9A59A]">User ID</span>
                  <span className="font-mono text-[#F5F1E6]">#{viewModalUser.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B2A24]">
                  <span className="text-[#A9A59A]">Account Status</span>
                  <span className={viewModalUser.is_active ? 'text-emerald-400 font-semibold' : 'text-zinc-400 font-semibold'}>
                    {viewModalUser.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B2A24]">
                  <span className="text-[#A9A59A]">Phone Number</span>
                  <span className="text-[#F5F1E6]">{viewModalUser.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B2A24]">
                  <span className="text-[#A9A59A]">Registration Date</span>
                  <span className="text-[#F5F1E6]">{formatDate(viewModalUser.date_joined)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B2A24]">
                  <span className="text-[#A9A59A]">Last Login</span>
                  <span className="text-[#F5F1E6]">
                    {viewModalUser.last_login ? formatDate(viewModalUser.last_login) : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2B2A24]">
              <button
                onClick={() => setViewModalUser(null)}
                className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl text-xs hover:brightness-110"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EDIT USER DETAILS MODAL */}
      {editModalUser && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-3">
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" /> Edit Permitted Details
              </h3>
              <button
                onClick={() => setEditModalUser(null)}
                className="p-1 rounded-full bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Email (Permanent)</label>
                <input
                  type="email"
                  value={editModalUser.email}
                  disabled
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#A9A59A] opacity-60 cursor-not-allowed outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editModalUser.full_name}
                  onChange={(e) => setEditModalUser({ ...editModalUser, full_name: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={editModalUser.phone || ''}
                  onChange={(e) => setEditModalUser({ ...editModalUser, phone: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Role</label>
                <select
                  value={editModalUser.role}
                  disabled={editModalUser.id === currentUser?.id}
                  onChange={(e) => setEditModalUser({ ...editModalUser, role: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] outline-none focus:border-[#D4AF37]"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="FINANCIAL_ADVISOR">Financial Advisor</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
                {editModalUser.id === currentUser?.id && (
                  <p className="text-[10px] text-red-400 mt-1">Cannot alter your own Administrator role.</p>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModalUser.is_active}
                    disabled={editModalUser.id === currentUser?.id}
                    onChange={(e) => setEditModalUser({ ...editModalUser, is_active: e.target.checked })}
                    className="accent-[#D4AF37] w-4 h-4 rounded"
                  />
                  <span className="text-[#F5F1E6] font-semibold">Account Active</span>
                </label>
                {editModalUser.id === currentUser?.id && (
                  <p className="text-[10px] text-red-400 mt-1">Cannot deactivate your own account.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2B2A24]">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-3 py-2 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl text-[#A9A59A] hover:text-[#F5F1E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl hover:brightness-110"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CONFIRM STATUS TOGGLE MODAL */}
      {statusConfirmUser && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                Confirm Status Change
              </h3>
            </div>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              Are you sure you want to{' '}
              <span className="font-bold text-[#F5F1E6]">
                {statusConfirmUser.is_active ? 'deactivate' : 'activate'}
              </span>{' '}
              the account for <span className="text-[#D4AF37] font-semibold">{statusConfirmUser.email}</span>?
              {statusConfirmUser.is_active && ' They will be immediately blocked from signing in.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B2A24]">
              <button
                onClick={() => setStatusConfirmUser(null)}
                className="px-3 py-1.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl text-xs text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                  statusConfirmUser.is_active
                    ? 'bg-amber-500 text-[#0B0B0A] hover:brightness-110'
                    : 'bg-emerald-500 text-[#0B0B0A] hover:brightness-110'
                }`}
              >
                Confirm {statusConfirmUser.is_active ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRM DELETE MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-red-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                Confirm User Deletion
              </h3>
            </div>
            <p className="text-xs text-[#A9A59A] leading-relaxed">
              This will permanently delete the user record for{' '}
              <span className="text-[#F5F1E6] font-bold">{deleteConfirmUser.full_name}</span> (
              <span className="text-red-400">{deleteConfirmUser.email}</span>).
              This action will be logged in the immutable audit trail.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B2A24]">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3 py-1.5 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl text-xs text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-[#F5F1E6] rounded-xl text-xs font-bold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

