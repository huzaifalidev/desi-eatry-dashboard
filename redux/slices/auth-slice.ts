// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { config } from '../../config/config';

interface UserState {
  user: any | null;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
}

// ---------------- Login User ----------------
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await axios.post(`${config.apiUrl}/auth/login`, { email, password });
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data?.msg || 'Login failed');
    }
  }
);

// ---------------- Refresh Access Token ----------------
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, thunkAPI) => {
    const refreshToken = localStorage.getItem('refreshtoken');
    if (!refreshToken) {
      thunkAPI.dispatch(logoutUser());
      return thunkAPI.rejectWithValue('No refresh token');
    }

    try {
      const res = await axios.post(`${config.apiUrl}/admin/refresh-token`, { refreshToken });
      const newAccessToken = res.data.accessToken;
      localStorage.setItem('accesstoken', newAccessToken);
      return newAccessToken;
    } catch (err: any) {
      thunkAPI.dispatch(logoutUser());
      return thunkAPI.rejectWithValue('Refresh token expired, please login again.');
    }
  }
);

// ---------------- Fetch Admin ----------------
export const fetchAdmin = createAsyncThunk(
  'auth/fetchAdmin',
  async (_, thunkAPI) => {
    const accessToken = localStorage.getItem('accesstoken')
    const refreshToken = localStorage.getItem('refreshtoken')

    if (!accessToken || !refreshToken)
      return thunkAPI.rejectWithValue('No access/refresh token')

    try {
      const res = await axios.post(
        `${config.apiUrl}/admin/get-admin`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      return res.data.user
    } catch (err: any) {
      if (
        err.response?.status === 401 &&
        err.response?.data?.msg === 'Access token expired'
      ) {
        const newAccessToken = await thunkAPI.dispatch(refreshAccessToken()).unwrap()

        const retryRes = await axios.post(
          `${config.apiUrl}/admin/get-admin`,
          {},
          { headers: { Authorization: `Bearer ${newAccessToken}` } }
        )

        return retryRes.data
      }

      return thunkAPI.rejectWithValue(err?.response?.data?.msg || 'Failed to fetch admin')
    }
  }
)



// ---------------- Logout User ----------------
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, thunkAPI) => {
  const accessToken = localStorage.getItem('accesstoken');

  if (accessToken) {
    try {
      await axios.post(
        `${config.apiUrl}/admin/logout`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (err) {
      console.error('Logout API error', err);
    }
  }

  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
});

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true' ? true : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    toggleSidebarCollapsed(state) {
      localStorage.setItem('sidebarCollapsed', (!state.sidebarCollapsed).toString())
      state.sidebarCollapsed = !state.sidebarCollapsed
    },

    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
  },
  extraReducers: (builder) => {

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        localStorage.setItem('accesstoken', action.payload.user.accessToken);
        localStorage.setItem('refreshtoken', action.payload.user.refreshToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Admin
    builder
      .addCase(fetchAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload // entire response { admin, msg }
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.user = null
      })


    // Refresh Access Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        // No state update needed, token already stored in localStorage
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.sidebarCollapsed = false
    });
  },
});
export const { toggleSidebarCollapsed, setSidebarCollapsed } = authSlice.actions
export default authSlice.reducer;
