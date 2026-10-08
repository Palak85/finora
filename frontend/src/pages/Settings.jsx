import React, { useState } from 'react'
import { User, Lock, CheckCircle2, AlertCircle, Sun, Moon, Palette } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/api'

export const Settings = () => {
  const { user, updateProfileState } = useAuth()
  const { theme, setTheme } = useTheme()

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profMsg, setProfMsg] = useState('')
  const [profErr, setProfErr] = useState('')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfMsg('')
    setProfErr('')
    try {
      const res = await authService.updateProfile({ full_name: fullName, phone })
      if (res.data?.success) {
        setProfMsg('Profile updated successfully!')
        updateProfileState(res.data.data)
      }
    } catch (err) {
      setProfErr(err.response?.data?.message || 'Profile update failed.')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    setPwdErr('')

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match.')
      return
    }

    try {
      const res = await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      if (res.data?.success) {
        setPwdMsg('Password updated successfully!')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setPwdErr(err.response?.data?.message || 'Password update failed.')
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-[#2B2A24] pb-5">
        <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Account Settings</h1>
        <p className="text-xs text-[#A9A59A] mt-1">Manage profile details, theme appearance & security credentials</p>
      </div>

      {/* Theme & Appearance Section */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 lg:p-8 space-y-4">
        <h3 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#D4AF37]" /> Interface Appearance
        </h3>
        <p className="text-xs text-[#A9A59A]">Choose your preferred theme mode for Finora</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
              theme === 'dark'
                ? 'bg-[#0B0B0A] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                : 'bg-[#0B0B0A]/50 border-[#2B2A24] hover:border-[#D4AF37]/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#171714] border border-[#2B2A24] flex items-center justify-center text-[#D4AF37]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#F5F1E6]">Dark Luxury</p>
              <p className="text-[11px] text-[#A9A59A]">Black & Metallic Gold</p>
            </div>
          </button>

          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
              theme === 'light'
                ? 'bg-[#F6F3EB] border-[#B8860B] shadow-lg shadow-[#B8860B]/10'
                : 'bg-[#0B0B0A]/50 border-[#2B2A24] hover:border-[#D4AF37]/40'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#E2DBCB] flex items-center justify-center text-[#B8860B]">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1F1C18]">Executive Beige</p>
              <p className="text-[11px] text-[#78716C]">Warm Beige & Rich Gold</p>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 lg:p-8 space-y-4">
        <h3 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
          <User className="w-5 h-5 text-[#D4AF37]" /> Personal Information
        </h3>

        {profMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {profMsg}
          </div>
        )}

        {profErr && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {profErr}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Email (Primary Identifier)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-[#0B0B0A]/50 border border-[#2B2A24] text-sm text-[#A9A59A] rounded-xl px-3.5 py-2.5 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Security Form */}
      <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 lg:p-8 space-y-4">
        <h3 className="text-base font-bold text-[#F5F1E6] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#D4AF37]" /> Change Security Password
        </h3>

        {pwdMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {pwdMsg}
          </div>
        )}

        {pwdErr && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {pwdErr}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A9A59A] mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A9A59A] mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0B0B0A] border border-[#2B2A24] text-sm text-[#F5F1E6] rounded-xl px-3.5 py-2.5 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#D4AF37] text-[#0B0B0A] font-bold text-xs rounded-xl shadow-lg hover:brightness-110"
          >
            Update Security Password
          </button>
        </form>
      </div>
    </div>
  )
}

