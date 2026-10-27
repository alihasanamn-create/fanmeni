import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function SidebarItem({
  item,
  collapsed,
}) {
  const Icon = item.icon;

  return (
    <NavLink to={item.path}>
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative flex h-12 items-center rounded-xl px-4 transition-all duration-200
            ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          {isActive && (
            <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-emerald-500" />
          )}

          <Icon className="h-5 w-5 shrink-0" />

          {!collapsed && (
            <span className="ml-3 text-sm font-medium">
              {item.title}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  );
}