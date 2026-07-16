const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
// Optional: Explicitly tell Express where your template files live (defaults to a folder named "views")
app.set('views', './views');

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies in requests
app.use(express.static('public')); // Serve static frontend files from the public folder

// Swagger Configuration Options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bed & Breakfast API',
            version: '1.0.0',
            description: 'API documentation for the custom B&B booking web application',
        },
    },
    // Path to the API docs (we will look inside our routes folder for endpoints)
    apis: ['./routes/*.js', './server.js'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount Routes
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/room', (req, res) => {
    res.render('room');
});

app.get('/checkout', (req, res) => {
    res.render('checkout'); 
});

app.get('/lookup', (req, res) => {
    res.render('lookup');
});

/**
 * @openapi
 * /:
 *  get:
 *   description: Welcome message for the B&B API
 *   responses:
 *      200:
 *        description: Returns a success string.
 */

// Database Connection & Server Start
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Documentation available at http://localhost:${PORT}/api-docs`);
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error.message);
    });
    
module.exports = app;
