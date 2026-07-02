const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: Retrieve a list of all reservations
 *     responses:
 *       200:
 *         description: A list of bookings.
 *   post:
 *     summary: Create a new room reservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - guestName
 *               - guestEmail
 *               - checkInDate
 *               - checkOutDate
 *               - totalPrice
 *             properties:
 *               room:
 *                 type: string
 *               description: The MongoDB ObjectId of the room being booked
 *               guestName:
 *                 type: string
 *               guestEmail:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               totalPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *       400:
 *         description: Invalid input data or checkout date precedes check-in.
 */
router.route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

module.exports = router;