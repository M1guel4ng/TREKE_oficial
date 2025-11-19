// apps/web/src/pages/reports/UserReportsPage.tsx

import React, { useEffect, useState } from "react";
import {
  getUserSummary,
  getUserRanking,
  getUserHistory,
} from "../../api/reportes.usuario";
import type {
  UserSummary,
  UserRankingResponse,
  UserHistoryItem as RawUserHistoryItem,
} from "../../api/reportes.usuario";

// Extiendo el tipo de historial para usar las columnas extra del view
type UserHistoryItem = RawUserHistoryItem & {
  estado?: string;
  publicacion_titulo?: string;
  categoria_nombre?: string;
};

const UserReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [ranking, setRanking] = useState<UserRankingResponse | null>(null);
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [_summary, _ranking, _history] = await Promise.all([
          getUserSummary(),
          getUserRanking(),
          getUserHistory(),
        ]);

        setSummary(_summary);
        setRanking(_ranking);
        setHistory(_history as UserHistoryItem[]);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error cargando reportes de usuario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-4">Cargando mis reportes...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const me = ranking?.me;
  const posicion =
    (me as any)?.rank_intercambios ??
    (me as any)?.pos ??
    "-";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Mis reportes</h1>

      {/* Resumen de participación */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-1">Participación</h2>
        {me ? (
          <>
            <p>
              <strong>Intercambios completados:</strong>{" "}
              {me.intercambios_hechos}
            </p>
            <p>
              <strong>Compras de créditos:</strong>{" "}
              {me.compras_creditos}
            </p>
            <p>
              <strong>Créditos comprados:</strong>{" "}
              {me.creditos_comprados ?? 0}
            </p>
            <p>
              <strong>Suscripción premium:</strong>{" "}
              {me.tiene_suscripcion ? "Sí" : "No"}
            </p>
            <p>
              <strong>Puntaje:</strong> {me.puntaje}
            </p>
            <p>
              <strong>Posición en ranking por intercambios:</strong>{" "}
              {posicion}
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            No se encontraron datos de participación.
          </p>
        )}
      </section>

      {/* Impacto ambiental personal */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-1">Mi Impacto Ambiental</h2>
        {summary?.impacto ? (
          <>
            <p>
              <strong>CO₂ evitado:</strong>{" "}
              {summary.impacto.total_co2_evitado}
            </p>
            <p>
              <strong>Energía ahorrada:</strong>{" "}
              {summary.impacto.total_energia_ahorrada}
            </p>
            <p>
              <strong>Agua preservada:</strong>{" "}
              {summary.impacto.total_agua_preservada}
            </p>
            <p>
              <strong>Residuos evitados:</strong>{" "}
              {summary.impacto.total_residuos_evitados}
            </p>
            <p>
              <strong>Créditos ganados por impacto:</strong>{" "}
              {summary.impacto.total_creditos_ganados}
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            Todavía no generaste impacto registrado.
          </p>
        )}
      </section>

      {/* Wallet mensual */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-2">
          Movimientos mensuales de créditos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 dark:bg-neutral-900/60">
              <tr>
                <th className="px-3 py-2 text-left border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Mes
                </th>
                <th className="px-3 py-2 text-left border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Créditos que entran
                </th>
                <th className="px-3 py-2 text-left border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Créditos que salen
                </th>
                <th className="px-3 py-2 text-left border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Saldo neto
                </th>
              </tr>
            </thead>
            <tbody>
              {summary?.wallet_monthly.length ? (
                summary.wallet_monthly.map((w, i) => (
                  <tr
                    key={i}
                    className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950"
                  >
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {new Date(w.mes).toLocaleDateString("es-BO", {
                        year: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {w.creditos_entrada ?? 0}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {w.creditos_salida ?? 0}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {w.saldo_neto ?? 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2" colSpan={4}>
                    Sin movimientos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historial de intercambios */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Historial de Intercambios
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 dark:bg-neutral-900/60">
              <tr>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  ID
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Rol
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Estado
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Título
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Créditos
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Categoría
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Fecha completado
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length ? (
                history.map((h) => (
                  <tr
                    key={h.intercambio_id}
                    className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950"
                  >
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.intercambio_id}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.rol ?? "-"}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.estado ?? "-"}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.publicacion_titulo ?? "-"}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.monto_credito}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.categoria_nombre ?? "-"}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {h.fecha_completado
                        ? new Date(h.fecha_completado).toLocaleString("es-BO")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2" colSpan={7}>
                    No tienes intercambios todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserReportsPage;
