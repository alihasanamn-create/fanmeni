
import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";
import {
  subscribeToCollection,
  subscribeToDocument,
} from "../firebase/firestore";
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
  const [demerits, setDemerits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demeritsLoading, setDemeritsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribeTeams = null;

    const start = async () => {
      setLoading(true);

      try {
        const user = auth.currentUser;

        if (user) {
          const profile = await getCurrentProfile(user);

          if (cancelled) return;

          if (profile?.role === "captain" && profile?.teamId) {
            unsubscribeTeams = subscribeToDocument(
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

        if (cancelled) return;

        unsubscribeTeams = subscribeToCollection(
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

      if (unsubscribeTeams) {
        unsubscribeTeams();
      }
    };
  }, []);

  // Listen to Arts demerits independently.
  // These records never modify the original team documents.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "artsDemerits"),
      (snapshot) => {
        setDemerits(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setDemeritsLoading(false);
      },
      (error) => {
        console.error("Unable to load Arts demerits:", error);
        setDemerits([]);
        setDemeritsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const adjustedTeams = useMemo(() => {
    const deductionsByTeam = {};

    demerits.forEach((demerit) => {
      if (demerit.category !== "arts") return;

      const teamId = demerit.teamId;
      const points = Number(demerit.points) || 0;

      if (!teamId || points <= 0) return;

      deductionsByTeam[teamId] =
        (deductionsByTeam[teamId] || 0) + points * 3;
    });

    return sortTeams(
      teams.map((team) => {
        const artsDeduction = deductionsByTeam[team.id] || 0;
        const originalTotal = Number(team.totalPoints) || 0;

        return {
          ...team,

          // Original Firestore total remains unchanged.
          totalPoints: originalTotal,

          // Use this value for a leaderboard that includes the penalty.
          adjustedTotalPoints: originalTotal - artsDeduction,

          // Penalty details for display.
          artsDemeritPoints:
            demerits
              .filter(
                (demerit) =>
                  demerit.category === "arts" &&
                  demerit.teamId === team.id
              )
              .reduce(
                (sum, demerit) => sum + (Number(demerit.points) || 0),
                0
              ),

          artsDeduction,
        };
      })
    );
  }, [teams, demerits]);

  return {
    teams: adjustedTeams,
    loading,
    demeritsLoading,
    demerits,
  };
}
