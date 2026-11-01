import React from 'react'
import { useLocation } from 'react-router-dom'
import { AdminConsole } from './admin/AdminConsole'
import { UserManagement } from './admin/UserManagement'
import { AuditLogs } from './admin/AuditLogs'

export const AdminDashboard = () => {
  const location = useLocation()

  if (location.pathname === '/admin/users') {
    return <UserManagement />
  }

  if (location.pathname === '/admin/audit-logs') {
    return <AuditLogs />
  }

  return <AdminConsole />
}

export default AdminDashboard
