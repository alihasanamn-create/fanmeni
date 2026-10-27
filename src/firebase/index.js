// ============================================
// FILE: src/firebase/index.js
// PURPOSE: Barrel file - re-exports everything so old imports still work
// ============================================

// Export Firebase instances (db, auth, storage)
export { auth, db, storage } from "./config";

// Export all Firestore helper functions
export {
  getDocument,
  getAllDocuments,
  queryDocuments,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  subscribeToDocument,
  batchWrite,
  incrementField,
  addToArray,
  removeFromArray,
  countDocuments,
  documentExists,
} from "./firestore";

// Export all Storage helper functions
export {
  uploadFile,
  uploadFileWithProgress,
  uploadStudentPhoto,
  uploadTeamLogo,
  uploadFestivalLogo,
  uploadGalleryImage,
  uploadCertificate,
  uploadDownload,
  deleteFile,
  getFileUrl,
  getFileMetadata,
  listFiles,
  validateFile,
  compressImage,
} from "./storage";

// Export all constants
export {
  COLLECTIONS,
  ROLES,
  RESULT_STATUS,
  PROGRAM_TYPES,
  CATEGORIES,
  POINTS,
  STORAGE_PATHS,
} from "./collections";