// ============================================
// FILE: src/services/captainService.js
// PURPOSE: Admin-managed captain accounts and profiles
// ============================================

import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { nameToAuthEmail } from "./authService";

const captainCollection = collection(db, "captains");

// A secondary Firebase app is used so creating a captain never signs the
// currently logged-in admin out of the primary application session.
const getSecondaryConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export async function getCaptains() {
  const snapshot = await getDocs(captainCollection);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createCaptain({ name, password, teamId, teamName, module }) {
  const cleanName = name.trim();
  if (!cleanName || !password || !teamId || !module) {
    throw new Error("Captain name, password, team and module are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must contain at least 6 characters.");
  }

  const secondaryApp = initializeApp(getSecondaryConfig(), `captain-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      nameToAuthEmail(cleanName),
      password
    );

    await setDoc(doc(db, "captains", credential.user.uid), {
      name: cleanName,
      role: "captain",
      teamId,
      teamName: teamName || "",
      module,
      active: true,
      createdAt: new Date().toISOString(),
    });

    await signOut(secondaryAuth);
    return { uid: credential.user.uid };
  } finally {
    await deleteApp(secondaryApp).catch(() => {});
  }
}

export async function setCaptainActive(uid, active) {
  await updateDoc(doc(db, "captains", uid), { active: Boolean(active) });
}

export async function updateCaptain(uid, data) {
  const allowed = {};
  if (data.name !== undefined) allowed.name = data.name.trim();
  if (data.teamId !== undefined) allowed.teamId = data.teamId;
  if (data.teamName !== undefined) allowed.teamName = data.teamName;
  if (data.module !== undefined) allowed.module = data.module;
  if (data.active !== undefined) allowed.active = Boolean(data.active);
  await updateDoc(doc(db, "captains", uid), allowed);
}
