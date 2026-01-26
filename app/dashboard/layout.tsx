// app/dashboard/layout.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminData, logoutAdmin } from '@/redux/slices/admin-slice'
import { fetchMenuItems } from '@/redux/slices/menu-slice'
import { fetchAllCustomers } from '@/redux/slices/customer-slice'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { Spinner } from '@/components/ui/spinner'
import { RootState } from '@/redux/store/store'
import type { DashboardLayoutProps } from '@/lib/types'


export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const dispatch = useDispatch<any>()
  const { admin, loading } = useSelector((state: RootState) => state.admin)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure hydration-safe mount
  useEffect(() => setMounted(true), [])

  // Initialize data
  useEffect(() => {
    if (!mounted || !admin) return

    const initialize = async () => {
      try {
        await dispatch(fetchMenuItems())
        await dispatch(fetchAllCustomers())
      } catch {
        await dispatch(logoutAdmin())
        router.replace('/login')
      }
    }

    initialize()
  }, [dispatch, admin, mounted])

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !loading && !admin) {
      router.replace('/login')
    }
  }, [mounted, loading, admin, router])

  // Show loader until auth check complete
  if (!mounted || loading || !admin) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner size={24} />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
