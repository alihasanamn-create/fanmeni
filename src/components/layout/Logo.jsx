import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Logo({
  collapsed = false,
  className = "",
}) {
  return (
    <Link
      to="/"
      aria-label="Go to Dashboard"
      className={`block ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{
          duration: 0.2,
        }}
        className={`flex items-center ${
          collapsed ? "justify-center" : "gap-3"
        }`}
      >
        <img
          src="/logo/logo.png"
          alt="FANMENI"
          className={`transition-all duration-300 ${
            collapsed
              ? "h-10 w-10"
              : "h-12 w-12"
          }`}
        />

        {!collapsed && (
          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              FANMENI
            </h1>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Festival Results Portal
            </p>
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}