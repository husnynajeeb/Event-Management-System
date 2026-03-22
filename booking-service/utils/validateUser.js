const axios = require("axios");

async function validateUser(token) {
  const userServiceUrl = process.env.USER_URL || "http://localhost:4003";
  try {
    const response = await axios.get(`${userServiceUrl}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.user && response.data.user.role) {
      return { valid: true, user: response.data.user };
    }
    return { valid: false };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

module.exports = { validateUser };
 