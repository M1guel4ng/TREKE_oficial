import { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  detail,
  toggleFav,
  type MarketDetail,
  getCurrentUserId,
} from "../../api/market";
import { iniciarPropuesta } from "../../api/intercambios";

const uid = getCurrentUserId();

export default function MarketDetailPage() {
  const id = Number(window.location.pathname.split("/").pop());
  const [data, setData] = useState<MarketDetail | null>(null);
  const [msg, setMsg] = useState("");

  // Estado para el modal de propuesta
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [offerMessage, setOfferMessage] = useState<string>("");

  async function load() {
    setMsg("");
    try {
      const d = await detail(id);
      setData(d);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cargar");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggleFav() {
    if (!data) return;
    try {
      await toggleFav(data.id, !data.is_fav);
      setData({ ...data, is_fav: !data.is_fav });
    } catch (e: any) {
      alert(e?.message || "No se pudo actualizar favorito");
    }
  }

  function abrirModalPropuesta() {
    if (!data) return;
    if (!uid) {
      setMsg("Debes iniciar sesión para iniciar un intercambio.");
      return;
    }
    if (uid === data.usuario_id) {
      setMsg("No puedes iniciar un intercambio con tu propia publicación.");
      return;
    }

    const base = data.valor_creditos || 0;
    setOfferAmount(base ? String(base) : "");
    setOfferMessage("");
    setShowProposalModal(true);
  }

  function cerrarModalPropuesta() {
    setShowProposalModal(false);
    setOfferAmount("");
    setOfferMessage("");
  }

  async function enviarPropuesta() {
    if (!data) return;

    const monto = Number(offerAmount);
    if (!Number.isFinite(monto) || monto <= 0) {
      setMsg("Monto inválido.");
      return;
    }

    try {
      await iniciarPropuesta(data.id, offerMessage || undefined, monto);
      setMsg("Propuesta enviada correctamente.");
      cerrarModalPropuesta();
      await load(); // recarga para actualizar total_propuestas
    } catch (e: any) {
      setMsg(e?.message || "No se pudo enviar la propuesta");
    }
  }

  if (!data) {
    return (
      <div className="min-h-dvh bg-neutral-950 text-neutral-100">
        <Header title="Detalle" />
        <main className="mx-auto max-w-5xl p-4">{msg || "Cargando…"}</main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title={data.titulo} />
      <main className="mx-auto max-w-5xl p-4 grid lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {data.fotos.length ? (
            data.fotos.map((f) => (
              <img
                key={f.id}
                src={f.foto_url}
                alt=""
                className="w-full rounded-xl border border-neutral-800"
              />
            ))
          ) : (
            <div className="aspect-square rounded-xl border border-neutral-800 flex items-center justify-center opacity-60">
              Sin fotos
            </div>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-emerald-400 text-xl font-bold">
            {data.valor_creditos} créditos
          </p>
          <p className="text-neutral-300">{data.descripcion}</p>
          <p className="text-sm text-neutral-400">
            {data.categoria} • {data.estado_nombre}
          </p>
          <p className="text-sm text-neutral-400">
            Ubicación: {data.ubicacion_texto}
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-neutral-700 px-3 py-2"
              onClick={onToggleFav}
            >
              {data.is_fav ? "Quitar de favoritos" : "Agregar a favoritos"}
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
              onClick={abrirModalPropuesta}
            >
              Iniciar intercambio
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-neutral-800 p-3">
            <p className="font-semibold">Vendedor</p>
            <p>{data.vendedor_nombre || data.vendedor_email}</p>
            {data.vendedor_rating != null && (
              <p className="text-sm text-neutral-400">
                ⭐ {Number(data.vendedor_rating).toFixed(2)}
              </p>
            )}
          </div>
          <p className="text-sm text-neutral-500">
            Propuestas recibidas: {data.total_propuestas}
          </p>
          {msg && (
            <p className="text-xs text-amber-400 pt-1 border-t border-neutral-800 mt-2">
              {msg}
            </p>
          )}
        </div>
      </main>

      {/* Modal para nueva propuesta */}
      {showProposalModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-4 space-y-3">
            <h3 className="text-lg font-semibold">
              Crear propuesta · {data.titulo}
            </h3>
            <p className="text-xs text-neutral-400">
              Valor de publicación: {data.valor_creditos} créditos
            </p>

            <div className="space-y-2">
              <label className="block text-sm">
                Créditos a ofertar
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                />
              </label>

              <label className="block text-sm">
                Mensaje (opcional)
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={cerrarModalPropuesta}
                className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={enviarPropuesta}
                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400"
              >
                Enviar propuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
