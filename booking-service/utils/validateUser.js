const axios = require("axios");

async function validateUser(token) {
  const userServiceUrl = process.env.USER_URL || "http://localhost:4003";

  if (!token) {
    console.log("❌ No token provided");
    return { valid: false };
  }

  try {
    console.log("🔍 Validating token:", token);

    const response = await axios.get(`${userServiceUrl}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ User service response:", response.data);

    if (response.data && response.data.user && response.data.user.role) {
      return { valid: true, user: response.data.user };
    }

    return { valid: false };
  } catch (error) {
    console.log("❌ Validation error:", error.message);
    return { valid: false, error: error.message };
  }
}

module.exports = { validateUser };