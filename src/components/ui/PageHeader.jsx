import { motion } from "framer-motion";

export default function PageHeader({
  title,
  description,
  actions,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="mb-8 flex flex-wrap items-center justify-between gap-4"
    >
      <div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}

    </motion.div>
  );
}