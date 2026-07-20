const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A room name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: [String],
      required: [true, "A room description is required"],
    },
    maxGuests: {
      type: Number,
      required: [true, "Maximum guest capacity is required"],
      min: [1, "A room must accommodate at least 1 guest"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    botanicalIcon: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
