// apps/web/src/pages/reports/AdminReportsPage.tsx

import React, { useEffect, useState } from "react";
import {
  getIngresosTotal,
  getIngresosMes,
  getCreditosPorUsuario,
  getSaldos,
  getConsumoVsGeneracion,
  getSuscripciones,
} from "../../api/reportes.monetizacion";
import type {
  IngresosTotal,
  IngresosMes,
  CreditosPorUsuario,
  SaldoUsuario,
  ConsumoVsGeneracion,
  Suscripciones,
} from "../../api/reportes.monetizacion";

import {
  getImpacto,
  getIntercambiosPorCat,
  getResumen,
  getRanking,
  getInactivos,
  getImpactoPorCategoria,
  getActividadesSostenibles,
  getUsuariosActivosPorRol,
} from "../../api/reportes.general";
import type {
  ImpactoTotal,
  IntercambiosPorCat,
  ResumenSistema,
  RankingItem,
  InactivoItem,
  ImpactoPorCategoriaItem,
  ActividadSostenibleItem,
  UsuariosActivosRolItem,
} from "../../api/reportes.general";

const AdminReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monetización
  const [ingresosTotal, setIngresosTotal] = useState<IngresosTotal | null>(null);
  const [ingresosMes, setIngresosMes] = useState<IngresosMes[]>([]);
  const [creditosPorUsuario, setCreditosPorUsuario] = useState<CreditosPorUsuario[]>([]);
  const [saldos, setSaldos] = useState<SaldoUsuario[]>([]);
  const [consumoVsGen, setConsumoVsGen] = useState<ConsumoVsGeneracion[]>([]);
  const [suscripciones, setSuscripciones] = useState<Suscripciones | null>(null);

  // Impacto
  const [impactoTotal, setImpactoTotal] = useState<ImpactoTotal | null>(null);
  const [impactoPorCat, setImpactoPorCat] = useState<ImpactoPorCategoriaItem[]>([]);
  const [actividadesSostenibles, setActividadesSostenibles] = useState<
    ActividadSostenibleItem[]
  >([]);

  // Usuarios / Sistema
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [inactivos, setInactivos] = useState<InactivoItem[]>([]);
  const [usuariosActivosRol, setUsuariosActivosRol] = useState<
    UsuariosActivosRolItem[]
  >([]);
  const [intercambiosPorCat, setIntercambiosPorCat] = useState<IntercambiosPorCat[]>([]);
  const [resumenSistema, setResumenSistema] = useState<ResumenSistema | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          _ingresosTotal,
          _ingresosMes,
          _creditosPorUsuario,
          _saldos,
          _consumoVsGen,
          _suscripciones,
          _impactoTotal,
          _impactoPorCat,
          _actividadesSostenibles,
          _ranking,
          _inactivos,
          _usuariosActivosRol,
          _intercambiosPorCat,
          _resumen,
        ] = await Promise.all([
          getIngresosTotal(),
          getIngresosMes(),
          getCreditosPorUsuario(),
          getSaldos(),
          getConsumoVsGeneracion(),
          getSuscripciones(),
          getImpacto(),
          getImpactoPorCategoria(),
          getActividadesSostenibles(),
          getRanking(10),
          getInactivos(30),
          getUsuariosActivosPorRol(),
          getIntercambiosPorCat(),
          getResumen(),
        ]);

        setIngresosTotal(_ingresosTotal);
        setIngresosMes(_ingresosMes);
        setCreditosPorUsuario(_creditosPorUsuario);
        setSaldos(_saldos);
        setConsumoVsGen(_consumoVsGen);
        setSuscripciones(_suscripciones);
        setImpactoTotal(_impactoTotal);
        setImpactoPorCat(_impactoPorCat);
        setActividadesSostenibles(_actividadesSostenibles);
        setRanking(_ranking);
        setInactivos(_inactivos);
        setUsuariosActivosRol(_usuariosActivosRol);
        setIntercambiosPorCat(_intercambiosPorCat);
        setResumenSistema(_resumen);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error cargando reportes");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-4">Cargando reportes...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard de Reportes (Admin)</h1>
      </div>

      {/* =================== */}
      {/* 1) MONETIZACIÓN     */}
      {/* =================== */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reportes de Monetización</h2>

        {/* KPIs principales */}
        <div className="grid md:grid-cols-3 gap-4">
          <KpiCard
            title="Ingresos totales (Bs)"
            value={ingresosTotal?.bs_total ?? 0}
          />
          <KpiCard
            title="Créditos vendidos"
            value={ingresosTotal?.creditos_total ?? 0}
          />
          <KpiCard
            title="Compras completadas"
            value={ingresosTotal?.compras_ok ?? 0}
          />
        </div>

        {/* Ingresos por mes */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Ingresos por Mes</h3>
          <Table
            headers={["Mes", "Compras OK", "Bs", "Créditos"]}
            rows={ingresosMes.map((m) => [
              new Date(m.periodo).toLocaleDateString("es-BO", {
                year: "numeric",
                month: "short",
              }),
              m.compras_ok,
              m.bs_total ?? 0,
              m.creditos_total ?? 0,
            ])}
          />
        </div>

        {/* Consumo vs generación */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Consumo vs Generación de Créditos</h3>
          <Table
            headers={["Origen", "Total créditos"]}
            rows={consumoVsGen.map((c) => [c.origen, c.total])}
          />
        </div>

        {/* Suscripciones */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Adopción de Suscripción Premium</h3>
          {suscripciones && (
            <Table
              headers={["Total registros", "Activas", "Usuarios con suscripción", "Ratio activas"]}
              rows={[
                [
                  suscripciones.total_registros,
                  suscripciones.activas,
                  suscripciones.usuarios_con_suscripcion,
                  Number(suscripciones.ratio_activas ?? 0).toFixed(2),
                ],
              ]}
            />
          )}
        </div>

        {/* Créditos comprados por usuario */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Créditos comprados por usuario (Top)</h3>
          <Table
            headers={["Usuario ID", "Compras OK", "Créditos", "Bs gastados"]}
            rows={creditosPorUsuario.map((u) => [
              u.usuario_id,
              u.compras_ok,
              u.creditos_comprados ?? 0,
              u.bs_gastados ?? 0,
            ])}
          />
        </div>

        {/* Saldos de billetera */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Saldos de Wallet</h3>
          <Table
            headers={["Usuario ID", "Saldo disponible", "Saldo retenido", "Saldo total"]}
            rows={saldos.map((s) => [
              s.usuario_id,
              s.saldo_disponible,
              s.saldo_retenido,
              s.saldo_total,
            ])}
          />
        </div>
      </section>

      {/* =================== */}
      {/* 2) IMPACTO AMBIENTAL*/}
      {/* =================== */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reportes de Impacto Ambiental</h2>

        {/* Impacto total */}
        <div className="grid md:grid-cols-5 gap-4">
          <KpiCard title="CO₂ evitado" value={impactoTotal?.co2 ?? 0} />
          <KpiCard title="Energía ahorrada" value={impactoTotal?.energia ?? 0} />
          <KpiCard title="Agua preservada" value={impactoTotal?.agua ?? 0} />
          <KpiCard title="Residuos evitados" value={impactoTotal?.residuos ?? 0} />
          <KpiCard title="Créditos verdes" value={impactoTotal?.creditos ?? 0} />
        </div>

        {/* Impacto por categoría */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Impacto por Categoría</h3>
          <Table
            headers={[
              "Categoría",
              "CO₂",
              "Energía",
              "Agua",
              "Residuos",
              "Créditos",
            ]}
            rows={impactoPorCat.map((i) => [
              i.categoria,
              i.co2 ?? 0,
              i.energia ?? 0,
              i.agua ?? 0,
              i.residuos ?? 0,
              i.creditos ?? 0,
            ])}
          />
        </div>

        {/* Actividades sostenibles */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Participación en Actividades Sostenibles</h3>
          <Table
            headers={["Tipo de actividad", "Usuarios", "Créditos otorgados"]}
            rows={actividadesSostenibles.map((a) => [
              a.tipo_actividad,
              a.total_usuarios_participantes,
              a.total_creditos_otorgados ?? 0,
            ])}
          />
        </div>
      </section>

      {/* =================== */}
      {/* 3) REPORTES USUARIOS */}
      {/* =================== */}
      <section className="space-y-4 pb-8">
        <h2 className="text-xl font-semibold">Reportes de Usuarios</h2>

        {/* Usuarios activos por rol */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Usuarios activos (últimos 30 días) por rol</h3>
          <Table
            headers={["Rol", "Usuarios activos 30d"]}
            rows={usuariosActivosRol.map((u) => [u.rol, u.usuarios_activos])}
          />
        </div>

        {/* Ranking */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Ranking de usuarios (participación)</h3>
          <Table
            headers={[
              "Posición",
              "Usuario ID",
              "Email",
              "Intercambios",
              "Compras créditos",
              "Créditos comprados",
              "Suscripción",
              "Puntaje",
            ]}
            rows={ranking.map((r) => [
              r.pos,
              r.usuario_id,
              r.email,
              r.intercambios,
              r.compras_creditos,
              r.creditos_comprados ?? 0,
              r.tiene_suscripcion ? "Sí" : "No",
              r.puntaje,
            ])}
          />
        </div>

        {/* Inactivos */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-2">Usuarios que abandonaron (inactivos &gt; 30 días)</h3>
          <Table
            headers={["Usuario ID", "Email", "Última actividad"]}
            rows={inactivos.map((u) => [
              u.usuario_id,
              u.email,
              new Date(u.ultima_actividad).toLocaleString("es-BO"),
            ])}
          />
        </div>

        {/* Resumen sistema + intercambios por categoría */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-2">Resumen Sistema</h3>
            {resumenSistema && (
              <>
                <p className="mb-1">
                  <strong>Intercambios completados:</strong>{" "}
                  {resumenSistema.total.completados}
                </p>
                <p className="mb-1">
                  <strong>Intercambios activos:</strong>{" "}
                  {resumenSistema.total.activos}
                </p>
                <p className="mb-1">
                  <strong>Total intercambios:</strong>{" "}
                  {resumenSistema.total.total}
                </p>
                <p className="mb-1">
                  <strong>Publicaciones:</strong>{" "}
                  {resumenSistema.ratio.publicaciones}
                </p>
                <p className="mb-1">
                  <strong>Intercambios (para ratio):</strong>{" "}
                  {resumenSistema.ratio.intercambios}
                </p>
                <p className="mt-1">
                  <strong>Ratio intercambio/publicación:</strong>{" "}
                  {Number(
                    resumenSistema.ratio.ratio_intercambio_por_publicacion ?? 0
                  ).toFixed(3)}
                </p>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-2">Intercambios por categoría</h3>
            <Table
              headers={["Categoría", "Intercambios completados"]}
              rows={intercambiosPorCat.map((c) => [c.categoria, c.intercambios])}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

/** Componentes simples de apoyo */

type KpiCardProps = {
  title: string;
  value: string | number | null;
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
      {title}
    </div>
    <div className="text-2xl font-semibold mt-1">
      {typeof value === "number" ? value.toLocaleString("es-BO") : value ?? 0}
    </div>
  </div>
);

type TableProps = {
  headers: (string | React.ReactNode)[];
  rows: (string | number | React.ReactNode | null)[][];
};

const Table: React.FC<TableProps> = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      <thead className="bg-neutral-100 dark:bg-neutral-900/60">
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className="px-3 py-2 text-left border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td className="px-3 py-2 text-sm" colSpan={headers.length}>
              Sin datos
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={i}
              className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default AdminReportsPage;
