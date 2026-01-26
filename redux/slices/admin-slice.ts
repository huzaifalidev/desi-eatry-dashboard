// src/features/admin/adminSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { config } from '../../config/config';

interface AdminState {
  admin: any | null;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
}

const isClient = () => typeof window !== 'undefined';

/* ===========================
   ADMIN LOGIN
=========================== */
export const loginAdmin = createAsyncThunk(
  'admin/loginAdmin',
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${config.apiUrl}/admin/signin`, { email, password });

      if (isClient()) {
        localStorage.setItem('accesstoken', res.data.accessToken);
        localStorage.setItem('refreshtoken', res.data.refreshToken);
      }

      return res.data.admin;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data?.msg || 'Login failed');
    }
  }
);

/* ===========================
   REFRESH ACCESS TOKEN
=========================== */
export const refreshAdminToken = createAsyncThunk(
  'admin/refreshAdminToken',
  async (_, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser');

    const refreshToken = localStorage.getItem('refreshtoken');
    if (!refreshToken) {
      thunkAPI.dispatch(logoutAdmin());
      return thunkAPI.rejectWithValue('No refresh token');
    }

    try {
      const res = await axios.post(
        `${config.apiUrl}/admin/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      const newAccessToken = res.data.accessToken;
      localStorage.setItem('accesstoken', newAccessToken);
      return newAccessToken;
    } catch (err: any) {
      thunkAPI.dispatch(logoutAdmin());
      return thunkAPI.rejectWithValue('Session expired');
    }
  }
);

/* ===========================
   FETCH LOGGED-IN ADMIN
=========================== */
export const fetchAdminData = createAsyncThunk(
  'admin/fetchAdminData',
  async (_, thunkAPI) => {
    if (!isClient()) return thunkAPI.rejectWithValue('Not in browser');

    const accessToken = localStorage.getItem('accesstoken');
    if (!accessToken) return thunkAPI.rejectWithValue('No access token');

    try {
      const res = await axios.get(
        `${config.apiUrl}/admin/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return res.data.admin;
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Try refreshing token
        const newToken = await thunkAPI.dispatch(refreshAdminToken()).unwrap();

        const retry = await axios.get(
          `${config.apiUrl}/admin/me`,
          { headers: { Authorization: `Bearer ${newToken}` } }
        );
        return retry.data.admin;
      }
      return thunkAPI.rejectWithValue(err?.response?.data?.msg || 'Fetch failed');
    }
  }
);

/* ===========================
   LOGOUT ADMIN
=========================== */
export const logoutAdmin = createAsyncThunk('admin/logoutAdmin', async () => {
  if (!isClient()) return;

  const accessToken = localStorage.getItem('accesstoken');

  try {
    if (accessToken) {
      await axios.post(`${config.apiUrl}/admin/logout`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
    }
  } catch (err) {
    console.error('Logout error', err);
  }
  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
});

/* ===========================
   SLICE
=========================== */
const initialState: AdminState = {
  admin: null,
  loading: false,
  error: null,
  sidebarCollapsed: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      if (isClient()) {
        localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString());
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Admin
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.admin = null;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { toggleSidebar } = adminSlice.actions;

export default adminSlice.reducer;
