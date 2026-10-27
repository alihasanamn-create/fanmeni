import { motion } from "framer-motion";
import Card from "./Card";

const colors = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600",
  },

  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600",
  },

  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-600",
  },

  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600",
  },

  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "emerald",
  trend,
}) {
  const current = colors[color] || colors.emerald;

  return (
    <Card>
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <motion.h2
            initial={{ scale: .95 }}
            animate={{ scale: 1 }}
            className="mt-2 text-3xl font-bold text-slate-900 dark:text-white"
          >
            {value}
          </motion.h2>

          {trend && (
            <p className="mt-2 text-sm text-emerald-600">
              {trend}
            </p>
          )}

        </div>

        <div
          className={`rounded-2xl p-4 ${current.bg}`}
        >
          <Icon
            size={30}
            className={current.text}
          />
        </div>

      </div>
    </Card>
  );
}