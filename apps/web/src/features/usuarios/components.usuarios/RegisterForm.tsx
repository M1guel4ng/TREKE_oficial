import { useState } from "react";
import { UsuariosAPI } from "../api";
import type { RegisterInput } from "../../../types/usuario";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterInput>({
    email: "",
    password: "",
    full_name: "",
    acepta_terminos: false,
  });
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const r = await UsuariosAPI.register(form);
      console.log(r);
      setMsg("Registrado. Se acreditaron +5 créditos.");
    } catch (err: any) {
      setMsg(err.message ?? "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <h2 className="text-lg font-semibold">Registro rápido</h2>
      <Input label="Email" placeholder="tu@email.com" type="email" value={form.email}
             onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input label="Nombre completo" placeholder="Alex Guzmán" value={form.full_name}
             onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      <Input label="Contraseña" placeholder="••••••••" type="password" value={form.password}
             onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <label className="mt-1.5 flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={form.acepta_terminos}
          onChange={(e) => setForm({ ...form, acepta_terminos: e.target.checked })}
          className="size-4 accent-green-600"
        />
        Acepto términos y condiciones
      </label>
      <Button disabled={loading} className="w-full">
        {loading ? "Registrando…" : "Registrarme"}
      </Button>
      {msg && <p className="text-sm text-green-400">{msg}</p>}
    </form>
  );
}
