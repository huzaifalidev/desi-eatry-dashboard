import api from '@/lib/axios';
export const API_BASE = '/menu';
export async function fetchMenus() {
  const res = await api.get(API_BASE,{});
  // pass 
  return res.data;
}
export async function createMenu(data: any) {
  const res = await api.post(API_BASE, data);
  return res.data;
}
export async function updateMenu(id: string, data: any) {
  const res = await api.put(`${API_BASE}/${id}`, data);
  return res.data;
}
export async function deleteMenu(id: string) {
  const res = await api.delete(`${API_BASE}/${id}`);
  return res.data;
}
