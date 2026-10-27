import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../firebase/config";

const studentsRef = collection(db, "students");

export async function getStudents() {
  const snapshot = await getDocs(studentsRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function addStudent(data) {
  return await addDoc(studentsRef, data);
}

export async function updateStudent(id, data) {
  return await updateDoc(doc(db, "students", id), data);
}

export async function deleteStudent(id) {
  return await deleteDoc(doc(db, "students", id));
}

export async function getStudentCount() {
  const count = await getCountFromServer(studentsRef);
  return count.data().count;
}