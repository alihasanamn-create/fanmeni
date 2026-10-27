// ============================================
// FILE: src/hooks/useCandidates.js
// PURPOSE: Real-time candidates data hook
// ============================================

import { useState, useEffect } from "react";
import { subscribeToCollection } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export function useCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      COLLECTIONS.PARTICIPANTS,
      (data) => {
        setCandidates(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { candidates, loading };
}