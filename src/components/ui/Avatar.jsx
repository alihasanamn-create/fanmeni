import { User } from "lucide-react";
import { cn } from "../../lib/utils";

const sizes = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-xl",
};

export default function Avatar({
  src,
  name = "",
  size = "md",
  className,
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-emerald-100 font-semibold text-emerald-700",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        initials
      ) : (
        <User size={20} />
      )}
    </div>
  );
}