import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Home,
  Trophy,
  CalendarDays,
  Image,
  Info,
} from "lucide-react";

const navItems = [
  {
    name: "Home",
    href: "#home",
    icon: Home,
  },
  {
    name: "Live Results",
    href: "#results",
    icon: Trophy,
  },
  {
    name: "Programs",
    href: "#programs",
    icon: CalendarDays,
  },
  {
    name: "Schedule",
    href: "#schedule",
    icon: CalendarDays,
  },
  {
    name: "Gallery",
    href: "#gallery",
    icon: Image,
  },
  {
    name: "About",
    href: "#about",
    icon: Info,
  },
];

export default function GlassNavbar() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("theme") === "dark"
  );

  const [scrolled, setScrolled] =
    useState(false);

  const [active, setActive] =
    useState("Home");

  const [searchOpen, setSearchOpen] =
    useState(false);

  useEffect(() => {
    // darkMode is initialised from localStorage above, so only the <html> class
    // needs syncing here.
    document.documentElement.classList.toggle("dark", darkMode);

    const sections = navItems.map((item) => ({
      id: item.href.replace("#", ""),
      name: item.name,
    }));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const current =
        window.scrollY + 150;

      sections.forEach((section) => {
        const element =
          document.getElementById(
            section.id
          );

        if (!element) return;

        const top = element.offsetTop;
        const bottom =
          top + element.offsetHeight;

        if (
          current >= top &&
          current < bottom
        ) {
          setActive(section.name);
        }
      });
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [darkMode]);

  useEffect(() => {
    const handler = (e) => {
      if (
        e.ctrlKey &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }

      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, []);

  const toggleDark = () => {
    const next = !darkMode;

    setDarkMode(next);

    if (next) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "light"
      );
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/20 bg-white/80 shadow-[0_20px_50px_rgba(16,185,129,.10)] backdrop-blur-3xl dark:bg-slate-900/80"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <motion.a
            href="#home"
            whileHover={{
              scale: 1.05,
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-700 shadow-lg shadow-emerald-500/40">

              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [.3, .7, .3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                }}
                className="absolute inset-0 rounded-full bg-white/20 blur-xl"
              />

              <span className="relative z-10 text-xl font-black text-white">
                F
              </span>

            </div>

            <div>

              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                FANMENI
              </h1>

              <p className="text-xs text-slate-500">
                Festival Portal
              </p>

            </div>

          </motion.a>

          <nav className="hidden items-center gap-2 lg:flex">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{
                    y: -2,
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: .97,
                  }}
                  onClick={() =>
                    setActive(item.name)
                  }
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    active === item.name
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300"
                  }`}
                >
                  <Icon size={16} />

                  {item.name}

                  {active === item.name && (
                    <motion.div
                      layoutId="nav"
                      className="absolute inset-0 rounded-full border border-emerald-200"
                    />
                  )}
                </motion.a>
              );
            })}
          </nav>
                    <div className="flex items-center gap-3">

            <motion.div
              animate={{
                width: searchOpen ? 280 : 46,
              }}
              transition={{
                duration: 0.35,
              }}
              className="hidden overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:flex"
            >

              <button
                onClick={() =>
                  setSearchOpen((v) => !v)
                }
                className="flex h-11 w-11 items-center justify-center"
              >
                <Search
                  size={18}
                  className="text-slate-500"
                />
              </button>

              <AnimatePresence>

                {searchOpen && (

                  <motion.input
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    autoFocus
                    placeholder="Search..."
                    className="w-full bg-transparent pr-4 text-sm outline-none placeholder:text-slate-400"
                  />

                )}

              </AnimatePresence>

            </motion.div>

            <motion.button
              whileHover={{
                scale: 1.05,
                rotate: 180,
              }}
              whileTap={{
                scale: 0.9,
              }}
              transition={{
                duration: .35,
              }}
              onClick={toggleDark}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </motion.button>

            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:hidden"
            >
              <Menu size={22} />
            </button>

          </div>

          {scrolled && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent blur-sm"
            />

          )}

        </div>

      </motion.header>

      <AnimatePresence>

        {mobileOpen && (

          <>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setMobileOpen(false)
              }
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
                mass: .9,
              }}
              className="fixed right-0 top-0 z-50 flex h-screen w-80 flex-col bg-white shadow-2xl dark:bg-slate-900"
            >

              <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">

                <div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    FANMENI
                  </h2>

                  <p className="text-sm text-slate-500">
                    Festival Portal
                  </p>

                </div>

                <button
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={22} />
                </button>

              </div>

              <div className="p-5">

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">

                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    placeholder="Search..."
                    className="w-full bg-transparent text-sm outline-none"
                  />

                </div>

              </div>

              <nav className="flex-1 space-y-2 px-5">
                              {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      whileHover={{
                        x: 8,
                        scale: 1.02,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() => {
                        setActive(item.name);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-semibold transition-all ${
                        active === item.name
                          ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-500/30"
                          : "text-slate-700 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon size={20} />

                      <span>{item.name}</span>
                    </motion.a>
                  );
                })}
              </nav>

              <div className="border-t border-slate-200 p-6 dark:border-slate-800">

                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: .97,
                  }}
                  onClick={toggleDark}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-700 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30"
                >
                  {darkMode ? (
                    <>
                      <Sun size={18} />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={18} />
                      Dark Mode
                    </>
                  )}
                </motion.button>

                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-slate-700 dark:bg-slate-800">

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    FANMENI 2026
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Live Results • Programs • Schedule •
                    Gallery • Team Rankings
                  </p>

                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                  © 2026 FANMENI Festival Portal
                </p>

              </div>

            </motion.aside>

          </>
        )}

      </AnimatePresence>

    </>
  );
}