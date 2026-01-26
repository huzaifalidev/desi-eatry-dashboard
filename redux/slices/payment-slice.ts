import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import {config} from '@/config/config'
import { refreshAdminToken } from './admin-slice'
import { isClient } from '@/lib/is-client'

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
   Helpers
====================================================== */
const authHeader = () => {
  const token = localStorage.getItem('accesstoken')
  return { Authorization: `Bearer ${token}` }
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
    thunkAPI,
  ) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    const token = localStorage.getItem('accesstoken')
    if (!token) return thunkAPI.rejectWithValue('No access token')

    try {
      const res = await axios.post(
        `${config.apiUrl}/admin/payment`,
        data,
        { headers: authHeader() },
      )
      return res.data.payment
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        const retry = await axios.post(
          `${config.apiUrl}/admin/payment`,
          data,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return retry.data.payment
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to create payment',
      )
    }
  },
)

/* ======================================================
   GET ALL PAYMENTS
====================================================== */
export const fetchAllPayments = createAsyncThunk(
  'payment/fetchAllPayments',
  async (_, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    const token = localStorage.getItem('accesstoken')
    if (!token) return thunkAPI.rejectWithValue('No access token')

    try {
      const res = await axios.get(
        `${config.apiUrl}/admin/payment`,
        { headers: authHeader() },
      )
      return res.data.payments
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        const retry = await axios.get(
          `${config.apiUrl}/admin/payment`,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return retry.data.payments
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch payments',
      )
    }
  },
)

/* ======================================================
   GET PAYMENTS BY CUSTOMER
====================================================== */
export const fetchPaymentsByCustomer = createAsyncThunk(
  'payment/fetchPaymentsByCustomer',
  async (customerId: string, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    const token = localStorage.getItem('accesstoken')
    if (!token) return thunkAPI.rejectWithValue('No access token')

    try {
      const res = await axios.get(
        `${config.apiUrl}/admin/payment/customer/${customerId}`,
        { headers: authHeader() },
      )
      return res.data.payments
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        const retry = await axios.get(
          `${config.apiUrl}/admin/payment/customer/${customerId}`,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return retry.data.payments
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch customer payments',
      )
    }
  },
)

/* ======================================================
   DELETE PAYMENT
====================================================== */
export const deletePayment = createAsyncThunk(
  'payment/deletePayment',
  async (paymentId: string, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    const token = localStorage.getItem('accesstoken')
    if (!token) return thunkAPI.rejectWithValue('No access token')

    try {
      await axios.delete(
        `${config.apiUrl}/admin/payment/${paymentId}`,
        { headers: authHeader() },
      )
      return paymentId
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        await axios.delete(
          `${config.apiUrl}/admin/payment/${paymentId}`,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return paymentId
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to delete payment',
      )
    }
  },
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
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createPayment.pending, (state) => {
        state.loading = true
      })
      .addCase(createPayment.fulfilled, (state, action) => {
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
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // FETCH BY CUSTOMER
      .addCase(fetchPaymentsByCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.payments = action.payload
      })

      // DELETE
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(
          (p) => p._id !== action.payload,
        )
      })
  },
})

export const { clearPayments } = paymentSlice.actions
export default paymentSlice.reducer
