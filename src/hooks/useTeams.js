// ============================================
// FILE: src/hooks/useTeams.js
// PURPOSE: Real-time teams data hook
// ============================================

import { useState, useEffect } from "react";
import { subscribeToCollection, subscribeToDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import { auth } from "../firebase/config";
import { getCurrentProfile } from "../services/authService";

const sortTeams = (data) =>
  [...data].sort((a, b) => {
    if ((b.totalPoints || 0) !== (a.totalPoints || 0)) {
      return (b.totalPoints || 0) - (a.totalPoints || 0);
    }
    return (a.name || "").localeCompare(b.name || "");
  });

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    const start = async () => {
      setLoading(true);

      try {
        // Captains use the already-resolved profile team ID. This is important
        // because an older captain record may contain a stale teamId while the
        // auth profile has resolved the current team by name.
        const user = auth.currentUser;
        if (user) {
          const profile = await getCurrentProfile(user);
          if (profile?.role === "captain" && profile?.teamId) {
            unsubscribe = subscribeToDocument(
              COLLECTIONS.TEAMS,
              profile.teamId,
              (team) => {
                if (cancelled) return;
                setTeams(team ? [team] : []);
                setLoading(false);
              }
            );
            return;
          }
        }

        // Admins and legacy non-captain sessions keep the original all-teams view.
        unsubscribe = subscribeToCollection(
          COLLECTIONS.TEAMS,
          (data) => {
            if (cancelled) return;
            setTeams(sortTeams(data));
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Unable to load teams:", error);
        if (!cancelled) {
          setTeams([]);
          setLoading(false);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { teams, loading };
}
