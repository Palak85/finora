import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  PieChart,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Bell,
  Settings,
  HeartPulse,
  X
} from 'lucide-react'

export const MobileNav = ({ onOpenQuickAdd }) => {
  const [moreOpen, setMoreOpen] = useState(false)

  const mainTabs = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
  ]

  const moreLinks = [
    { name: 'Investments', path: '/investments', icon: TrendingUp },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Health', path: '/financial-health', icon: HeartPulse },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-[#0B0B0A]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="fixed bottom-20 left-4 right-4 bg-[#171714] border border-[#2B2A24] rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2A24]">
              <h3 className="text-sm font-bold text-[#F5F1E6]">Financial Suite</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full bg-[#0B0B0A] text-[#A9A59A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreLinks.map((link) => {
                const Icon = link.icon
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#0B0B0A] border border-[#2B2A24] text-[#A9A59A] hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all text-center"
                  >
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-[11px] font-medium">{link.name}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Gold + Action Button */}
      <div className="fixed bottom-20 right-5 z-40 lg:hidden">
        <button
          onClick={onOpenQuickAdd}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] shadow-2xl shadow-[#D4AF37]/50 flex items-center justify-center active:scale-90 transition-all border-2 border-[#FFF0B3]"
        >
          <Plus className="w-7 h-7 font-extrabold stroke-[3]" />
        </button>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#171714]/95 backdrop-blur-lg border-t border-[#2B2A24] px-3 py-2 z-30 lg:hidden flex items-center justify-around">
        {mainTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-[#D4AF37] font-bold' : 'text-[#A9A59A]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{tab.name}</span>
            </NavLink>
          )
        })}

        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            moreOpen ? 'text-[#D4AF37] font-bold' : 'text-[#A9A59A]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </>
  )
}
