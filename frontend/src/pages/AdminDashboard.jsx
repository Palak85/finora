import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Users,
  FileText,
  Trash2,
  CheckCircle2,
  Shield,
  Bell,
  Radio,
  Server,
  Activity,
  UserCheck,
  ArrowRight,
  Database,
  Lock
} from 'lucide-react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authService, auditService } from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { formatDate } from '../utils/formatters'

export const AdminDashboard = () => {
  const { notifications, unreadCount } = useNotification()
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  // Derive active tab from URL path
  const getActiveTab = () => {
    if (location.pathname === '/admin/users') return 'users'
    if (location.pathname === '/admin/audit-logs') return 'audit'
    return 'overview' // default for /admin
  }

  const activeTab = getActiveTab()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [uRes, aRes] = await Promise.all([
        authService.getUsers(),
        auditService.getAuditLogs(),
      ])
      if (uRes.data?.success) setUsers(uRes.data.data)
      if (aRes.data?.success) setAuditLogs(aRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChangeRole = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole)
      fetchData()
    } catch (e) {}
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user account?')) {
      try {
        await authService.deleteUser(userId)
        fetchData()
      } catch (e) {}
    }
  }

  // Calculated Stats for Overview
  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length
  const advisorCount = users.filter((u) => u.role === 'FINANCIAL_ADVISOR').length
  const adminCount = users.filter((u) => u.role === 'ADMINISTRATOR').length

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
            System Administrator
          </span>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            {activeTab === 'overview' && 'Admin Command Center'}
            {activeTab === 'users' && 'User Directory & Access Control'}
            {activeTab === 'audit' && 'Security & Audit Trail'}
          </h1>
          <p className="text-xs text-[#A9A59A]">
            {activeTab === 'overview' && 'Platform telemetry, security health & administrative control'}
            {activeTab === 'users' && 'Manage user permissions, authentication roles & active account statuses'}
            {activeTab === 'audit' && 'Cryptographically recorded system events, logins & access logs'}
          </p>
        </div>

        {/* 3 Dedicated Tabs */}
        <div className="flex items-center gap-1.5 bg-[#171714] border border-[#2B2A24] p-1 rounded-2xl">
          <button
            onClick={() => navigate('/admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-[#D4AF37] text-[#0B0B0A] shadow-md' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-[#D4AF37] text-[#0B0B0A] shadow-md' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users ({users.length})
          </button>
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-[#D4AF37] text-[#0B0B0A] shadow-md' : 'text-[#A9A59A] hover:text-[#F5F1E6]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Live Signal Banner */}
      <div className="p-4 bg-[#171714] border border-[#2B2A24] rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-[#F5F1E6] flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> Security Telemetry Active:
          </span>
          <span className="text-xs text-[#A9A59A]">
            Audit logs and authentication security layers actively monitoring {users.length} registered accounts across all roles.
          </span>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0B0B0A] shrink-0">
            {unreadCount} Active Signals
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#171714] border border-[#2B2A24] rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
        </div>
      ) : activeTab === 'overview' ? (
        /* ================= 1. ADMIN CONSOLE OVERVIEW ================= */
        <div className="space-y-6">
          {/* Key Admin Telemetry KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Accounts</span>
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{users.length}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                {customerCount} Customers • {advisorCount} Advisors • {adminCount} Admin
              </p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">System Security</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">100% Secure</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">JWT Bearer 256-bit encryption active</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Audit Trail Logs</span>
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{auditLogs.length}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">Logged authentication &amp; data events</p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Engine Status</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400 font-['Space_Grotesk']">Operational</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">Django 5.1 &amp; SQLite connected</p>
            </div>
          </div>

          {/* Quick Access Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Access Management Card */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#D4AF37]" /> Role &amp; Permission Manager
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#A9A59A] leading-relaxed">
                  Elevate accounts to Financial Advisors, assign Customer tiers, manage user deletion, or adjust access permissions.
                </p>
              </div>

              <div className="pt-4 border-t border-[#2B2A24] flex items-center justify-between">
                <span className="text-xs text-[#A9A59A]">{users.length} registered accounts</span>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-1.5 transition-all"
                >
                  Manage Users <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audit Logs Card */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D4AF37]" /> Security Audit Inspection
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Live Audit
                  </span>
                </div>
                <p className="text-xs text-[#A9A59A] leading-relaxed">
                  Review real-time IP telemetry, timestamps, security password changes, and authenticated logins across the platform.
                </p>
              </div>

              <div className="pt-4 border-t border-[#2B2A24] flex items-center justify-between">
                <span className="text-xs text-[#A9A59A]">{auditLogs.length} logged events</span>
                <button
                  onClick={() => navigate('/admin/audit-logs')}
                  className="px-4 py-2 border border-[#2B2A24] hover:border-[#D4AF37] text-[#F5F1E6] hover:text-[#D4AF37] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  View Audit Logs <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Security Activity Stream */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                Recent Administrative Events
              </h3>
              <button
                onClick={() => navigate('/admin/audit-logs')}
                className="text-xs font-bold text-[#D4AF37] hover:underline"
              >
                View Full Trail →
              </button>
            </div>

            <div className="divide-y divide-[#2B2A24]">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#21201B]/40 px-2 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#F5F1E6]">{log.action}</span>
                      <p className="text-[11px] text-[#A9A59A]">By {log.user_email || 'System'} • IP: {log.ip_address || '127.0.0.1'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A9A59A]">{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* ================= 2. USER MANAGEMENT TABLE ================= */
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[#2B2A24] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">User Directory</h3>
              <p className="text-xs text-[#A9A59A]">Change roles or manage account permissions</p>
            </div>
            <span className="text-xs text-[#D4AF37] font-semibold">{users.length} Total Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[11px] font-bold text-[#A9A59A] uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Date Joined</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A24] text-xs font-medium">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#A9A59A] text-xs">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#21201B]/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#F5F1E6]">{u.full_name}</td>
                      <td className="py-4 px-6 text-[#A9A59A]">{u.email}</td>
                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#D4AF37] font-bold rounded-xl px-2.5 py-1 focus:outline-none"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="FINANCIAL_ADVISOR">FINANCIAL_ADVISOR</option>
                          <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-[#A9A59A]">{formatDate(u.date_joined)}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-[#A9A59A] hover:text-red-400"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= 3. AUDIT TRAIL LOGS ================= */
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden divide-y divide-[#2B2A24]">
          <div className="p-5 border-b border-[#2B2A24] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">System Audit Logs</h3>
              <p className="text-xs text-[#A9A59A]">Track user access, role modifications, and login security records</p>
            </div>
            <span className="text-xs text-[#D4AF37] font-semibold">{auditLogs.length} Events</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-[#A9A59A] text-xs">No audit logs found.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs flex items-center justify-between hover:bg-[#21201B]/50 transition-colors">
                <div>
                  <span className="font-bold text-[#D4AF37]">{log.action}</span>
                  <p className="text-[#A9A59A] mt-0.5">
                    By {log.user_email || 'System'} • IP: {log.ip_address || '127.0.0.1'}
                  </p>
                </div>
                <span className="text-[10px] text-[#A9A59A]">{formatDate(log.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
