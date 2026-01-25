import api from '@/lib/axios';

export const API_BASE = '/customer';

// ---------------- Fetch all customers ----------------
export async function fetchCustomers() {
  const res = await api.get(API_BASE);
  return res.data;
}

// ---------------- Fetch single customer ----------------
export async function fetchCustomer(id: string) {
  const res = await api.get(`${API_BASE}/${id}`);
  return res.data;
}

// ---------------- Create a new customer ----------------
export async function createCustomer(data: {
  name: string;
  phone: string;
  address?: string;
  password?: string;
}) {
  const res = await api.post(API_BASE, data);
  return res.data;
}

// ---------------- Update customer ----------------
export async function updateCustomer(
  id: string,
  data: { name?: string; phone?: string; address?: string; isActive?: boolean }
) {
  const res = await api.put(`${API_BASE}/${id}`, data);
  return res.data;
}

// ---------------- Delete (soft delete) customer ----------------
export async function deleteCustomer(id: string) {
  const res = await api.delete(`${API_BASE}/${id}`);
  return res.data;
}

// ---------------- Restore soft-deleted customer (optional) ----------------
export async function restoreCustomer(id: string) {
  const res = await api.post(`${API_BASE}/${id}/restore`);
  return res.data;
}
