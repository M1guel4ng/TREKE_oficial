import { Link } from "react-router-dom";



export default function Header({ title, onBack }: { title?: string; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/70 bg-neutral-950/70 backdrop-blur">
      <div className="mx-auto max-w-7xl h-14 px-4 flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="text-xl leading-none hover:text-green-400">←</button>
        ) : (
          <Link to="/" className="font-semibold text-green-400 hover:text-green-300">TREKE</Link>
        )}
        <h1 className="text-base md:text-lg font-semibold text-neutral-100 truncate">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/marketplace" className="hidden sm:inline text-sm text-neutral-300 hover:text-white">Marketplace</Link>
          <Link to="/perfil" className="inline-flex items-center rounded-xl bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
            Mi Perfil
          </Link>
          <Link
            to="/creditos/paquetes"
            className="inline-flex items-center rounded-full border border-emerald-500/70 bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 hover:border-emerald-400 transition-colors"
          >
          Comprar créditos
          </Link>
        </div>
      </div>
    </header>
  );
}
