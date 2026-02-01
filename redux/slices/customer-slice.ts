"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import api from "@/lib/axios-instance";
import { Customer, CustomerData } from "@/lib/types";

interface CustomerState {
  customers: Customer[];
  selectedCustomer: CustomerData | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
};
// ---------------- Async Thunks ----------------

// Fetch all customers
export const fetchAllCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/users");
      return res.data ?? [];
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to fetch customers");
      return rejectWithValue(
        err.response?.data?.msg || "Failed to fetch customers",
      );
    }
  },
);

// Add new customer
export const addCustomer = createAsyncThunk(
  "customer/add",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/users", data);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to create customer");
      return rejectWithValue(
        err.response?.data?.msg || "Failed to create customer",
      );
    }
  },
);

// Edit customer
export const editCustomer = createAsyncThunk(
  "customer/edit",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/users/${id}`, data);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to update customer");
      return rejectWithValue(
        err.response?.data?.msg || "Failed to update customer",
      );
    }
  },
);

// Fetch customer by ID
export const fetchCustomerById = createAsyncThunk(
  "customer/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to fetch customer");
      return rejectWithValue(
        err.response?.data?.msg || "Failed to fetch customer",
      );
    }
  },
);

// Soft delete customer
export const removeCustomer = createAsyncThunk(
  "customer/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to delete customer");
      return rejectWithValue(
        err.response?.data?.msg || "Failed to delete customer",
      );
    }
  },
);

// ---------------- Slice ----------------
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearCustomerState(state) {
      state.customers = [];
      state.selectedCustomer = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllCustomers.fulfilled,
        (state, action: PayloadAction<Customer[]>) => {
          state.loading = false;
          state.customers = action.payload;
        },
      )
      .addCase(fetchAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addCustomer.fulfilled,
        (state, action: PayloadAction<Customer>) => {
          state.loading = false;
          state.customers.unshift(action.payload);
        },
      )
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Edit
      .addCase(editCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        editCustomer.fulfilled,
        (state, action: PayloadAction<Customer>) => {
          state.loading = false;
          state.customers = state.customers.map((c) =>
            c._id === action.payload._id ? action.payload : c,
          );
        },
      )
      .addCase(editCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(removeCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        removeCustomer.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.customers = state.customers.filter(
            (c) => c._id !== action.payload,
          );
        },
      )
      .addCase(removeCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCustomerById.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          const fetchedCustomer = action.payload;
          state.selectedCustomer = fetchedCustomer;
        },
      )
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCustomerState } = customerSlice.actions;
export default customerSlice.reducer;
