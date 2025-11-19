// apps/web/src/pages/reports/OrgReportsPage.tsx

import React, { useEffect, useState } from "react";
import {
  getOrgVentas,
  getOrgWallet,
  getOrgTopCategorias,
} from "../../api/reportes.usuario";
import type {
  OrgVentaItem,
  OrgWalletItem,
  OrgTopCategoriaItem,
} from "../../api/reportes.usuario";

const OrgReportsPage: React.FC = () => {
  const [ventas, setVentas] = useState<OrgVentaItem[]>([]);
  const [wallet, setWallet] = useState<OrgWalletItem[]>([]);
  const [topCategorias, setTopCategorias] = useState<OrgTopCategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [_ventas, _wallet, _topCat] = await Promise.all([
          getOrgVentas(),
          getOrgWallet(),
          getOrgTopCategorias(),
        ]);
        setVentas(_ventas);
        setWallet(_wallet);
        setTopCategorias(_topCat);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Error cargando reportes de organización");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-4">Cargando reportes...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Reportes de mi organización</h1>

      {/* Ventas por mes */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-2">Ventas por mes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 dark:bg-neutral-900/60">
              <tr>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Mes
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Créditos
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Operaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ventas.length ? (
                ventas.map((v, i) => (
                  <tr
                    key={i}
                    className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950"
                  >
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {new Date(v.mes).toLocaleDateString("es-BO", {
                        year: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {v.total_cred ?? 0}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {v.total_ops}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2" colSpan={3}>
                    Sin ventas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Wallet mensual */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-2">Movimientos de billetera</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 dark:bg-neutral-900/60">
              <tr>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Mes
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Créditos que entran
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Créditos que salen
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Saldo neto
                </th>
              </tr>
            </thead>
            <tbody>
              {wallet.length ? (
                wallet.map((w, i) => (
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

      {/* Top categorías */}
      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Categorías con más intercambios
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <thead className="bg-neutral-100 dark:bg-neutral-900/60">
              <tr>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Categoría
                </th>
                <th className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Intercambios completados
                </th>
              </tr>
            </thead>
            <tbody>
              {topCategorias.length ? (
                topCategorias.map((c) => (
                  <tr
                    key={c.categoria_id}
                    className="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-900 dark:even:bg-neutral-950"
                  >
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {c.categoria}
                    </td>
                    <td className="px-3 py-1 border-b border-neutral-200 dark:border-neutral-800">
                      {c.intercambios}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2" colSpan={2}>
                    Aún no hay intercambios.
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

export default OrgReportsPage;
