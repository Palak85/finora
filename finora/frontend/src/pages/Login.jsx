import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('customer@finora.com')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        setError(result.message)
      }
    } catch (err) {
      setError('An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail)
    setPassword('Password123!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Welcome Back</h2>
        <p className="text-xs text-[#A9A59A] mt-1">Access your Finora private wealth dashboard</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Credentials Switcher */}
      <div className="p-3 bg-[#0B0B0A] border border-[#2B2A24] rounded-2xl space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">Quick Demo Logins</p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => fillQuickDemo('customer@finora.com')}
            className="px-2 py-1.5 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37] text-[11px] font-semibold text-[#F5F1E6] rounded-xl transition-all"
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('advisor@finora.com')}
            className="px-2 py-1.5 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37] text-[11px] font-semibold text-[#F5F1E6] rounded-xl transition-all"
          >
            Advisor
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('admin@finora.com')}
            className="px-2 py-1.5 bg-[#171714] border border-[#2B2A24] hover:border-[#D4AF37] text-[11px] font-semibold text-[#F5F1E6] rounded-xl transition-all"
          >
            Admin
          </button>
        </div>
      </div>

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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl pl-10 pr-4 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#D4AF37] to-[#9A7B1C] text-[#0B0B0A] font-bold text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
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
