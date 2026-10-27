// ============================================
// FILE: src/hooks/useSettings.js
// ============================================

import { useState, useEffect } from "react";
import { subscribeToDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export function useSettings() {
  const [settings, setSettings] = useState({
    festivalName: "FANMENI",
    tagline: "Festival Results Portal",
    logoUrl: "",
    primaryColor: "#10b981",
    secondaryColor: "#0d9488",
    schoolName: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToDocument(
      COLLECTIONS.SETTINGS,
      "festival",
      (data) => {
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}