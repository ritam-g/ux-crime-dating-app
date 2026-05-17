import User from "../models/User.js";

/**
 * Creates a new user document in MongoDB.
 * The controller is responsible for hashing the password before calling this.
 */
export const createUser = async (userData) => {
  return User.create(userData);
};

/**
 * Finds a user by email.
 * The includePassword flag is useful for login, where we need to compare hashes.
 */
export const findUserByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email });

  if (includePassword) {
    query.select("+password");
  }

  return query;
};

/**
 * Finds a user by id.
 * The includePassword flag is kept here for consistency with the email lookup helper.
 */
export const findUserById = async (userId, includePassword = false) => {
  const query = User.findById(userId);

  if (includePassword) {
    query.select("+password");
  }

  return query;
};

/**
 * Updates only the fields passed in by the controller.
 * This keeps the DAO focused on database work and avoids extra business logic.
 */
export const updateUser = async (userId, updateData) => {
  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
};

/**
 * Updates only the profile picture URL.
 */
export const updateProfileImage = async (userId, imageUrl) => {
  return User.findByIdAndUpdate(
    userId,
    { profileImage: imageUrl },
    { new: true, runValidators: true }
  );
};

/**
 * Updates user profile details like bio, age, gender, etc.
 */
export const updateUserProfile = async (userId, profileData) => {
  return User.findByIdAndUpdate(
    userId,
    profileData,
    { new: true, runValidators: true }
  );
};
