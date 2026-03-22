const axios = require("axios");

// Get the user service API URL from environment variables or default to localhost
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://user-service:4003";

/**
 * Validate the user token with the User Service
 * @param {string} token - The JWT token from the request header
 * @returns {Promise<Object>} - The user object if valid, or null if invalid
 */
const validateUser = async (token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.user) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    console.error("Error validating user:", error.message);
    return null;
  }
};

module.exports = { validateUser };