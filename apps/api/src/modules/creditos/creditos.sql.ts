// apps/api/src/modules/creditos/creditos.sql.ts
export const CreditosSQL = {
  paquetesActivos: `
    SELECT id, nombre_paq, descripcion, cant_creditos, precio
    FROM paquetes_creditos
    WHERE esta_activo = true
    ORDER BY precio ASC;
  `,

  paquetePorId: `
    SELECT id, nombre_paq, descripcion, cant_creditos, precio
    FROM paquetes_creditos
    WHERE id = $1 AND esta_activo = true;
  `,

  // crea billetera si no existe
  billeteraPorUsuario: `
    SELECT id, saldo_disponible, saldo_retenido
    FROM billetera
    WHERE usuario_id = $1;
  `,

  crearBilletera: `
    INSERT INTO billetera (usuario_id, saldo_disponible, saldo_retenido)
    VALUES ($1, 0, 0)
    RETURNING id, saldo_disponible, saldo_retenido;
  `,

  // tipos de movimiento
  tipoMovimientoPorCodigo: `
    SELECT id
    FROM tipos_movimiento
    WHERE codigo = $1
      AND es_activo = true;
  `,

  crearTipoMovimiento: `
    INSERT INTO tipos_movimiento (codigo, descripcion, es_debito, es_activo)
    VALUES ($1, $2, false, true)
    RETURNING id;
  `,

  crearCompraCreditos: `
    INSERT INTO compras_creditos(
        usuario_id,
        paquete_id,
        id_transaccion,
        estado_pago
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `,

  crearMovimiento: `
    INSERT INTO movimientos (
      monto,
      saldo_anterior,
      saldo_posterior,
      billetera_user_id,
      tipo_mov_id
    )
    VALUES ($1, $2, $3, $4, $5);
  `,

  actualizarSaldoBilletera: `
    UPDATE billetera
    SET saldo_disponible = saldo_disponible + $1,
        updated_at = now()
    WHERE id = $2
    RETURNING saldo_disponible;
  `,

  getResumenCompras: `
    SELECT 
      COALESCE(SUM(p.precio), 0)        AS monto_total,
      COALESCE(SUM(p.cant_creditos), 0) AS creditos_obtenidos,
      COUNT(*)                          AS total_compras
    FROM compras_creditos c
    JOIN paquetes_creditos p ON p.id = c.paquete_id
    WHERE c.usuario_id = $1
      AND c.estado_pago = 'completado';
  `,
};
