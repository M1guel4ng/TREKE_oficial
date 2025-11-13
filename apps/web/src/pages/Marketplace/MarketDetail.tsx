import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { detail, toggleFav, type MarketDetail } from "../../api/market";

export default function MarketDetailPage() {
  const id = Number(window.location.pathname.split("/").pop());
  const [data, setData] = useState<MarketDetail | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try { setData(await detail(id)); } catch (e:any) { setMsg(e?.message || "No se pudo cargar"); }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, []);

  async function onToggleFav() {
    if (!data) return;
    try {
      await toggleFav(data.id, !data.is_fav);
      setData({ ...data, is_fav: !data.is_fav });
    } catch (e:any) { alert(e?.message || "No se pudo actualizar favorito"); }
  }

  if (!data) return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Detalle" />
      <main className="mx-auto max-w-5xl p-4">{msg || "Cargando…"}</main>
    </div>
  );

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title={data.titulo} />
      <main className="mx-auto max-w-5xl p-4 grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {data.fotos.length ? data.fotos.map(f => (
            <img key={f.id} src={f.foto_url} alt="" className="w-full rounded-xl border border-neutral-800" />
          )) : <div className="aspect-square rounded-xl border border-neutral-800 flex items-center justify-center opacity-60">Sin fotos</div>}
        </div>
        <div className="space-y-3">
          <p className="text-emerald-400 text-xl font-bold">{data.valor_creditos} créditos</p>
          <p className="text-neutral-300">{data.descripcion}</p>
          <p className="text-sm text-neutral-400">{data.categoria} • {data.estado_nombre}</p>
          <p className="text-sm text-neutral-400">Ubicación: {data.ubicacion_texto}</p>
          <div className="flex gap-2">
            <button className="rounded-xl border border-neutral-700 px-3 py-2" onClick={onToggleFav}>
              {data.is_fav ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-neutral-800 p-3">
            <p className="font-semibold">Vendedor</p>
            <p>{data.vendedor_nombre || data.vendedor_email}</p>
            {data.vendedor_rating != null && <p className="text-sm text-neutral-400">⭐ {Number(data.vendedor_rating).toFixed(2)}</p>}
          </div>
          <p className="text-sm text-neutral-500">Propuestas recibidas: {data.total_propuestas}</p>
        </div>
      </main>
    </div>
  );
}
