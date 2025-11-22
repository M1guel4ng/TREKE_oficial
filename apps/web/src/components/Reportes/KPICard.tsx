// src/components/Reportes/KPICard.tsx
interface KPIProps {
  value: string | number;
  label: string;
  helperText?: string;
}

export default function KPICard({ value, label, helperText }: KPIProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div className="mt-1 text-xl font-semibold text-neutral-50">
        {value}
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-neutral-400">{helperText}</p>
      )}
    </div>
  );
}
