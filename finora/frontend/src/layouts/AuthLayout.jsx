import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sparkles, ShieldCheck, Lock, TrendingUp } from 'lucide-react'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#F5F1E6] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Gold Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 lg:px-12 flex items-center justify-between z-10">
        <Link to="/login" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
            <Sparkles className="w-6 h-6 text-[#0B0B0A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#F5F1E6] font-['Space_Grotesk']">FINORA</h1>
            <p className="text-[10px] text-[#D4AF37] font-semibold tracking-widest uppercase">Private Banking</p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-xs text-[#A9A59A]">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> 256-Bit Encryption</span>
          <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-[#D4AF37]" /> JWT Auth</span>
        </div>
      </header>

      {/* Auth Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 sm:p-8 shadow-2xl gold-border-glow">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#A9A59A] z-10">
        &copy; {new Date().getFullYear()} Finora Wealth Management Inc. All rights reserved.
      </footer>
    </div>
  )
}
