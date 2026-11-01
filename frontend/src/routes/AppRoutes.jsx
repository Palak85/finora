import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'

import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ForgotPassword } from '../pages/ForgotPassword'
import { Dashboard } from '../pages/Dashboard'
import { Accounts } from '../pages/Accounts'
import { Transactions } from '../pages/Transactions'
import { Budgets } from '../pages/Budgets'
import { Investments } from '../pages/Investments'
import { Goals } from '../pages/Goals'
import { Analytics } from '../pages/Analytics'
import { Reports } from '../pages/Reports'
import { Notifications } from '../pages/Notifications'
import { Settings } from '../pages/Settings'
import { MyAdvisor } from '../pages/MyAdvisor'
import { AdvisorDashboard } from '../pages/AdvisorDashboard'
import { AdminConsole } from '../pages/admin/AdminConsole'
import { UserManagement } from '../pages/admin/UserManagement'
import { AdvisorManagement } from '../pages/admin/AdvisorManagement'
import { CustomerManagement } from '../pages/admin/CustomerManagement'
import { SecurityAccessControl } from '../pages/admin/SecurityAccessControl'
import { AuditLogs } from '../pages/admin/AuditLogs'
import { SystemSettings } from '../pages/admin/SystemSettings'
import { NotFound } from '../pages/NotFound'

import { AdvisorTransactionsDashboard } from '../pages/AdvisorTransactionsDashboard'
import { AdvisorBudgetsDashboard } from '../pages/AdvisorBudgetsDashboard'
import { CustomerRequests } from '../pages/advisor/CustomerRequests'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="p-12 text-center text-xs text-[#A9A59A]">Loading Finora Workspace...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const RoleBasedDashboard = () => {
  const { isAdvisor, isAdmin } = useAuth()
  if (isAdmin) {
    return <AdminConsole />
  }
  if (isAdvisor) {
    return <AdvisorDashboard />
  }
  return <Dashboard />
}

const RoleBasedTransactions = () => {
  const { isAdvisor } = useAuth()
  if (isAdvisor) {
    return <AdvisorTransactionsDashboard />
  }
  return <Transactions />
}

const RoleBasedBudgets = () => {
  const { isAdvisor } = useAuth()
  if (isAdvisor) {
    return <AdvisorBudgetsDashboard />
  }
  return <Budgets />
}

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Home / Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<RoleBasedTransactions />} />
        <Route path="/budgets" element={<RoleBasedBudgets />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/financial-health" element={<Navigate to="/dashboard" replace />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />

        {/* Customer Only: My Financial Advisor */}
        <Route
          path="/my-advisor"
          element={
            <RoleRoute allowedRoles={['CUSTOMER']}>
              <MyAdvisor />
            </RoleRoute>
          }
        />

        {/* Advisor Routes */}
        <Route
          path="/advisor"
          element={
            <RoleRoute allowedRoles={['FINANCIAL_ADVISOR', 'ADMINISTRATOR']}>
              <AdvisorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/advisor/clients"
          element={
            <RoleRoute allowedRoles={['FINANCIAL_ADVISOR', 'ADMINISTRATOR']}>
              <AdvisorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/advisor/transactions"
          element={
            <RoleRoute allowedRoles={['FINANCIAL_ADVISOR', 'ADMINISTRATOR']}>
              <AdvisorTransactionsDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/advisor/budgets"
          element={
            <RoleRoute allowedRoles={['FINANCIAL_ADVISOR', 'ADMINISTRATOR']}>
              <AdvisorBudgetsDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/advisor/requests"
          element={
            <RoleRoute allowedRoles={['FINANCIAL_ADVISOR', 'ADMINISTRATOR']}>
              <CustomerRequests />
            </RoleRoute>
          }
        />

        {/* Admin Routes (Strictly Administrator Only) */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AdminConsole />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <UserManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/advisors"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AdvisorManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/advisor-management"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AdvisorManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <CustomerManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/customer-management"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <CustomerManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <SecurityAccessControl />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/security-access"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <SecurityAccessControl />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AuditLogs />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <SystemSettings />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/system-settings"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <SystemSettings />
            </RoleRoute>
          }
        />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
