import clsx from "clsx";

export default function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border bg-white shadow-sm",
        "border-zinc-200 dark:border-zinc-800",
        "dark:bg-zinc-900/60",
        className
      )}
      {...props}
    />
  );
}