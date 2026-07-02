const Booking = require('../models/Booking');
const Room = require('../models/Room');

//  GET /api/bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('room');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/bookings (Create a new booking )
exports.createBooking = async (req, res) => {
    try {
        // Optional: Verify the room actually exists before booking it
        const roomExists = await Room.findById(req.body.room);
        if (!roomExists) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const newBooking = await Booking.create(req.body);
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};