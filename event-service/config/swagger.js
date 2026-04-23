import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Event Service API",
      version: "1.0.0",
      description:
        "Production-grade API documentation for Event Service (Events, Seats, Media Uploads)",
    },

    servers: [
      {
        url: "https://event-service.whitebeach-5fa3a19b.centralindia.azurecontainerapps.io",
        description: "Production Server",
      },
      {
        url: "http://localhost:4000",
        description: "Local Server",
      },
    ],

    tags: [
      {
        name: "Events",
        description: "Core event management APIs",
      },
      {
        name: "Event Images",
        description: "Cover and gallery image management APIs",
      },
    ],

    components: {
      schemas: {
        Event: {
          type: "object",
          required: ["title", "start", "end"],
          properties: {
            _id: { type: "string", example: "660f1c2e2f8fb814c89b1234" },

            title: { type: "string", example: "Demo Event" },

            description: {
              type: "string",
              example: "This is a test event for Swagger",
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
              example: ["music", "live"],
            },

            isSeated: { type: "boolean", example: true },

            rows: { type: "integer", example: 2 },
            cols: { type: "integer", example: 2 },

            seatType: { type: "string", example: "Regular" },
            seatPrice: { type: "number", example: 1000 },

            coverImage: {
              type: "string",
              example: "https://res.cloudinary.com/example.jpg",
            },

            galleryImages: {
              type: "array",
              items: { type: "string" },
              example: [
                "https://res.cloudinary.com/img1.jpg",
                "https://res.cloudinary.com/img2.jpg",
              ],
            },
          },
        },

        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Something went wrong" },
          },
        },
      },
    },
  },

  // IMPORTANT: safer scanning for production
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };