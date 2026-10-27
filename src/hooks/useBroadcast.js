// ============================================
// FILE: src/hooks/useBroadcast.js
// PURPOSE: Real-time sync for dramatic result reveal
// ============================================

import { useState, useEffect } from "react";
import { subscribeToDocument } from "../firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";

// How long to wait for the first Firestore snapshot before the stage screen
// shows "still connecting" instead of an empty black frame.
const FIRST_SNAPSHOT_TIMEOUT_MS = 4000;

export function useBroadcast() {
  const [broadcastData, setBroadcastData] = useState({
    isActive: false,
    resultId: null,
    revealStep: 0,
    // 0 = Title only
    // 1 = Grades
    // 2 = 3rd Place
    // 3 = 2nd Place
    // 4 = 1st Place
  });
  const [loading, setLoading] = useState(true);

  // True once Firestore has answered at least once (snapshot or error). While it
  // is false the screen is still waiting on the network rather than on data.
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let settled = false;

    // Called when Firestore actually answers (snapshot or error).
    const settle = () => {
      if (settled) return;
      settled = true;
      setConnected(true);
      setLoading(false);
    };

    // Firestore stays silent (it keeps retrying) when there is no connection, so
    // the listener alone can never tell the screen "you are offline". After the
    // timeout we stop blocking the UI but leave `connected` false so the screen
    // can keep saying it is still waiting on the network.
    const timer = setTimeout(() => setLoading(false), FIRST_SNAPSHOT_TIMEOUT_MS);

    const unsubscribe = subscribeToDocument(
      COLLECTIONS.SETTINGS,
      "broadcast",
      (data) => {
        if (data) setBroadcastData(data);
        settle();
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { broadcastData, loading, connected };
}
