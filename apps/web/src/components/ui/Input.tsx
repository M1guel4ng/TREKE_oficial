import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export default function Input({ label, hint, className, ...props }: Props) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-neutral-300">{label}</span>}
      <input
        className={clsx(
          "w-full rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm",
          "text-neutral-100 placeholder:text-neutral-500",
          "focus:outline-none focus:ring-2 focus:ring-green-600",
          className
        )}
        {...props}
      />
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
