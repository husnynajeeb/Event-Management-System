const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const  validateUserMiddleware  = require('../middleware/validateUserMiddleware');

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               event_id:
 *                 type: string
 *               event_name:
 *                 type: string
 *               ticket_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Bad request
 */
router.post('/', validateUserMiddleware, bookingController.createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/',validateUserMiddleware, bookingController.getBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Booking not found
 */
router.get('/:id',validateUserMiddleware, bookingController.getBookingById);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Booking updated
 *       404:
 *         description: Booking not found
 */
router.put('/:id',validateUserMiddleware, bookingController.updateBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted
 *       404:
 *         description: Booking not found
 */
router.delete('/:id',validateUserMiddleware, bookingController.deleteBooking);

module.exports = router;
