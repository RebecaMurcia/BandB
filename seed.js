const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Room = require('./models/Room');

// Read the JSON data file
const rooms = JSON.parse(fs.readFileSync(`${__dirname}/roomsSeed.json`, 'utf-8'));

const seedDatabase = async () => {
    try {
        // 1. Connect to the database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // 2. Clear out any existing rooms so we don't duplicate them
        await Room.deleteMany();
        console.log('Old room data cleared.');

        // 3. Insert the new seed data
        await Room.create(rooms);
        console.log('Database successfully seeded with new rooms! 🌱');

        // 4. Disconnect safely from the process
        mongoose.disconnect();
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seedDatabase();