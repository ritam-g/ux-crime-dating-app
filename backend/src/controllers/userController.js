import {
  findUserById,
  updateUser,
  updateProfileImage,
  updateUserProfile as updateProfileDao,
} from "../dao/user.dao.js";
import { uploadToImageKit } from "../services/imageUpload.service.js";

/**
 * @file userController.js
 * @description Handles user profile queries, metadata editing, and ImageKit profile picture uploads.
 */

/**
 * Returns the logged-in user's profile.
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

/**
 * Updates the logged-in user's profile details.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, age, gender, bio, interests } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;

    const updatedUser = await updateUser(req.user.id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

/**
 * Uploads a profile image via Multer stream buffer and records Hosted URL in User Model.
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Call external ImageKit gateway service
    const hostedUrl = await uploadToImageKit(req.file.buffer, req.file.originalname);

    // Save strictly via DAO
    const updatedUser = await updateProfileImage(req.user.id, hostedUrl);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};

/**
 * Custom profile updater matching requirements.
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, bio, interests, profileImage } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const updatedUser = await updateProfileDao(req.user.id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

