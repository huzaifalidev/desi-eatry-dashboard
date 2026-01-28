import type { ReactNode } from 'react'

export interface CustomerData {
    user: Customer
    bills: Bill[]
    payments: Payment[]
}

export interface Customer {
    _id: string
    firstName: string
    lastName: string
    phone: string
    address?: string
    isActive?: boolean
    summary?: {
        totalBilled: number
        totalPaid: number
        balance: number
    },
    bills: Bill[]
    payments: Payment[]
}

export type Size = 'half' | 'full'

export interface BillItem {
    _id?: string
    menuId: string
    name: string
    size: Size
    unit: string
    quantity: number
    price: number
    total: number
}

export interface Bill {
    _id: string
    date: string
    total: number
    items: BillItem[]
}

export interface Payment {
    _id: string
    date: string
    amount: number
    method: string
}

export interface MenuItem {
    _id: string
    name: string
    unit: string
    half: number
    full: number
}

export interface DashboardLayoutProps {
    children: ReactNode
}

export interface BillEntryDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerId: string
    customerFirstName: string
    customerLastName: string
}
