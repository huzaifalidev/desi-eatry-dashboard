'use client'

import { LoaderIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
interface SpinnerProps extends React.ComponentProps<'svg'> {
  size?: number | string 
}
function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  const style = typeof size === 'number' ? { width: size, height: size } : {}
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', className)}
      style={style}
      {...props}
    />
  )
}

export { Spinner }
