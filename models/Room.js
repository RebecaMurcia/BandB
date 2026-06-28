const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A room name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'A room description is required']
    },
    maxGuests: {
        type: Number,
        required: [true, 'Maximum guest capacity is required'],
        min: [1, 'A room must accommodate at least 1 guest']
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Price per night is required'],
        min: [0, 'Price cannot be negative']
    },
    amenities: {
        type: [String], // Array of strings (e.g., ['Wi-Fi', 'King Bed', 'Ocean View'])
        default: []
    },
    images: {
        type: [String], // Array of image URLs
        default: []
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Room', roomSchema);