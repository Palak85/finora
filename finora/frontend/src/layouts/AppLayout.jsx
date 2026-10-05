import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { MobileNav } from '../components/MobileNav'
import { QuickAddModal } from '../components/QuickAddModal'

export const AppLayout = () => {
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleQuickAddSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex min-h-screen bg-[#0B0B0A] text-[#F5F1E6]">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
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
