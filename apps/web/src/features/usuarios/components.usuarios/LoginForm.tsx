import { useState } from "react";
import { UsuariosAPI } from "../api";
import type { LoginInput } from "../../../types/usuario";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function LoginForm({ onLogged }: { onLogged: (user: any) => void }) {
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const r = await UsuariosAPI.login(form);
      onLogged(r.user);
    } catch (err: any) {
      setMsg(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <h2 className="text-lg font-semibold">Login (dev)</h2>
      <Input label="Email" placeholder="demo@treke.dev" type="email"
             value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input label="Contraseña" placeholder="••••••••" type="password"
             value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <Button variant="ghost" disabled={loading} className="w-full">
        {loading ? "Entrando…" : "Entrar"}
      </Button>
      {msg && <p className="text-sm text-red-400">{msg}</p>}
    </form>
  );
}
