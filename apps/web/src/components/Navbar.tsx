import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center gap-6">
        <Link to="/" className="font-semibold text-green-400 hover:text-green-300">
          TREKE
        </Link>

        <Link to="/publicaciones" className="text-sm text-neutral-300 hover:text-white">
          Publicaciones
        </Link>
        <Link to="/admin/usuarios" className="text-sm text-neutral-300 hover:text-white">
          Admin Usuarios
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/auth"
            className="inline-flex items-center rounded-xl border border-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            Entrar
          </Link>
          <Link
            to="/perfil"
            className="inline-flex items-center rounded-xl bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            Mi Perfil
          </Link>
        </div>
      </div>
    </nav>
  );
}
