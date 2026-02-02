'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '../ui/skeleton'
import { LucideIcon } from 'lucide-react'

export interface InsightCard {
  title: string
  value?: number | string
  count?: number
  icon?: LucideIcon
  valuePrefix?: string
  valueDecimals?: number
}

interface Props {
  cards: InsightCard[]
  loading?: boolean
}

export function InsightsCards({ cards, loading = false }: Props) {
  // ===== Skeleton =====
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // ===== Actual Content =====
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {Icon && <Icon size={16} />}
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold leading-none ">
                {card.valuePrefix || ''}{' '}
                {typeof card.value === 'number'
                  ? card.value.toFixed(card.valueDecimals ?? 0)
                  : card.value}
              </p>
              {card.count !== undefined && (
                <p className="text-xs text-muted-foreground mt-1 leading-none">
                  {card.count} {card.title.toLowerCase().includes('items') ? 'items' : 'entries'}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
