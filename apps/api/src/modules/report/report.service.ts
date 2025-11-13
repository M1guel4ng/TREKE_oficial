import { withTx } from "../../config/database/database";

export async function userSummary(uid: number) {
  return withTx(async (c) => {
    const a = await c.query("SELECT * FROM v_user_exchange_stats WHERE usuario_id=$1", [uid]);
    const b = await c.query("SELECT * FROM v_wallet_monthly WHERE usuario_id=$1 ORDER BY mes", [uid]);
    const imp = await c.query("SELECT * FROM impacto_usuario WHERE usuario_id=$1", [uid]);
    return { exchange: a.rows[0] || null, wallet_monthly: b.rows, impacto: imp.rows[0] || null };
  });
}

export async function userRanking(uid: number) {
  return withTx(async (c) => {
    const me = await c.query("SELECT * FROM v_user_rank_by_trades WHERE usuario_id=$1", [uid]);
    const top = await c.query(`
      SELECT r.usuario_id, r.intercambios_hechos, r.rank_intercambios,
             COALESCE(p.full_name, u.email) AS nombre
      FROM v_user_rank_by_trades r
      JOIN usuario u ON u.id = r.usuario_id
      LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
      ORDER BY r.rank_intercambios ASC
      LIMIT 10
    `);
    return { me: me.rows[0] || null, top10: top.rows };
  });
}

export async function userHistory(uid: number) {
  return withTx(async (c) => {
    const q = await c.query(`
      SELECT h.*, 
             CASE WHEN h.vendedor_id=$1 THEN 'venta'
                  WHEN h.comprador_id=$1 THEN 'compra' END AS rol
      FROM v_user_trade_history h
      WHERE h.vendedor_id=$1 OR h.comprador_id=$1
      ORDER BY h.fecha_completado DESC NULLS LAST, h.intercambio_id DESC
      LIMIT 200
    `, [uid]);
    return q.rows;
  });
}

// Emprendedor/ONG
export async function orgVentas(uid: number) {
  return withTx(async (c) => {
    const ventas = await c.query(`
      SELECT date_trunc('month', COALESCE(fecha_completado, fecha_de_aceptacion))::date AS mes,
             SUM(monto_credito)::bigint AS total_cred,
             COUNT(*)::int AS total_ops
      FROM intercambios
      WHERE vendedor_id=$1 AND estado='completado'
      GROUP BY 1 ORDER BY 1
    `, [uid]);
    return ventas.rows;
  });
}

export async function orgWallet(uid: number) {
  return withTx(async (c) => {
    const w = await c.query("SELECT * FROM v_wallet_monthly WHERE usuario_id=$1 ORDER BY mes", [uid]);
    return w.rows;
  });
}

export async function orgTopCategorias() {
  return withTx(async (c) => {
    const r = await c.query("SELECT * FROM v_category_demand ORDER BY intercambios_completados DESC LIMIT 20");
    return r.rows;
  });
}

// Admin
export async function adminOverview() {
  return withTx(async (c) => {
    const ingresos = await c.query("SELECT * FROM v_credits_revenue_monthly ORDER BY mes");
    const impacto  = await c.query("SELECT * FROM v_site_impact_totals");
    const activos  = await c.query(`
      SELECT COUNT(*)::int AS usuarios_activos
      FROM usuario WHERE estado='activo' AND deleted_at IS NULL
    `);
    return { ingresos: ingresos.rows, impacto: impacto.rows[0], usuarios_activos: activos.rows[0]?.usuarios_activos ?? 0 };
  });
}

export async function adminTopCategorias() {
  return withTx(async (c) => {
    const r = await c.query("SELECT * FROM v_category_demand ORDER BY intercambios_completados DESC LIMIT 10");
    return r.rows;
  });
}

export async function adminTopUsuarios() {
  return withTx(async (c) => {
    const r = await c.query(`
      SELECT r.usuario_id,
             r.intercambios_hechos,
             r.rank_intercambios,
             COALESCE(p.full_name, u.email) AS nombre
      FROM v_user_rank_by_trades r
      JOIN usuario u ON u.id = r.usuario_id
      LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
      ORDER BY r.intercambios_hechos DESC
      LIMIT 20
    `);
    return r.rows;
  });
}
