import { api } from "./client";

// ======= Generales =======
export const repGeneral = {
  impactoTotal:     () => api.get("/api/reportesgeneral/impacto-total"),
  ranking:          (limit = 10) => api.get(`/api/reportesgeneral/ranking?limit=${limit}`),
  inactivos:        () => api.get("/api/reportesgeneral/inactivos"),
  porCategoria:     () => api.get("/api/reportesgeneral/intercambios-categoria"),
  ratioPublicacion: () => api.get("/api/reportesgeneral/ratio"),
};

// ======= Monetización (ADMIN) =======
export const repMonet = {
  total:            () => api.get("/api/admin/reportes/monetizacion/ingresos/total"),
  porMes:           () => api.get("/api/admin/reportes/monetizacion/ingresos/por-mes"),
  compradosUsuario: () => api.get("/api/admin/reportes/monetizacion/creditos/comprados-por-usuario"),
  saldos:           () => api.get("/api/admin/reportes/monetizacion/creditos/saldos"),
  consumoGen:       () => api.get("/api/admin/reportes/monetizacion/consumo-vs-generacion"),
  adopcion:         () => api.get("/api/admin/reportes/monetizacion/suscripciones/adopcion"),
};
