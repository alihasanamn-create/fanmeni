import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/config";

async function fetch(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getArtsPrograms() {
  return fetch("arts_programs");
}

export async function getSportsPrograms() {
  return fetch("sports_programs");
}

export async function addProgram(type, data) {
  return addDoc(collection(db, type), data);
}

export async function updateProgram(type, id, data) {
  return updateDoc(doc(db, type, id), data);
}

export async function deleteProgram(type, id) {
  return deleteDoc(doc(db, type, id));
}