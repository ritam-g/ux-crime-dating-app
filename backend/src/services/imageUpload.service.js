import ImageKit from "imagekit";
import imagekitConfig from "../config/imagekit.config.js";

/**
 * @file imageUpload.service.js
 * @description Uploads local memory buffers to ImageKit and returns hosted secure URLs.
 */

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: imagekitConfig.publicKey,
  privateKey: imagekitConfig.privateKey,
  urlEndpoint: imagekitConfig.urlEndpoint,
});

/**
 * Uploads a file buffer directly to ImageKit.
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @returns {Promise<string>} Hosted image URL
 */
export const uploadToImageKit = async (fileBuffer, originalName) => {
  try {
    const ext = originalName.split(".").pop() || "png";
    const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName,
      folder: "/ux-crime-profiles",
    });

    return response.url;
  } catch (error) {
    console.error("[ImageKit Service Error]:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};
