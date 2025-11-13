import { api } from "./client";

export type IngresosTotal = {
  compras_ok: number | null;
  bs_total: string | number | null;
  creditos_total: string | number | null;
};

export type IngresosMes = {
  periodo: string; // ISO del 1er día del mes
  compras_ok: number;
  bs_total: string | number | null;
  creditos_total: string | number | null;
};

export type CreditosPorUsuario = {
  usuario_id: number;
  compras_ok: number;
  creditos_comprados: string | number | null;
  bs_gastados: string | number | null;
};

export type SaldoUsuario = {
  usuario_id: number;
  saldo_disponible: string | number;
  saldo_retenido: string | number;
  saldo_total: string | number;
};

export type ConsumoVsGeneracion = {
  origen: "compra_directa" | "generado_intercambios" | "gastado_intercambios" | "otros";
  total: string | number;
};

export type Suscripciones = {
  total_registros: number;
  activas: number;
  usuarios_con_suscripcion: number;
  ratio_activas: string | number | null;
};

export const getIngresosTotal = () =>
  api.get<IngresosTotal>(`/api/admin/reportes/monetizacion/ingresos/total`);

export const getIngresosMes = () =>
  api.get<IngresosMes[]>(`/api/admin/reportes/monetizacion/ingresos/mes`);

export const getCreditosPorUsuario = () =>
  api.get<CreditosPorUsuario[]>(`/api/admin/reportes/monetizacion/creditos/por-usuario`);

export const getSaldos = () =>
  api.get<SaldoUsuario[]>(`/api/admin/reportes/monetizacion/saldos`);

export const getConsumoVsGeneracion = () =>
  api.get<ConsumoVsGeneracion[]>(`/api/admin/reportes/monetizacion/consumo-vs-generacion`);

export const getSuscripciones = () =>
  api.get<Suscripciones>(`/api/admin/reportes/monetizacion/suscripciones`);
