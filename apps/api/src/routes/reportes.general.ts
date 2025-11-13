import { Router } from "express";
import { pool } from "../config/database/database";

const r = Router();

/** Impacto total (vw_impacto_ambiental_total) */
r.get("/impacto-total", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_impacto_ambiental_total`);
    res.json({ ok: true, data: rows[0] || { co2:0, energia:0, agua:0, residuos:0, creditos:0 } });
  } catch (e) { next(e); }
});

/** Ranking participación (vw_ranking_participacion_ranked) */
r.get("/ranking", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const q = `
      SELECT * FROM vw_ranking_participacion_ranked
      ORDER BY pos ASC
      LIMIT $1
    `;
    const { rows } = await pool.query(q, [limit]);
    res.json({ ok: true, data: rows });
  } catch (e) { next(e); }
});

/** Inactivos 30 días (vw_usuarios_inactivos_30d) */
r.get("/inactivos", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_usuarios_inactivos_30d ORDER BY ultima_actividad ASC`);
    res.json({ ok: true, data: rows });
  } catch (e) { next(e); }
});

/** Intercambios por categoría (vw_intercambios_por_categoria) */
r.get("/intercambios-categoria", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_intercambios_por_categoria`);
    res.json({ ok: true, data: rows });
  } catch (e) { next(e); }
});

/** Totales + ratio publicaciones vs intercambios */
r.get("/ratio", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_ratio_publicaciones_vs_intercambios`);
    res.json({ ok: true, data: rows[0] || { publicaciones:0, intercambios:0, ratio_intercambio_por_publicacion:0 } });
  } catch (e) { next(e); }
});

export default r;
