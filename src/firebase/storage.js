// ============================================
// FILE: src/firebase/storage.js
// PURPOSE: Firebase Storage operations (upload/delete files)
// ============================================

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from "firebase/storage";
import { storage } from "./config";
import { STORAGE_PATHS } from "./collections";

// ============================================
// UPLOAD FILE (Basic)
// ============================================
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url,
      path,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// UPLOAD FILE WITH PROGRESS TRACKING
// Usage: uploadFileWithProgress(file, path, (progress) => setProgress(progress))
// ============================================
export const uploadFileWithProgress = (file, path, onProgress) => {
  return new Promise((resolve) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        resolve({ success: false, error: error.message });
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            url,
            path,
            name: file.name,
            size: file.size,
            type: file.type,
          });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }
    );
  });
};

// ============================================
// UPLOAD STUDENT PHOTO
// ============================================
export const uploadStudentPhoto = async (file, studentId) => {
  const ext = file.name.split(".").pop();
  const path = `${STORAGE_PATHS.STUDENT_PHOTOS}/${studentId}.${ext}`;
  return await uploadFile(file, path);
};

// ============================================
// UPLOAD TEAM LOGO
// ============================================
export const uploadTeamLogo = async (file, teamId) => {
  const ext = file.name.split(".").pop();
  const path = `${STORAGE_PATHS.TEAM_LOGOS}/${teamId}.${ext}`;
  return await uploadFile(file, path);
};

// ============================================
// UPLOAD FESTIVAL LOGO
// ============================================
export const uploadFestivalLogo = async (file) => {
  const ext = file.name.split(".").pop();
  const path = `${STORAGE_PATHS.FESTIVAL_LOGO}/festival-logo.${ext}`;
  return await uploadFile(file, path);
};

// ============================================
// UPLOAD GALLERY IMAGE
// ============================================
export const uploadGalleryImage = async (file) => {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const path = `${STORAGE_PATHS.GALLERY}/${timestamp}_${cleanName}`;
  return await uploadFile(file, path);
};

// ============================================
// UPLOAD CERTIFICATE PDF
// ============================================
export const uploadCertificate = async (file, certificateId) => {
  const path = `${STORAGE_PATHS.CERTIFICATES}/${certificateId}.pdf`;
  return await uploadFile(file, path);
};

// ============================================
// UPLOAD DOWNLOAD FILE (PDFs, Excel, etc.)
// ============================================
export const uploadDownload = async (file, category = "general") => {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const path = `${STORAGE_PATHS.DOWNLOADS}/${category}/${timestamp}_${cleanName}`;
  return await uploadFile(file, path);
};

// ============================================
// DELETE FILE FROM STORAGE
// ============================================
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// GET FILE DOWNLOAD URL
// ============================================
export const getFileUrl = async (path) => {
  try {
    const url = await getDownloadURL(ref(storage, path));
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// GET FILE METADATA
// ============================================
export const getFileMetadata = async (path) => {
  try {
    const metadata = await getMetadata(ref(storage, path));
    return { success: true, metadata };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// LIST ALL FILES IN A FOLDER
// ============================================
export const listFiles = async (folderPath) => {
  try {
    const listRef = ref(storage, folderPath);
    const res = await listAll(listRef);

    const files = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url,
          size: metadata.size,
          contentType: metadata.contentType,
          createdAt: metadata.timeCreated,
        };
      })
    );

    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// VALIDATE FILE (Size and Type)
// ============================================
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  } = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Only ${allowedTypes.join(", ")} files are allowed`,
    };
  }

  return { valid: true };
};

// ============================================
// COMPRESS IMAGE BEFORE UPLOAD (Optional Helper)
// ============================================
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
    };
  });
};