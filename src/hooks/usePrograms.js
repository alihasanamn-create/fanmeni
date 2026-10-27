// ============================================
// FILE: src/hooks/usePrograms.js
// PURPOSE: Real-time programs data hook
// ============================================

import { useState, useEffect } from "react";
import { subscribeToCollection } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

const normalizeCategory = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "bidaya") return "Bidaya";
  if (normalized === "thaniya") return "Thaniya";
  if (normalized === "general") return "General";
  return String(value || "").trim();
};

export function usePrograms(type = null) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const collectionName =
      type === "arts"
        ? COLLECTIONS.ARTS
        : type === "sports"
        ? COLLECTIONS.SPORTS
        : COLLECTIONS.ARTS;

    const unsubscribe = subscribeToCollection(collectionName, (data) => {
      const normalized = data.map((program) => ({
        ...program,
        category: normalizeCategory(
          program.category ?? program.programCategory ?? program.studentCategory
        ),
      }));

      const sorted = normalized.sort((a, b) => {
        const aCode = parseInt(a.code) || 999;
        const bCode = parseInt(b.code) || 999;
        return aCode - bCode;
      });

      setPrograms(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type]);

  return { programs, loading };
}