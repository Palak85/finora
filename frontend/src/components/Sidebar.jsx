import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  PieChart,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Compass,
  Sparkles,
  LogOut,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Sidebar = () => {
  const { user, logout, isAdmin, isAdvisor } = useAuth()
  const location = useLocation()

  // 1. Customer Navigation (Private Banking & Wealth Management)
  const customerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Investments', path: '/investments', icon: TrendingUp },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  // 2. Financial Advisor Navigation (Wealth Coach & Navigator Suite)
  const advisorLinks = [
    { name: 'Advisor Suite', path: '/advisor', icon: Compass },
    { name: 'Client Navigator', path: '/advisor/clients', icon: Users },
    { name: 'Track Transactions', path: '/advisor/transactions', icon: ArrowRightLeft },
    { name: 'Track Budgets', path: '/advisor/budgets', icon: PieChart },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Wealth Intelligence', path: '/wealth-analytics', icon: BarChart3 },
    { name: 'Advisor Showcase', path: '/advisor-suite', icon: Sparkles },
    { name: 'Live Client Signals', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  // 3. System Administrator Navigation (Platform Governance & Control)
  const adminLinks = [
    { name: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { name: 'User Directory', path: '/admin/users', icon: Users },
    { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'System Telemetry', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#171714] border-r border-[#2B2A24] h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#2B2A24]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
          <Wallet className="w-6 h-6 text-[#0B0B0A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-1.5">
            FINORA <span className="text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">PRO</span>
          </h1>
          <p className="text-xs text-[#A9A59A]">Private Wealth Suite</p>
        </div>
      </div>

      {/* Workspace Role Badge */}
      <div className="px-6 py-3 bg-[#0B0B0A]/50 border-b border-[#2B2A24] flex items-center justify-between">
        <span className="text-xs text-[#A9A59A] uppercase tracking-wider font-semibold">Workspace</span>
        <span
          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
            isAdmin
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : isAdvisor
              ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
        >
          {isAdmin ? 'System Admin' : isAdvisor ? 'Financial Advisor' : 'Wealth Client'}
        </span>
      </div>

      {/* Dynamic Navigation Sections Tailored per Role */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {isAdmin ? (
          /* ================= ADMINISTRATOR MENU ================= */
          <div>
            <p className="px-3 text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Administration Suite
            </p>
            <div className="space-y-1">
              {adminLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500/20 to-transparent text-red-400 border-l-4 border-red-500 font-bold'
                        : 'text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-[#A9A59A]'}`} />
                    <span>{link.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ) : isAdvisor ? (
          /* ================= FINANCIAL ADVISOR MENU ================= */
          <div>
            <p className="px-3 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Wealth Coach Suite
            </p>
            <div className="space-y-1">
              {advisorLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-4 border-[#D4AF37] font-bold'
                        : 'text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#A9A59A]'}`} />
                    <span>{link.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ) : (
          /* ================= CUSTOMER / WEALTH CLIENT MENU ================= */
          <div>
            <p className="px-3 text-[11px] font-semibold text-[#A9A59A] uppercase tracking-wider mb-2">Private Banking</p>
            <div className="space-y-1">
              {customerLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-l-4 border-[#D4AF37] font-semibold'
                        : 'text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#A9A59A]'}`} />
                    <span>{link.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-[#2B2A24]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}
