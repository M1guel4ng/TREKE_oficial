import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { getCurrentUserId } from "../../api/market";
import {
  fetchMisIntercambios,
  confirmarIntercambio,
  cancelarIntercambio,
  aceptarPropuesta,
  rechazarPropuesta,
  contraofertarPropuesta,
  type MisIntercambiosResponse,
  type PropuestaResumen,
} from "../../api/intercambios";
import { Link } from "react-router-dom";

export default function IntercambiosPage() {
  const uid = getCurrentUserId();
  const [data, setData] = useState<MisIntercambiosResponse | null>(null);
  const [msg, setMsg] = useState<string>("");

  // Estado para el modal de contraoferta
  const [showContraModal, setShowContraModal] = useState(false);
  const [currentProp, setCurrentProp] = useState<PropuestaResumen | null>(null);
  const [contraMonto, setContraMonto] = useState<string>("");
  const [contraMensaje, setContraMensaje] = useState<string>("");

  async function load() {
    if (!uid) return;
    setMsg("");
    try {
      const resp = await fetchMisIntercambios(uid);
      setData(resp);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cargar tus intercambios");
    }
  }

  useEffect(() => {
    if (uid) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      load();
    }
  }, [uid]);

  async function onConfirmar(id: number) {
    try {
      await confirmarIntercambio(id);
      setMsg("Intercambio confirmado");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "No se pudo confirmar");
    }
  }

  async function onCancelar(id: number) {
    const motivo = window.prompt("Motivo de cancelación / disputa (opcional):") || "";
    try {
      await cancelarIntercambio(id, motivo || undefined);
      setMsg("Intercambio cancelado");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cancelar");
    }
  }

  async function onAceptarPropuesta(id: number) {
    try {
      await aceptarPropuesta(id);
      setMsg("Propuesta aceptada, créditos en retención.");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "No se pudo aceptar la propuesta");
    }
  }

  async function onRechazarPropuesta(id: number) {
    const motivo = window.prompt("Motivo de rechazo (opcional):") || "";
    try {
      await rechazarPropuesta(id, motivo || undefined);
      setMsg("Propuesta rechazada");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "No se pudo rechazar la propuesta");
    }
  }

  function abrirModalContraoferta(p: PropuestaResumen) {
    const base = p.monto_ofertado || p.valor_publicacion;
    setCurrentProp(p);
    setContraMonto(base ? String(base) : "");
    setContraMensaje("");
    setShowContraModal(true);
  }

  function cerrarModalContraoferta() {
    setShowContraModal(false);
    setCurrentProp(null);
    setContraMonto("");
    setContraMensaje("");
  }

  async function enviarContraoferta() {
    if (!currentProp) return;
    const monto = Number(contraMonto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setMsg("Monto inválido");
      return;
    }

    try {
      await contraofertarPropuesta(
        currentProp.id,
        monto,
        contraMensaje || undefined
      );
      setMsg("Contraoferta enviada");
      cerrarModalContraoferta();
      await load();
    } catch (e: any) {
      setMsg(e?.message || "No se pudo enviar la contraoferta");
    }
  }

  // Botón especial: aceptar automáticamente al valor de la publicación
  async function aceptarValorPublicacion() {
    if (!currentProp) return;
    const monto = currentProp.valor_publicacion;
    if (!monto || monto <= 0) {
      setMsg("Valor de publicación inválido");
      return;
    }

    try {
      await contraofertarPropuesta(
        currentProp.id,
        monto,
        "Acepto el valor de la publicación"
      );
      setMsg("Propuesta actualizada al valor de la publicación");
      cerrarModalContraoferta();
      await load();
    } catch (e: any) {
      setMsg(e?.message || "No se pudo actualizar la propuesta al valor de la publicación");
    }
  }

  if (!uid) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Header />
        <main className="mx-auto max-w-4xl p-4">
          <p>Debes iniciar sesión para ver tus intercambios.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Header />
      <main className="mx-auto max-w-5xl p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis intercambios</h1>
            <p className="text-sm text-neutral-400">
              Propuestas, intercambios activos e historial de movimientos de crédito.
            </p>
          </div>
          <Link to="/perfil" className="text-sm text-emerald-400 hover:underline">
            ← Volver al perfil
          </Link>
        </div>

        {msg && <p className="text-sm text-amber-400">{msg}</p>}

        {/* Propuestas */}
        <section className="rounded-xl border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold mb-3">Propuestas</h2>
          {!data?.propuestas?.length && (
            <p className="text-sm text-neutral-500">
              Aún no tienes propuestas enviadas ni recibidas.
            </p>
          )}
          <ul className="space-y-2">
            {data?.propuestas.map((p) => {
              const puedeResponder =
                p.estado === "pendiente" && p.puede_responder;

              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3 text-sm"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">
                        {p.tipo === "enviada" ? "Enviada" : "Recibida"} · {p.titulo}
                      </p>
                      <p className="text-neutral-400">
                        {p.monto_ofertado} créditos ofertados
                        {p.valor_publicacion !== p.monto_ofertado && (
                          <>
                            {" · "}Valor original: {p.valor_publicacion} créditos
                          </>
                        )}
                        {" · "}Estado: {p.estado}
                      </p>
                    </div>
                    <Link
                      to={`/market/${p.publicacion_id}`}
                      className="text-emerald-400 hover:underline text-xs md:text-sm"
                    >
                      Ver publicación
                    </Link>
                  </div>

                  {puedeResponder && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onAceptarPropuesta(p.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold hover:bg-emerald-500"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => onRechazarPropuesta(p.id)}
                        className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-300 hover:bg-red-900/40"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => abrirModalContraoferta(p)}
                        className="rounded-lg border border-amber-400 px-3 py-1 text-xs text-amber-300 hover:bg-amber-900/40"
                      >
                        Contraofertar créditos
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Intercambios */}
        <section className="rounded-xl border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold mb-3">Intercambios</h2>
          {!data?.intercambios?.length && (
            <p className="text-sm text-neutral-500">
              Aún no tienes intercambios registrados.
            </p>
          )}
          <ul className="space-y-2">
            {data?.intercambios.map((i) => {
              const soyComprador = i.comprador_id === uid;
              const puedoConfirmar = soyComprador
                ? !i.confirm_comprador
                : !i.confirm_vendedor;
              const esActivo = i.estado === "activo";

              return (
                <li
                  key={i.id}
                  className="rounded-lg border border-neutral-800 p-3 text-sm space-y-1"
                >
                  <p className="font-semibold">
                    {i.titulo} · {i.monto_credito} créditos
                  </p>
                  <p className="text-neutral-400">
                    Rol: {soyComprador ? "Comprador" : "Vendedor"} · Estado:{" "}
                    {i.estado}
                  </p>
                  <p className="text-neutral-500 text-xs">
                    Confirmación comprador:{" "}
                    {i.confirm_comprador ? "✔" : "Pendiente"} · vendedor:{" "}
                    {i.confirm_vendedor ? "✔" : "Pendiente"}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <Link
                      to={`/market/${i.publicacion_id}`}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Ver publicación
                    </Link>
                    {esActivo && puedoConfirmar && (
                      <button
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold hover:bg-emerald-500"
                        onClick={() => onConfirmar(i.id)}
                      >
                        Confirmar intercambio
                      </button>
                    )}
                    {esActivo && (
                      <button
                        className="rounded-lg border border-red-500 px-2 py-1 text-xs text-red-300 hover:bg-red-900/40"
                        onClick={() => onCancelar(i.id)}
                      >
                        Cancelar / Disputa
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {/* Modal de contraoferta */}
      {showContraModal && currentProp && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-4 space-y-3">
            <h3 className="text-lg font-semibold">
              Contraoferta · {currentProp.titulo}
            </h3>
            <p className="text-xs text-neutral-400">
              Valor original: {currentProp.valor_publicacion} créditos · Última
              oferta: {currentProp.monto_ofertado} créditos
            </p>

            <div className="space-y-2">
              <label className="block text-sm">
                Créditos a ofertar
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={contraMonto}
                  onChange={(e) => setContraMonto(e.target.value)}
                />
              </label>

              <label className="block text-sm">
                Mensaje (opcional)
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  value={contraMensaje}
                  onChange={(e) => setContraMensaje(e.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={aceptarValorPublicacion}
                className="rounded-lg border border-emerald-400 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-900/40"
              >
                Aceptar valor de publicación
              </button>
              <button
                onClick={cerrarModalContraoferta}
                className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={enviarContraoferta}
                className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-black hover:bg-amber-400"
              >
                Enviar contraoferta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
