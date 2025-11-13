import { withTx } from "../../config/database/database";
import { MarketSQL } from "./market.sql";

export type MarketListParams = {
  q?: string | null;
  categoria_id?: number | null;
  min_cred?: number | null;
  max_cred?: number | null;
  estado_id?: number | null;
  lat?: number | null;
  lng?: number | null;
  radio_km?: number | null;
  sort?: "recent" | "price_asc" | "price_desc" | "near";
  limit?: number;
  offset?: number;
};

export async function list(params: MarketListParams) {
  const {
    q=null, categoria_id=null, min_cred=null, max_cred=null, estado_id=null,
    lat=null, lng=null, radio_km=null, sort="recent", limit=12, offset=0
  } = params;

  return withTx(async (client) => {
    const [itemsQ, countQ] = await Promise.all([
      client.query(MarketSQL.list, [q, categoria_id, min_cred, max_cred, estado_id, lat, lng, radio_km, sort, limit, offset]),
      client.query(MarketSQL.listCount, [q, categoria_id, min_cred, max_cred, estado_id]),
    ]);
    const total = countQ.rows[0]?.total ?? 0;
    return { items: itemsQ.rows, page: { total, limit, offset, has_more: offset + limit < total } };
  });
}

export async function detail(id: number, viewerUserId?: number | null) {
  return withTx(async (client) => {
    const base = await client.query(MarketSQL.detail, [id]);
    if (!base.rowCount) throw new Error("Publicación no encontrada");

    const fotos  = await client.query(MarketSQL.detailFotos, [id]);
    const propsC = await client.query(MarketSQL.detailPropuestasCount, [id]);

    let is_fav = false;
    if (viewerUserId) {
      const fav = await client.query(MarketSQL.favCheck, [viewerUserId, id]);
      is_fav = (fav.rowCount ?? 0) > 0;
    }

    return { ...base.rows[0], fotos: fotos.rows, total_propuestas: propsC.rows[0]?.total_propuestas ?? 0, is_fav };
  });
}

export async function favAdd(userId: number, pubId: number) {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.favAdd, [userId, pubId]);
    return { ok: r.rowCount ?? 0 > 0 };
  });
}

export async function favRemove(userId: number, pubId: number) {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.favRemove, [userId, pubId]);
    return { ok: r.rowCount ?? 0 > 0 };
  });
}

// catálogos
export async function categorias() {
  return withTx(async (client) => (await client.query(MarketSQL.cats)).rows);
}
export async function estadosPublicacion() {
  return withTx(async (client) => (await client.query(MarketSQL.estados)).rows);
}
