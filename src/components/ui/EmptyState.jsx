import { Inbox } from "lucide-react";
import { Button } from "./";

export default function EmptyState({
  icon = <Inbox size={48} />,
  title = "Nothing here",
  description = "No records available.",
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">

      <div className="text-gray-400">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-gray-500">
        {description}
      </p>

      {actionText && (
        <Button
          className="mt-6"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}

    </div>
  );
}