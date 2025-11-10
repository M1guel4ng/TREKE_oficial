import { useState } from "react";
import LoginForm from "../features/usuarios/components.usuarios/LoginForm";
import RegisterForm from "../features/usuarios/components.usuarios/RegisterForm";


export default function Home() {
  const [user, setUser] = useState<any>(null);
  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <h1 className="text-xl font-semibold">TREKE – Demo HU 7.1 (sin auth)</h1>

      {!user ? (
        <div className="grid md:grid-cols-2 gap-6">
          <RegisterForm />
          <LoginForm onLogged={setUser} />
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-neutral-300">
            Sesión DEV: <span className="text-white">{user.email}</span> (id: {user.id})
          </p>
          <a
            href={`/perfil/${user.id}`}
            className="mt-3 inline-flex items-center rounded-xl bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Ir a mi perfil
          </a>
        </div>
      )}
    </div>
  );
}
