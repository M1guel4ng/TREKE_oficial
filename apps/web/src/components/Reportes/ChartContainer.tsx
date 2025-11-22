// src/components/Reportes/ChartContainer.tsx
import type { ReactNode } from "react";

export default function ChartContainer({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      {title && (
        <h3 className="text-xs font-semibold text-neutral-300 mb-2">
          {title}
        </h3>
      )}
      <div className="h-64 w-full">
        {children}
      </div>
    </div>
  );
}
