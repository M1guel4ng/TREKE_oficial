import { api } from "./client";
import { getCurrentUser } from "./auth";

/** Helper: obtiene el id del usuario logueado.
 *  - Primero usa getCurrentUser() (treke_user de localStorage)
 *  - Si no hay nada, intenta algunos fallback suaves.
 *  - Nunca lanza error, puede devolver null.
 */
const getUsuarioId = (): number | null => {
  const current = getCurrentUser();
  if (current && typeof current.id === "number" && current.id > 0) {
    return current.id;
  }

  // Fallbacks suaves, por si cambias el storage en el futuro
  const rawId =
    localStorage.getItem("treke_user_id") ||
    localStorage.getItem("user_id") ||
    null;
  if (rawId) {
    const n = Number(rawId);
    if (Number.isFinite(n) && n > 0) return n;
  }

  const rawUser =
    localStorage.getItem("treke_user") ||
    localStorage.getItem("user") ||
    null;
  if (rawUser) {
    try {
      const u = JSON.parse(rawUser);
      const possibleId = u?.id ?? u?.usuario?.id ?? u?.user?.id;
      const n = Number(possibleId);
      if (Number.isFinite(n) && n > 0) return n;
    } catch {
      // ignoramos
    }
  }

  return null;
};

/* ========= TIPOS ========= */

export interface UserSummary {
  exchange: {
    usuario_id: number;
    email: string;
    intercambios_hechos: number;
    compras_creditos: number;
    creditos_comprados: number;
    tiene_suscripcion: boolean;
    puntaje: number;
    pos?: number | null;
  } | null;
  wallet_monthly: Array<{
    mes: string; // ISO (primer día del mes)
    creditos_entrada: number;
    creditos_salida: number;
    saldo_neto: number;
  }>;
  impacto: {
    total_co2_evitado: number;
    total_energia_ahorrada: number;
    total_agua_preservada: number;
    total_residuos_evitados: number;
    total_creditos_ganados: number;
  } | null;
}

export interface UserRankingResponse {
  me: {
    usuario_id: number;
    email: string;
    intercambios_hechos: number;
    compras_creditos: number;
    creditos_comprados: number;
    tiene_suscripcion: boolean;
    puntaje: number;
    pos?: number | null;
    rank_intercambios?: number | null;
  } | null;
  top10: Array<{
    usuario_id: number;
    intercambios_hechos: number;
    rank_intercambios: number;
    nombre: string;
  }>;
}

export interface UserHistoryItem {
  intercambio_id: number;
  comprador_id: number;
  vendedor_id: number;
  fecha_completado: string | null;
  fecha_de_aceptacion: string;
  monto_credito: number;
  rol: "compra" | "venta" | null;
  // campos extra del view (opcionales)
  estado?: string;
  publicacion_titulo?: string;
  categoria_nombre?: string;
}

/** Ventas por mes (para ONG/emprendedor) */
export interface OrgVentaItem {
  mes: string;        // ISO (primer día del mes)
  total_cred: number; // bigint → number
  total_ops: number;
}

/** Wallet mensual (vista v_wallet_monthly) */
export interface OrgWalletItem {
  usuario_id: number;
  mes: string;
  creditos_entrada: number;
  creditos_salida: number;
  saldo_neto: number;
}

/** Categorías más demandadas para la org */
export interface OrgTopCategoriaItem {
  categoria_id: number;
  categoria: string;
  intercambios: number;
}

/* ========= ENDPOINTS USER ========= */

export const getUserSummary = async (): Promise<UserSummary> => {
  const uid = getUsuarioId();
  const url = uid
    ? `/api/report/user/me/summary?usuario_id=${uid}`
    : `/api/report/user/me/summary`;

  const resp = await api.get<{ ok: boolean; data: UserSummary }>(url);
  return (resp as any).data ?? (resp as any);
};

export const getUserRanking = async (): Promise<UserRankingResponse> => {
  const uid = getUsuarioId();
  const url = uid
    ? `/api/report/user/me/ranking?usuario_id=${uid}`
    : `/api/report/user/me/ranking`;

  const resp = await api.get<{ ok: boolean; data: UserRankingResponse }>(url);
  return (resp as any).data ?? (resp as any);
};

export const getUserHistory = async (): Promise<UserHistoryItem[]> => {
  const uid = getUsuarioId();
  const url = uid
    ? `/api/report/user/me/history?usuario_id=${uid}`
    : `/api/report/user/me/history`;

  const resp = await api.get<{ ok: boolean; data: UserHistoryItem[] }>(url);
  return (resp as any).data ?? (resp as any);
};

/* ========= ENDPOINTS ORG / EMPRENDEDOR ========= */

export const getOrgVentas = async (): Promise<OrgVentaItem[]> => {
  const uid = getUsuarioId();
  const url = uid
    ? `/api/report/org/me/ventas?usuario_id=${uid}`
    : `/api/report/org/me/ventas`;

  const resp = await api.get<{ ok: boolean; data: OrgVentaItem[] }>(url);
  return (resp as any).data ?? (resp as any);
};

export const getOrgWallet = async (): Promise<OrgWalletItem[]> => {
  const uid = getUsuarioId();
  const url = uid
    ? `/api/report/org/me/wallet?usuario_id=${uid}`
    : `/api/report/org/me/wallet`;

  const resp = await api.get<{ ok: boolean; data: OrgWalletItem[] }>(url);
  return (resp as any).data ?? (resp as any);
};

export const getOrgTopCategorias = async (): Promise<OrgTopCategoriaItem[]> => {
  const resp = await api.get<{ ok: boolean; data: OrgTopCategoriaItem[] }>(
    `/api/report/org/me/top-categorias`
  );
  return (resp as any).data ?? (resp as any);
};
