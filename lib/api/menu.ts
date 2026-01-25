export const API_BASE = '/api/menu' // Adjust if your API route is different

export async function fetchMenus() {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error('Failed to fetch menus')
  return res.json()
}

export async function createMenu(data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create menu')
  return res.json()
}

export async function updateMenu(id: string, data: any) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update menu')
  return res.json()
}

export async function deleteMenu(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete menu')
  return res.json()
}
