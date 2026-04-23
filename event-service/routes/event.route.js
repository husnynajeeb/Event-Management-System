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

/* =========================================================
   CREATE EVENT
========================================================= */
/**
 * @swagger
 * /events/create:
 *   post:
 *     summary: Create a new event with cover and gallery images
 *     tags: [Events]
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
 *               description:
 *                 type: string
 *               start:
 *                 type: string
 *                 format: date-time
 *               end:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, cancelled, completed]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isSeated:
 *                 type: boolean
 *               rows:
 *                 type: number
 *               cols:
 *                 type: number
 *               seatType:
 *                 type: string
 *               seatPrice:
 *                 type: number
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 */
eventRouter.post("/create", validateAdmin, uploadEventImages, createEvent);

/* =========================================================
   GET ALL EVENTS
========================================================= */
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 */
eventRouter.get("/", getEvents);

/* =========================================================
   GET EVENT BY ID
========================================================= */
/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 */
eventRouter.get("/:id", getEventById);

/* =========================================================
   UPDATE EVENT
========================================================= */
/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event by ID
 *     tags: [Events]
 */
eventRouter.put("/:id", validateAdmin, updateEvent);

/* =========================================================
   DELETE EVENT
========================================================= */
/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event by ID
 *     tags: [Events]
 */
eventRouter.delete("/:id", validateAdmin, deleteEvent);

/* =========================================================
   COVER IMAGE
========================================================= */
/**
 * @swagger
 * /events/{id}/cover-image:
 *   post:
 *     summary: Upload cover image
 *     tags: [Event Images]
 */
eventRouter.post(
  "/:id/cover-image",
  validateAdmin,
  uploadCover,
  uploadCoverImage
);

/* =========================================================
   GALLERY IMAGES
========================================================= */
/**
 * @swagger
 * /events/{id}/gallery-images:
 *   post:
 *     summary: Upload gallery images
 *     tags: [Event Images]
 */
eventRouter.post(
  "/:id/gallery-images",
  validateAdmin,
  uploadGallery,
  uploadGalleryImages
);

/* =========================================================
   DELETE IMAGE
========================================================= */
/**
 * @swagger
 * /events/{id}/image:
 *   delete:
 *     summary: Delete image from event
 *     tags: [Event Images]
 */
eventRouter.delete("/:id/image", validateAdmin, deleteEventImage);

/* =========================================================
   UPDATE SEATS
========================================================= */
/**
 * @swagger
 * /events/{id}/seats:
 *   put:
 *     summary: Update event seats
 *     tags: [Events]
 */
eventRouter.put("/:id/seats", updateEventSeats);

export default eventRouter;