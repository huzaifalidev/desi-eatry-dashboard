'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store/store'

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const loading = useSelector((state: RootState) => state.auth.loading)
  return { user, loading, isAuthenticated: !!user }
}
