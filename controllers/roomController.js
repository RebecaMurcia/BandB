const Room = require('../models/Room');

//  GET all rooms
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//  POST - Create a new room
exports.createRoom = async (req, res) => {
    try {
        const newRoom = await Room.create(req.body);
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT -  Update a room by ID
exports.updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // returns the modified document and re-runs schema checks
        );
        
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE - Delete a room by ID
exports.deleteRoom = async (req, res) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        
        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        
        res.status(200).json({ message: 'Room successfully removed from inventory' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};