const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

/**
 * @openapi
 * /api/rooms:
 *   get:
 *     summary: Retrieve a list of all B&B rooms
 *     responses:
 *       200:
 *         description: A list of rooms.
 *   post:
 *     summary: Add a new room to the B&B inventory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - maxGuests
 *               - pricePerNight
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               maxGuests:
 *                 type: number
 *               pricePerNight:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Room created successfully.
 *       400:
 *         description: Invalid input data.
 */
router.route('/')
    .get(roomController.getAllRooms)
    .post(roomController.createRoom);

module.exports = router;