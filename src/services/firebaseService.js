import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";

export default class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  async getAll() {
    const snapshot = await getDocs(this.collectionRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getById(id) {
    const snapshot = await getDoc(
      doc(db, this.collectionName, id)
    );

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  }

  async add(data) {
    return await addDoc(this.collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async update(id, data) {
    return await updateDoc(
      doc(db, this.collectionName, id),
      {
        ...data,
        updatedAt: serverTimestamp(),
      }
    );
  }

  async delete(id) {
    return await deleteDoc(
      doc(db, this.collectionName, id)
    );
  }

  async count() {
    const snapshot =
      await getCountFromServer(
        this.collectionRef
      );

    return snapshot.data().count;
  }
}