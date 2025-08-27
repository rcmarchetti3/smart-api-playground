import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};

export default function Button({ variant="primary", size="md", className, ...props }: Props) {
  return (
    <button
      className={clsx(
        "rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm",
        variant === "primary" && "bg-emerald-500 text-white hover:bg-emerald-600",
        variant === "ghost"   && "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        className
      )}
      {...props}
    />
  );
}