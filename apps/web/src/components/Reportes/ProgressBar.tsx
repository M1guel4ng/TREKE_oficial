// src/components/Reportes/ProgressBar.tsx
export default function ProgressBar({ percentage }: { percentage: number }) {
  const safe = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-neutral-800">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${safe}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-400">
        {safe.toFixed(0)}% de progreso hacia el objetivo
      </p>
    </div>
  );
}
