'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios-instance'
import { Spinner } from '@/components/ui/spinner'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get('/admin/me')
        window.location.replace('/dashboard')
      } catch {
        window.location.replace('/login')
      }
    }

    checkSession()
  }, [])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="48" />
    </div>
  )
}
