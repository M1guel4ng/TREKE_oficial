// apps/api/src/modules/intercambios/intercambios.sql.ts
export const IntercambiosSQL = {
  // Datos necesarios de la publicación
  getPublicacionParaPropuesta: `
    SELECT
      pub.id,
      pub.usuario_id       AS vendedor_id,
      pub.valor_creditos,
      pub.estado_id,
      e.nombre             AS estado_nombre,
      pub.titulo,
      pub.descripcion
    FROM publicaciones pub
    JOIN estado_publicacion e ON e.id = pub.estado_id
    WHERE pub.id = $1
      AND pub.deleted_at IS NULL
      -- ⚠ en el nuevo esquema NO existe pub.es_visible, se elimina ese filtro
  `,

  // RF-18: iniciar propuesta
  crearPropuesta: `
    INSERT INTO propuesta (
      estado,
      mensaje,
      publicacion_id,
      demandante_id,
      monto_ofertado,
      ultimo_actor_id,
      created_at,
      updated_at
    )
    VALUES ('pendiente', $1, $2, $3, $4, $5, now(), now())
    RETURNING *;
  `,

  crearMensajeInicial: `
    INSERT INTO mensajes (contenido, propuesta_id, remitente_id, destinatario_id, fecha_envio)
    VALUES ($1, $2, $3, $4, now())
    RETURNING *;
  `,

  getPropuestaParaAccion: `
    SELECT
      p.*,
      pub.valor_creditos,
      pub.usuario_id AS vendedor_id,
      pub.titulo,
      pub.id         AS publicacion_id
    FROM propuesta p
    JOIN publicaciones pub ON pub.id = p.publicacion_id
    WHERE p.id = $1
    FOR UPDATE;
  `,

  actualizarEstadoPropuesta: `
    UPDATE propuesta
    SET estado = $2,
        fecha_respuesta = now(),
        updated_at      = now()
    WHERE id = $1
    RETURNING *;
  `,

  getIntercambioConRetencion: `
    SELECT i.*,
           r.id              AS retencion_id,
           r.monto_reservado,
           r.estado          AS estado_retencion,
           r.billetera_demandante
    FROM intercambios i
    LEFT JOIN retencion_creditos r ON r.intercambio_id = i.id
    WHERE i.id = $1
    FOR UPDATE;
  `,

  marcarConfirmacionComprador: `
    UPDATE intercambios
    SET confirm_comprador = TRUE
    WHERE id = $1
    RETURNING *;
  `,

  marcarConfirmacionVendedor: `
    UPDATE intercambios
    SET confirm_vendedor = TRUE
    WHERE id = $1
    RETURNING *;
  `,

  marcarCompletado: `
    UPDATE intercambios
    SET estado = 'completado',
        fecha_completado = now()
    WHERE id = $1
    RETURNING *;
  `,

  marcarCancelado: `
    UPDATE intercambios
    SET estado = 'cancelado'
    WHERE id = $1
    RETURNING *;
  `,

  // ⚠ retencion_creditos en la nueva DB NO tiene fecha_liberacion
  actualizarRetencionEstado: `
    UPDATE retencion_creditos
    SET estado    = $2,
        updated_at = now()
    WHERE id = $1
    RETURNING *;
  `,

  // Resumen para la página de perfil (propuestas enviadas/recibidas)
  listarResumenUsuario: `
    SELECT * FROM (
      SELECT
        p.id,
        'enviada'::text AS tipo,
        p.estado,
        p.created_at,
        pub.titulo,
        p.monto_ofertado   AS monto_ofertado,
        pub.valor_creditos AS valor_publicacion,
        pub.id             AS publicacion_id,
        pub.usuario_id     AS contraparte_id,
        (p.estado = 'pendiente'
          AND (p.ultimo_actor_id IS NULL OR p.ultimo_actor_id <> $1)
        ) AS puede_responder
      FROM propuesta p
      JOIN publicaciones pub ON pub.id = p.publicacion_id
      WHERE p.demandante_id = $1

      UNION ALL

      SELECT
        p.id,
        'recibida'::text AS tipo,
        p.estado,
        p.created_at,
        pub.titulo,
        p.monto_ofertado   AS monto_ofertado,
        pub.valor_creditos AS valor_publicacion,
        pub.id             AS publicacion_id,
        p.demandante_id    AS contraparte_id,
        (p.estado = 'pendiente'
          AND (p.ultimo_actor_id IS NULL OR p.ultimo_actor_id <> $1)
        ) AS puede_responder
      FROM propuesta p
      JOIN publicaciones pub ON pub.id = p.publicacion_id
      WHERE pub.usuario_id = $1
    ) t
    ORDER BY created_at DESC, id DESC
    LIMIT $2 OFFSET $3;
  `,

  listarIntercambiosUsuario: `
    SELECT
      i.*,
      pub.titulo,
      pub.valor_creditos,
      pub.id         AS publicacion_id
    FROM intercambios i
    JOIN propuesta p       ON p.id = i.propuesta_aceptada_id
    JOIN publicaciones pub ON pub.id = p.publicacion_id
    WHERE i.comprador_id = $1 OR i.vendedor_id = $1
    ORDER BY i.fecha_de_aceptacion DESC, i.id DESC
    LIMIT $2 OFFSET $3;
  `,

  rechazarPropuesta: `
    UPDATE propuesta
    SET estado = 'rechazada',
        fecha_respuesta = now(),
        updated_at = now()
    WHERE id = $1
    RETURNING *;
  `,

  actualizarContraoferta: `
    UPDATE propuesta
    SET monto_ofertado = $2,
        mensaje        = $3,
        ultimo_actor_id= $4,
        updated_at     = now()
    WHERE id = $1
      AND estado = 'pendiente'
    RETURNING *;
  `,

  crearMensajePropuesta: `
    INSERT INTO mensajes (contenido, propuesta_id, remitente_id, destinatario_id, fecha_envio)
    VALUES ($1, $2, $3, $4, now())
    RETURNING *;
  `,

  getPropuestaParaAceptar: `
    SELECT
      p.*,
      pub.valor_creditos,
      pub.usuario_id   AS vendedor_id,
      pub.id           AS publicacion_id,
      b.id             AS billetera_id,
      b.saldo_disponible,
      b.saldo_retenido
    FROM propuesta p
    JOIN publicaciones pub ON pub.id = p.publicacion_id
    JOIN billetera b       ON b.usuario_id = p.demandante_id
    WHERE p.id = $1
    FOR UPDATE;
  `,

  marcarPropuestaAceptada: `
    UPDATE propuesta
    SET estado = 'aceptada',
        fecha_respuesta = now(),
        updated_at = now()
    WHERE id = $1;
  `,

  crearIntercambio: `
    INSERT INTO intercambios
      (monto_credito, fecha_de_expiracion, propuesta_aceptada_id, comprador_id, vendedor_id)
    VALUES
      ($1, now() + interval '7 days', $2, $3, $4)
    RETURNING *;
  `,

  crearRetencion: `
    INSERT INTO retencion_creditos (monto_reservado, billetera_demandante, intercambio_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `,

  actualizarBilletera: `
    UPDATE billetera
    SET saldo_disponible = $2,
        saldo_retenido   = $3,
        updated_at = now()
    WHERE id = $1;
  `,

  getTipoMovByCodigo: `
    SELECT id
    FROM tipos_movimiento
    WHERE codigo = $1
      AND es_activo = true
    LIMIT 1;
  `,

  insertarMovimiento: `
    INSERT INTO movimientos
      (monto, saldo_anterior, saldo_posterior, billetera_user_id, tipo_mov_id)
    VALUES ($1, $2, $3, $4, $5);
  `,

  insertarBitacora: `
    INSERT INTO bitacora_intercambios
      (tipo_evento, estado_actual, propuesta_id, intercambio_id,
       comprador_id, vendedor_id, publicacion_id, monto_creditos,
       observaciones, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);
  `,
};
