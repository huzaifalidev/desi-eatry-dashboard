// src/features/admin/adminSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios-instance";
import { toast } from "sonner";

type ThemeMode = "light" | "dark" | "system";

interface AdminState {
  admin: any | null;
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  isAuthenticated: boolean;
  theme: ThemeMode;
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
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      const res = await api.post("/admin/signin", { email, password });

      const { accessToken, refreshToken, admin } = res.data;

      // ✅ STORE TOKENS
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast.success(
        `Welcome back, ${admin.firstName} ${admin.lastName}!`
      );

      return admin;
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
        err?.response?.data?.msg || "Session expired"
      );
    }
  }
);

/* ===========================
  LOGOUT ADMIN
=========================== */
export const logoutAdmin = createAsyncThunk(
  "admin/logoutAdmin",
  async () => {
    try {
      await api.post("/admin/logout");
    } catch (_) { }
    finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
);


/* ===========================
  SLICE
=========================== */
const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as ThemeMode) || "system";
};

const initialState: AdminState = {
  admin: null,
  loading: false,
  error: null,
  sidebarCollapsed: false,
  isAuthenticated:
    typeof window !== "undefined" &&
    !!localStorage.getItem("accessToken"),
  theme: getInitialTheme(),
};
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },

    clearAuth(state) {
      state.admin = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
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

      // Fetch Admin
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
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
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { toggleSidebar, setTheme, clearAuth } = adminSlice.actions;
export default adminSlice.reducer;
