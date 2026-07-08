console.log('Frontend JavaScript successfully connected!');

document.addEventListener('DOMContentLoaded', () => {
    fetchRooms();
});

// Fetch all rooms from our REST API
async function fetchRooms() {
    try {
        const response = await fetch('/api/rooms');
        if (!response.ok) {
            throw new Error('Failed to fetch rooms from server');
        }
        
        const rooms = await response.json();
        displayRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        document.getElementById('rooms-display').innerHTML = `
            <p class="error-message">Unable to load rooms at this time. Please try again later.</p>
        `;
    }
}

// Dynamically inject the room cards into the HTML grid
function displayRooms(rooms) {
    const roomsContainer = document.getElementById('rooms-display');
    
    // Clear out any loading placeholders
    roomsContainer.innerHTML = '';

    if (rooms.length === 0) {
        roomsContainer.innerHTML = '<p>No accommodations are currently available.</p>';
        return;
    }

    // Generate cards using template literals
    rooms.forEach(room => {
        // Fallback placeholder image if none provided
        const roomImage = room.images && room.images.length > 0 
            ? room.images[0] 
            : 'https://via.placeholder.com/300x200?text=Cozy+Room';

        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        
        roomCard.innerHTML = `
            <img src="${roomImage}" alt="${room.name}">
            <div class="room-card-meta">Max Guests: ${room.maxGuests}</div>
            <h3>${room.name}</h3>
            <p class="price">from $${room.pricePerNight}/night</p>
        `;
        
        roomsContainer.appendChild(roomCard);
    });
}

// Inside your rooms.forEach(room => { ... }) block in app.js:
roomCard.innerHTML = `
    <a href="/room.html?id=${room._id}" class="room-card-link">
        <img src="${roomImage}" alt="${room.name}">
        <div class="room-card-meta">Max Guests: ${room.maxGuests}</div>
        <h3>${room.name}</h3>
        <p class="price">from $${room.pricePerNight}/night</p>
    </a>
`;