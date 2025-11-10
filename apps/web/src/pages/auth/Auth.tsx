import Header from "../../components/Header";
import Login from "./Login";
import Register from "./Register";

export default function Auth() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Acceso" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <Register />
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <Login />
          </div>
        </div>
      </main>
    </div>
  );
}
