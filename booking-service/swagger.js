const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 4001;

// IMPORTANT: switch between local and Azure automatically
const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://booking-service.whitebeach-5fa3a19b.centralindia.azurecontainerapps.io"
    : `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Booking Service API",
      version: "1.0.0",
      description: "API documentation for the Booking Service",
    },

    servers: [
      {
        url: SERVER_URL,
        description: "Booking Service Server",
      },
    ],
  },

  apis: ["./routes/*.js"], // IMPORTANT FIX (broader + safer)
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};