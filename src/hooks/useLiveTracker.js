// ============================================
// FILE: src/hooks/useLiveTracker.js
// PURPOSE: Real-time live tracker data
// ============================================

import { useState, useEffect } from "react";
import { subscribeToDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export function useLiveTracker() {
  const [liveData, setLiveData] = useState({
    currentProgramId: null,
    currentModuleType: null,
    nextProgramIds: [],
    announcementText: "",
    showLeaderboard: true,
    showResults: true,
    autoRotateResults: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToDocument(
      COLLECTIONS.SETTINGS,
      "liveTracker",
      (data) => {
        if (data) {
          setLiveData((prev) => ({ ...prev, ...data }));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { liveData, loading };
}