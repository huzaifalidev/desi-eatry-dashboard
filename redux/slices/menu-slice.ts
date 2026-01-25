'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchMenus, createMenu, updateMenu, deleteMenu } from '@/lib/api/menu'

export interface MenuItem {
  _id: string
  name: string
  half: number
  full: number
  unit: string
  status: string
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

// ---------------- Async Thunks ----------------
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchMenus()
      return res.menus ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch menus')
    }
  }
)

export const addMenuItem = createAsyncThunk(
  'menu/addMenu',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await createMenu(data)
      return res.menu ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create menu item')
    }
  }
)

export const editMenuItem = createAsyncThunk(
  'menu/editMenu',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await updateMenu(id, data)
      return res.menu ?? res
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update menu item')
    }
  }
)

export const removeMenuItem = createAsyncThunk(
  'menu/deleteMenu',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteMenu(id)
      return id
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete menu item')
    }
  }
)

// ---------------- Slice ----------------
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
      // fetchMenus
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItems.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // addMenu
      .addCase(addMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // editMenu
      .addCase(editMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(editMenuItem.fulfilled, (state, action: PayloadAction<MenuItem>) => {
        state.loading = false
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        )
      })
      .addCase(editMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // deleteMenu
      .addCase(removeMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeMenuItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
      .addCase(removeMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearMenuState } = menuSlice.actions
export default menuSlice.reducer
