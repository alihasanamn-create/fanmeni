import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import IntroSplash from "../pages/IntroSplash";

const PAGE_NAMES = {
  "/login": "LOGIN",
  "/home": "HOME",
  "/riyadha": "RIYADHA HOME",
  "/live": "LIVE",
  "/screen": "TV SCREEN",
};

function wasPageRefreshed() {
  const navigation = window.performance?.getEntriesByType?.("navigation")?.[0];
  return navigation?.type === "reload";
}

export default function PageIntroGate({ children }) {
  const location = useLocation();
  const pageName = PAGE_NAMES[location.pathname];
  const [showIntro, setShowIntro] = useState(() => Boolean(pageName && wasPageRefreshed()));

  useEffect(() => {
    if (pageName) {
      document.title = `FANMENI 26 • ${pageName}`;
    }
  }, [pageName]);

  const finishIntro = () => {
    // Reveal the already-mounted destination directly. Do not navigate to the
    // same pathname, because browsers continue to report the original page
    // load as a reload and that can cause the intro to mount again.
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroSplash onComplete={finishIntro} pageName={pageName} />;
  }

  return children;
}
