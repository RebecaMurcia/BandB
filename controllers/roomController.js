const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new room
// @route   POST /api/rooms
exports.createRoom = async (req, res) => {
    try {
        const newRoom = await Room.create(req.body);
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};