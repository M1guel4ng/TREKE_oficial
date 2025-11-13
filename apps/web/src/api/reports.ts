import { api } from "./client";

function currentUserId(): number | null {
  try { return JSON.parse(localStorage.getItem("treke_user") || "{}")?.id ?? null; }
  catch { return null; }
}

// Usuario común
export async function userSummary() {
  const uid = currentUserId();
  return api.get(`/api/report/user/me/summary?usuario_id=${uid}`);
}
export async function userRanking() {
  const uid = currentUserId();
  return api.get(`/api/report/user/me/ranking?usuario_id=${uid}`);
}
export async function userHistory() {
  const uid = currentUserId();
  return api.get(`/api/report/user/me/history?usuario_id=${uid}`);
}

// Emprendedor / ONG
export async function orgVentas() {
  const uid = currentUserId();
  return api.get(`/api/report/org/me/ventas?usuario_id=${uid}`);
}
export async function orgWallet() {
  const uid = currentUserId();
  return api.get(`/api/report/org/me/wallet?usuario_id=${uid}`);
}
// Top categorías del vendedor (NO del sitio)
export async function orgTopCategoriasMine() {
  const uid = currentUserId();
  return api.get(`/api/report/org/me/top-categorias?usuario_id=${uid}`);
}

// Admin
export async function adminOverview() {
  return api.get(`/api/report/admin/overview`);
}
export async function adminTopCategorias() {
  return api.get(`/api/report/admin/top-categorias`);
}
export async function adminTopUsuarios() {
  return api.get(`/api/report/admin/top-usuarios`);
}
