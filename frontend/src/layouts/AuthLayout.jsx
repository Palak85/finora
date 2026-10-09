import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'

export const AuthLayout = () => {

  return (
    <div className="min-h-screen bg-[#0B0B0A] text-[#F5F1E6] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Gold Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 lg:px-12 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#0B0B0A]" />
          </div>
          <div>
            <span className="text-xl font-bold font-['Space_Grotesk'] tracking-wider text-[#F5F1E6] flex items-center gap-1.5">
              FINORA <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">PREMIUM</span>
            </span>
            <p className="text-[9px] text-[#A9A59A] tracking-widest uppercase font-semibold">Private Wealth & Banking</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs text-[#A9A59A]">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171714] border border-[#2B2A24] text-xs font-semibold text-[#F5F1E6] hover:text-[#D4AF37] hover:border-[#D4AF37]/40 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>Home</span>
          </Link>
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

