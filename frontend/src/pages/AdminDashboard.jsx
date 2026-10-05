import React, { useState, useEffect } from 'react'
import { ShieldCheck, Users, FileText, Trash2, CheckCircle2, Shield } from 'lucide-react'
import { authService, auditService } from '../services/api'
import { formatDate } from '../utils/formatters'

export const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'audit'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [uRes, aRes] = await Promise.all([
        authService.getUsers(),
        auditService.getAuditLogs(),
      ])
      if (uRes.data?.success) setUsers(uRes.data.data)
      if (aRes.data?.success) setAuditLogs(aRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChangeRole = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole)
      fetchData()
    } catch (e) {}
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user account?')) {
      try {
        await authService.deleteUser(userId)
        fetchData()
      } catch (e) {}
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B2A24] pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
            System Administrator
          </span>
          <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-1">Admin Console</h1>
          <p className="text-xs text-[#A9A59A]">User role permissions, security policies & system audit trails</p>
        </div>

        <div className="flex items-center gap-2 bg-[#171714] border border-[#2B2A24] p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-[#D4AF37] text-[#0B0B0A]' : 'text-[#A9A59A]'
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-[#D4AF37] text-[#0B0B0A]' : 'text-[#A9A59A]'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0B0A] border-b border-[#2B2A24] text-[11px] font-bold text-[#A9A59A] uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Date Joined</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A24] text-xs font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#21201B]/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#F5F1E6]">{u.full_name}</td>
                    <td className="py-4 px-6 text-[#A9A59A]">{u.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="bg-[#0B0B0A] border border-[#2B2A24] text-xs text-[#D4AF37] font-bold rounded-xl px-2.5 py-1 focus:outline-none"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="FINANCIAL_ADVISOR">FINANCIAL_ADVISOR</option>
                        <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-[#A9A59A]">{formatDate(u.date_joined)}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-[#A9A59A] hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl overflow-hidden divide-y divide-[#2B2A24]">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 text-xs flex items-center justify-between hover:bg-[#21201B]/50">
              <div>
                <span className="font-bold text-[#D4AF37]">{log.action}</span>
                <p className="text-[#A9A59A] mt-0.5">By {log.user_email || 'System'} • IP: {log.ip_address || '127.0.0.1'}</p>
              </div>
              <span className="text-[10px] text-[#A9A59A]">{formatDate(log.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
