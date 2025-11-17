import {api} from "./client";
import { getCurrentUser } from "./auth"; // o de donde lo tengas

export type PaqueteCreditos = {
  id: number;
  nombre_paq: string;
  descripcion: string;
  cant_creditos: number;
  precio: string;
};

export type Billetera = {
  id: number;
  saldo_disponible: number;
  saldo_retenido: number;
};

export async function getPaquetesCreditos(): Promise<PaqueteCreditos[]> {
  const r = await api.get<{ ok: boolean; data: PaqueteCreditos[] }>(
    "/api/creditos/paquetes"
  );
  return (r as any).data ?? (r as any);
}

export async function getSaldoBilletera(): Promise<Billetera> {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const headers = { "x-user-id": String(uid) };

  const r = await api.get<{ ok: boolean; data: Billetera }>(
    "/api/creditos/saldo",
    { headers } as any
  );
  return (r as any).data ?? (r as any);
}

export async function comprarPaquete(paqueteId: number) {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const headers = { "x-user-id": String(uid) };

  const r = await api.post<{ ok: boolean; data: any }>(
    "/api/creditos/comprar",
    { paquete_id: paqueteId },
    { headers } as any
  );

  return (r as any).data ?? (r as any);
}


function getCurrentUserIdSafe(): number | null {
  const u = getCurrentUser();
  if (!u) return null;

  // Si ya es un número (ej: 3)
  if (typeof u === "number") {
    return Number.isFinite(u) ? u : null;
  }

  // Si es un string (ej: "3" o "42")
  if (typeof u === "string") {
    const n = Number(u);
    return Number.isFinite(n) ? n : null;
  }

  // Si es un objeto tipo { id: 3, ... }
  if (typeof u === "object" && u !== null && "id" in u) {
    const v = (u as any).id;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  // Cualquier otra cosa no es válida
  return null;
}

