import { useState } from "react";

export type RegisterValues = {
  email: string;
  full_name: string;
  password: string;
  acepta_terminos: boolean;
};

export default function Register({
  onSubmit,
}: {
  // Si conectas backend, pásame esta función. Debe lanzar error en fallo.
  onSubmit?: (values: RegisterValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<RegisterValues>({
    email: "",
    full_name: "",
    password: "",
    acepta_terminos: false,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const canSend =
    values.email.includes("@") &&
    values.full_name.trim().length >= 3 &&
    values.password.length >= 6 &&
    values.acepta_terminos;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend || loading) return;
    setLoading(true);
    setMsg(null);
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        // Modo demo sin backend:
        await new Promise((r) => setTimeout(r, 700));
      }
      setMsg({ type: "ok", text: "Registro completado. ¡Bienvenido!" });
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.message || "No se pudo completar el registro",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.25)]"
    >
      <h2 className="text-lg md:text-xl font-semibold mb-4">Registro rápido</h2>

      <div className="space-y-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-neutral-300">Email</span>
          <input
            type="email"
            placeholder="tu@email.com"
            value={values.email}
            onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
            className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-neutral-300">Nombre completo</span>
          <input
            placeholder="Alex Guzmán"
            value={values.full_name}
            onChange={(e) =>
              setValues((s) => ({ ...s, full_name: e.target.value }))
            }
            className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-neutral-300">Contraseña</span>
          <input
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) =>
              setValues((s) => ({ ...s, password: e.target.value }))
            }
            className="w-full rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <span className="text-xs text-neutral-500">
            Mínimo 6 caracteres.
          </span>
        </label>

        <label className="mt-1.5 flex items-center gap-2 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={values.acepta_terminos}
            onChange={(e) =>
              setValues((s) => ({ ...s, acepta_terminos: e.target.checked }))
            }
            className="size-4 accent-green-600"
          />
          Acepto términos y condiciones
        </label>

        <button
          disabled={!canSend || loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Registrando…" : "Registrarme"}
        </button>

        {msg && (
          <p
            className={
              "text-sm " +
              (msg.type === "ok" ? "text-green-400" : "text-red-400")
            }
          >
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
