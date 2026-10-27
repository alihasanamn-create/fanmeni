// ============================================
// FILE: src/hooks/useAuth.js
// PURPOSE: React authentication state and profile
// ============================================

import { useEffect, useState } from "react";
import { getCurrentProfile, subscribeToAuth } from "../services/authService";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToAuth(async (nextUser) => {
      if (!active) return;

      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await getCurrentProfile(nextUser);
        if (!active) return;
        setProfile(nextProfile);
      } catch (error) {
        console.error("Unable to load user profile:", error);
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user && profile),
    isAdmin: profile?.role === "admin",
    isCaptain: profile?.role === "captain",
  };
}
