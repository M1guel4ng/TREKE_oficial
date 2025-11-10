import clsx from "clsx";

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "rounded-2xl border border-neutral-800 bg-neutral-950",
      "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_rgba(0,0,0,0.25)]",
      className
    )}>
      {children}
    </div>
  );
}
