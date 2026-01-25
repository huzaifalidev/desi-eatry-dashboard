'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '@/redux/slices/auth-slice'
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

  const { user, loading, error } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('password123')


  useEffect(() => {
    if (user) {
      console.log('Login Page User:', user);
      router.push('/dashboard')}

  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-500">
      <Card className="w-full max-w-md dark dark:bg-zinc-900 shadow-lg bg-zinc-900">
        <CardHeader>
          <CardTitle>Desi Eatry</CardTitle>
          <CardDescription>Billing & Inventory System</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label htmlFor='email' >Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Label htmlFor='password'>Password</Label>
            <Input
              type="password"
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
