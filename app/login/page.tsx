'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { loginAdmin, fetchAdminData } from '@/redux/slices/admin-slice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { RootState } from '@/redux/store/store'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<any>()

  const { admin, loading, error } = useSelector((state: RootState) => state.admin)

  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('Admin123')

  // Show toast messages for errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Redirect after login
  useEffect(() => {
    if (admin) {
      toast.success(`Welcome back, ${admin.firstName}!`)
      router.push('/dashboard')
    }
  }, [admin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }

    try {
      await dispatch(loginAdmin({ email, password })).unwrap()
      // Fetch admin data after login
      await dispatch(fetchAdminData()).unwrap()
    } catch (err: any) {
      // Error handled via slice toast
    }
  }

  return (
    <div className="flex items-center justify-center bg-zinc-700 min-h-screen max-sm:min-h-[100svh]">
      <Card className="w-full max-w-md shadow-lg bg-zinc-900 max-sm:mx-4">
        <CardHeader>
          <CardTitle>Desi Eatry</CardTitle>
          <CardDescription>Billing & Inventory System</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
