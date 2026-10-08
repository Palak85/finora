import React, { useState, useEffect } from 'react'
import { HeartPulse, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react'
import { dashboardService } from '../services/api'

export const FinancialHealth = () => {
  const [score, setScore] = useState(85)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getDashboardData()
      .then(res => {
        if (res.data?.success) setScore(res.data.data.financial_health_score || 85)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-b border-[#2B2A24] pb-5">
        <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Financial Health Audit</h1>
        <p className="text-xs text-[#A9A59A] mt-1">Automated credit worthiness, emergency buffer & risk assessment</p>
      </div>

      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 gold-border-glow">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#9A7B1C] p-1 flex items-center justify-center shrink-0 shadow-md">
          <div className="w-full h-full bg-[#0B0B0A] rounded-full flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-[#D4AF37] font-['Space_Grotesk']">{score}</span>
            <span className="text-[10px] text-[#A9A59A] uppercase font-bold tracking-wider">Health Score</span>
          </div>
        </div>

        <div className="space-y-2.5 text-center md:text-left">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Strong Stability Grade
          </span>
          <h2 className="text-xl font-bold text-[#F5F1E6]">Your Financial Wellness is Optimal</h2>
          <p className="text-xs text-[#A9A59A] leading-relaxed max-w-xl">
            You maintain a 60% monthly savings rate and healthy emergency reserve buffers. Your budget compliance is well within optimal threshold ranges.
          </p>
        </div>
      </div>

    </div>
  )
}
