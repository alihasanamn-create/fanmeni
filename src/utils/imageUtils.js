// ============================================
// FILE: src/utils/imageUtils.js
// PURPOSE: Convert images to Base64 (no storage needed)
// ============================================

/**
 * Convert File to Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Compress image and convert to Base64
 * Reduces file size to fit in Firestore (1MB limit)
 */
export const compressAndConvertImage = (file, maxWidth = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");

        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64 (compressed JPEG)
        const base64 = canvas.toDataURL("image/jpeg", quality);

        // Calculate approximate size in KB
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);

        resolve({
          success: true,
          base64,
          sizeKB,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject({ success: false, error: "Failed to load image" });
      };
    };

    reader.onerror = () => {
      reject({ success: false, error: "Failed to read file" });
    };
  });
};

/**
 * Validate image file
 */
export const validateImage = (file, maxSizeMB = 5) => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please select an image file" };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image must be less than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};