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
import { AdvisorDashboard } from '../pages/AdvisorDashboard'
import { AdminDashboard } from '../pages/AdminDashboard'
import { NotFound } from '../pages/NotFound'

import { WealthAnalyticsPage } from '../pages/WealthAnalyticsPage'
import { AdvisorSuitePage } from '../pages/AdvisorSuitePage'
import { AdvisorTransactionsDashboard } from '../pages/AdvisorTransactionsDashboard'
import { AdvisorBudgetsDashboard } from '../pages/AdvisorBudgetsDashboard'

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

// Role-based root dashboard router: directs each user to their role-specific dashboard
const RoleBasedDashboard = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role === 'FINANCIAL_ADVISOR') {
    return <Navigate to="/advisor" replace />
  }
  if (user?.role === 'ADMINISTRATOR') {
    return <Navigate to="/admin" replace />
  }
  return <Dashboard />
}

// Role-based Transactions: Directs Advisor to Advisor Transaction Tracker
const RoleBasedTransactions = () => {
  const { isAdvisor } = useAuth()
  if (isAdvisor) {
    return <AdvisorTransactionsDashboard />
  }
  return <Transactions />
}

// Role-based Budgets: Directs Advisor to Advisor Budget Tracker
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
      {/* Public Home / Landing & Showcase Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/wealth-analytics" element={<WealthAnalyticsPage />} />
      <Route path="/advisor-suite" element={<AdvisorSuitePage />} />

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

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleRoute allowedRoles={['ADMINISTRATOR']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
