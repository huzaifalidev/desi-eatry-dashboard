'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { toggleSidebarCollapsed } from '@/redux/slices/auth-slice'
import { useDispatch, useSelector } from 'react-redux'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/menu', label: 'Food Menu', icon: UtensilsCrossed },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
}) {
  const dispatch = useDispatch()
  const sidebarCollapsed = useSelector((state: any) => state.auth.sidebarCollapsed)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed z-50 lg:static inset-y-0 left-0 bg-[#fafafa] dark:bg-zinc-900 border-r transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between h-16 border-b px-2">
          {/* Logo for desktop or expanded */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 p-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 dark:bg-white rounded-full" />
              <span className="font-bold text-lg px-2">Desi Eatry</span>
            </div>
          )}

          {/* Centered logo when collapsed */}
          {sidebarCollapsed && (
            <div className="flex-1 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSidebarCollapsed())}
                className="h-8 w-8 p-0 flex items-center justify-center relative group"
              >
                {/* Logo */}
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-8 w-8 dark:bg-white rounded-full transition-opacity duration-200 group-hover:opacity-0 absolute"
                />
                {/* Hover arrow */}
                <ChevronRight className="h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 absolute" />
              </Button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Desktop collapse toggle */}
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebarCollapsed())}
                className="hidden lg:flex"
              >
                <ChevronLeft />
              </Button>
            )}
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden"
            >
              <X />
            </Button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <TooltipProvider delayDuration={0}>
            {menuItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)

              const button = (
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href={item.href} className="flex items-center w-full gap-3">
                    <item.icon size={20} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </Button>
              )

              return sidebarCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{button}</div>
              )
            })}
          </TooltipProvider>
        </nav>
      </aside>
    </>
  )
}
