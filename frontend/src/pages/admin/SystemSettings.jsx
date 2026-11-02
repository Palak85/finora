
const normalizeAdvisorMode = (mode) => {
  if (!mode) return 'CLIENT_REQUEST'
  const upper = String(mode).toUpperCase()
  if (upper.includes('ADMIN')) return 'ADMIN_ONLY'
  return 'CLIENT_REQUEST'
}

const normalizeThemeMode = (mode) => {
  if (!mode) return 'DARK_GOLD'
  const upper = String(mode).toUpperCase()
  if (upper.includes('LIGHT')) return 'LIGHT_CLASSIC'
  return 'DARK_GOLD'
}
import React, { useState, useEffect } from 'react'
import {
  Settings,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ShieldCheck,
  Globe,
  Bell,
  Lock,
  Compass,
  Sparkles,
  Info
} from 'lucide-react'
import { adminService } from '../../services/api'
import { formatDate } from '../../utils/formatters'
import { useTheme } from '../../context/ThemeContext'

export const SystemSettings = () => {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')
  const [themeFieldTouched, setThemeFieldTouched] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    app_name: 'FINORA Pro',
    app_description: 'Private Wealth Suite & Digital Banking Architecture',
    default_currency: 'INR',
    timezone_pref: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
    theme_mode: theme === 'light' ? 'LIGHT_CLASSIC' : 'DARK_GOLD',
    advisor_assignment_mode: 'CLIENT_REQUEST',
    allow_customer_registration: true,
    maintenance_mode: false,
    email_alerts_enabled: true,
    security_audit_logging: true,
  })

  // Align theme_mode with active view theme if admin toggles theme in header and hasn't manually selected in form
  useEffect(() => {
    if (!themeFieldTouched) {
      setFormData((prev) => ({
        ...prev,
        theme_mode: theme === 'light' ? 'LIGHT_CLASSIC' : 'DARK_GOLD',
      }))
    }
  }, [theme, themeFieldTouched])

  const fetchSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getSystemSettings()
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data)
        const activeTheme = normalizeThemeMode(res.data.data.theme_mode)
        setFormData({
          app_name: res.data.data.app_name || 'FINORA Pro',
          app_description: res.data.data.app_description || '',
          default_currency: res.data.data.default_currency || 'INR',
          timezone_pref: res.data.data.timezone_pref || 'Asia/Kolkata',
          date_format: res.data.data.date_format || 'DD/MM/YYYY',
          theme_mode: themeFieldTouched ? formData.theme_mode : activeTheme,
          advisor_assignment_mode: normalizeAdvisorMode(res.data.data.advisor_assignment_mode),
          allow_customer_registration: Boolean(res.data.data.allow_customer_registration),
          maintenance_mode: Boolean(res.data.data.maintenance_mode),
          email_alerts_enabled: Boolean(res.data.data.email_alerts_enabled),
          security_audit_logging: Boolean(res.data.data.security_audit_logging),
        })
      }
    } catch (err) {
      console.error('Failed to load system settings:', err)
      setError('Failed to load platform settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await adminService.updateSystemSettings(formData)
      if (res.data?.success) {
        setActionSuccess('System configuration saved successfully. All changes are active immediately.')
        // Sync local storage immediately for Customer and Advisor sessions
        if (res.data.data?.default_currency) {
          localStorage.setItem('finora_currency', res.data.data.default_currency)
        }
        if (res.data.data?.date_format) {
          localStorage.setItem('finora_date_format', res.data.data.date_format)
        }
        // Sync visual identity theme across all platform interfaces (Advisor, Customer, Admin)
        if (res.data.data?.theme_mode) {
          const appliedTheme = normalizeThemeMode(res.data.data.theme_mode) === 'LIGHT_CLASSIC' ? 'light' : 'dark'
          setTheme(appliedTheme)
          localStorage.setItem('finora_theme', appliedTheme)
          window.dispatchEvent(new CustomEvent('finora_theme_updated', { detail: appliedTheme }))
        }
        // Broadcast event to all modules across FINORA (currency, formats, maintenance, theme)
        window.dispatchEvent(new CustomEvent('finora_system_config_updated', { detail: res.data.data }))
        setThemeFieldTouched(false)
        await fetchSettings()
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update system configuration.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (settings) {
      setThemeFieldTouched(false)
      const activeTheme = normalizeThemeMode(settings.theme_mode)
      setFormData({
        app_name: settings.app_name || 'FINORA Pro',
        app_description: settings.app_description || '',
        default_currency: settings.default_currency || 'INR',
        timezone_pref: settings.timezone_pref || 'Asia/Kolkata',
        date_format: settings.date_format || 'DD/MM/YYYY',
        theme_mode: activeTheme,
        advisor_assignment_mode: normalizeAdvisorMode(settings.advisor_assignment_mode),
        allow_customer_registration: Boolean(settings.allow_customer_registration),
        maintenance_mode: Boolean(settings.maintenance_mode),
        email_alerts_enabled: Boolean(settings.email_alerts_enabled),
        security_audit_logging: Boolean(settings.security_audit_logging),
      })
      setActionSuccess('Form values reset to current active configuration.')
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Core Infrastructure
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#2B2A24] text-[#A9A59A] border border-[#3E3C34]">
              Global Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">
            System Settings
          </h1>
          <p className="text-xs text-[#A9A59A]">
            Configure platform name, currency, system preferences and application settings.
          </p>
        </div>

        {settings && (
          <div className="text-right text-[11px] text-[#A9A59A]">
            <div>Last Updated: <strong className="text-[#F5F1E6]">{formatDate(settings.updated_at)}</strong></div>
            <div>By: <strong className="text-[#D4AF37]">{settings.updated_by}</strong></div>
          </div>
        )}
      </div>

      {/* Notifications */}
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

      {loading ? (
        <div className="p-16 text-center text-xs text-[#A9A59A] animate-pulse bg-[#171714] border border-[#2B2A24] rounded-3xl">
          Loading System Configuration...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-xs text-red-400 bg-[#171714] border border-red-500/30 rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p>{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold rounded-xl cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Platform Identity & Localization */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#2B2A24] pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Platform Identity &amp; Localization
                </h2>
                <p className="text-xs text-[#A9A59A]">
                  Core application labels, base currency for analytics, and standard time formatting
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Application Title</label>
                <input
                  type="text"
                  required
                  value={formData.app_name}
                  onChange={(e) => handleInputChange('app_name', e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Default Currency</label>
                <select
                  value={formData.default_currency}
                  onChange={(e) => handleInputChange('default_currency', e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Platform Tagline &amp; Descriptor</label>
                <input
                  type="text"
                  value={formData.app_description}
                  onChange={(e) => handleInputChange('app_description', e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">System Timezone</label>
                <select
                  value={formData.timezone_pref}
                  onChange={(e) => handleInputChange('timezone_pref', e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST / EDT)</option>
                  <option value="Europe/London">Europe/London (GMT / BST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Date Display Format</label>
                <select
                  value={formData.date_format}
                  onChange={(e) => handleInputChange('date_format', e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Advisory Governance & Operating Modes */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#2B2A24] pb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  Advisory Governance &amp; Theme Configuration
                </h2>
                <p className="text-xs text-[#A9A59A]">
                  Control how clients discover and engage financial advisors, and system visual profiles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Advisor Assignment Protocol</label>
                <select
                  value={formData.advisor_assignment_mode}
                  onChange={(e) => handleInputChange('advisor_assignment_mode', e.target.value)}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="CLIENT_REQUEST">Client Directed (Clients choose advisor from directory)</option>
                  <option value="ADMIN_ONLY">Administrator Only (Direct administrator assignment)</option>
                </select>
                <p className="text-[10px] mt-1.5 font-medium flex items-center gap-1.5">
                  {formData.advisor_assignment_mode === 'ADMIN_ONLY' ? (
                    <span className="text-amber-400">
                      🔒 Administrator Only: Direct administrative assignment active. Customers cannot submit requests.
                    </span>
                  ) : (
                    <span className="text-emerald-400">
                      🌐 Client Directed: Customers can discover advisors in My Advisor and submit requests.
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Visual Identity Theme</label>
                <select
                  value={formData.theme_mode}
                  onChange={(e) => {
                    setThemeFieldTouched(true)
                    handleInputChange('theme_mode', e.target.value)
                  }}
                  className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  <option value="DARK_GOLD">Dark Gold (Finora Luxury Dark)</option>
                  <option value="LIGHT_CLASSIC">Light Classic Banking (Luxury Cream Light)</option>
                </select>
                <p className="text-[10px] text-[#A9A59A] mt-1.5">
                  Preserves the primary luxury palette across all high-net-worth client interfaces.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: System Security & Access Governance Toggles */}
          <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#2B2A24] pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F5F1E6] font-['Space_Grotesk']">
                  System Security &amp; Registration Governance
                </h2>
                <p className="text-xs text-[#A9A59A]">
                  Critical platform toggles governing public enrollment, emergency lockdown, and immutable audit logs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Toggle 1: Customer Registration */}
              <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-[#F5F1E6]">Customer Self-Registration</div>
                  <div className="text-[11px] text-[#A9A59A]">
                    Allow new wealth clients to register accounts via the public portal
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_customer_registration}
                    onChange={(e) => handleInputChange('allow_customer_registration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2B2A24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
                </label>
              </div>

              {/* Toggle 2: Security Audit Logging */}
              <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-[#F5F1E6]">Immutable Audit Logging</div>
                  <div className="text-[11px] text-[#A9A59A]">
                    Track all login attempts, role changes, and data modifications
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.security_audit_logging}
                    onChange={(e) => handleInputChange('security_audit_logging', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2B2A24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Toggle 3: Email Alerts Enabled */}
              <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-[#F5F1E6]">Advisory &amp; Security Alerts</div>
                  <div className="text-[11px] text-[#A9A59A]">
                    Dispatch automatic notifications for advisor assignment decisions
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.email_alerts_enabled}
                    onChange={(e) => handleInputChange('email_alerts_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2B2A24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]" />
                </label>
              </div>

              {/* Toggle 4: Maintenance Mode */}
              <div className="p-4 rounded-2xl bg-[#0B0B0A] border border-red-500/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    Maintenance Lockdown Mode
                  </div>
                  <div className="text-[11px] text-[#A9A59A]">
                    Display system maintenance advisory and restrict routine transactions
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.maintenance_mode}
                    onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2B2A24] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#2B2A24] text-xs font-bold text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Values
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] text-xs font-bold shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Changes...' : 'Save Platform Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default SystemSettings

