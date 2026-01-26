'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from 'sonner'
import { config } from '@/config/config'

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
  }
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

// Fetch all customers
export const fetchAllCustomers = createAsyncThunk(
  'customer/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accesstoken')
      const res = await axios.get(`${config.apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return res.data ?? []
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to fetch customers')
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch customers')
    }
  }
)

// Add new customer
export const addCustomer = createAsyncThunk(
  'customer/add',
  async (data: any, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accesstoken')
      const res = await axios.post(`${config.apiUrl}/admin/users`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      toast.success('Customer added successfully')
      return res.data.user
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to create customer')
      return rejectWithValue(err.response?.data?.msg || 'Failed to create customer')
    }
  }
)

// Edit customer
export const editCustomer = createAsyncThunk(
  'customer/edit',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accesstoken')
      const res = await axios.put(`${config.apiUrl}/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      toast.success('Customer updated successfully')
      return res.data.user
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to update customer')
      return rejectWithValue(err.response?.data?.msg || 'Failed to update customer')
    }
  }
)

// Fetch customer by ID
export const fetchCustomerById = createAsyncThunk(
  'customer/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accesstoken')
      const res = await axios.get(`${config.apiUrl}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return res.data
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to fetch customer')
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch customer')
    }
  }
)

// Soft delete customer
export const removeCustomer = createAsyncThunk(
  'customer/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('accesstoken')
      await axios.delete(`${config.apiUrl}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      toast.success('Customer deleted successfully')
      return id
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to delete customer')
      return rejectWithValue(err.response?.data?.msg || 'Failed to delete customer')
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
      // fetchCustomerById  
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true
        state.error = null
      } )
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.loading = false
        state.customer = action.payload
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCustomerState } = customerSlice.actions
export default customerSlice.reducer
