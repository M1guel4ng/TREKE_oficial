import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  asChild?: boolean;
};

export default function Button({ variant = "primary", className, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium " +
    "transition focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed";
  const map = {
    primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
    ghost:
      "border border-neutral-800 text-neutral-200 hover:bg-neutral-900 focus:ring-green-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  } as const;

  return <button className={clsx(base, map[variant], className)} {...props} />;
}
