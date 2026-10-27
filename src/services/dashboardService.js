import {
  collection,
  getCountFromServer,
} from "firebase/firestore";

import { db } from "../firebase/config";

export async function getDashboardStats() {
  try {
    const [
      students,
      teams,
      artsPrograms,
      sportsPrograms,
      results,
    ] = await Promise.all([
      getCountFromServer(collection(db, "students")),
      getCountFromServer(collection(db, "teams")),
      getCountFromServer(collection(db, "arts_programs")),
      getCountFromServer(collection(db, "sports_programs")),
      getCountFromServer(collection(db, "results")),
    ]);

    return {
      students: students.data().count,
      teams: teams.data().count,
      programs:
        artsPrograms.data().count +
        sportsPrograms.data().count,
      results: results.data().count,
    };
  } catch (error) {
    console.error(error);

    return {
      students: 0,
      teams: 0,
      programs: 0,
      results: 0,
    };
  }
}