'use client'

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { config } from '@/config/config'
import { refreshAdminToken } from './admin-slice'
import { isClient } from '@/lib/is-client'

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
   Helpers
====================================================== */
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('accesstoken')}`,
})

/* ======================================================
   FETCH ALL MENUS (PUBLIC)
   GET /menus
====================================================== */
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenus',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${config.apiUrl}/menus`)
      return res.data.menus
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to fetch menus',
      )
    }
  },
)

/* ======================================================
   CREATE MENU (ADMIN)
   POST /menus
====================================================== */
export const addMenuItem = createAsyncThunk(
  'menu/createMenu',
  async (data: Partial<MenuItem>, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    try {
      const res = await axios.post(
        `${config.apiUrl}/menus`,
        data,
        { headers: authHeader() },
      )
      return res.data.menu
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        const retry = await axios.post(
          `${config.apiUrl}/menus`,
          data,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return retry.data.menu
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to create menu',
      )
    }
  },
)

/* ======================================================
   UPDATE MENU (ADMIN)
   PUT /menus/:id
====================================================== */
export const editMenuItem = createAsyncThunk(
  'menu/updateMenu',
  async (
    { id, data }: { id: string; data: Partial<MenuItem> },
    thunkAPI,
  ) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    try {
      const res = await axios.put(
        `${config.apiUrl}/menus/${id}`,
        data,
        { headers: authHeader() },
      )
      return res.data.menu
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        const retry = await axios.put(
          `${config.apiUrl}/menus/${id}`,
          data,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return retry.data.menu
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to update menu',
      )
    }
  },
)

/* ======================================================
   DELETE MENU (ADMIN)
   DELETE /menus/:id
====================================================== */
export const removeMenuItem = createAsyncThunk(
  'menu/deleteMenu',
  async (id: string, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser')

    try {
      await axios.delete(
        `${config.apiUrl}/menus/${id}`,
        { headers: authHeader() },
      )
      return id
    } catch (err: any) {
      if (err.response?.status === 403) {
        const newToken = await thunkAPI
          .dispatch(refreshAdminToken())
          .unwrap()

        await axios.delete(
          `${config.apiUrl}/menus/${id}`,
          { headers: { Authorization: `Bearer ${newToken}` } },
        )
        return id
      }

      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || 'Failed to delete menu',
      )
    }
  },
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
        },
      )
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // CREATE
      .addCase(addMenuItem.pending, (state) => {
        state.loading = true
      })
      .addCase(
        addMenuItem.fulfilled,
        (state, action: PayloadAction<MenuItem>) => {
          state.loading = false
          state.items.unshift(action.payload)
        },
      )
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // UPDATE
      .addCase(
        editMenuItem.fulfilled,
        (state, action: PayloadAction<MenuItem>) => {
          state.items = state.items.map((item) =>
            item._id === action.payload._id ? action.payload : item,
          )
        },
      )

      // DELETE
      .addCase(
        removeMenuItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (item) => item._id !== action.payload,
          )
        },
      )
  },
})

export const { clearMenuState } = menuSlice.actions
export default menuSlice.reducer
