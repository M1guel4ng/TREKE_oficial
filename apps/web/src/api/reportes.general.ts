import { api } from "./client";

export type RankingItem = {
  usuario_id: number;
  email: string;
  intercambios: number;
  compras_creditos: number;
  creditos_comprados: number;
  tiene_suscripcion: boolean;
  puntaje: number;
  pos: number;
};

export type InactivoItem = {
  usuario_id: number;
  email: string;
  ultima_actividad: string; // ISO
};

export type ImpactoTotal = {
  co2: string | number | null;
  energia: string | number | null;
  agua: string | number | null;
  residuos: string | number | null;
  creditos: string | number | null;
};

export type IntercambiosPorCat = {
  categoria_id: number;
  categoria: string;
  intercambios: number;
};

export type ResumenSistema = {
  total: { completados: number; activos: number; total: number };
  ratio: {
    publicaciones: number;
    intercambios: number;
    ratio_intercambio_por_publicacion: number;
  };
};

export const getRanking = (limit = 10) =>
  api.get<RankingItem[]>(`/api/reportes/general/participacion?limit=${limit}`);

export const getInactivos = (days = 30) =>
  api.get<InactivoItem[]>(`/api/reportes/general/inactivos?days=${days}`);

export const getImpacto = () =>
  api.get<ImpactoTotal>(`/api/reportes/general/impacto`);

export const getIntercambiosPorCat = () =>
  api.get<IntercambiosPorCat[]>(`/api/reportes/general/intercambios/categorias`);

export const getResumen = () =>
  api.get<ResumenSistema>(`/api/reportes/general/resumen`);
