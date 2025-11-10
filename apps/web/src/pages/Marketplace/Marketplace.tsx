import { useState } from "react";
import Header from "../../components/Header";
import Card from "../../components/Card";

type Producto = {
  id: number;
  titulo: string;
  creditos: number;
  imagen: string;
  usuario: string;
  fotoUsuario: string;
  favorito: boolean;
};

const mock: Producto[] = [
  { id:1, titulo:"Cafetera casi nueva", creditos:50,
    imagen:"https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1600&auto=format&fit=crop",
    usuario:"Ana", fotoUsuario:"https://i.pravatar.cc/48?img=1", favorito:false },
  { id:2, titulo:"Bicicleta urbana", creditos:120,
    imagen:"https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=1600&auto=format&fit=crop",
    usuario:"Luis", fotoUsuario:"https://i.pravatar.cc/48?img=12", favorito:true },
  // agrega más si quieres
];

export default function Marketplace() {
  const [items, setItems] = useState<Producto[]>(mock);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Marketplace" />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* Filtros simples */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Buscar…"
            className="w-full sm:max-w-xs rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select className="rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
            <option>Todos</option>
            <option>Electrodomésticos</option>
            <option>Transporte</option>
          </select>
          <select className="rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
            <option>Más recientes</option>
            <option>Menor crédito</option>
            <option>Mayor crédito</option>
          </select>
        </div>

        {/* Grid de cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative">
                <img src={p.imagen} alt={p.titulo} className="h-44 w-full object-cover" />
                <button
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, favorito: !x.favorito } : x))
                    )
                  }
                  className="absolute right-3 top-3 rounded-full bg-neutral-900/70 px-2 py-1 text-xs hover:bg-neutral-900"
                  title="Favorito"
                >
                  {p.favorito ? "★" : "☆"}
                </button>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-base font-semibold line-clamp-1">{p.titulo}</h3>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full border border-neutral-800 px-2 py-0.5 text-xs">
                    Créditos: {p.creditos}
                  </span>
                  <div className="flex items-center gap-2">
                    <img src={p.fotoUsuario} alt={p.usuario} className="size-6 rounded-full" />
                    <span className="text-sm text-neutral-300">{p.usuario}</span>
                  </div>
                </div>
                <a
                  href={`/marketplace/${p.id}`}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Ver detalle
                </a>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
