// src/features/admin/adminSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios-instance";
import { toast } from "sonner";
interface AdminState {
  admin: any | null;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  isAuthenticated: boolean;
  theme: "light" | "dark";
}

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
      toast.success(`Welcome back, ${res.data.admin.firstName} ${res.data.admin.lastName} !`)
      window.location.href = '/dashboard';
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
  (Used on refresh & new tab)
=========================== */
export const fetchAdminData = createAsyncThunk(
  "admin/fetchAdminData",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/admin/me");
      return res.data.admin;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.msg || "Session expired"
      );
    }
  }
);

/* ===========================
  LOGOUT ADMIN
=========================== */
export const logoutAdmin = createAsyncThunk("admin/logoutAdmin", async () => {
  try {
    await api.post("/admin/logout");
  } catch (err) {
    console.error("Logout error", err);
  }
});

/* ===========================
  SLICE
=========================== */
const initialState: AdminState = {
  admin: null,
  loading: false,
  error: null,
  sidebarCollapsed: false,
  isAuthenticated: false,
  theme: "dark",
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      if (typeof window !== "undefined") {
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
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Fetch Admin (session restore)
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchAdminData.rejected, (state) => {
        state.loading = false;
        state.admin = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
      });
  },
});

export const { toggleSidebar } = adminSlice.actions;

export default adminSlice.reducer;
