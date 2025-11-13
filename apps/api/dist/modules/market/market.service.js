"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.detail = detail;
exports.favAdd = favAdd;
exports.favRemove = favRemove;
exports.categorias = categorias;
exports.estadosPublicacion = estadosPublicacion;
const database_1 = require("../../config/database/database");
const market_sql_1 = require("./market.sql");
async function list(params) {
    const { q = null, categoria_id = null, min_cred = null, max_cred = null, estado_id = null, lat = null, lng = null, radio_km = null, sort = "recent", limit = 12, offset = 0 } = params;
    return (0, database_1.withTx)(async (client) => {
        const [itemsQ, countQ] = await Promise.all([
            client.query(market_sql_1.MarketSQL.list, [q, categoria_id, min_cred, max_cred, estado_id, lat, lng, radio_km, sort, limit, offset]),
            client.query(market_sql_1.MarketSQL.listCount, [q, categoria_id, min_cred, max_cred, estado_id]),
        ]);
        const total = countQ.rows[0]?.total ?? 0;
        return { items: itemsQ.rows, page: { total, limit, offset, has_more: offset + limit < total } };
    });
}
async function detail(id, viewerUserId) {
    return (0, database_1.withTx)(async (client) => {
        const base = await client.query(market_sql_1.MarketSQL.detail, [id]);
        if (!base.rowCount)
            throw new Error("Publicación no encontrada");
        const fotos = await client.query(market_sql_1.MarketSQL.detailFotos, [id]);
        const propsC = await client.query(market_sql_1.MarketSQL.detailPropuestasCount, [id]);
        let is_fav = false;
        if (viewerUserId) {
            const fav = await client.query(market_sql_1.MarketSQL.favCheck, [viewerUserId, id]);
            is_fav = (fav.rowCount ?? 0) > 0;
        }
        return { ...base.rows[0], fotos: fotos.rows, total_propuestas: propsC.rows[0]?.total_propuestas ?? 0, is_fav };
    });
}
async function favAdd(userId, pubId) {
    return (0, database_1.withTx)(async (client) => {
        const r = await client.query(market_sql_1.MarketSQL.favAdd, [userId, pubId]);
        return { ok: r.rowCount ?? 0 > 0 };
    });
}
async function favRemove(userId, pubId) {
    return (0, database_1.withTx)(async (client) => {
        const r = await client.query(market_sql_1.MarketSQL.favRemove, [userId, pubId]);
        return { ok: r.rowCount ?? 0 > 0 };
    });
}
// catálogos
async function categorias() {
    return (0, database_1.withTx)(async (client) => (await client.query(market_sql_1.MarketSQL.cats)).rows);
}
async function estadosPublicacion() {
    return (0, database_1.withTx)(async (client) => (await client.query(market_sql_1.MarketSQL.estados)).rows);
}
