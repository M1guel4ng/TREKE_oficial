import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Card from "../../components/Card";

export default function Landing() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Bienvenido a TREKE" />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              Trueque moderno con <span className="text-green-400">créditos verdes</span>
            </h2>
            <p className="text-neutral-300 md:text-lg">
              Publica, intercambia y gana recompensas cuidando el planeta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/marketplace" className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Explorar Marketplace
              </Link>
              <Link to="/auth" className="inline-flex items-center rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900">
                Crear cuenta
              </Link>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <img
              className="w-full h-64 md:h-[360px] object-cover"
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
              alt="Hero"
            />
          </Card>
        </section>

        {/* KPIs / beneficios */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Publicaciones activas", v: "1.2k" },
            { t: "Usuarios verificados", v: "8.4k" },
            { t: "Créditos otorgados", v: "56k" },
            { t: "CO₂ evitado", v: "19.2t" },
          ].map((k) => (
            <Card key={k.t} className="p-5">
              <p className="text-sm text-neutral-400">{k.t}</p>
              <p className="mt-1 text-2xl font-semibold">{k.v}</p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
