// ============================================
// FILE: src/services/authService.js
// PURPOSE: Name + password authentication using Firebase Auth underneath
// ============================================

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const normalizeName = (name = "") =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTeamName = (name = "") => String(name || "").trim().toLowerCase();
const getTeamName = (team = {}) => team.name || team.teamName || team.title || team.displayName || "";

const ADMIN_EMAIL = "fanmeni@login.fanmeni.app";

export const nameToAuthEmail = (name) =>
  `${normalizeName(name)}@login.fanmeni.app`;

// Captain records created in older versions may contain a stale teamId while
// retaining the correct team name. Resolve the team against the live teams
// collection. A stored ID is accepted only when its team name also agrees
// with the captain's saved team name.
const resolveCaptainTeam = async (captainData) => {
  const storedTeamId = captainData?.teamId || null;
  const storedTeamName = captainData?.teamName || captainData?.team || "";

  if (storedTeamId) {
    const teamSnapshot = await getDoc(doc(db, "teams", storedTeamId));
    if (teamSnapshot.exists()) {
      const teamData = teamSnapshot.data() || {};
      const liveTeamName = getTeamName(teamData);
      if (!storedTeamName || normalizeTeamName(liveTeamName) === normalizeTeamName(storedTeamName)) {
        return { teamId: storedTeamId, teamName: liveTeamName || storedTeamName };
      }
    }
  }

  if (!storedTeamName) return { teamId: null, teamName: "" };

  const teamsSnapshot = await getDocs(collection(db, "teams"));
  const matchingTeam = teamsSnapshot.docs.find((item) => {
    const teamData = item.data() || {};
    return normalizeTeamName(getTeamName(teamData)) === normalizeTeamName(storedTeamName);
  });

  return matchingTeam
    ? { teamId: matchingTeam.id, teamName: getTeamName(matchingTeam.data()) || storedTeamName }
    : { teamId: null, teamName: storedTeamName };
};

const readProfile = async (uid, authUser = null) => {
  if (authUser?.email?.toLowerCase() === ADMIN_EMAIL) {
    return { uid, name: "fanmeni", role: "admin", active: true };
  }

  // Captains must be checked first so a legacy users/{uid} document cannot
  // hide the captain's team assignment.
  const captainSnapshot = await getDoc(doc(db, "captains", uid));
  if (captainSnapshot.exists()) {
    const captainData = captainSnapshot.data();
    const resolvedTeam = await resolveCaptainTeam(captainData);
    return {
      uid,
      ...captainData,
      role: "captain",
      teamId: resolvedTeam.teamId,
      teamName: resolvedTeam.teamName,
    };
  }

  const sources = [
    ["users", uid],
    ["admins", uid],
  ];

  for (const [collectionName, id] of sources) {
    const snapshot = await getDoc(doc(db, collectionName, id));
    if (snapshot.exists()) return { uid, ...snapshot.data() };
  }

  return null;
};

export const loginWithName = async (name, password) => {
  const cleanName = name.trim();
  if (!cleanName || !password) throw new Error("Enter your name and password.");

  const credential = await signInWithEmailAndPassword(
    auth,
    nameToAuthEmail(cleanName),
    password
  );

  const profile = await readProfile(credential.user.uid, credential.user);
  if (!profile || profile.active === false) {
    await signOut(auth);
    throw new Error("This account is not authorized or is disabled.");
  }

  return { user: credential.user, profile };
};

export const getCurrentProfile = async (user) => {
  if (!user) return null;
  return readProfile(user.uid, user);
};

export const logout = () => signOut(auth);
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);
