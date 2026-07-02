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

// PUT - Update a booking by ID
exports.updateBooking = async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('room');

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE -  Delete/Cancel a booking by ID
exports.deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking successfully removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};