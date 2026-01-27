'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import api from '@/lib/axios-instance'

export interface Bill {
  _id: string
  customerId: string
  items: any[]
  total: number
  paid?: number
  balance?: number
  date: string
}

interface BillingState {
  bills: Bill[]
  loading: boolean
  error: string | null
}

const initialState: BillingState = {
  bills: [],
  loading: false,
  error: null,
}

// ---------------- Async Thunks ----------------

// Create bill
export const createBill = createAsyncThunk(
  'billing/createBill',
  async ({ customerId, items, date }: { customerId: string; items: any[]; date?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/admin/bill', { customerId, items, date })
      return res.data.bill
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to create bill')
      return rejectWithValue(err.response?.data?.msg || 'Failed to create bill')
    }
  }
)

// Fetch all bills
export const fetchAllBills = createAsyncThunk(
  'billing/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/admin/bill')
      return res.data.bills
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to fetch bills')
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch bills')
    }
  }
)

// Delete bill
export const deleteBill = createAsyncThunk(
  'billing/delete',
  async (billId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/bill/${billId}`)
      return billId
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to delete bill')
      return rejectWithValue(err.response?.data?.msg || 'Failed to delete bill')
    }
  }
)

// ---------------- Slice ----------------
const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBillingState(state) {
      state.bills = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create bill
      .addCase(createBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.loading = false
        state.bills.unshift(action.payload)
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch all bills
      .addCase(fetchAllBills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllBills.fulfilled, (state, action: PayloadAction<Bill[]>) => {
        state.loading = false
        state.bills = action.payload
      })
      .addCase(fetchAllBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Delete bill
      .addCase(deleteBill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBill.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.bills = state.bills.filter((b) => b._id !== action.payload)
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearBillingState } = billingSlice.actions
export default billingSlice.reducer
