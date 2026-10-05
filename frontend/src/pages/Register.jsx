import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('CUSTOMER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await register({
        full_name: fullName,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
        role,
      })

      if (res.success) {
        navigate('/dashboard')
      } else {
        setError(res.message || 'Registration failed.')
      }
    } catch (err) {
      setError('Registration failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Create Account</h2>
        <p className="text-xs text-[#A9A59A] mt-1">Start your journey with Finora Wealth</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl pl-10 pr-4 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl pl-10 pr-4 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl pl-10 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none transition-all"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="FINANCIAL_ADVISOR">Financial Advisor</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Password</label>
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

        <div>
          <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#A9A59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Creating Account...' : 'Register Account'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <p className="text-center text-xs text-[#A9A59A]">
        Already have an account?{' '}
        <Link to="/login" className="text-[#D4AF37] font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}
