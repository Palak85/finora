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
  HeartPulse,
  LogOut,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Sidebar = () => {
  const { user, logout, isAdmin, isAdvisor } = useAuth()
  const location = useLocation()

  const customerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Investments', path: '/investments', icon: TrendingUp },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Financial Health', path: '/financial-health', icon: HeartPulse },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const advisorLinks = [
    { name: 'Advisor Overview', path: '/advisor', icon: UserCheck },
    { name: 'Client Directory', path: '/advisor/clients', icon: Users },
  ]

  const adminLinks = [
    { name: 'Admin Console', path: '/admin', icon: ShieldCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#171714] border-r border-[#2B2A24] h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#2B2A24]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
          <Sparkles className="w-6 h-6 text-[#0B0B0A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-[#F5F1E6] font-['Space_Grotesk'] flex items-center gap-1.5">
            FINORA <span className="text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">PRO</span>
          </h1>
          <p className="text-xs text-[#A9A59A]">Private Wealth Suite</p>
        </div>
      </div>

      {/* User Role Badge */}
      <div className="px-6 py-3 bg-[#0B0B0A]/50 border-b border-[#2B2A24] flex items-center justify-between">
        <span className="text-xs text-[#A9A59A] uppercase tracking-wider font-semibold">Workspace</span>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
          {user?.role || 'CUSTOMER'}
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Customer Main Menu */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-[#A9A59A] uppercase tracking-wider mb-2">Main Menu</p>
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

        {/* Advisor Section */}
        {isAdvisor && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Advisor Tools
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
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-l-4 border-[#D4AF37]'
                        : 'text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                    <span>{link.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Administration
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
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-l-4 border-[#D4AF37]'
                        : 'text-[#A9A59A] hover:text-[#F5F1E6] hover:bg-[#21201B]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
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
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-[#A9A59A] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}
