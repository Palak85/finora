import React, { useState } from 'react'
import {
  ShieldAlert,
  RefreshCw,
  LogOut,
  Lock,
  Wallet,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSystemConfig } from '../context/SystemConfigContext'

export const MaintenanceLockdown = () => {
  const { user, logout } = useAuth()
  const { refreshConfig } = useSystemConfig()
  const [checking, setChecking] = useState(false)

  const handleRefresh = async () => {
    setChecking(true)
    try {
      await refreshConfig()
    } finally {
      setTimeout(() => setChecking(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#F5F1E6] flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Brand Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#2B2A24]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 shrink-0">
            <Wallet className="w-6 h-6 text-[#0B0B0A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-1.5">
              FINORA <span className="text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">PRO</span>
            </h1>
            <p className="text-xs text-[#A9A59A]">Private Wealth Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Lockdown Active
          </span>
        </div>
      </div>

      {/* Center Hero Card */}
      <div className="max-w-lg w-full mx-auto my-12 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Top Accent Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-500" />

        {/* Big Maintenance Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
            Fiduciary Infrastructure Advisory
          </span>
          <h2 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">
            System Under Scheduled Maintenance
          </h2>
          <p className="text-xs text-[#A9A59A] leading-relaxed max-w-md mx-auto">
            FINORA Pro Private Wealth Suite is currently undergoing platform maintenance and security upgrades. Customer and Financial Advisor access is temporarily locked down by System Administration.
          </p>
        </div>

        {/* Security / Status Pillars */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#A9A59A]">
              <Lock className="w-3 h-3 text-[#D4AF37]" /> Asset Safety
            </div>
            <div className="text-xs font-bold text-[#F5F1E6] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Preserved
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#A9A59A]">
              <Clock className="w-3 h-3 text-amber-400" /> Expected Return
            </div>
            <div className="text-xs font-bold text-[#F5F1E6]">
              Resuming Shortly
            </div>
          </div>
        </div>

        {/* User identification info */}
        {user && (
          <div className="p-3 rounded-xl bg-[#0B0B0A]/60 border border-[#2B2A24] text-[11px] text-[#A9A59A] flex items-center justify-between">
            <span>Signed in as: <strong className="text-[#F5F1E6]">{user.email}</strong></span>
            <span className="font-mono text-[10px] uppercase text-[#D4AF37]">[{user.role}]</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#D4AF37] hover:brightness-110 text-[#0B0B0A] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking Status...' : 'Check Status / Refresh'}
          </button>

          <button
            onClick={logout}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#0B0B0A] hover:bg-[#21201B] border border-[#2B2A24] text-xs font-semibold text-[#A9A59A] hover:text-[#F5F1E6] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-[#A9A59A] pt-6 border-t border-[#2B2A24]">
        FINORA PRO &bull; Private Wealth &amp; Fiduciary Banking Suite &bull; Admin Support: <span className="text-[#D4AF37]">admin@finora.com</span>
      </div>
    </div>
  )
}

export default MaintenanceLockdown

