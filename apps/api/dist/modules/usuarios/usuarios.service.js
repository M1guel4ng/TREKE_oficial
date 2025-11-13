"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarUsuario = registrarUsuario;
exports.loginPlano = loginPlano;
exports.getPerfil = getPerfil;
exports.actualizarPerfil = actualizarPerfil;
exports.actualizarFoto = actualizarFoto;
exports.actualizarEmail = actualizarEmail;
exports.listarUsuarios = listarUsuarios;
exports.cambiarRol = cambiarRol;
exports.suspenderUsuario = suspenderUsuario;
exports.eliminarUsuario = eliminarUsuario;
exports.getPanel = getPanel;
const database_1 = require("../../config/database/database");
const usuarios_sql_1 = require("./usuarios.sql");
// Helper local de transacciones usando TU pool
async function withTx(fn) {
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function registrarUsuario(input) {
    if (!input.acepta_terminos)
        throw new Error('Debe aceptar términos y condiciones');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
        throw new Error('Email inválido');
    if (!input.full_name?.trim())
        throw new Error('Nombre completo es requerido');
    if (!input.password || input.password.length < 6)
        throw new Error('Contraseña mínima de 6 caracteres');
    return withTx(async (client) => {
        const dup = await client.query(usuarios_sql_1.SQL.existeEmail, [input.email]);
        if (dup.rowCount)
            throw new Error('El email ya existe');
        // Tu seed: 10001 = 'usuario'
        const rolId = input.rol_id ?? 10001;
        const u = await client.query(usuarios_sql_1.SQL.crearUsuario, [input.email, input.password, rolId]);
        const user = u.rows[0];
        const p = await client.query(usuarios_sql_1.SQL.crearPerfil, [input.full_name, user.id]);
        const b = await client.query(usuarios_sql_1.SQL.crearBilletera, [user.id]);
        await client.query(usuarios_sql_1.SQL.asegurarTipoMovimiento);
        await client.query(usuarios_sql_1.SQL.aplicarBonoBienvenida, [user.id]);
        return { user, perfil: p.rows[0], billetera: b.rows[0] };
    });
}
async function loginPlano(email, password) {
    const r = await database_1.pool.query(usuarios_sql_1.SQL.loginPlano, [email, password]);
    if (!r.rowCount)
        throw new Error('Credenciales inválidas');
    return { ok: true, user: r.rows[0], token: 'DEV_TOKEN' }; // dummy
}
async function getPerfil(usuarioId) {
    const r = await database_1.pool.query(usuarios_sql_1.SQL.getPerfilFull, [usuarioId]);
    if (!r.rowCount)
        throw new Error('Usuario no encontrado');
    return r.rows[0];
}
async function actualizarPerfil(usuarioId, data) {
    if (data.full_name !== undefined && !data.full_name.trim())
        throw new Error('full_name es obligatorio');
    const r = await database_1.pool.query(usuarios_sql_1.SQL.updatePerfil, [usuarioId, data.full_name, data.acerca_de, data.telefono, data.fecha_nacimiento]);
    return r.rows[0];
}
async function actualizarFoto(usuarioId, fotoUrl) {
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(fotoUrl))
        throw new Error('Formato de imagen no permitido (JPG, PNG, WEBP)');
    const r = await database_1.pool.query(usuarios_sql_1.SQL.updateFoto, [usuarioId, fotoUrl]);
    return r.rows[0];
}
async function actualizarEmail(usuarioId, email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error('Email inválido');
    const r = await database_1.pool.query(usuarios_sql_1.SQL.updateEmail, [usuarioId, email]);
    return r.rows[0];
}
async function listarUsuarios({ page = 1, pageSize = 20, rol, estado, q, fecha_desde, fecha_hasta }) {
    const where = [];
    const params = [];
    let base = usuarios_sql_1.SQL.listarUsuariosBase;
    if (rol) {
        params.push(+rol);
        where.push(`u.rol_id = $${params.length}`);
    }
    if (estado) {
        params.push(estado);
        where.push(`u.estado = $${params.length}`);
    }
    if (fecha_desde) {
        params.push(fecha_desde);
        where.push(`u.created_at >= $${params.length}`);
    }
    if (fecha_hasta) {
        params.push(fecha_hasta);
        where.push(`u.created_at < $${params.length}`);
    }
    if (q) {
        params.push(`%${q}%`);
        where.push(`(p.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (where.length)
        base += ` AND ${where.join(' AND ')}`;
    const limit = +pageSize;
    const offset = (page - 1) * limit;
    base += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const r = await database_1.pool.query(base, params);
    return r.rows;
}
async function cambiarRol(_actorId, usuarioId, nuevoRolId) {
    const r = await withTx(async (client) => client.query(usuarios_sql_1.SQL.cambiarRol, [usuarioId, nuevoRolId]));
    return r.rows[0];
}
async function suspenderUsuario(_actorId, usuarioId) {
    const r = await withTx(async (client) => client.query(usuarios_sql_1.SQL.suspender, [usuarioId]));
    return r.rows[0];
}
async function eliminarUsuario(_actorId, usuarioId) {
    const r = await withTx(async (client) => client.query(usuarios_sql_1.SQL.hardDeleteUsuario, [usuarioId]));
    if (!r.rowCount)
        throw new Error('Usuario no encontrado');
    return r.rows[0]; // { id }
}
async function getPanel(usuarioId, pubsLimit = 12, pubsOffset = 0, movsLimit = 20, movsOffset = 0) {
    return withTx(async (client) => {
        const base = await client.query(usuarios_sql_1.SQL.panelUsuarioBase, [usuarioId]);
        if (!base.rowCount)
            throw new Error('Usuario no encontrado');
        const metricas = await client.query(usuarios_sql_1.SQL.panelMetricas, [usuarioId]);
        const impacto = await client.query(usuarios_sql_1.SQL.panelImpacto, [usuarioId]);
        const pubs = await client.query(usuarios_sql_1.SQL.panelPublicaciones, [usuarioId, pubsLimit, pubsOffset]);
        let movimientos = [];
        const billeteraId = base.rows[0].billetera_id;
        if (billeteraId) {
            const mov = await client.query(usuarios_sql_1.SQL.panelMovimientos, [billeteraId, movsLimit, movsOffset]);
            movimientos = mov.rows.map((r) => ({
                ...r,
                monto_con_signo: r.es_debito ? -Number(r.monto) : Number(r.monto),
            }));
        }
        const b = base.rows[0];
        return {
            usuario: {
                id: b.id, email: b.email, estado: b.estado, rol_id: b.rol_id, rol_nombre: b.rol_nombre,
                full_name: b.full_name, acerca_de: b.acerca_de, foto: b.foto,
                ultimo_login: b.ultimo_login, created_at: b.created_at,
            },
            billetera: {
                id: b.billetera_id,
                saldo_disponible: b.saldo_disponible ?? 0,
                saldo_retenido: b.saldo_retenido ?? 0,
            },
            metricas: metricas.rows[0],
            impacto: impacto.rows[0] ?? null,
            publicaciones: pubs.rows,
            movimientos,
        };
    });
}
