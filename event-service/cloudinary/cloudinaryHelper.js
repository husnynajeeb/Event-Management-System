import cloudinary from "./cloudinary.js";

/**
 * Delete image from Cloudinary by URL or public_id
 * @param {string} imageUrl - The image URL or public ID
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    // Extract public_id from Cloudinary URL
    let publicId;
    if (imageUrl.includes("cloudinary")) {
      // Extract public_id from URL: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/file_id.jpg
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      publicId = `event-service/events/${fileName.split(".")[0]}`;
    } else {
      publicId = imageUrl;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} imageUrls - Array of image URLs or public IDs
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleImages = async (imageUrls) => {
  try {
    if (!imageUrls || imageUrls.length === 0) return [];

    const deletePromises = imageUrls.map((url) => deleteImage(url));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error("Error deleting multiple images:", error);
    throw error;
  }
};

/**
 * Get image URL from multer file object
 * @param {Object} file - Multer file object
 * @returns {string} - Cloudinary image URL
 */
export const getImageUrl = (file) => {
  if (!file) return null;
  return file.path || file.url; // Multer-storage-cloudinary stores URL in 'path'
};

/**
 * Get multiple image URLs from multer files array
 * @param {Array<Object>} files - Array of multer file objects
 * @returns {Array<string>} - Array of Cloudinary image URLs
 */
export const getImageUrls = (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => file.path || file.url);
};
