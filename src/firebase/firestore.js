// ============================================
// FILE: src/firebase/firestore.js
// PURPOSE: Reusable Firestore CRUD operations
// ============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./config";

// ============================================
// GET SINGLE DOCUMENT BY ID
// ============================================
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
      };
    }

    return {
      success: false,
      error: "Document not found",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// GET ALL DOCUMENTS FROM A COLLECTION
// ============================================
export const getAllDocuments = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// QUERY DOCUMENTS WITH FILTERS
// Usage: queryDocuments("students", [["teamId", "==", "abc"]], "name", 10)
// ============================================
export const queryDocuments = async (
  collectionName,
  filters = [],
  orderByField = null,
  orderDirection = "asc",
  limitCount = null
) => {
  try {
    const constraints = [];

    // Add filters (where clauses)
    filters.forEach(([field, operator, value]) => {
      constraints.push(where(field, operator, value));
    });

    // Add ordering
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ADD NEW DOCUMENT (auto-generated ID)
// ============================================
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
      message: "Document added successfully",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// SET DOCUMENT WITH CUSTOM ID (creates or overwrites)
// ============================================
export const setDocument = async (collectionName, docId, data, merge = true) => {
  try {
    await setDoc(
      doc(db, collectionName, docId),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge }
    );

    return {
      success: true,
      id: docId,
      message: "Document saved successfully",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// UPDATE EXISTING DOCUMENT
// ============================================
export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Document updated successfully",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// DELETE DOCUMENT
// ============================================
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return {
      success: true,
      message: "Document deleted successfully",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// REAL-TIME LISTENER FOR COLLECTION
// Returns unsubscribe function
// ============================================
export const subscribeToCollection = (
  collectionName,
  callback,
  filters = [],
  orderByField = null,
  orderDirection = "asc"
) => {
  const constraints = [];

  filters.forEach(([field, operator, value]) => {
    constraints.push(where(field, operator, value));
  });

  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }

  const q =
    constraints.length > 0
      ? query(collection(db, collectionName), ...constraints)
      : collection(db, collectionName);

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(data);
    },
    (error) => {
      console.error("Subscription error:", error);
      callback([]);
    }
  );
};

// ============================================
// REAL-TIME LISTENER FOR SINGLE DOCUMENT
// ============================================
export const subscribeToDocument = (collectionName, docId, callback) => {
  return onSnapshot(
    doc(db, collectionName, docId),
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Document subscription error:", error);
      callback(null);
    }
  );
};

// ============================================
// BATCH WRITE (bulk operations)
// Usage: batchWrite([
//   { type: "set", collectionName: "students", docId: "1", data: {...} },
//   { type: "update", collectionName: "teams", docId: "2", data: {...} },
//   { type: "delete", collectionName: "arts", docId: "3" }
// ])
// ============================================
export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);

    operations.forEach(({ type, collectionName, docId, data }) => {
      const ref = doc(db, collectionName, docId);

      if (type === "set") {
        batch.set(ref, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else if (type === "update") {
        batch.update(ref, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else if (type === "delete") {
        batch.delete(ref);
      }
    });

    await batch.commit();
    return {
      success: true,
      message: `Batch operation completed (${operations.length} ops)`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// INCREMENT NUMERIC FIELD (atomic operation)
// Usage: incrementField("teams", "blueHouse", "totalPoints", 5)
// ============================================
export const incrementField = async (collectionName, docId, field, value = 1) => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      [field]: increment(value),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ADD ITEM TO ARRAY FIELD (atomic operation)
// ============================================
export const addToArray = async (collectionName, docId, field, value) => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      [field]: arrayUnion(value),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// REMOVE ITEM FROM ARRAY FIELD (atomic operation)
// ============================================
export const removeFromArray = async (collectionName, docId, field, value) => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      [field]: arrayRemove(value),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// COUNT DOCUMENTS IN COLLECTION
// ============================================
export const countDocuments = async (collectionName, filters = []) => {
  try {
    const constraints = filters.map(([field, operator, value]) =>
      where(field, operator, value)
    );

    const q =
      constraints.length > 0
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName);

    const snapshot = await getDocs(q);
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// CHECK IF DOCUMENT EXISTS
// ============================================
export const documentExists = async (collectionName, docId) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, docId));
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking document:", error);
    return false;
  }
};