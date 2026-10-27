import { cn } from "../../lib/utils";

export default function Loading({
  text = "Loading...",
  fullScreen = false,
  className,
}) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-10",
        className
      )}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

      <p className="text-sm text-gray-500">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  return content;
}