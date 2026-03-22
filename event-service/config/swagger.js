import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Service API",
      version: "1.0.0",
      description: "API documentation for the Event Service",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      schemas: {
        Event: {
          type: "object",
          properties: {
            title: { type: "string", example: "Demo Event" },
            description: {
              type: "string",
              example: "This is a test event for Swagger and API validation.",
            },
            start: {
              type: "string",
              format: "date-time",
              example: "2026-04-10T10:00:00Z",
            },
            end: {
              type: "string",
              format: "date-time",
              example: "2026-04-10T13:00:00Z",
            },
            location: { type: "string", example: "Test Hall" },
            status: {
              type: "string",
              enum: ["active", "cancelled", "completed"],
              example: "active",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["demo", "test", "swagger"],
            },
            isSeated: { type: "boolean", example: true },
            rows: { type: "integer", example: 2 },
            cols: { type: "integer", example: 2 },
            seatType: { type: "string", example: "Regular" },
            seatPrice: { type: "integer", example: 1000 },
            coverImage: {
              type: "string",
              example: "https://example.com/test-cover.jpg",
            },
            galleryImages: {
              type: "array",
              items: { type: "string" },
              example: [
                "https://example.com/test-gallery1.jpg",
                "https://example.com/test-gallery2.jpg",
              ],
            },
          },
        },
      },
    },
  },
  apis: ["./routes/event.route.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
