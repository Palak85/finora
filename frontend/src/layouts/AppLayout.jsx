import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { MobileNav } from '../components/MobileNav'
import { QuickAddModal } from '../components/QuickAddModal'
import { MaintenanceLockdown } from '../components/MaintenanceLockdown'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { useSystemConfig } from '../context/SystemConfigContext'

export const AppLayout = () => {
  const { isAdmin } = useAuth()
  const { maintenanceMode } = useSystemConfig()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { refreshNotifications } = useNotification()

  const handleQuickAddSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    if (refreshNotifications) {
      setTimeout(() => refreshNotifications(), 250)
    }
  }

  // If Maintenance Lockdown is active and user is NOT an administrator:
  // Render full Maintenance Lockdown takeover screen!
  if (maintenanceMode && !isAdmin) {
    return <MaintenanceLockdown />
  }

  return (
    <div className="flex min-h-screen bg-[#0B0B0A] text-[#F5F1E6]">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Administrator Maintenance Notice Banner */}
        {maintenanceMode && isAdmin && (
          <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-2 text-center text-xs text-red-300 flex items-center justify-center gap-2 z-50">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-bold">Maintenance Lockdown Active Platform-Wide:</span>
            <span>Customer &amp; Advisor access is restricted. Admin bypass is active.</span>
          </div>
        )}

        <Header onOpenQuickAdd={() => setQuickAddOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshKey, triggerRefresh: handleQuickAddSuccess }} />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav onOpenQuickAdd={() => setQuickAddOpen(true)} />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={handleQuickAddSuccess}
      />
    </div>
  )
}

export default AppLayout
