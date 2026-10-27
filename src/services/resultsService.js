import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const resultsRef = collection(db, "results");

export async function getResults() {
  const snapshot = await getDocs(resultsRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function addResult(data) {
  return addDoc(resultsRef, data);
}

export async function updateResult(id, data) {
  return updateDoc(doc(db, "results", id), data);
}

export async function deleteResult(id) {
  return deleteDoc(doc(db, "results", id));
}