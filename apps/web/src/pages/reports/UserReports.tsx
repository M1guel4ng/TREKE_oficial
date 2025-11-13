import { useEffect, useState } from "react";
import { userSummary, userRanking, userHistory } from "../../api/reports";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function UserReports() {
  const [sum, setSum] = useState<any>(null);
  const [rank, setRank] = useState<any>(null);
  const [hist, setHist] = useState<any[]>([]);

  useEffect(() => {
    userSummary().then((r:any)=>setSum(r.data ?? r)).catch(console.error);
    userRanking().then((r:any)=>setRank(r.data ?? r)).catch(console.error);
    userHistory().then((r:any)=>setHist(r.data ?? r)).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Reportes — Usuario</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Créditos por intercambios</h3>
          <p>Ventas: <b>{sum?.exchange?.total_ventas_cred ?? 0}</b> | Compras: <b>{sum?.exchange?.total_compras_cred ?? 0}</b> | Neto: <b>{sum?.exchange?.neto_intercambios ?? 0}</b></p>
          <div className="h-56 mt-3">
            <ResponsiveContainer>
              <BarChart data={sum?.wallet_monthly || []}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="adquiridos" />
                <Bar dataKey="consumidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4">
          <h3 className="font-semibold mb-2">Ranking personal</h3>
          <p>Posición: <b>{rank?.me?.rank_intercambios ?? "-"}</b> con <b>{rank?.me?.intercambios_hechos ?? 0}</b> trueques.</p>
          <div className="mt-2">
            <h4 className="text-sm font-semibold mb-2">Top 10 (sitio)</h4>
            <ol className="text-sm space-y-1">
              {(rank?.top10 || []).map((x:any) => (
                <li key={x.usuario_id}>{x.rank_intercambios}. {x.nombre} — {x.intercambios_hechos}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 p-4">
        <h3 className="font-semibold mb-3">Historial de intercambios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="py-2">Fecha</th>
                <th>Rol</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Créditos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {(hist || []).map((h:any) => (
                <tr key={h.intercambio_id} className="border-t border-neutral-800">
                  <td className="py-2">{h.fecha_completado?.slice(0,10) ?? ""}</td>
                  <td>{h.rol}</td>
                  <td>{h.titulo}</td>
                  <td>{h.categoria}</td>
                  <td>{h.monto_credito}</td>
                  <td>{h.estado}</td>
                </tr>
              ))}
              {!hist?.length && (
                <tr><td colSpan={6} className="py-6 text-center text-neutral-400">Sin intercambios aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
