export const MarketSQL = {
  list: `
    WITH base AS (
      SELECT
        pub.id,
        pub.titulo,
        pub.descripcion,
        pub.valor_creditos,
        pub.ubicacion_texto,
        pub.created_at,
        pub.usuario_id,
        pub.categoria_id,
        pub.estado_id,
        c.nombre       AS categoria,
        e.nombre       AS estado_nombre,
        p.full_name    AS vendedor_nombre,
        ru.calificacion_prom AS vendedor_rating,
        (
          SELECT f.foto_url
          FROM fotos f
          WHERE f.publicacion_id = pub.id
          ORDER BY f.es_principal DESC, f.orden ASC, f.id ASC
          LIMIT 1
        ) AS foto_principal
      FROM publicaciones pub
      JOIN categoria         c  ON c.id = pub.categoria_id
      JOIN estado_publicacion e ON e.id = pub.estado_id
      LEFT JOIN perfil_usuario  p  ON p.usuario_id = pub.usuario_id
      LEFT JOIN reputacion_user ru ON ru.usuario_id = pub.usuario_id
      WHERE pub.deleted_at IS NULL
        -- ⚠ ya NO existe pub.es_visible en el esquema nuevo
        AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
        AND e.nombre = 'disponible'
        AND ($1::text IS NULL OR pub.titulo ILIKE '%'||$1||'%' OR pub.descripcion ILIKE '%'||$1||'%')
        AND ($2::int  IS NULL OR pub.categoria_id    = $2)
        AND ($3::int  IS NULL OR pub.valor_creditos >= $3)
        AND ($4::int  IS NULL OR pub.valor_creditos <= $4)
        AND ($5::int  IS NULL OR pub.estado_id       = $5)
    ),
    enriched AS (
      SELECT
        b.*,
        -- Como la tabla publicaciones no tiene latitud/longitud,
        -- dejamos distancia_km siempre en NULL, pero seguimos
        -- usando $6 y $7 para que el número de parámetros coincida.
        CASE
          WHEN $6::numeric IS NULL OR $7::numeric IS NULL THEN NULL::numeric
          ELSE NULL::numeric
        END AS distancia_km
      FROM base b
    )
    SELECT *
    FROM enriched
    WHERE
      -- Si quieres que radio_km no filtre nada, basta con esto.
      ($8::numeric IS NULL OR distancia_km <= $8)
    ORDER BY
      CASE WHEN $9 = 'near'       THEN distancia_km   END ASC  NULLS LAST,
      CASE WHEN $9 = 'price_asc'  THEN valor_creditos END ASC  NULLS LAST,
      CASE WHEN $9 = 'price_desc' THEN valor_creditos END DESC NULLS LAST,
      CASE WHEN $9 = 'recent'     THEN created_at     END DESC NULLS LAST,
      created_at DESC
    LIMIT $10 OFFSET $11
  `,

  listCount: `
    SELECT COUNT(*)::int AS total
    FROM publicaciones pub
    WHERE pub.deleted_at IS NULL
      -- ⚠ ya no hay pub.es_visible
      AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
      AND ($1::text IS NULL OR pub.titulo ILIKE '%'||$1||'%' OR pub.descripcion ILIKE '%'||$1||'%')
      AND ($2::int  IS NULL OR pub.categoria_id    = $2)
      AND ($3::int  IS NULL OR pub.valor_creditos >= $3)
      AND ($4::int  IS NULL OR pub.valor_creditos <= $4)
      AND ($5::int  IS NULL OR pub.estado_id       = $5)
  `,

  detail: `
    SELECT
      pub.*,
      c.nombre  AS categoria,
      e.nombre  AS estado_nombre,
      u.email   AS vendedor_email,
      p.full_name AS vendedor_nombre,
      ru.calificacion_prom AS vendedor_rating
    FROM publicaciones pub
    JOIN categoria         c  ON c.id = pub.categoria_id
    JOIN estado_publicacion e ON e.id = pub.estado_id
    JOIN usuario           u  ON u.id = pub.usuario_id
    LEFT JOIN perfil_usuario  p  ON p.usuario_id = u.id
    LEFT JOIN reputacion_user ru ON ru.usuario_id = u.id
    WHERE pub.id = $1
      AND pub.deleted_at IS NULL
  `,

  detailFotos: `
    SELECT id, foto_url, orden, es_principal
    FROM fotos
    WHERE publicacion_id = $1
    ORDER BY es_principal DESC, orden ASC, id ASC
  `,

  detailPropuestasCount: `
    SELECT COUNT(*)::int AS total_propuestas
    FROM propuesta
    WHERE publicacion_id = $1
  `,

  favAdd: `
    INSERT INTO lista_favoritos (usuario_id, publicacion_id)
    VALUES ($1, $2)
    ON CONFLICT (usuario_id, publicacion_id) DO NOTHING
    RETURNING id
  `,

  favRemove: `
    DELETE FROM lista_favoritos
    WHERE usuario_id = $1
      AND publicacion_id = $2
    RETURNING id
  `,

  favCheck: `
    SELECT 1
    FROM lista_favoritos
    WHERE usuario_id = $1
      AND publicacion_id = $2
  `,

  // catálogos
  cats: `
    SELECT id, nombre
    FROM categoria
    ORDER BY nombre;
  `,

  estados: `
    SELECT id, nombre
    FROM estado_publicacion
    ORDER BY id;
  `,

  // Factores ecológicos disponibles para marcar en la creación de publicaciones
  factores: `
    SELECT
      id,
      nombre_factor,
      unidad_medida,
      desc_calc
    FROM factores_ecologicos
    ORDER BY id;
  `,

  // Creación de publicación básica (sin latitud/longitud, porque la tabla no los tiene)
  createPublication: `
    INSERT INTO publicaciones (
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      peso_aprox_kg,
      usuario_id,
      categoria_id,
      estado_id
    )
    VALUES (
      $1,              -- titulo
      $2,              -- descripcion
      $3,              -- valor_creditos
      $4,              -- ubicacion_texto
      $5,              -- peso_aprox_kg
      $6::integer,     -- usuario_id
      $7::integer,     -- categoria_id
      $8::integer      -- estado_id
    )
    RETURNING id;
  `,

  // Inserción de fotos asociadas
  insertFoto: `
    INSERT INTO fotos (publicacion_id, foto_url, orden, es_principal)
    VALUES ($1, $2, $3, $4);
  `,

  // Buscar id de estado por nombre (por ej. "disponible")
  estadoPorNombre: `
    SELECT id
    FROM estado_publicacion
    WHERE nombre = $1
    LIMIT 1;
  `,

  // Acumular impacto ecológico al crear una publicación
  acumularImpactoPublicacion: `
    INSERT INTO impacto_usuario (
      usuario_id,
      total_co2_evitado,
      total_energia_ahorrada,
      total_agua_preservada,
      total_residuos_evitados,
      total_creditos_ganados,
      updated_at
    )
    SELECT
      $1::integer AS usuario_id,
      SUM(
        CASE WHEN f.nombre_factor = 'CO2 evitado'
             THEN ec.valor_por_kg * $3::numeric
             ELSE 0
        END
      ) AS total_co2_evitado,
      SUM(
        CASE WHEN f.nombre_factor = 'Energía ahorrada'
             THEN ec.valor_por_kg * $3::numeric
             ELSE 0
        END
      ) AS total_energia_ahorrada,
      SUM(
        CASE WHEN f.nombre_factor = 'Agua preservada'
             THEN ec.valor_por_kg * $3::numeric
             ELSE 0
        END
      ) AS total_agua_preservada,
      SUM(
        CASE WHEN f.nombre_factor = 'Residuos evitados'
             THEN ec.valor_por_kg * $3::numeric
             ELSE 0
        END
      ) AS total_residuos_evitados,
      0 AS total_creditos_ganados,
      now() AS updated_at
    FROM equivalencias_categoria ec
    JOIN factores_ecologicos f ON f.id = ec.factor_id
    WHERE ec.categoria_id = $2::integer
      AND (
        $4::int[] IS NULL
        OR cardinality($4::int[]) = 0
        OR ec.factor_id = ANY($4::int[])
      )
    GROUP BY usuario_id
    ON CONFLICT (usuario_id) DO UPDATE
    SET
      total_co2_evitado       = impacto_usuario.total_co2_evitado       + EXCLUDED.total_co2_evitado,
      total_energia_ahorrada  = impacto_usuario.total_energia_ahorrada  + EXCLUDED.total_energia_ahorrada,
      total_agua_preservada   = impacto_usuario.total_agua_preservada   + EXCLUDED.total_agua_preservada,
      total_residuos_evitados = impacto_usuario.total_residuos_evitados + EXCLUDED.total_residuos_evitados,
      total_creditos_ganados  = impacto_usuario.total_creditos_ganados  + EXCLUDED.total_creditos_ganados,
      updated_at              = now();
  `,
};
