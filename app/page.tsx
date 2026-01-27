'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios-instance'
import { Spinner } from '@/components/ui/spinner'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store/store'
import { is } from 'date-fns/locale'

export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useSelector((state: RootState) => state.admin)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
    else {
      router.replace('/login')
    }
  }, [router, isAuthenticated])

  return loading ? <div className="flex h-screen w-full items-center justify-center"><Spinner size='48' /></div> : null
}
