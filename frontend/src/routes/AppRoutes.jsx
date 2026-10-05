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
import { FinancialHealth } from '../pages/FinancialHealth'
import { Notifications } from '../pages/Notifications'
import { Settings } from '../pages/Settings'
import { AdvisorDashboard } from '../pages/AdvisorDashboard'
import { AdminDashboard } from '../pages/AdminDashboard'
import { NotFound } from '../pages/NotFound'

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/financial-health" element={<FinancialHealth />} />
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

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
