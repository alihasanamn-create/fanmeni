import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const teamsRef = collection(db, "teams");

export async function getTeams() {
  const snapshot = await getDocs(teamsRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function addTeam(data) {
  return addDoc(teamsRef, data);
}

export async function updateTeam(id, data) {
  return updateDoc(doc(db, "teams", id), data);
}

export async function deleteTeam(id) {
  return deleteDoc(doc(db, "teams", id));
}