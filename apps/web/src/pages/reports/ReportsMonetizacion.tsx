import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import * as RM from "../../api/reportes.monetizacion";

type Tab = "totales" | "porMes" | "porUsuario" | "consumo" | "suscripciones" | "saldos";

export default function ReportsMonetizacion() {
  const [tab, setTab] = useState<Tab>("totales");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [tot, setTot] = useState<RM.IngresosTotal | null>(null);
  const [mes, setMes] = useState<RM.IngresosMes[]>([]);
  const [porUser, setPorUser] = useState<RM.CreditosPorUsuario[]>([]);
  const [saldos, setSaldos] = useState<RM.SaldoUsuario[]>([]);
  const [cvg, setCvg] = useState<RM.ConsumoVsGeneracion[]>([]);
  const [sus, setSus] = useState<RM.Suscripciones | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, b, c, d, e, f] = await Promise.all([
          RM.getIngresosTotal(),
          RM.getIngresosMes(),
          RM.getCreditosPorUsuario(),
          RM.getSaldos(),
          RM.getConsumoVsGeneracion(),
          RM.getSuscripciones(),
        ]);
        setTot(a); setMes(b); setPorUser(c); setSaldos(d); setCvg(e); setSus(f);
      } catch (e: any) {
        setErr(e?.message || "No se pudieron cargar los reportes de monetización");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cvgMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of cvg) m[i.origen] = Number(i.total ?? 0);
    return m;
  }, [cvg]);

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <Header title="Reportes de monetización (Admin)" />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {([
            ["totales","Totales"],
            ["porMes","Ingresos por mes"],
            ["porUsuario","Créditos por usuario"],
            ["consumo","Consumo vs Generación"],
            ["saldos","Saldos billetera"],
            ["suscripciones","Suscripciones"]
          ] as [Tab,string][]).map(([k, label]) => (
            <button key={k}
              onClick={()=>setTab(k)}
              className={`px-4 py-2 -mb-[1px] border-b-2 text-sm font-semibold ${tab===k ? "border-emerald-500 text-emerald-500" : "border-transparent text-neutral-400 hover:text-neutral-200"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading && <p>Cargando…</p>}
        {err && <p className="text-red-500">{err}</p>}

        {/* Totales */}
        {tab==="totales" && tot && (
          <section className="grid gap-3 sm:grid-cols-3">
            <KPI label="Compras OK" value={tot.compras_ok ?? 0} />
            <KPI label="Ingresos (Bs)" value={Number(tot.bs_total ?? 0).toFixed(2)} />
            <KPI label="Créditos vendidos" value={tot.creditos_total ?? 0} />
          </section>
        )}

        {/* Por mes */}
        {tab==="porMes" && (
          <section className="space-y-3">
            {mes.map((m) => (
              <BarItem
                key={m.periodo}
                label={new Date(m.periodo).toLocaleDateString(undefined,{year:"numeric",month:"short"})}
                value={Number(m.bs_total ?? 0)}
                max={Math.max(1, ...mes.map(x => Number(x.bs_total ?? 0)))}
                suffix=" Bs"
              />
            ))}
            {!mes.length && <Empty>Sin datos.</Empty>}
          </section>
        )}

        {/* Créditos por usuario */}
        {tab==="porUsuario" && (
          <section className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <Th>Usuario</Th><Th>Compras OK</Th><Th>Créditos</Th><Th>Bs gastados</Th>
                </tr>
              </thead>
              <tbody>
                {porUser.map(u => (
                  <tr key={u.usuario_id} className="border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <Td>{u.usuario_id}</Td>
                    <Td>{u.compras_ok}</Td>
                    <Td>{u.creditos_comprados ?? 0}</Td>
                    <Td>{Number(u.bs_gastados ?? 0).toFixed(2)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!porUser.length && <Empty>Sin datos.</Empty>}
          </section>
        )}

        {/* Consumo vs Generación */}
        {tab==="consumo" && (
          <section className="grid gap-3">
            {(["compra_directa","generado_intercambios","gastado_intercambios","otros"] as const).map((k) => (
              <BarItem
                key={k}
                label={labelConsumo(k)}
                value={cvgMap[k] ?? 0}
                max={Math.max(1, ...Object.values(cvgMap))}
              />
            ))}
            {!cvg.length && <Empty>Sin datos.</Empty>}
          </section>
        )}

        {/* Saldos */}
        {tab==="saldos" && (
          <section className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <Th>Usuario</Th><Th>Disponible</Th><Th>Retenido</Th><Th>Total</Th>
                </tr>
              </thead>
              <tbody>
                {saldos.map(s => (
                  <tr key={s.usuario_id} className="border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <Td>{s.usuario_id}</Td>
                    <Td>{s.saldo_disponible}</Td>
                    <Td>{s.saldo_retenido}</Td>
                    <Td className="font-semibold">{s.saldo_total}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!saldos.length && <Empty>Sin datos.</Empty>}
          </section>
        )}

        {/* Suscripciones */}
        {tab==="suscripciones" && sus && (
          <section className="grid gap-3 sm:grid-cols-4">
            <KPI label="Registros" value={sus.total_registros ?? 0} />
            <KPI label="Activas" value={sus.activas ?? 0} />
            <KPI label="Usuarios con suscripción" value={sus.usuarios_con_suscripcion ?? 0} />
            <KPI label="Ratio activas" value={Number(sus.ratio_activas ?? 0).toFixed(2)} />
          </section>
        )}
      </main>
    </div>
  );
}

function labelConsumo(k: RM.ConsumoVsGeneracion["origen"]) {
  switch (k) {
    case "compra_directa": return "Compra directa";
    case "generado_intercambios": return "Generado por intercambios";
    case "gastado_intercambios": return "Gastado en intercambios";
    default: return "Otros";
  }
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function BarItem({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  const p = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="opacity-80">{label}</span>
        <span className="font-medium">{value.toFixed(2)}{suffix}</span>
      </div>
      <div className="h-2 rounded bg-neutral-200/60 dark:bg-neutral-800/60 overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${p}%` }} />
      </div>
    </div>
  );
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
