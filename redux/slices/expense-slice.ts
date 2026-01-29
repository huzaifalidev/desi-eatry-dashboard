'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@/lib/axios-instance'

export interface ExpenseItem {
  _id: string
  type: string
  item: string
  date: string
  quantity: number
  unitPrice: number
  totalAmount: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface ExpenseState {
  items: ExpenseItem[]
  loading: boolean
  error: string | null
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
  error: null,
}

/* ======================================================
   FETCH ALL EXPENSES (ADMIN)
====================================================== */
export const fetchExpenses = createAsyncThunk(
  'expense/fetchExpenses',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/expense')
      return res.data.expenses || res.data
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch expenses'
      )
    }
  }
)

/* ======================================================
   CREATE EXPENSE (ADMIN)
====================================================== */
export const addExpense = createAsyncThunk(
  'expense/addExpense',
  async (data: Partial<ExpenseItem>, thunkAPI) => {
    try {
      const res = await api.post('/admin/expense', data)
      return res.data.expense
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to create expense'
      )
    }
  }
)

/* ======================================================
   UPDATE EXPENSE (ADMIN)
====================================================== */
export const editExpense = createAsyncThunk(
  'expense/editExpense',
  async (
    { id, data }: { id: string; data: Partial<ExpenseItem> },
    thunkAPI
  ) => {
    try {
      const res = await api.put(`/admin/expense/${id}`, data)
      return res.data.expense
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to update expense'
      )
    }
  }
)

/* ======================================================
   DELETE EXPENSE (ADMIN)
====================================================== */
export const removeExpense = createAsyncThunk(
  'expense/removeExpense',
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/admin/expense/${id}`)
      return id
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to delete expense'
      )
    }
  }
)

/* ======================================================
   SLICE
====================================================== */
const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearExpenseState(state) {
      state.items = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchExpenses.fulfilled,
        (state, action: PayloadAction<ExpenseItem[]>) => {
          state.loading = false
          state.items = action.payload
        }
      )
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // CREATE
      .addCase(addExpense.pending, (state) => {
        state.loading = true
      })
      .addCase(addExpense.fulfilled, (state, action: PayloadAction<ExpenseItem>) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // UPDATE
      .addCase(editExpense.fulfilled, (state, action: PayloadAction<ExpenseItem>) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        )
      })

      // DELETE
      .addCase(removeExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
  },
})

export const { clearExpenseState } = expenseSlice.actions
export default expenseSlice.reducer
