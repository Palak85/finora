import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Users,
  FileText,
  Activity,
  Lock,
  Bell,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
  UserCheck,
  Shield,
  Clock,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/api'
import { formatDate } from '../../utils/formatters'

export const AdminConsole = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  // Admin System Settings State (Persisted in localStorage for Administrator)
  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('finora_admin_settings')
    return saved
      ? JSON.parse(saved)
      : {
          platformName: 'FINORA Private Wealth Suite',
          defaultCurrency: 'INR (₹)',
          dateFormat: 'DD/MM/YYYY',
          sessionTimeout: '60 minutes',
          twoFactorEnforced: true,
          auditLoggingLevel: 'Verbose (All Events)',
          systemMaintenanceMode: false,
        }
  })
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false)

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const res = await adminService.getStats()
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleSaveSettings = (e) => {
    e.preventDefault()
    localStorage.setItem('finora_admin_settings', JSON.stringify(systemSettings))
    setSettingsSavedMessage(true)
    setTimeout(() => {
      setSettingsSavedMessage(false)
      setSettingsModalOpen(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> System Administrator
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Core Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            Admin Console &amp; Command Center
          </h1>
          <p className="text-xs text-[#A9A59A]">
            Real-time platform telemetry, user accounts, and administrative control
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="px-3.5 py-2 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37] text-xs font-semibold text-[#F5F1E6] rounded-xl flex items-center gap-1.5 transition-all"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>

          <button
            onClick={() => setSettingsModalOpen(true)}
            className="px-3.5 py-2 bg-[#D4AF37] hover:brightness-110 text-xs font-bold text-[#0B0B0A] rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/10"
          >
            <Sliders className="w-3.5 h-3.5" />
            Admin Settings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-[#171714] border border-[#2B2A24] rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
            <div className="h-72 bg-[#171714] border border-[#2B2A24] rounded-3xl" />
          </div>
        </div>
      ) : (
        <>
          {/* 1. KEY OVERVIEW CARDS (5 Metric Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Users */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{stats?.total_users ?? 0}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                {stats?.roles_breakdown?.CUSTOMER ?? 0} Clients • {stats?.roles_breakdown?.FINANCIAL_ADVISOR ?? 0} Advisors
              </p>
            </div>

            {/* Total Accounts */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Accounts</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">{stats?.total_accounts ?? 0}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                {stats?.active_accounts ?? 0} Active banking ledgers
              </p>
            </div>

            {/* Total Transactions */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Transactions</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{stats?.total_transactions ?? 0}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                Verified platform operations
              </p>
            </div>

            {/* Active Users */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">{stats?.active_users ?? 0}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                {stats?.inactive_users ?? 0} Inactive / suspended
              </p>
            </div>

            {/* Pending Alerts */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-2xl p-5 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-[#A9A59A] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Alerts</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-400 font-['Space_Grotesk']">{stats?.pending_alerts ?? 0}</p>
              <p className="text-[11px] text-[#A9A59A] mt-1">
                Unread security &amp; system signals
              </p>
            </div>
          </div>

          {/* 2. SYSTEM OVERVIEW BREAKDOWNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Registration & Role Distribution */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B2A24] pb-3">
                <h3 className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" /> User Role Distribution
                </h3>
                <span className="text-xs font-bold text-[#D4AF37]">{stats?.total_users ?? 0} Total</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A9A59A]">Customers</span>
                    <span className="text-[#F5F1E6] font-semibold">{stats?.roles_breakdown?.CUSTOMER ?? 0}</span>
                  </div>
                  <div className="w-full bg-[#0B0B0A] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D4AF37] h-full rounded-full transition-all"
                      style={{
                        width: `${stats?.total_users ? ((stats?.roles_breakdown?.CUSTOMER ?? 0) / stats.total_users) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A9A59A]">Financial Advisors</span>
                    <span className="text-[#F5F1E6] font-semibold">{stats?.roles_breakdown?.FINANCIAL_ADVISOR ?? 0}</span>
                  </div>
                  <div className="w-full bg-[#0B0B0A] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{
                        width: `${stats?.total_users ? ((stats?.roles_breakdown?.FINANCIAL_ADVISOR ?? 0) / stats.total_users) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A9A59A]">Administrators</span>
                    <span className="text-[#F5F1E6] font-semibold">{stats?.roles_breakdown?.ADMINISTRATOR ?? 0}</span>
                  </div>
                  <div className="w-full bg-[#0B0B0A] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-400 h-full rounded-full transition-all"
                      style={{
                        width: `${stats?.total_users ? ((stats?.roles_breakdown?.ADMINISTRATOR ?? 0) / stats.total_users) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full py-2 px-3 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] rounded-xl text-xs font-semibold text-[#D4AF37] flex items-center justify-center gap-1.5 transition-all"
                >
                  Manage Users Directory <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Transaction Activity Overview */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B2A24] pb-3">
                <h3 className="text-sm font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-blue-400" /> Transaction Activity
                </h3>
                <span className="text-xs font-bold text-blue-400">{stats?.total_transactions ?? 0} Logged</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl">
                  <span className="text-[10px] text-[#A9A59A] uppercase">Income Operations</span>
                  <p className="text-lg font-bold text-emerald-400 font-['Space_Grotesk']">
                    {stats?.transaction_activity?.income_count ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl">
                  <span className="text-[10px] text-[#A9A59A] uppercase">Expense Operations</span>
                  <p className="text-lg font-bold text-red-400 font-['Space_Grotesk']">
                    {stats?.transaction_activity?.expense_count ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl">
                  <span className="text-[10px] text-[#A9A59A] uppercase">Investments</span>
                  <p className="text-lg font-bold text-[#D4AF37] font-['Space_Grotesk']">
                    {stats?.transaction_activity?.investment_count ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl">
                  <span className="text-[10px] text-[#A9A59A] uppercase">Transfers</span>
                  <p className="text-lg font-bold text-blue-400 font-['Space_Grotesk']">
                    {stats?.transaction_activity?.transfer_count ?? 0}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-[#A9A59A] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Double-entry ledger verification active
              </div>
            </div>


          </div>

          {/* 3. RECENT ACTIVITY & SECURITY ALERTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Administrative Activities */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#D4AF37]" /> Recent Administrative Activities
                  </h3>
                  <p className="text-xs text-[#A9A59A]">Logged role updates, activations, and administrative actions</p>
                </div>
                <button
                  onClick={() => navigate('/admin/audit-logs')}
                  className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  Full Trail <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {(!stats?.recent_activities || stats.recent_activities.length === 0) ? (
                <div className="py-10 text-center text-xs text-[#A9A59A]">
                  No recent administrative activities recorded.
                </div>
              ) : (
                <div className="divide-y divide-[#2B2A24]">
                  {stats.recent_activities.map((act) => (
                    <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-[#21201B]/40 px-2 rounded-xl transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F5F1E6]">{act.action}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#0B0B0A] text-[#A9A59A] border border-[#2B2A24]">
                              {act.module}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A9A59A] mt-0.5">{act.description}</p>
                          <p className="text-[10px] text-[#A9A59A]/80 mt-0.5">
                            By {act.user_email} • IP: {act.ip_address}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A9A59A] whitespace-nowrap shrink-0">
                        {formatDate(act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Security Alerts */}
            <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
                <div>
                  <h3 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" /> Security Telemetry &amp; Alerts
                  </h3>
                  <p className="text-xs text-[#A9A59A]">Real-time authentication safeguards and perimeter events</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Active Shield
                </span>
              </div>

              {(!stats?.security_alerts || stats.security_alerts.length === 0) ? (
                <div className="py-10 text-center text-xs text-[#A9A59A]">
                  No security alerts pending. Systems running normally.
                </div>
              ) : (
                <div className="divide-y divide-[#2B2A24]">
                  {stats.security_alerts.map((alert) => (
                    <div key={alert.id} className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-[#21201B]/40 px-2 rounded-xl transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#F5F1E6]">{alert.title}</p>
                          <p className="text-[11px] text-[#A9A59A] mt-0.5">{alert.message}</p>
                          <p className="text-[10px] text-[#A9A59A]/80 mt-0.5">Account: {alert.user_email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A9A59A] whitespace-nowrap shrink-0">
                        {formatDate(alert.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 4. ADMIN SETTINGS MODAL */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2B2A24] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#D4AF37]" /> Administrator System Settings
                </h3>
                <p className="text-xs text-[#A9A59A]">Platform-wide operational preferences and security policies</p>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1.5 rounded-full bg-[#0B0B0A] text-[#A9A59A] hover:text-[#F5F1E6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {settingsSavedMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Settings updated and persisted successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A9A59A] font-semibold mb-1">Application Branding</label>
                <input
                  type="text"
                  value={systemSettings.platformName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A59A] font-semibold mb-1">Currency Preference</label>
                  <select
                    value={systemSettings.defaultCurrency}
                    onChange={(e) => setSystemSettings({ ...systemSettings, defaultCurrency: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none"
                  >
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="GBP (£)">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A9A59A] font-semibold mb-1">Date Format</label>
                  <select
                    value={systemSettings.dateFormat}
                    onChange={(e) => setSystemSettings({ ...systemSettings, dateFormat: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A59A] font-semibold mb-1">Session Inactivity Timeout</label>
                  <select
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                    <option value="120 minutes">120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A9A59A] font-semibold mb-1">Audit Logging Level</label>
                  <select
                    value={systemSettings.auditLoggingLevel}
                    onChange={(e) => setSystemSettings({ ...systemSettings, auditLoggingLevel: e.target.value })}
                    className="w-full bg-[#0B0B0A] border border-[#2B2A24] rounded-xl px-3 py-2 text-[#F5F1E6] focus:border-[#D4AF37] outline-none"
                  >
                    <option value="Verbose (All Events)">Verbose (All Events)</option>
                    <option value="Standard">Standard (Security + Admin)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.twoFactorEnforced}
                    onChange={(e) => setSystemSettings({ ...systemSettings, twoFactorEnforced: e.target.checked })}
                    className="accent-[#D4AF37] w-4 h-4 rounded"
                  />
                  <span className="text-[#F5F1E6] font-semibold">Enforce Multi-Factor Authentication (2FA)</span>
                </label>
                <p className="text-[11px] text-[#A9A59A] pl-6">
                  Requires TOTP/SMS verification for administrative actions and large transfers.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2A24]">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 bg-[#0B0B0A] border border-[#2B2A24] rounded-xl text-[#A9A59A] hover:text-[#F5F1E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl hover:brightness-110 shadow-md shadow-[#D4AF37]/20"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

