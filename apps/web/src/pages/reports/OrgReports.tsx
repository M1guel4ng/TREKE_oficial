import { useEffect, useState } from "react";
import { orgVentas, orgWallet, orgTopCategoriasMine, userSummary } from "../../api/reports";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function OrgReports() {
  const [ventas, setVentas] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any[]>([]);
  const [topCat, setTopCat] = useState<any[]>([]);
  const [impacto, setImpacto] = useState<any>(null);

  useEffect(() => {
    orgVentas().then((r:any)=>setVentas(r.data ?? r)).catch(console.error);
    orgWallet().then((r:any)=>setWallet(r.data ?? r)).catch(console.error);
    orgTopCategoriasMine().then((r:any)=>setTopCat(r.data ?? r)).catch(console.error);
    userSummary().then((r:any)=>setImpacto((r.data ?? r)?.impacto ?? null)).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Reportes — Emprendedor / ONG</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Ingresos por ventas (créditos)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={ventas}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_cred" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm mt-2">Operaciones: {ventas.reduce((a,b)=>a+(b.total_ops||0),0)}</p>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Créditos adquiridos vs consumidos</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={wallet}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="adquiridos" />
                <Bar dataKey="consumidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Productos más demandados (mis categorías)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={topCat} dataKey="intercambios_completados" nameKey="categoria" outerRadius={100} label>
                  {topCat.map((_, i) => <Cell key={i} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Impacto sostenible estimado</h3>
          <ul className="text-sm space-y-1">
            <li>CO₂ evitado: <b>{impacto?.total_co2_evitado ?? 0}</b></li>
            <li>Energía ahorrada: <b>{impacto?.total_energia_ahorrada ?? 0}</b></li>
            <li>Agua preservada: <b>{impacto?.total_agua_preservada ?? 0}</b></li>
            <li>Residuos evitados: <b>{impacto?.total_residuos_evitados ?? 0}</b></li>
          </ul>
          {!impacto && <p className="text-sm text-neutral-500 mt-2">Sin datos de impacto todavía.</p>}
        </div>
      </div>
    </div>
  );
}
