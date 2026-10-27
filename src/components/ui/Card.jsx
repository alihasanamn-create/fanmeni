import { cn } from "../../lib/utils";

export default function Card({
  children,
  title,
  description,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        `
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300

        dark:bg-slate-900
        dark:border-slate-700
        `,
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-5">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}