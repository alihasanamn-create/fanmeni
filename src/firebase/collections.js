// ============================================
// FILE: src/firebase/collections.js
// ============================================

// ---------- COLLECTIONS ----------
export const COLLECTIONS = {
  ADMINS: "admins",
  USERS: "users",
  CAPTAINS: "captains",
  JUDGES: "judges",
  STUDENTS: "students",
  TEAMS: "teams",
  ARTS: "arts",
  SPORTS: "sports",
  PARTICIPANTS: "participants",
  SCORES: "scores",
  RESULTS: "results",
  TEAM_POINTS: "teamPoints",
  SETTINGS: "settings",
  NOTIFICATIONS: "notifications",
  ACTIVITY_LOGS: "activityLogs",
  DOWNLOADS: "downloads",
  GALLERY: "gallery",
  LIVE_QUEUE: "liveQueue",
  BROADCAST_HISTORY: "broadcastHistory",
  CANDIDATE_ENTRIES: "candidateEntries",
};

// ---------- USER ROLES ----------
export const ROLES = {
  ADMIN: "admin",
  CAPTAIN: "captain",
  JUDGE: "judge",
  VOLUNTEER: "volunteer",
  VIEWER: "viewer",
};

// ---------- RESULT STATUS ----------
export const RESULT_STATUS = {
  DRAFT: "draft",
  LOCKED: "locked",
  PUBLISHED: "published",
};

// ---------- PROGRAM TYPES ----------
export const PROGRAM_TYPES = {
  INDIVIDUAL: "Individual",
  PERSONAL_GROUP: "Personal Group",
  GROUP: "Group",
  GENERAL: "General",
};

// ---------- CATEGORIES ----------
export const CATEGORIES = {
  BIDAYA: "Bidaya",
  THANIYA: "Thaniya",
  GENERAL: "General",
};

// ---------- STUDENT CATEGORIES (only Bidaya & Thaniya) ----------
export const STUDENT_CATEGORIES = ["Bidaya", "Thaniya"];

// ---------- POINTS SYSTEM ----------
export const POINTS = {
  Individual: { first: 5, second: 3, third: 1 },
  "Personal Group": { first: 5, second: 3, third: 1, shared: true },
  Group: { first: 7, second: 5, third: 3 },
  General: { first: 15, second: 7, third: 5 },
  grades: { A: 3, B: 2, C: 1 },
};

// ---------- STORAGE PATHS ----------
export const STORAGE_PATHS = {
  STUDENT_PHOTOS: "students/photos",
  TEAM_LOGOS: "teams/logos",
  FESTIVAL_LOGO: "settings",
  GALLERY: "gallery",
  CERTIFICATES: "certificates",
  DOWNLOADS: "downloads",
};

export const getPositionPoints = (type, position) => {
  return POINTS[type]?.[position] || 0;
};

export const getGradePoints = (grade) => {
  return POINTS.grades[grade] || 0;
};

export const isPointsShared = (type) => {
  return POINTS[type]?.shared === true;
};
