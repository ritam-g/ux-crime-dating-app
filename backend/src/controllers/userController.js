import { findUserById, updateUser } from "../dao/user.dao.js";

/**
 * Returns the logged-in user's profile.
 * The auth middleware puts the user id on req.user so controllers stay simple.
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
 * Updates the logged-in user's profile.
 * Only approved fields are forwarded to the DAO so the update stays controlled.
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
