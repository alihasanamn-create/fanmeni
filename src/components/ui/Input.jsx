import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex items-center rounded-2xl border bg-white transition-all duration-200",
            "dark:border-slate-700 dark:bg-slate-900",
            error
              ? "border-red-500"
              : "border-slate-300 focus-within:border-emerald-500 dark:focus-within:border-emerald-400"
          )}
        >
          {leftIcon && (
            <div className="pl-4 text-slate-500 dark:text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              "w-full bg-transparent px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="pr-4 text-slate-500 dark:text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;