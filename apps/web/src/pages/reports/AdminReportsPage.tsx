// apps/web/src/pages/admin/AdminReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import {
  getAdminOverview,
  getAdminTopCategorias,
  getAdminTopUsuarios,
  getAdminUsuariosActivosPorRol,
  getAdminUserLastActivityAll,
  getAdminUsuariosInactivos30d,
} from "../../api/report";
import type {
  AdminDashboard,
  IntercambiosPorCategoria,
  RankingTopUsuario,
  ConsumoVsGeneracion,
  MonetizacionIngresosMes,
  UsuarioActivoPorRolRow,
  UserLastActivityRow,
} from "../../types/report";

import KPICard from "../../components/Reportes/KPICard";
import ChartContainer from "../../components/Reportes/ChartContainer";
import SectionCard from "../../components/Reportes/SectionCard";
import BarChartSimple, {
  type SimpleChartDatum,
} from "../../components/Reportes/Graficas/BarChartSimple";
import PieChartSimple from "../../components/Reportes/Graficas/PieChartSimple";

type Status = "idle" | "loading" | "success" | "error";

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<AdminDashboard | null>(null);
  const [topCategorias, setTopCategorias] = useState<IntercambiosPorCategoria[]>([]);
  const [topUsuarios, setTopUsuarios] = useState<RankingTopUsuario[]>([]);
  const [usuariosActivos, setUsuariosActivos] = useState<UsuarioActivoPorRolRow[]>([]);
  const [userLastActivity, setUserLastActivity] = useState<UserLastActivityRow[]>([]);
  const [usuariosInactivos, setUsuariosInactivos] = useState<UserLastActivityRow[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        setMsg("");

        const [
          ov,
          cats,
          users,
          activos,
          lastActivity,
          inactivos,
        ] = await Promise.all([
          getAdminOverview(),
          getAdminTopCategorias(),
          getAdminTopUsuarios(),
          getAdminUsuariosActivosPorRol(),
          getAdminUserLastActivityAll(),
          getAdminUsuariosInactivos30d(),
        ]);

        setOverview(ov);
        setTopCategorias(cats || []);
        setTopUsuarios(users || []);
        setUsuariosActivos(activos || []);
        setUserLastActivity(lastActivity || []);
        setUsuariosInactivos(inactivos || []);
        setStatus("success");
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "No se pudo cargar el dashboard de administración");
        setStatus("error");
      }
    })();
  }, []);

  // === DATA PARA GRÁFICOS ===
  const ingresosMesChart: SimpleChartDatum[] = useMemo(
    () =>
      (overview?.ingresos_por_mes || []).map((row) => ({
        name: row.periodo,
        value: Number(row.bs_total ?? 0),
      })),
    [overview]
  );

  const consumoChart: SimpleChartDatum[] = useMemo(
    () =>
      (overview?.consumo_vs_generacion || []).map((row) => ({
        name: row.origen,
        value: Number(row.total ?? 0),
      })),
    [overview]
  );

  const categoriasChart: SimpleChartDatum[] = useMemo(
    () =>
      topCategorias.map((c) => ({
        name: c.categoria,
        value: Number(c.intercambios ?? 0),
      })),
    [topCategorias]
  );

  const topUsuariosChart: SimpleChartDatum[] = useMemo(
    () =>
      topUsuarios.map((u) => ({
        name: u.nombre,
        value: Number(u.intercambios_hechos ?? 0),
      })),
    [topUsuarios]
  );

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Dashboard de administración" />
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        {status === "loading" && <p>Cargando dashboard…</p>}
        {status === "error" && (
          <div className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        {status === "success" && overview && (
          <>
            {/* KPIs globales */}
            <section className="grid gap-4 md:grid-cols-3">
              <KPICard
                label="Ingresos totales (Bs) por venta de créditos"
                value={overview.ingresos_total?.bs_total ?? "0.00"}
                helperText={`Compras OK: ${
                  overview.ingresos_total?.compras_ok ?? 0
                } · Créditos vendidos: ${
                  overview.ingresos_total?.creditos_total ?? 0
                }`}
              />
              <KPICard
                label="Intercambios totales"
                value={overview.total_intercambios?.total ?? 0}
                helperText={`Completados: ${
                  overview.total_intercambios?.completados ?? 0
                } · Activos: ${overview.total_intercambios?.activos ?? 0}`}
              />
              <KPICard
                label="Suscripciones premium"
                value={overview.adopcion_suscripcion?.activas ?? 0}
                helperText={`Usuarios con suscripción: ${
                  overview.adopcion_suscripcion?.usuarios_con_suscripcion ?? 0
                }`}
              />
            </section>

            {/* Monetización: tabla + gráfico */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <SubTablaIngresosPorMes rows={overview.ingresos_por_mes || []} />
              <ChartContainer title="Ingresos por mes (Bs)">
                {ingresosMesChart.length > 0 ? (
                  <BarChartSimple data={ingresosMesChart} />
                ) : (
                  <p className="text-xs text-neutral-500">
                    No hay datos para mostrar.
                  </p>
                )}
              </ChartContainer>
            </section>

            {/* Consumo vs generación: tabla + gráfico */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <SubTablaConsumoVsGeneracion
                rows={overview.consumo_vs_generacion || []}
              />
              <ChartContainer title="Consumo vs generación de créditos">
                {consumoChart.length > 0 ? (
                  <PieChartSimple data={consumoChart} />
                ) : (
                  <p className="text-xs text-neutral-500">
                    No hay datos para mostrar.
                  </p>
                )}
              </ChartContainer>
            </section>

            {/* Impacto ambiental */}
            <SectionCard title="Impacto ambiental acumulado">
              {overview.impacto_total ? (
                <ul className="space-y-1 text-sm text-neutral-300">
                  <li>
                    <span className="font-semibold">CO₂ evitado:</span>{" "}
                    {overview.impacto_total.co2} kg
                  </li>
                  <li>
                    <span className="font-semibold">Energía ahorrada:</span>{" "}
                    {overview.impacto_total.energia} kWh
                  </li>
                  <li>
                    <span className="font-semibold">Agua preservada:</span>{" "}
                    {overview.impacto_total.agua} L
                  </li>
                  <li>
                    <span className="font-semibold">Residuos evitados:</span>{" "}
                    {overview.impacto_total.residuos} kg
                  </li>
                  <li>
                    <span className="font-semibold">
                      Créditos ecológicos otorgados:
                    </span>{" "}
                    {overview.impacto_total.creditos}
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-neutral-400">
                  Aún no se ha calculado el impacto ambiental.
                </p>
              )}
            </SectionCard>

            {/* Categorías + gráfico */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">
                  Categorías con más intercambios
                </h2>
                {topCategorias.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No hay datos suficientes de categorías.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
                    <table className="min-w-full text-left text-xs">
                      <thead className="border-b border-neutral-800 text-neutral-400">
                        <tr>
                          <th className="py-2 px-3">Categoría</th>
                          <th className="py-2 px-3 text-right">
                            Total intercambios
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCategorias.map((c) => (
                          <tr
                            key={c.categoria_id}
                            className="border-b border-neutral-900/80 last:border-0"
                          >
                            <td className="py-2 px-3">{c.categoria}</td>
                            <td className="py-2 px-3 text-right">
                              {c.intercambios}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <ChartContainer title="Distribución por categoría">
                {categoriasChart.length > 0 ? (
                  <PieChartSimple data={categoriasChart} />
                ) : (
                  <p className="text-xs text-neutral-500">
                    No hay datos para mostrar.
                  </p>
                )}
              </ChartContainer>
            </section>

            {/* Top usuarios + gráfico */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] pb-6">
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">
                  Top usuarios por intercambios
                </h2>
                {topUsuarios.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    No hay datos del ranking global de usuarios.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
                    <table className="min-w-full text-left text-xs">
                      <thead className="border-b border-neutral-800 text-neutral-400">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Usuario</th>
                          <th className="py-2 px-3 text-right">
                            Intercambios completados
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topUsuarios.map((u) => (
                          <tr
                            key={u.usuario_id}
                            className="border-b border-neutral-900/80 last:border-0"
                          >
                            <td className="py-2 px-3 text-xs">
                              #{u.rank_intercambios}
                            </td>
                            <td className="py-2 px-3">{u.nombre}</td>
                            <td className="py-2 px-3 text-right">
                              {u.intercambios_hechos}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <ChartContainer title="Top 10 por intercambios">
                {topUsuariosChart.length > 0 ? (
                  <BarChartSimple data={topUsuariosChart} />
                ) : (
                  <p className="text-xs text-neutral-500">
                    No hay datos para mostrar.
                  </p>
                )}
              </ChartContainer>
            </section>

            {/* Usuarios activos por rol */}
            <SectionCard title="Usuarios activos por rol">
              {usuariosActivos.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No hay registros recientes de actividad de usuarios.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-neutral-800 text-neutral-400">
                      <tr>
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Rol</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Última actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosActivos.map((u) => (
                        <tr
                          key={u.usuario_id}
                          className="border-b border-neutral-900/80 last:border-0"
                        >
                          <td className="py-2 px-3 text-xs">#{u.usuario_id}</td>
                          <td className="py-2 px-3">{u.rol}</td>
                          <td className="py-2 px-3">{u.email}</td>
                          <td className="py-2 px-3 text-xs">
                            {new Date(u.ultima_actividad).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* Última actividad de usuarios */}
            <SectionCard title="Última actividad de usuarios">
              {userLastActivity.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No hay registros de actividad de usuarios.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-neutral-800 text-neutral-400">
                      <tr>
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Última actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLastActivity.map((row) => (
                        <tr
                          key={row.usuario_id}
                          className="border-b border-neutral-900/80 last:border-0"
                        >
                          <td className="py-2 px-3 text-xs">
                            #{row.usuario_id}
                          </td>
                          <td className="py-2 px-3">{row.email}</td>
                          <td className="py-2 px-3 text-xs">
                            {row.ultima_actividad
                              ? new Date(row.ultima_actividad).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-[11px] text-neutral-400">
                Datos provenientes de la vista <code>vw_user_last_activity</code>.
              </p>
            </SectionCard>

            {/* Usuarios inactivos (> 30 días sin actividad) */}
            <SectionCard title="Usuarios inactivos (&gt; 30 días sin actividad)">
              {usuariosInactivos.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No hay usuarios con más de 30 días sin actividad.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-neutral-800 text-neutral-400">
                      <tr>
                        <th className="py-2 px-3">ID</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Última actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosInactivos.map((row) => (
                        <tr
                          key={row.usuario_id}
                          className="border-b border-neutral-900/80 last:border-0"
                        >
                          <td className="py-2 px-3 text-xs">
                            #{row.usuario_id}
                          </td>
                          <td className="py-2 px-3">{row.email}</td>
                          <td className="py-2 px-3 text-xs">
                            {row.ultima_actividad
                              ? new Date(row.ultima_actividad).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-[11px] text-neutral-400">
                Basado en la vista <code>vw_usuario_inactivos_30d</code>.
              </p>
            </SectionCard>
          </>
        )}
      </main>
    </div>
  );
}

function SubTablaIngresosPorMes({ rows }: { rows: MonetizacionIngresosMes[] }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="text-xs font-semibold text-neutral-300">
        Ingresos por mes (detalle)
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="py-2 px-3">Periodo</th>
              <th className="py-2 px-3 text-right">Compras OK</th>
              <th className="py-2 px-3 text-right">Créditos</th>
              <th className="py-2 px-3 text-right">Ingresos (Bs)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.periodo}
                className="border-b border-neutral-900/80 last:border-0"
              >
                <td className="py-2 px-3">{row.periodo}</td>
                <td className="py-2 px-3 text-right">{row.compras_ok}</td>
                <td className="py-2 px-3 text-right">
                  {row.creditos_total}
                </td>
                <td className="py-2 px-3 text-right">{row.bs_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubTablaConsumoVsGeneracion({
  rows,
}: {
  rows: ConsumoVsGeneracion[];
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="text-xs font-semibold text-neutral-300">
        Consumo de créditos vs generación (detalle)
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="py-2 px-3">Origen</th>
              <th className="py-2 px-3 text-right">Total créditos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.origen}
                className="border-b border-neutral-900/80 last:border-0"
              >
                <td className="py-2 px-3">{row.origen}</td>
                <td className="py-2 px-3 text-right">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">
        Este indicador compara créditos que provienen de compra directa vs
        créditos generados por intercambios u otras acciones.
      </p>
    </div>
  );
}
