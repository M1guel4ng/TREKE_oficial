import { useEffect, useState } from "react";
import {
  getPaquetesCreditos,
  getSaldoBilletera,
  comprarPaquete,
  type PaqueteCreditos,
} from "../../api/creditos";
import { useNavigate } from "react-router-dom";

type EstadoCarga = "idle" | "loading" | "success" | "error";

export default function ComprarPaquetes() {
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [paquetes, setPaquetes] = useState<PaqueteCreditos[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [estadoPago, setEstadoPago] = useState<EstadoCarga>("idle");
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [bil, pkts] = await Promise.all([
          getSaldoBilletera(),
          getPaquetesCreditos(),
        ]);
        setSaldo(Number(bil.saldo_disponible));
        setPaquetes(pkts);

        // Seleccionar por defecto "Paquete Popular" si existe, si no el primero
        const popular = pkts.find((p) =>
          p.nombre_paq.toLowerCase().includes("popular")
        );
        setSelectedId(popular?.id ?? pkts[0]?.id ?? null);
      } catch (e: any) {
        setMensaje(e?.message || "No se pudieron cargar los datos");
      }
    })();
  }, []);

  const selected = paquetes.find((p) => p.id === selectedId) || null;

  const handleComprar = async () => {
    if (!selected) {
      setMensaje("Selecciona un paquete para continuar");
      return;
    }
    setEstadoPago("loading");
    setMensaje(null);
    try {
      const resp = await comprarPaquete(selected.id);
      // resp trae saldo_posterior, creditos_agregados, etc. según armamos el servicio
      if (resp?.saldo_posterior != null) {
        setSaldo(Number(resp.saldo_posterior));
      }
      setEstadoPago("success");
      setMensaje(
        `Compra realizada. Se acreditaron ${resp.creditos_agregados} créditos.`
      );
    } catch (e: any) {
      setEstadoPago("error");
      setMensaje(e?.message || "No se pudo completar la compra");
    }
  };

  const formatCreditos = (n: number) =>
    n.toLocaleString("es-BO", { maximumFractionDigits: 0 });

  const formatPrecio = (p: string | number) =>
    Number(p).toLocaleString("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 2,
    });

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Header estilo mockup */}
        <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
          <button
            className="text-zinc-900 dark:text-white flex size-12 shrink-0 items-center justify-center"
            onClick={() => navigate(-1)}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Adquiere Créditos Verdes
          </h2>
          <div className="flex size-12 shrink-0" />
        </header>

        <main className="flex-1 px-4 py-6">
          {/* Mensajes */}
          {mensaje && (
            <div className="mb-4 rounded-xl border border-emerald-600/60 bg-emerald-900/40 px-3 py-2 text-xs text-emerald-50">
              {mensaje}
            </div>
          )}

          {/* Saldo actual */}
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-base font-normal leading-normal">
              Tu saldo de créditos
            </p>
            <h1 className="text-zinc-900 dark:text-white tracking-light text-5xl font-bold leading-tight mt-1">
              {saldo !== null ? formatCreditos(saldo) : "—"}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base font-normal leading-normal mt-4">
              Elige un paquete y potencia el intercambio sostenible en tu
              comunidad.
            </p>
          </div>

          {/* Paquetes */}
          <div className="mt-8 space-y-4">
            {paquetes.map((p) => {
              const isPopular = p.nombre_paq.toLowerCase().includes("popular");
              const isSelected = p.id === selectedId;

              // Diferenciar algunos estilos según el nombre para acercarnos al mockup
              const extraBadge =
                p.nombre_paq.toLowerCase().includes("premium") ||
                p.nombre_paq.toLowerCase().includes("emprendedor") ||
                p.nombre_paq.toLowerCase().includes("empres");
              const credits = Number(
                (p as any).cant_credits ?? p.cant_creditos
              );

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={[
                    "relative flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-300",
                    isSelected ? "ring-2 ring-primary" : "ring-2 ring-transparent",
                  ].join(" ")}
                >
                  {isPopular && (
                    <div className="absolute -top-3 right-4 bg-accent text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Más Popular
                    </div>
                  )}

                  <div className="flex items-stretch justify-between">
                    <div className="flex flex-col gap-1 flex-[2_2_0px]">
                      <p className="text-primary text-sm font-medium leading-normal">
                        {p.nombre_paq}
                      </p>
                      <p className="text-zinc-900 dark:text-white text-lg font-bold leading-tight">
                        {formatCreditos(credits)} Créditos
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400 text-base font-normal leading-normal">
                        {formatPrecio(p.precio)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center flex-1">
                      <span className="material-symbols-outlined text-primary text-5xl md:text-6xl">
                        {isPopular
                          ? "local_florist"
                          : extraBadge
                          ? "park"
                          : "eco"}
                      </span>
                    </div>
                  </div>

                  {/* Mensajes extra estilo mockup */}
                  {isPopular && (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 p-2 rounded-md">
                      <span className="material-symbols-outlined text-primary text-lg">
                        history
                      </span>
                      <p className="text-primary text-xs font-medium">
                        Ideal para usuarios activos que ya están cambiando el
                        planeta.
                      </p>
                    </div>
                  )}

                  {extraBadge && (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md">
                      <span className="material-symbols-outlined text-accent text-lg">
                        star
                      </span>
                      <p className="text-accent text-xs font-medium">
                        Perfecto para impulsar proyectos más grandes y sumar
                        más impacto.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tu impacto positivo (por ahora estático / demo) */}
          <div className="mt-10">
            <h3 className="text-zinc-900 dark:text-white text-xl font-bold text-center">
              Tu Impacto Positivo
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mt-1">
              Cada crédito apoya proyectos locales de reforestación y limpieza.
            </p>
            <div className="flex justify-around mt-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-4xl">
                  forest
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">
                  10 árboles plantados
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-4xl">
                  recycling
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">
                  5kg de plástico reciclado
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-primary text-4xl">
                  water_drop
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">
                  100L de agua limpia
                </p>
              </div>
            </div>
          </div>

          {/* Método de pago (demo) */}
          <div className="mt-10">
            <h3 className="text-zinc-900 dark:text-white text-xl font-bold">
              Método de Pago
            </h3>
            <div className="mt-4 space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-4">
                  <img
                    alt="Tarjeta demo"
                    className="h-6 w-auto dark:invert"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWF-_gy9hemaEqRdbpmTw3pnOVwdLdjD-0vrOvbf2Rb6kh10K58PXPXOE1TLQmRwHRZq9J5LrOlmeOQVcQcNf3394T_YFh42wCB0NNZeeWLObi_AIdx1LvJYEfGHXf-HUPDGyQLGzttH6hJbGRJ0DdBr43zsQe7WGxTsi3AVqfJ6mltVXlcXdHpemNoWIjnazgxZSDUq04Er-Ja0CZJk0yJkqMqcTtx4EV9ACH54V4Q3v_CpxR3wm4F8gKXqQACko1Z2TB2wysBz5A"
                  />
                  <p className="text-zinc-900 dark:text-white font-medium">
                    **** **** **** 1234 (demo)
                  </p>
                </div>
                <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-400">
                  chevron_right
                </span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-primary text-primary">
                <span className="material-symbols-outlined">add</span>
                <span className="font-medium">Añadir nuevo método</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer con botón de pago */}
        <footer className="sticky bottom-0 bg-white dark:bg-zinc-800 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              {selected ? selected.nombre_paq : "Selecciona un paquete"}
            </p>
            <p className="text-zinc-900 dark:text-white font-bold text-lg">
              {selected ? formatPrecio(selected.precio) : "—"}
            </p>
          </div>
          <button
            disabled={!selected || estadoPago === "loading"}
            onClick={handleComprar}
            className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/30 hover:bg-green-600 transition-all duration-300 transform hover:scale-105 active:scale-100 disabled:opacity-60 disabled:hover:scale-100"
          >
            {estadoPago === "loading"
              ? "Procesando..."
              : "Pagar de forma Segura (Demo)"}
          </button>
          <div className="text-center mt-4">
            <a
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline"
              href="#"
            >
              Términos y Condiciones
            </a>{" "}
            •{" "}
            <a
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline"
              href="#"
            >
              Política de Privacidad
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
