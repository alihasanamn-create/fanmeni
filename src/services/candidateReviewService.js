// ============================================
// FANMENI - Admin candidate review service
// ============================================

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

const entriesRef = collection(db, COLLECTIONS.CANDIDATE_ENTRIES);

export async function getCandidateSubmissions() {
  const q = query(entriesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function reviewCandidateSubmission({
  entryId,
  status,
  reviewedBy,
  reviewedByName,
  reviewNote = "",
}) {
  if (!entryId) throw new Error("Missing submission ID.");
  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid review status.");
  }
  if (!reviewedBy) throw new Error("Missing reviewer information.");
  if (status === "rejected" && !String(reviewNote).trim()) {
    throw new Error("Please provide a reason for rejection.");
  }

  await updateDoc(doc(db, COLLECTIONS.CANDIDATE_ENTRIES, entryId), {
    status,
    reviewedBy,
    reviewedByName: reviewedByName || "Admin",
    reviewedAt: serverTimestamp(),
    reviewNote: String(reviewNote || "").trim(),
  });
}
