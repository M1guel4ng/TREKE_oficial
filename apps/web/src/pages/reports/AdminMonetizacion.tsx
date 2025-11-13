import { useEffect, useState } from "react";
import { repMonet } from "../../api/reportes";

export default function AdminMonetization() {
  const [total, setTotal] = useState<any>(null);
  const [porMes, setPorMes] = useState<any[]>([]);
  const [comprados, setComprados] = useState<any[]>([]);
  const [saldos, setSaldos] = useState<any[]>([]);
  const [consumoGen, setConsumoGen] = useState<any[]>([]);
  const [adopcion, setAdopcion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [t, m, c, s, cg, a] = await Promise.all([
          repMonet.total(), repMonet.porMes(), repMonet.compradosUsuario(),
          repMonet.saldos(), repMonet.consumoGen(), repMonet.adopcion()
        ]);
        setTotal(t.data);
        setPorMes(m.data);
        setComprados(c.data);
        setSaldos(s.data);
        setConsumoGen(cg.data);
        setAdopcion(a.data);
      } catch (e:any) { setMsg(e.message || "Error cargando monetización"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Wrap><h2 className="text-xl font-semibold">Cargando…</h2></Wrap>;
  if (msg)     return <Wrap><p>{msg}</p></Wrap>;

  return (
    <Wrap>
      <h1 className="text-2xl font-bold">Monetización (Admin)</h1>

      {/* KPIs principales */}
      <div className="grid gap-3 sm:grid-cols-3 mt-4">
        <KPI label="Compras OK" value={fmt(total?.compras_ok)} />
        <KPI label="Ingresos (Bs.)" value={fmt(total?.bs_total)} />
        <KPI label="Créditos vend." value={fmt(total?.creditos_total)} />
      </div>

      {/* Ingresos por mes */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Ingresos por mes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left opacity-70">
              <th className="py-2 px-2">Mes</th>
              <th className="py-2 px-2">Compras OK</th>
              <th className="py-2 px-2">Bs</th>
              <th className="py-2 px-2">Créditos</th>
            </tr></thead>
            <tbody>
              {porMes.map((r:any, i:number) => (
                <tr key={i} className="border-t border-neutral-800">
                  <td className="py-2 px-2">{new Date(r.periodo).toLocaleDateString()}</td>
                  <td className="py-2 px-2">{fmt(r.compras_ok)}</td>
                  <td className="py-2 px-2">{fmt(r.bs_total)}</td>
                  <td className="py-2 px-2">{fmt(r.creditos_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Créditos comprados por usuario */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Créditos comprados por usuario</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left opacity-70">
              <th className="py-2 px-2">Usuario</th>
              <th className="py-2 px-2">Compras OK</th>
              <th className="py-2 px-2">Créditos</th>
              <th className="py-2 px-2">Bs gastados</th>
            </tr></thead>
            <tbody>
              {comprados.map((u:any, i:number) => (
                <tr key={i} className="border-t border-neutral-800">
                  <td className="py-2 px-2">{u.usuario_id}</td>
                  <td className="py-2 px-2">{fmt(u.compras_ok)}</td>
                  <td className="py-2 px-2">{fmt(u.creditos_comprados)}</td>
                  <td className="py-2 px-2">{fmt(u.bs_gastados)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Saldos actuales */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Saldos de créditos por usuario</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left opacity-70">
              <th className="py-2 px-2">Usuario</th>
              <th className="py-2 px-2">Disponible</th>
              <th className="py-2 px-2">Retenido</th>
              <th className="py-2 px-2">Total</th>
            </tr></thead>
            <tbody>
              {saldos.map((u:any, i:number) => (
                <tr key={i} className="border-t border-neutral-800">
                  <td className="py-2 px-2">{u.usuario_id}</td>
                  <td className="py-2 px-2">{fmt(u.saldo_disponible)}</td>
                  <td className="py-2 px-2">{fmt(u.saldo_retenido)}</td>
                  <td className="py-2 px-2">{fmt(u.saldo_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Consumo vs Generación */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Consumo vs generación</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {consumoGen.map((x:any, i:number) => (
            <Card key={i}>
              <p className="text-sm opacity-70">{x.origen}</p>
              <p className="text-2xl font-bold">{fmt(x.total)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Adopción de suscripciones */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Suscripciones</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <KPI label="Registros" value={fmt(adopcion?.total_registros)} />
          <KPI label="Activas"   value={fmt(adopcion?.activas)} />
          <KPI label="Usuarios con suscripción" value={fmt(adopcion?.usuarios_con_suscripcion)} />
          <KPI label="Ratio activas" value={(Number(adopcion?.ratio_activas||0)*100).toFixed(1) + "%"} />
        </div>
      </section>
    </Wrap>
  );
}

function Wrap({ children }: {children: React.ReactNode}) {
  return <div className="min-h-dvh bg-neutral-950 text-neutral-100">
    <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
  </div>;
}
function Card({ children }: {children: React.ReactNode}) {
  return <div className="rounded-xl border border-neutral-800 p-4 bg-neutral-950">{children}</div>;
}
function KPI({ label, value }: {label:string; value:string}) {
  return <Card><p className="text-sm opacity-70">{label}</p><p className="text-2xl font-bold mt-1">{value}</p></Card>;
}
function fmt(n:any){ const v = Number(n ?? 0); return Number.isFinite(v) ? v.toLocaleString() : "0"; }
