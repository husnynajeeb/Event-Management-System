import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
  updateEventSeats,
  uploadCoverImage,
  uploadGalleryImages,
  deleteEventImage,
} from "../controller/event.controller.js";
import { validateAdmin } from "../middleware/validateAdmin.js";
import {
  uploadEventImages,
  uploadCover,
  uploadGallery,
} from "../cloudinary/upload.js";

const eventRouter = express.Router();
/**
 * @swagger
 * /event/create:
 *   post:
 *     summary: Create a new event with cover and gallery images
 *     tags: [Event]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start
 *               - end
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Concert 2026"
 *               description:
 *                 type: string
 *                 example: "Amazing live concert event"
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-10T10:00:00Z"
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-10T13:00:00Z"
 *               location:
 *                 type: string
 *                 example: "Grand Hall"
 *               status:
 *                 type: string
 *                 enum: ["active", "cancelled", "completed"]
 *                 example: "active"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["music", "concert", "live"]
 *               isSeated:
 *                 type: boolean
 *                 example: true
 *               rows:
 *                 type: number
 *                 example: 10
 *               cols:
 *                 type: number
 *                 example: 15
 *               seatType:
 *                 type: string
 *                 enum: ["VIP", "Regular", "Balcony", "Economy"]
 *                 example: "Regular"
 *               seatPrice:
 *                 type: number
 *                 example: 2000
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file (JPEG, PNG, GIF, WebP)
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Gallery images (up to 10 files)
 *     responses:
 *       201:
 *         description: Event created successfully with images
 *         content:
 *           application/json:
 *             example:
 *               message: "Event created successfully"
 *               event:
 *                 _id: "660f1c2e2f8fb814c89b1234"
 *                 title: "Concert 2026"
 *                 description: "Amazing live concert event"
 *                 start: "2026-04-10T10:00:00Z"
 *                 end: "2026-04-10T13:00:00Z"
 *                 location: "Grand Hall"
 *                 status: "active"
 *                 tags: ["music", "concert", "live"]
 *                 isSeated: true
 *                 seats: []
 *                 coverImage: "https://res.cloudinary.com/..."
 *                 galleryImages: ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."]
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - admin access required
 */
// CORRECT - multipart parsing happens first
eventRouter.post("/create", validateAdmin, uploadEventImages, createEvent); /**
 * @swagger
 * /event:
 *   get:
 *     summary: Get all events
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: List of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *             example:
 *               - _id: "660f1c2e2f8fb814c89b1234"
 *                 title: "Demo Event"
 *                 description: "This is a test event for Swagger and API validation."
 *                 start: "2026-04-10T10:00:00Z"
 *                 end: "2026-04-10T13:00:00Z"
 *                 location: "Test Hall"
 *                 status: "active"
 *                 tags: ["demo", "test", "swagger"]
 *                 isSeated: true
 *                 rows: 2
 *                 cols: 2
 *                 seatType: "Regular"
 *                 seatPrice: 1000
 *                 coverImage: "https://example.com/test-cover.jpg"
 *                 galleryImages: ["https://example.com/test-gallery1.jpg", "https://example.com/test-gallery2.jpg"]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed to fetch events"
 */
eventRouter.get("/", getEvents);
/**
 * @swagger
 * /event/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *             example:
 *               _id: "660f1c2e2f8fb814c89b1234"
 *               title: "Demo Event"
 *               description: "This is a test event for Swagger and API validation."
 *               start: "2026-04-10T10:00:00Z"
 *               end: "2026-04-10T13:00:00Z"
 *               location: "Test Hall"
 *               status: "active"
 *               tags: ["demo", "test", "swagger"]
 *               isSeated: true
 *               rows: 2
 *               cols: 2
 *               seatType: "Regular"
 *               seatPrice: 1000
 *               coverImage: "https://example.com/test-cover.jpg"
 *               galleryImages: ["https://example.com/test-gallery1.jpg", "https://example.com/test-gallery2.jpg"]
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Event not found"
 */
eventRouter.get("/:id", getEventById);
/**
 * @swagger
 * /event/{id}:
 *   put:
 *     summary: Update event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *           example:
 *             title: "Updated Demo Event"
 *             description: "This is an updated test event."
 *             start: "2026-04-10T11:00:00Z"
 *             end: "2026-04-10T14:00:00Z"
 *             location: "Updated Hall"
 *             status: "active"
 *             tags: ["demo", "update"]
 *             isSeated: true
 *             rows: 3
 *             cols: 3
 *             seatType: "VIP"
 *             seatPrice: 2000
 *             coverImage: "https://example.com/updated-cover.jpg"
 *             galleryImages: ["https://example.com/updated-gallery1.jpg", "https://example.com/updated-gallery2.jpg"]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *             example:
 *               _id: "660f1c2e2f8fb814c89b1234"
 *               title: "Updated Demo Event"
 *               description: "This is an updated test event."
 *               start: "2026-04-10T11:00:00Z"
 *               end: "2026-04-10T14:00:00Z"
 *               location: "Updated Hall"
 *               status: "active"
 *               tags: ["demo", "update"]
 *               isSeated: true
 *               rows: 3
 *               cols: 3
 *               seatType: "VIP"
 *               seatPrice: 2000
 *               coverImage: "https://example.com/updated-cover.jpg"
 *               galleryImages: ["https://example.com/updated-gallery1.jpg", "https://example.com/updated-gallery2.jpg"]
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "Failed to update event"
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Event not found"
 */
eventRouter.put("/:id", validateAdmin, updateEvent);
/**
 * @swagger
 * /event/{id}:
 *   delete:
 *     summary: Delete event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Event deleted successfully"
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Event not found"
 */
eventRouter.delete("/:id", validateAdmin, deleteEvent);

/**
 * @swagger
 * /event/{id}/cover-image:
 *   post:
 *     summary: Upload cover image for event
 *     tags: [Event Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Cover image uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Cover image uploaded successfully"
 *               event:
 *                 _id: "660f1c2e2f8fb814c89b1234"
 *                 title: "Demo Event"
 *                 coverImage: "https://res.cloudinary.com/..."
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event not found
 */
eventRouter.post(
  "/:id/cover-image",
  validateAdmin,
  uploadCover,
  uploadCoverImage,
);

/**
 * @swagger
 * /event/{id}/gallery-images:
 *   post:
 *     summary: Upload gallery images for event
 *     tags: [Event Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image files (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Gallery images uploaded successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Gallery images uploaded successfully"
 *               event:
 *                 _id: "660f1c2e2f8fb814c89b1234"
 *                 title: "Demo Event"
 *                 galleryImages: ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."]
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event not found
 */
eventRouter.post(
  "/:id/gallery-images",
  validateAdmin,
  uploadGallery,
  uploadGalleryImages,
);

/**
 * @swagger
 * /event/{id}/image:
 *   delete:
 *     summary: Delete an image from event (cover or gallery)
 *     tags: [Event Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of image to delete
 *             required:
 *               - imageUrl
 *           example:
 *             imageUrl: "https://res.cloudinary.com/..."
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Image deleted successfully"
 *               event:
 *                 _id: "660f1c2e2f8fb814c89b1234"
 *                 title: "Demo Event"
 *       404:
 *         description: Event or image not found
 */
eventRouter.delete("/:id/image", validateAdmin, deleteEventImage);

// seat update route for booking integration
eventRouter.put("/:id/seats", updateEventSeats);

export default eventRouter;
