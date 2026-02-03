"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import api from "@/lib/axios-instance";

// ---------------- Types ----------------
export interface Bill {
  _id: string;
  customerId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        phone: string;
      };
  items: {
    menuId:
      | string
      | {
          _id: string;
          name: string;
          half?: number;
          full?: number;
          unit?: string;
        };
    name: string;
    size: string;
    unit: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  total: number;
  paid?: number;
  balance?: number;
  date: string;
}

export interface DailySales {
  date: string;
  sales: number;
  bills: number;
}

interface BillingState {
  bills: Bill[];
  dailySales: DailySales[];
  totals: { totalSales: number; totalBills: number };
  loading: boolean;
  error: string | null;
}

// ---------------- Initial State ----------------
const initialState: BillingState = {
  bills: [],
  dailySales: [],
  totals: { totalSales: 0, totalBills: 0 },
  loading: false,
  error: null,
};

// ---------------- Async Thunks ----------------

// Create Bill
export const createBill = createAsyncThunk(
  "billing/createBill",
  async (
    { customerId, items, date }: { customerId: string; items: any[]; date?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/admin/bill", { customerId, items, date });
      return res.data.bill;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to create bill");
      return rejectWithValue(err.response?.data?.msg || "Failed to create bill");
    }
  }
);

// Fetch All Bills
export const fetchAllBills = createAsyncThunk(
  "billing/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/bill");
      return res.data.bills;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to fetch bills");
      return rejectWithValue(err.response?.data?.msg || "Failed to fetch bills");
    }
  }
);

// Fetch Bill by ID
export const getBillById = createAsyncThunk(
  "billing/getBillById",
  async (billId: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/bill/${billId}`);
      return res.data.bill;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to fetch bill");
      return rejectWithValue(err.response?.data?.msg || "Failed to fetch bill");
    }
  }
);

// Update Bill
export const updateBill = createAsyncThunk(
  "billing/updateBill",
  async (
    { billId, customerId, items, date }: { billId: string; customerId: string; items: any[]; date?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/admin/bill/${billId}`, { customerId, items, date });
      return res.data.bill;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to update bill");
      return rejectWithValue(err.response?.data?.msg || "Failed to update bill");
    }
  }
);

// Delete Bill
export const deleteBill = createAsyncThunk(
  "billing/delete",
  async ({ billId, customerId }: { billId: string; customerId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/bill/${billId}`, { data: { customerId } });
      return billId;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to delete bill");
      return rejectWithValue(err.response?.data?.msg || "Failed to delete bill");
    }
  }
);

// Fetch Daily Sales
export const fetchDailySales = createAsyncThunk<
  { data: DailySales[]; totals: { totalSales: number; totalBills: number } },
  { days?: number } | undefined,
  { rejectValue: string }
>(
  "billing/fetchDailySales",
  async ({ days } = { days: 30 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/sales?days=${days}`);
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to fetch daily sales");
      return rejectWithValue(err.response?.data?.msg || "Failed to fetch daily sales");
    }
  }
);

// ---------------- Slice ----------------
const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    clearBillingState(state) {
      state.bills = [];
      state.dailySales = [];
      state.totals = { totalSales: 0, totalBills: 0 };
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Bill
      .addCase(createBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.loading = false;
        state.bills.unshift(action.payload);
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch All Bills
      .addCase(fetchAllBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBills.fulfilled, (state, action: PayloadAction<Bill[]>) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchAllBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Bill By ID
      .addCase(getBillById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBillById.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.loading = false;
        const index = state.bills.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.bills[index] = action.payload;
        else state.bills.unshift(action.payload);
      })
      .addCase(getBillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Bill
      .addCase(updateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.loading = false;
        const index = state.bills.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.bills[index] = action.payload;
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Bill
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.bills = state.bills.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Daily Sales
      .addCase(fetchDailySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDailySales.fulfilled,
        (state, action: PayloadAction<{ data: DailySales[]; totals: { totalSales: number; totalBills: number } }>) => {
          state.loading = false;
          state.dailySales = action.payload.data;
          state.totals = action.payload.totals;
        }
      )
      .addCase(fetchDailySales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBillingState } = billingSlice.actions;
export default billingSlice.reducer;
