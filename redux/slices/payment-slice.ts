'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@/lib/axios-instance'

export interface Payment {
  _id: string
  customerId: any
  billId?: any
  amount: number
  method?: string
  note?: string
  date: string
}

interface PaymentState {
  payments: Payment[]
  loading: boolean
  error: string | null
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
}

/* ======================================================
   CREATE PAYMENT
====================================================== */
export const createPayment = createAsyncThunk(
  'payment/createPayment',
  async (
    data: {
      customerId: string
      billId?: string
      amount: number
      method?: string
      note?: string
      date?: Date
    },
    thunkAPI
  ) => {
    try {
      const res = await api.post('/admin/payment', data)
      return res.data.payment
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to create payment'
      )
    }
  }
)

/* ======================================================
   GET ALL PAYMENTS
====================================================== */
export const fetchAllPayments = createAsyncThunk(
  'payment/fetchAllPayments',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/payment')
      return res.data.payments
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch payments'
      )
    }
  }
)

/* ======================================================
   GET PAYMENTS BY CUSTOMER
====================================================== */
export const fetchPaymentsByCustomer = createAsyncThunk(
  'payment/fetchPaymentsByCustomer',
  async (customerId: string, thunkAPI) => {
    try {
      const res = await api.get(`/admin/payment/customer/${customerId}`)
      return res.data.payments
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch customer payments'
      )
    }
  }
)

/* ======================================================
   DELETE PAYMENT
====================================================== */
export const deletePayment = createAsyncThunk(
  'payment/deletePayment',
  async (paymentId: string, thunkAPI) => {
    try {
      await api.delete(`/admin/payment/${paymentId}`)
      return paymentId
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to delete payment'
      )
    }
  }
)

/* ======================================================
   SLICE
====================================================== */
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPayments: (state) => {
      state.payments = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        state.loading = false
        state.payments.unshift(action.payload)
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // FETCH ALL
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false
        state.payments = action.payload
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // FETCH BY CUSTOMER
      .addCase(fetchPaymentsByCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentsByCustomer.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false
        state.payments = action.payload
      })
      .addCase(fetchPaymentsByCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // DELETE
      .addCase(deletePayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePayment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.payments = state.payments.filter((p) => p._id !== action.payload)
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearPayments } = paymentSlice.actions
export default paymentSlice.reducer
