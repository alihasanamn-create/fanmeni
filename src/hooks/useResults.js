// ============================================
// FILE: src/hooks/useResults.js
// PURPOSE: Real-time results data hook
// ============================================

import { useState, useEffect } from "react";
import { subscribeToCollection } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export function useResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(COLLECTIONS.RESULTS, (data) => {
      setResults(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { results, loading };
}