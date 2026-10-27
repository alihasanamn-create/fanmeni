import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";

export default function useDashboardStats() {
  const [stats, setStats] = useState({
    students: 0,
    teams: 0,
    programs: 0,
    results: 0,
  });

  const [loading, setLoading] = useState(true);

  async function loadStats() {
    setLoading(true);

    const data = await getDashboardStats();

    setStats(data);

    setLoading(false);
  }

  useEffect(() => {
    // loadStats() flips `loading` synchronously; that is the intended
    // fetch-on-mount pattern and loadStats is also exposed as refresh().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, []);

  return {
    stats,
    loading,
    refresh: loadStats,
  };
}