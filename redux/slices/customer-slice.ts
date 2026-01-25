'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
} from '@/lib/api/customer'

export interface Customer {
  _id: string
  name: string
  phone: string
  address?: string
  isActive?: boolean
  totalBilled?: number
  totalPaid?: number
  balance?: number
}

interface CustomerState {
  customers: Customer[]
  loading: boolean
  error: string | null
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
}

// ---------------- Async Thunks ----------------
export const fetchAllCustomers = createAsyncThunk(
  'customer/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchCustomers()
      return res.customers ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch customers')
    }
  }
)

export const addCustomer = createAsyncThunk(
  'customer/add',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await createCustomer(data)
      return res.customer ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create customer')
    }
  }
)

export const editCustomer = createAsyncThunk(
  'customer/edit',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await updateCustomer(id, data)
      return res.customer ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update customer')
    }
  }
)

export const removeCustomer = createAsyncThunk(
  'customer/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteCustomer(id)
      return id
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete customer')
    }
  }
)

export const restoreCustomerById = createAsyncThunk(
  'customer/restore',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await restoreCustomer(id)
      return res.customer ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to restore customer')
    }
  }
)

// ---------------- Slice ----------------
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerState(state) {
      state.customers = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllCustomers
      .addCase(fetchAllCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.loading = false
        state.customers = action.payload
      })
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // addCustomer
      .addCase(addCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false
        state.customers.unshift(action.payload)
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // editCustomer
      .addCase(editCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(editCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false
        state.customers = state.customers.map((c) =>
          c._id === action.payload._id ? action.payload : c
        )
      })
      .addCase(editCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // removeCustomer
      .addCase(removeCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.customers = state.customers.filter((c) => c._id !== action.payload)
      })
      .addCase(removeCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // restoreCustomerById
      .addCase(restoreCustomerById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(restoreCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false
        state.customers.unshift(action.payload)
      })
      .addCase(restoreCustomerById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCustomerState } = customerSlice.actions
export default customerSlice.reducer
