'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@/lib/axios-instance'

export interface MenuItem {
  _id: string
  name: string
  half: number
  full: number
  unit: string
  status?: string
  createdAt?: string
}

interface MenuState {
  items: MenuItem[]
  loading: boolean
  error: string | null
}

const initialState: MenuState = {
  items: [],
  loading: false,
  error: null,
}

/* ======================================================
   FETCH ALL MENUS (PUBLIC)
====================================================== */
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenus',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/menus')
      return res.data.menus
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch menus'
      )
    }
  }
)

/* ======================================================
   CREATE MENU (ADMIN)
====================================================== */
export const addMenuItem = createAsyncThunk(
  'menu/createMenu',
  async (data: Partial<MenuItem>, thunkAPI) => {
    try {
      const res = await api.post('/menus', data)
      return res.data.menu
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to create menu'
      )
    }
  }
)

/* ======================================================
   UPDATE MENU (ADMIN)
====================================================== */
export const editMenuItem = createAsyncThunk(
  'menu/updateMenu',
  async ({ id, data }: { id: string; data: Partial<MenuItem> }, thunkAPI) => {
    try {
      const res = await api.put(`/menus/${id}`, data)
      return res.data.menu
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to update menu'
      )
    }
  }
)

/* ======================================================
   DELETE MENU (ADMIN)
====================================================== */
export const removeMenuItem = createAsyncThunk(
  'menu/deleteMenu',
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/menus/${id}`)
      return id
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to delete menu'
      )
    }
  }
)

/* ======================================================
   SLICE
====================================================== */
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenuState(state) {
      state.items = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchMenuItems.fulfilled,
        (state, action: PayloadAction<MenuItem[]>) => {
          state.loading = false
          state.items = action.payload
        }
      )
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // CREATE
      .addCase(addMenuItem.pending, (state) => {
        state.loading = true
      })
      .addCase(addMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // UPDATE
      .addCase(editMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        )
      })

      // DELETE
      .addCase(removeMenuItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
  },
})

export const { clearMenuState } = menuSlice.actions
export default menuSlice.reducer
