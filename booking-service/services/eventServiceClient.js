const axios = require("axios");

const eventServiceUrl = process.env.EVENT_URL || "http://localhost:4000";

async function validateEvent(eventId) {
  try {
    const response = await axios.get(`${eventServiceUrl}/events/${eventId}`);
    if (response.status === 200 && response.data && response.data._id) {
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function updateEvent(eventId, payload, token) {
  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
  const response = await axios.put(`${eventServiceUrl}/events/${eventId}`, payload, {
    headers,
  });
  return response.data;
}

// Backward-compatible exports:
// - const validateEvent = require(...)
// - const { validateEvent, updateEvent } = require(...)
module.exports = validateEvent;
module.exports.validateEvent = validateEvent;
module.exports.updateEvent = updateEvent;
