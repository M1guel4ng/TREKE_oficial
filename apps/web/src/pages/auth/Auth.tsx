import Header from "../../components/Header";
import Login, { type LoginValues } from "./Login";
import Register, {type RegisterValues } from "./Register";
import * as AuthApi from "../../api/auth";
import { useState } from "react";

export default function Auth() {
  const [status, setStatus] = useState<'idle'|'ok'|'err'>('idle');
  const [msg, setMsg] = useState<string>("");

  async function handleRegister(values: RegisterValues) {
    setStatus('idle'); setMsg('');
    const r = await AuthApi.register(values);
    // Puedes guardar algo, redirigir, etc.
    setStatus('ok');
    setMsg("¡Registro completado!");
    console.log("register resp:", r);
  }

  async function handleLogin(values: LoginValues) {
    setStatus('idle'); setMsg('');
    const r = await AuthApi.login(values);
    // Si el backend devuelve token:
    if ((r as any).token) {
      localStorage.setItem('treke_token', (r as any).token);
    }
    setStatus('ok');
    setMsg("¡Login correcto!");
    console.log("login resp:", r);
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Acceso" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Mensaje global */}
        {status !== 'idle' && (
          <div className={`mb-4 rounded-lg border p-3 ${status === 'ok' ? 'border-green-600' : 'border-red-600'}`}>
            {msg}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <Register onSubmit={handleRegister} />
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <Login onSubmit={handleLogin} />
          </div>
        </div>
      </main>
    </div>
  );
}
