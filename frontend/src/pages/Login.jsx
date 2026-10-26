import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, ShieldCheck, UserCheck, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        if (result.user.role === 'ADMINISTRATOR') {
          navigate('/admin')
        } else if (result.user.role === 'FINANCIAL_ADVISOR') {
          navigate('/advisor')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(result.message || 'Invalid email or password.')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A9A59A] hover:text-[#D4AF37] transition-colors mb-3 group"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <h2 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Welcome Back</h2>
        <p className="text-xs text-[#A9A59A] mt-1">Access your Finora private wealth dashboard</p>
      </div>

      {/* Demo Credentials Quick Fill */}
      <div className="p-3.5 bg-[#171714] border border-[#2B2A24] rounded-xl space-y-2">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#A9A59A] block">
          ⚡ One-Click Demo Logins
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('customer@finora.com', 'Password123!')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#22211C] hover:bg-[#2F2E27] hover:border-[#D4AF37]/50 border border-[#2B2A24] rounded-lg text-xs font-medium text-[#F5F1E6] transition-all"
            title="Alex Mercer (Customer)"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('advisor@finora.com', 'Password123!')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#22211C] hover:bg-[#2F2E27] hover:border-[#D4AF37]/50 border border-[#2B2A24] rounded-lg text-xs font-medium text-[#F5F1E6] transition-all"
            title="Elena Vance (Advisor)"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Advisor</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('admin@finora.com', 'Password123!')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#22211C] hover:bg-[#2F2E27] hover:border-[#D4AF37]/50 border border-[#2B2A24] rounded-lg text-xs font-medium text-[#F5F1E6] transition-all"
            title="System Admin"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#A9A59A]">Password</label>
            <Link to="/forgot-password" className="text-xs text-[#D4AF37] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl pl-10 pr-10 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A9A59A] hover:text-[#F5F1E6] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <p className="text-center text-xs text-[#A9A59A]">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#D4AF37] font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
