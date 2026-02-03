'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
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
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from './ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store/store'
import { clearAuth, logoutAdmin, setTheme as setReduxTheme } from '@/redux/slices/admin-slice'
import {
  Breadcrumb, BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const logout = () => {
    dispatch(clearAuth());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.replace("/login");
    dispatch(logoutAdmin());
  };
  // next-themes
  const { setTheme, resolvedTheme } = useTheme()

  // Redux
  const reduxTheme = useSelector(
    (state: RootState) => state.admin.theme
  )
  const user = useSelector(
    (state: RootState) => state.admin.admin
  )
  const pathname = usePathname() || '/dashboard'
  // Split the path
  const segments = pathname.split('/').filter(Boolean)
  // Determine what to render
  let breadcrumbSegment = ''
  if (segments.length >= 2 && /^[0-9a-fA-F]+$/.test(segments[segments.length - 1])) {
    // If last segment is a number/ID, show its parent segment
    breadcrumbSegment = segments[segments.length - 2]
  } else {
    // Otherwise show the last segment
    breadcrumbSegment = segments[segments.length - 1] || 'dashboard'
  }
  const pageLabel = breadcrumbSegment.charAt(0).toUpperCase() + breadcrumbSegment.slice(1)
  // 🔑 Sync Redux theme → next-themes
  useEffect(() => {
    setTheme(reduxTheme)
  }, [reduxTheme, setTheme])

  return (
    <nav className="dark:bg-zinc-950 bg-[#fafafa] border-b border-border h-16 px-4 sm:px-6 sticky top-0 z-10">
      <div className="w-full h-full flex items-center justify-between">

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

          <div className="hidden lg:flex flex-col leading-none">
            <h1 className="font-bold text-lg">Desi Eatry</h1>
            <h5 className="text-xs text-muted-foreground">{pageLabel}</h5>
          </div>
        </div>

        {/* CENTER (mobile) */}
        <div className="flex justify-center lg:hidden">
          <div className="flex flex-col items-center leading-none">
            <h1 className="font-bold text-base">Desi Eatry</h1>
            <span className="text-[10px] text-muted-foreground">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className='text-xs text-muted-foreground'>{pageLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 border rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt={
                      user
                        ? `${user.firstName} ${user.lastName}`
                        : 'User Avatar'
                    }
                  />
                  <AvatarBadge className="bg-green-400 animate-pulse" />
                  <AvatarFallback>
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
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
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* THEME TOGGLE */}
              <DropdownMenuItem
                onClick={() => {
                  const nextTheme =
                    resolvedTheme === 'light' ? 'dark' : 'light'
                  dispatch(setReduxTheme(nextTheme))
                }}
              >
                {resolvedTheme === 'light' ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : (
                  <Sun className="mr-2 h-4 w-4" />
                )}
                <span>
                  {resolvedTheme === 'light' ? 'Dark' : 'Light'} Mode
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  logout()
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
