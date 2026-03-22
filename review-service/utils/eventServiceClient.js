// review-service/services/eventServiceClient.js
const axios = require("axios");

const EVENT_SERVICE_URL = process.env.EVENT_URL || "http://event-service:4000";

async function getEventById(eventId) {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    return null; // or handle/log error as needed
  }
}

module.exports = { getEventById };
