import { useEffect, useState } from "react";
import Header from "../../components/Header";
import * as RG from "../../api/reportes.general";

export default function ReportsGeneral() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [ranking, setRanking] = useState<RG.RankingItem[]>([]);
  const [inactivos, setInactivos] = useState<RG.InactivoItem[]>([]);
  const [impacto, setImpacto] = useState<RG.ImpactoTotal | null>(null);
  const [cats, setCats] = useState<RG.IntercambiosPorCat[]>([]);
  const [resumen, setResumen] = useState<RG.ResumenSistema | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [r1, r2, r3, r4, r5] = await Promise.all([
          RG.getRanking(10),
          RG.getInactivos(30),
          RG.getImpacto(),
          RG.getIntercambiosPorCat(),
          RG.getResumen(),
        ]);
        setRanking(r1);
        setInactivos(r2);
        setImpacto(r3);
        setCats(r4);
        setResumen(r5);
      } catch (e: any) {
        setErr(e?.message || "No se pudieron cargar los reportes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <Header title="Reportes generales" />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
        {loading && <p>Cargando…</p>}
        {err && <p className="text-red-500">{err}</p>}

        {/* Impacto agregado */}
        {impacto && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { k: "co2", label: "CO₂ total", suf: " kg" },
              { k: "energia", label: "Energía", suf: " kWh" },
              { k: "agua", label: "Agua", suf: " L" },
              { k: "residuos", label: "Residuos", suf: " kg" },
              { k: "creditos", label: "Créditos ganados", suf: "" },
            ].map((i) => (
              <KPI
                key={i.k}
                label={i.label}
                value={`${Number((impacto as any)[i.k] ?? 0)}${i.suf}`}
              />
            ))}
          </section>
        )}

        {/* Ranking participación */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Top usuarios por participación</h3>
          <Table className="min-w-full">
            <thead>
              <tr>
                <Th>#</Th><Th>Usuario</Th><Th>Intercambios</Th>
                <Th>Compras</Th><Th>Suscripción</Th><Th>Puntaje</Th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr key={r.usuario_id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <Td>{r.pos}</Td>
                  <Td>{r.email}</Td>
                  <Td>{r.intercambios}</Td>
                  <Td>{r.compras_creditos}</Td>
                  <Td>{r.tiene_suscripcion ? "Sí" : "No"}</Td>
                  <Td className="font-semibold">{r.puntaje}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {!ranking.length && <Empty>Sin datos.</Empty>}
        </section>

        {/* Inactivos */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Usuarios inactivos (30 días)</h3>
          <ul className="space-y-2">
            {inactivos.map((u) => (
              <li key={u.usuario_id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                <div className="font-medium">{u.email}</div>
                <div className="text-sm opacity-80">
                  Última actividad: {new Date(u.ultima_actividad).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
          {!inactivos.length && <Empty>Todos activos 🎉</Empty>}
        </section>

        {/* Intercambios por Categoría */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Intercambios por categoría</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => (
              <div key={c.categoria_id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <div className="font-semibold">{c.categoria}</div>
                <div className="text-2xl">{c.intercambios}</div>
              </div>
            ))}
          </div>
          {!cats.length && <Empty>Sin datos.</Empty>}
        </section>

        {/* Resumen sistema */}
        {resumen && (
          <section>
            <h3 className="text-lg font-semibold mb-3">Resumen del sistema</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <KPI label="Intercambios completados" value={resumen.total?.completados ?? 0} />
              <KPI label="Intercambios activos" value={resumen.total?.activos ?? 0} />
              <KPI
                label="Ratio Intercambios / Publicaciones"
                value={(resumen.ratio?.ratio_intercambio_por_publicacion ?? 0).toFixed(2)}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function Table(props: React.HTMLAttributes<HTMLTableElement>) {
  return <table {...props} className={`text-sm ${props.className ?? ""}`} />;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-2 text-left text-neutral-600 dark:text-neutral-300">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-2 py-2 ${className ?? ""}`}>{children}</td>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="opacity-70 mt-2">{children}</p>;
}
