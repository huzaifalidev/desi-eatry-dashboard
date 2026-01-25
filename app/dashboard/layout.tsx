'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdmin, logoutUser } from '@/redux/slices/auth-slice'
import { RootState } from '@/redux/store/store'
import { fetchMenuItems } from '@/redux/slices/menu-slice'
import { fetchAllCustomers } from '@/redux/slices/customer-slice'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const dispatch = useDispatch<any>()
  const { user, loading } = useSelector((state: RootState) => state.auth)
  console.log('Dashboard Layout User:', user);
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(fetchMenuItems())
        await dispatch(fetchAllCustomers())
        if (!user) {
          // Fetch admin info using access token (refresh token handled automatically)
          await dispatch(fetchAdmin())
        }
      } catch (err) {
        // If fetch fails, log out and redirect to login
        await dispatch(logoutUser())
        router.push('/login')
      }
    }

    checkAuth()
  }, [dispatch, router, user])

  // Redirect if user is null after loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Show loader while fetching
  if (loading || !user) {
    return <Spinner className='flex justify-center items-center h-screen' />
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
