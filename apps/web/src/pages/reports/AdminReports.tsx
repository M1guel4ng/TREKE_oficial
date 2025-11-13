import { useEffect, useState } from "react";
import { adminOverview, adminTopCategorias, adminTopUsuarios } from "../../api/reports";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminReports() {
  const [overview, setOverview] = useState<any>(null);
  const [topCats, setTopCats] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    adminOverview().then((r:any)=>setOverview(r.data ?? r)).catch(console.error);
    adminTopCategorias().then((r:any)=>setTopCats(r.data ?? r)).catch(console.error);
    adminTopUsuarios().then((r:any)=>setTopUsers(r.data ?? r)).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Reportes — Administrador</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Ingresos por compra de créditos</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={overview?.ingresos || []}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ingresos_usd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Productos/servicios más demandados (categorías)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={topCats} dataKey="intercambios_completados" nameKey="categoria" outerRadius={100} label>
                  {topCats.map((_, i) => <Cell key={i} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Ranking de usuarios más activos</h3>
          <ol className="text-sm space-y-1">
            {(topUsers || []).map((u:any) => (
              <li key={u.usuario_id}>{u.nombre} — {u.intercambios_hechos} trueques</li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Impacto ambiental estimado (sitio)</h3>
          <ul className="text-sm space-y-1">
            <li>CO₂ total: <b>{overview?.impacto?.co2_t ?? 0}</b></li>
            <li>Energía total: <b>{overview?.impacto?.energia_t ?? 0}</b></li>
            <li>Agua total: <b>{overview?.impacto?.agua_t ?? 0}</b></li>
            <li>Residuos evitados: <b>{overview?.impacto?.residuos_t ?? 0}</b></li>
            <li>Créditos ganados: <b>{overview?.impacto?.creditos_ganados_t ?? 0}</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
