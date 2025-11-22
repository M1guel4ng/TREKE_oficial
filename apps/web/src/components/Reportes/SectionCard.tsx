// src/components/Reportes/SectionCard.tsx
import type { ReactNode } from "react";

export default function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && (
        <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
      )}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        {children}
      </div>
    </section>
  );
}
