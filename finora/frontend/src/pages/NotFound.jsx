import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <AlertCircle className="w-16 h-16 text-[#D4AF37]" />
      <h1 className="text-4xl font-extrabold text-[#F5F1E6] font-['Space_Grotesk']">404 — Page Not Found</h1>
      <p className="text-xs text-[#A9A59A] max-w-sm">The requested financial suite route does not exist or has been moved.</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110 mt-4"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  )
}
