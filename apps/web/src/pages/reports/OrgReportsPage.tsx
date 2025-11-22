// apps/web/src/pages/org/OrgReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import { getOrgVentas, getOrgWallet, getOrgTopCategorias } from "../../api/report";
import type {
  MonetizacionIngresosMes,
  SaldoCreditosUsuarioRow,
  IntercambiosPorCategoria,
} from "../../types/report";

import KPICard from "../../components/Reportes/KPICard";
import ChartContainer from "../../components/Reportes/ChartContainer";
import SectionCard from "../../components/Reportes/SectionCard";
import BarChartSimple, {
  type SimpleChartDatum,
} from "../../components/Reportes/Graficas/BarChartSimple";
import PieChartSimple from "../../components/Reportes/Graficas/PieChartSimple";

type Status = "idle" | "loading" | "success" | "error";

export default function OrgReportsPage() {
  const [ventasMes, setVentasMes] = useState<MonetizacionIngresosMes[]>([]);
  const [wallet, setWallet] = useState<SaldoCreditosUsuarioRow | null>(null);
  const [topCategorias, setTopCategorias] = useState<IntercambiosPorCategoria[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        setMsg("");
        const [v, w, t] = await Promise.all([
          getOrgVentas(),
          getOrgWallet(),
          getOrgTopCategorias(),
        ]);
        setVentasMes(v || []);
        setWallet(w);
        setTopCategorias(t || []);
        setStatus("success");
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "No se pudieron cargar los reportes de la organización");
        setStatus("error");
      }
    })();
  }, []);

  const totalesVentas = useMemo(() => {
    return ventasMes.reduce(
      (acc, row) => {
        acc.compras_ok += Number(row.compras_ok ?? 0);
        acc.creditos += Number(row.creditos_total ?? 0);
        acc.bs += Number(row.bs_total ?? 0);
        return acc;
      },
      { compras_ok: 0, creditos: 0, bs: 0 }
    );
  }, [ventasMes]);

  const ventasChart: SimpleChartDatum[] = useMemo(
    () =>
      ventasMes.map((row) => ({
        name: row.periodo,
        value: Number(row.bs_total ?? 0),
      })),
    [ventasMes]
  );

  const categoriasChart: SimpleChartDatum[] = useMemo(
    () =>
      topCategorias.map((c) => ({
        name: c.categoria,
        value: Number(c.intercambios ?? 0),
      })),
    [topCategorias]
  );

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Reportes de organización" />
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        {status === "loading" && <p>Cargando reportes…</p>}
        {status === "error" && (
          <div className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        {status === "success" && (
          <>
            {/* KPIs principales */}
            <section className="grid gap-4 md:grid-cols-3">
              <KPICard
                label="Saldo total de créditos"
                value={wallet ? wallet.saldo_total : 0}
                helperText={
                  wallet
                    ? `Disponible: ${wallet.saldo_disponible} · Retenido: ${wallet.saldo_retenido}`
                    : "No se encontró una billetera asociada."
                }
              />
              <KPICard
                label="Ingresos acumulados por venta de créditos (Bs)"
                value={totalesVentas.bs.toFixed(2)}
                helperText={`Compras OK: ${totalesVentas.compras_ok}`}
              />
              <KPICard
                label="Créditos vendidos (acumulado)"
                value={totalesVentas.creditos}
              />
            </section>

            {/* Wallet detalle */}
            <SectionCard title="Detalle de billetera">
              {wallet ? (
                <div className="space-y-1 text-sm text-neutral-300">
                  <p>
                    <span className="font-semibold">Disponible:</span>{" "}
                    {wallet.saldo_disponible}
                  </p>
                  <p>
                    <span className="font-semibold">Retenido:</span>{" "}
                    {wallet.saldo_retenido}
                  </p>
                  <p>
                    <span className="font-semibold">Total:</span>{" "}
                    {wallet.saldo_total}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">
                  No se encontró una billetera asociada a esta cuenta.
                </p>
              )}
            </SectionCard>

            {/* Ingresos por mes: tabla + gráfico */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <section>
                <h2 className="text-sm font-semibold text-neutral-200">
                  Ingresos por mes (venta de créditos)
                </h2>
                {ventasMes.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-400">
                    Todavía no se registran ingresos.
                  </p>
                ) : (
                  <div className="mt-2 overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
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
                        {ventasMes.map((row) => (
                          <tr
                            key={row.periodo}
                            className="border-b border-neutral-900/80 last:border-0"
                          >
                            <td className="py-2 px-3">{row.periodo}</td>
                            <td className="py-2 px-3 text-right">
                              {row.compras_ok}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {row.creditos_total}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {row.bs_total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <ChartContainer title="Ingresos por mes (Bs)">
                {ventasChart.length > 0 ? (
                  <BarChartSimple data={ventasChart} />
                ) : (
                  <p className="text-xs text-neutral-500">
                    No hay datos para mostrar.
                  </p>
                )}
              </ChartContainer>
            </section>

            {/* Top categorías + gráfico */}
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <section>
                <h2 className="text-sm font-semibold text-neutral-200">
                  Categorías de intercambio más populares
                </h2>
                {topCategorias.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-400">
                    Aún no hay suficientes intercambios para mostrar categorías
                    populares.
                  </p>
                ) : (
                  <div className="mt-2 overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
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
          </>
        )}
      </main>
    </div>
  );
}
