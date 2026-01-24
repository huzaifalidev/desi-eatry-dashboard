'use client'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { logout } = useAuth()

  const user = { firstName: 'John', lastName: 'Doe', email: 'admin@demo.com' }

  return (
    <nav className="dark:bg-zinc-900 bg-[#fafafa] border-b border-border h-16 px-4 sm:px-6 sticky top-0 z-10">
      <div className="w-full h-full grid grid-cols-3 items-center">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Desktop brand */}
          <div className="hidden lg:flex flex-col">
            <h1 className="font-bold text-lg leading-none">Desi Eatry</h1>
            <h5 className="text-xs text-muted-foreground">Dashboard</h5>
          </div>
        </div>

        {/* CENTER (mobile brand) */}
        <div className="flex justify-center lg:hidden">
          <div className="flex flex-col items-center leading-none">
            <h1 className="font-bold text-base">Desi Eatry</h1>
            <span className="text-[10px] text-muted-foreground">
              Dashboard
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 z-[100] mt-2 p-2"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  setTheme(theme === 'light' ? 'dark' : 'light')
                }
              >
                {theme === 'light' ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                <span>
                  {theme === 'light' ? 'Dark' : 'Light'} Mode
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  localStorage.clear()
                  logout()
                  router.push('/login')
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  )
}
