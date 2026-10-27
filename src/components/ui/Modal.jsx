import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Modal({
  open,
  title,
  children,
  onClose,
  width = "max-w-2xl",
}) {
  return (
    <AnimatePresence>

      {open && (

        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: .95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: .95,
              y: 20,
            }}
            className={`w-full ${width} rounded-3xl bg-white shadow-2xl`}
          >

            <div className="flex items-center justify-between border-b p-6">

              <h2 className="text-xl font-semibold">
                {title}
              </h2>

              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20}/>
              </button>

            </div>

            <div className="p-6">

              {children}

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}