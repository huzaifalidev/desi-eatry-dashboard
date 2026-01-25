export interface Customer {
  _id: string
  firstName: string
  lastName: string
  phone: string
  address?: string
  totalBilled: number
  totalPaid: number
  balance: number
  lastBillDate: string
}


export interface MenuItem {
  id: string
  name: string
  half: number
  full: number
  unit: string
  status: 'active' | 'inactive'
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  stock: number
  unit: string
  minStock: number
}

export interface Bill {
  id: string
  customerId: string
  date: string
  items: BillItem[]
  total: number
}

export interface BillItem {
  id: string
  name: string
  size: 'half' | 'full'
  unit: string
  quantity: number
  total: number
}

export interface Payment {
  id: string
  customerId: string
  amount: number
  date: string
  method: string
}

export interface Purchase {
  id: string
  date: string
  item: string
  quantity: number
  unit: string
  cost: number
}

// Mock Customers Data
export const mockCustomers: Customer[] = [
  {
    _id: '1',
    firstName: 'Sara',
    lastName: 'Ahmed',
    phone: '+92 300 1234567',
    totalBilled: 15000,
    totalPaid: 12000,
    balance: 3000,
    lastBillDate: '2024-01-20',
  },
  {
    _id: '2',
    firstName: 'Ahmed',
    lastName: 'Khan',
    phone: '+92 321 2345678',
    totalBilled: 8500,
    totalPaid: 8500,
    balance: 0,
    lastBillDate: '2024-01-18',
  },
  {
    _id: '3',
    firstName: 'Fatima',
    lastName: 'Ali',
    phone: '+92 333 3456789',
    totalBilled: 22000,
    totalPaid: 15000,
    balance: 7000,
    lastBillDate: '2024-01-22',
  },
  {
    _id: '4',
    firstName: 'Hassan',
    lastName: 'Sheikh',
    phone: '+92 345 4567890',
    totalBilled: 5500,
    totalPaid: 5500,
    balance: 0,
    lastBillDate: '2024-01-19',
  },
  {
    _id: '5',
    firstName: 'Ayesha',
    lastName: 'Zafar',
    phone: '+92 300 5678901',
    totalBilled: 18000,
    totalPaid: 10000,
    balance: 8000,
    lastBillDate: '2024-01-21',
  },
]

// Mock Food Menu Data
export const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Chicken Biryani', half: 250, full: 450, unit: 'plate', status: 'active' },
  { id: '2', name: 'Mutton Karahi', half: 280, full: 500, unit: 'plate', status: 'active' },
  { id: '3', name: 'Dal Chawal', half: 150, full: 280, unit: 'plate', status: 'active' },
  { id: '4', name: 'Nihari', half: 200, full: 380, unit: 'plate', status: 'active' },
  { id: '5', name: 'Seekh Kebab', half: 120, full: 220, unit: 'plate', status: 'active' },
  { id: '6', name: 'Lassi', half: 0, full: 80, unit: 'glass', status: 'active' },
]

// Mock Inventory Data
export const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Basmati Rice', category: 'Grains', stock: 50, unit: 'kg', minStock: 10 },
  { id: '2', name: 'Chicken', category: 'Meat', stock: 8, unit: 'kg', minStock: 15 },
  { id: '3', name: 'Mutton', category: 'Meat', stock: 5, unit: 'kg', minStock: 10 },
  { id: '4', name: 'Onions', category: 'Vegetables', stock: 25, unit: 'kg', minStock: 5 },
  { id: '5', name: 'Tomatoes', category: 'Vegetables', stock: 3, unit: 'kg', minStock: 8 },
  { id: '6', name: 'Lentils', category: 'Grains', stock: 30, unit: 'kg', minStock: 5 },
]

// Mock Bills Data
export const mockBills: Bill[] = [
  {
    id: '1',
    customerId: '1',
    date: '2024-01-20',
    items: [
      { id: '1', name: 'Chicken Biryani', size: 'full', unit: 'plate', quantity: 2, total: 900 },
      { id: '2', name: 'Lassi', size: 'full', unit: 'glass', quantity: 2, total: 160 },
    ],
    total: 1060,
  },
  {
    id: '2',
    customerId: '1',
    date: '2024-01-18',
    items: [
      { id: '3', name: 'Mutton Karahi', size: 'full', unit: 'plate', quantity: 1, total: 500 },
    ],
    total: 500,
  },
]

// Mock Payments Data
export const mockPayments: Payment[] = [
  { id: '1', customerId: '1', amount: 5000, date: '2024-01-15', method: 'Cash' },
  { id: '2', customerId: '1', amount: 7000, date: '2024-01-10', method: 'Bank Transfer' },
  { id: '3', customerId: '3', amount: 7000, date: '2024-01-20', method: 'Cash' },
  { id: '4', customerId: '3', amount: 8000, date: '2024-01-05', method: 'Bank Transfer' },
]

// Mock Purchases Data
export const mockPurchases: Purchase[] = [
  { id: '1', date: '2024-01-22', item: 'Basmati Rice', quantity: 25, unit: 'kg', cost: 2500 },
  { id: '2', date: '2024-01-21', item: 'Chicken', quantity: 10, unit: 'kg', cost: 3500 },
  { id: '3', date: '2024-01-20', item: 'Onions', quantity: 20, unit: 'kg', cost: 800 },
]

export const getCustomerById = (_id: string) => {
  return mockCustomers.find((c) => c._id === _id)
}

export const getCustomerBills = (customerId: string) => {
  return mockBills.filter((b) => b.customerId === customerId)
}

export const getCustomerPayments = (customerId: string) => {
  return mockPayments.filter((p) => p.customerId === customerId)
}
