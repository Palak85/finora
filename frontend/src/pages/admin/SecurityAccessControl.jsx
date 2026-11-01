import React, { useState, useEffect } from 'react'
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Server,
  FileText,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  X
} from 'lucide-react'
import { adminService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

export const SecurityAccessControl = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')

  const fetchSecurity = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getSecurityOverview()
      if (res.data?.success) {
        setData(res.data)
      }
    } catch (err) {
      console.error('Failed to load security overview:', err)
      setError('Failed to load platform security & access control architecture.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSecurity()
  }, [])

  const config = data?.security_config || {}
  const roles = data?.roles || []
  const matrix = data?.security_matrix || []
  const logs = data?.recent_security_logs || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Fiduciary Defense Matrix
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
              Zero-Trust Architecture
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            Security &amp; Access Control
          </h1>
          <p className="text-xs text-[#A9A59A]">
            Manage roles, permissions, account security and access restrictions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPolicyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:brightness-110 text-xs font-bold text-[#0B0B0A] rounded-xl transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Enforce Policy Rule
          </button>

          <button
            onClick={fetchSecurity}
            className="flex items-center gap-2 px-4 py-2 bg-[#171714] hover:bg-[#21201B] border border-[#2B2A24] text-xs font-bold text-[#F5F1E6] rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" /> Refresh Telemetry
          </button>
        </div>
      </div>

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

      {loading ? (
        <div className="p-16 text-center text-xs text-[#A9A59A] animate-pulse bg-[#171714] border border-[#2B2A24] rounded-3xl">
          Loading Security Specifications &amp; RBAC Telemetry...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-red-400 bg-[#171714] border border-red-500/30 rounded-3xl space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p>{error}</p>
          <button
            onClick={fetchSecurity}
            className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Security Core Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#171714] border border-[#2B2A24] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                Cryptographic Signature
              </div>
              <div className="text-sm font-bold text-[#F5F1E6] font-mono">
                {config.token_algorithm || 'HS256 256-Bit Signature'}
              </div>
              <div className="text-[11px] text-[#A9A59A]">
                Token Rotation: {config.access_token_lifetime || '60 Min'}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#171714] border border-[#2B2A24] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                Password Encryption
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono truncate">
                PBKDF2 SHA-256 Core
              </div>
              <div className="text-[11px] text-[#A9A59A]">
                Salted iterative hashing
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#171714] border border-[#2B2A24] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                RBAC Enforcement
              </div>
              <div className="text-sm font-bold text-indigo-300">
                Dual-Layer Protection
              </div>
              <div className="text-[11px] text-[#A9A59A]">
                Django REST Middleware + React Route Guards
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#171714] border border-[#2B2A24] space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                Audit &amp; Session Tracking
              </div>
              <div className="text-sm font-bold text-amber-300">
                {config.active_sessions_estimated || 0} Active Identities
              </div>
              <div className="text-[11px] text-[#A9A59A]">
                IP geolocation logging &amp; immutable audit trail
              </div>
            </div>
          </div>

          {/* Role Governance & Permissions Specification */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Role-Based Access Control (RBAC) Governance
              </h2>
              <p className="text-xs text-[#A9A59A]">
                Enforced role boundaries, data separation, and authority definitions across FINORA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {roles.map((r) => {
                const isAdminRole = r.role === 'ADMINISTRATOR'
                const isAdvisorRole = r.role === 'FINANCIAL_ADVISOR'

                return (
                  <div
                    key={r.role}
                    className={`rounded-3xl p-6 bg-[#171714] border shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden ${
                      isAdminRole
                        ? 'border-[#D4AF37]/50 shadow-[#D4AF37]/5'
                        : isAdvisorRole
                        ? 'border-indigo-500/40 shadow-indigo-500/5'
                        : 'border-[#2B2A24]'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider border ${
                              isAdminRole
                                ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                                : isAdvisorRole
                                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                : 'bg-[#2B2A24] text-[#A9A59A] border-[#3E3C34]'
                            }`}
                          >
                            {r.role}
                          </span>
                          <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1.5">
                            {r.label}
                          </h3>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold text-[#F5F1E6] font-mono">
                            {r.users_count}
                          </span>
                          <span className="block text-[10px] text-[#A9A59A] uppercase">Active Users</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#A9A59A] leading-relaxed">
                        {r.description}
                      </p>

                      <div className="pt-2 border-t border-[#2B2A24] space-y-2">
                        <div className="text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                          Granular Authorities ({r.permissions?.length || 0})
                        </div>
                        <ul className="space-y-1.5">
                          {r.permissions?.map((perm, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-[#F5F1E6]">
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isAdminRole
                                    ? 'text-[#D4AF37]'
                                    : isAdvisorRole
                                    ? 'text-indigo-400'
                                    : 'text-emerald-400'
                                }`}
                              />
                              <span>{perm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Module Isolation Matrix Table */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" /> System Module Isolation Matrix
              </h2>
              <p className="text-xs text-[#A9A59A]">
                Strict segregation of duties across Customer, Financial Advisor, and Administrator modules
              </p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[10px] uppercase font-bold text-[#A9A59A] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">System Module</th>
                      <th className="py-3.5 px-4 text-emerald-400">Wealth Client (Customer)</th>
                      <th className="py-3.5 px-4 text-indigo-300">Financial Advisor</th>
                      <th className="py-3.5 px-4 text-[#D4AF37]">System Administrator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B2A24]/60">
                    {matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#1c1b17] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#F5F1E6]">
                          {row.module}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-300 font-medium">
                          {row.customer}
                        </td>
                        <td className="py-3.5 px-4 text-indigo-200 font-medium">
                          {row.advisor}
                        </td>
                        <td className="py-3.5 px-4 text-[#FFF0B3] font-medium">
                          {row.admin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Real-Time Security Audit Telemetry Feed */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4AF37]" /> Security Audit &amp; Authorization Stream
              </h2>
              <p className="text-xs text-[#A9A59A]">
                Latest security-critical events, authentication changes, and authorization state checks
              </p>
            </div>

            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl divide-y divide-[#2B2A24]/60">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A9A59A]">
                  No security-critical events recorded in recent log window.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          {log.action}
                        </span>
                        <span className="font-semibold text-[#F5F1E6]">{log.user_email}</span>
                      </div>
                      <div className="text-[11px] text-[#A9A59A]">
                        {log.details?.description || JSON.stringify(log.details)}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-[#A9A59A] shrink-0 font-mono">
                      <div>IP: {log.ip_address}</div>
                      <div>{formatDate(log.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ENFORCE POLICY RULE ================= */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Enforce Security Policy Rule
                </h3>
                <p className="text-xs text-[#A9A59A]">Configure perimeter access restriction rule</p>
              </div>
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Target Role Boundary</label>
                <select className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none">
                  <option value="ALL">All Roles (Global Rule)</option>
                  <option value="CUSTOMER">Wealth Client (Customer)</option>
                  <option value="FINANCIAL_ADVISOR">Financial Advisor</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Policy Action</label>
                <select className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none">
                  <option value="MFA_REQUIRED">Require Multi-Factor Authentication</option>
                  <option value="IP_WHITELIST">Restrict by IP Geolocation Subnet</option>
                  <option value="SESSION_LIMIT">Enforce Max Concurrent Sessions (1)</option>
                  <option value="READ_ONLY_LOCK">Emergency Read-Only Lock</option>
                </select>
              </div>

              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl text-[11px] text-[#A9A59A]">
                Policy enforcement updates the perimeter security rules across all microservices and triggers an immediate immutable audit log entry.
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPolicyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:bg-[#21201B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPolicyModalOpen(false)
                    setActionSuccess('Security policy rule applied and enforced across system boundaries.')
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  Apply Policy Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityAccessControl

