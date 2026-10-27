// ============================================
// FILE: src/hooks/useStudents.js
// PURPOSE: Real-time students data hook
// ============================================

import { useState, useEffect } from "react";
import { subscribeToCollection } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

export function useStudents(teamId = null) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const filters = teamId ? [["teamId", "==", teamId]] : [];
    const unsubscribe = subscribeToCollection(
      COLLECTIONS.STUDENTS,
      (data) => {
        const sorted = data.sort((a, b) => {
          const aNum = parseInt(a.chestNumber) || 0;
          const bNum = parseInt(b.chestNumber) || 0;
          return aNum - bNum;
        });
        setStudents(sorted);
        setLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [teamId]);

  return { students, loading };
}
