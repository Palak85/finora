import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SystemConfigProvider } from './context/SystemConfigContext'
import { NotificationProvider } from './context/NotificationContext'
import { AppRoutes } from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SystemConfigProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </SystemConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
