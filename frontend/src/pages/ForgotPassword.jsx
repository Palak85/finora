import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { authService } from '../services/api'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSubmitted(true)
    } catch (e) {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Reset Password</h2>
        <p className="text-xs text-[#A9A59A] mt-1">Enter your registered email for password recovery</p>
      </div>

      {submitted ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-[#F5F1E6]">Instructions Sent!</h3>
          <p className="text-xs text-[#A9A59A]">
            If <span className="text-[#D4AF37]">{email}</span> is registered in our system, password reset instructions have been dispatched.
          </p>
          <Link
            to="/login"
            className="inline-block px-4 py-2 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl pl-10 pr-4 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
          >
            {loading ? 'Sending...' : 'Send Recovery Link'}
          </button>
        </form>
      )}

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#A9A59A] hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>
    </div>
  )
}
