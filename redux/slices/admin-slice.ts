// src/features/admin/adminSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios-instance";

interface AdminState {
  admin: any | null;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
}

const isClient = () => typeof window !== "undefined";

/* ===========================
   ADMIN LOGIN
=========================== */
export const loginAdmin = createAsyncThunk(
  "admin/loginAdmin",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await api.post("/admin/signin", { email, password });

      if (isClient()) {
        localStorage.setItem("accesstoken", res.data.accessToken);
        localStorage.setItem("refreshtoken", res.data.refreshToken);
      }

      return res.data.admin;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || "Login failed"
      );
    }
  }
);

/* ===========================
   FETCH LOGGED-IN ADMIN
=========================== */
export const fetchAdminData = createAsyncThunk(
  "admin/fetchAdminData",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/admin/me");
      return res.data.admin;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || "Fetch failed"
      );
    }
  }
);

/* ===========================
   LOGOUT ADMIN
=========================== */
export const logoutAdmin = createAsyncThunk("admin/logoutAdmin", async () => {
  if (!isClient()) return;

  try {
    await api.post("/admin/logout");
  } catch (err) {
    console.error("Logout error", err);
  }

  localStorage.removeItem("accesstoken");
  localStorage.removeItem("refreshtoken");
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
  name: "admin",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      if (isClient()) {
        localStorage.setItem(
          "sidebarCollapsed",
          state.sidebarCollapsed.toString()
        );
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
