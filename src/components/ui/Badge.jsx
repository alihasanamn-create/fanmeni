import { cn } from "../../lib/utils";

const variants = {
  default:
    "bg-gray-100 text-gray-700",

  success:
    "bg-green-100 text-green-700",

  warning:
    "bg-yellow-100 text-yellow-700",

  danger:
    "bg-red-100 text-red-700",

  primary:
    "bg-emerald-100 text-emerald-700",

  info:
    "bg-blue-100 text-blue-700",
};

export default function Badge({
  children,
  variant = "default",
  className,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}