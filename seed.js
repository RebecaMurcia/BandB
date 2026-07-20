const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const Room = require("./models/Room");

const rooms = JSON.parse(
  fs.readFileSync(`${__dirname}/roomsSeed.json`, "utf-8"),
);

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    await Room.deleteMany();
    console.log("Old room data cleared.");

    await Room.create(rooms);
    console.log("Database successfully seeded with new rooms! 🌱");

    mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
