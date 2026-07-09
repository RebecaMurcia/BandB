console.log('Frontend JavaScript successfully connected!');

document.addEventListener('DOMContentLoaded', () => {
    fetchRooms();
});

// Fetch all rooms from REST API
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
       
        const roomCard = document.createElement('div');
    roomCard.classList.add('room-card');

    const roomImage = room.images && room.images.length > 0 ? room.images[0] : 'assets/blue-room.jpg';
        
        roomCard.innerHTML = `
    <a href="/room?id=${room._id}" class="room-card-link">
        <img src="${roomImage}" alt="${room.name}">
        <div class="room-card-meta">Max Guests: ${room.maxGuests}</div>
        <h3>${room.name}</h3>
        <p class="price">from $${room.pricePerNight}/night</p>
    </a>
`;    
        roomsContainer.appendChild(roomCard);
    });
}


// Run initialization checks when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the individual room details page
    if (window.location.pathname === '/room') {
        initRoomDetailsPage();
    }
});

// Main orchestrator for the Room Details View
async function initRoomDetailsPage() {
    // 1. Extract the URL query parameters (e.g., ?id=65f1a2...)
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (!roomId) {
        console.error('No room ID provided in the URL query parameters.');
        showRoomError('No accommodation specified. Please return to the homepage.');
        return;
    }

    try {
        // 2. Fetch the specific room data from the backend API endpoint
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) {
            throw new Error('Could not find room data in the system database.');
        }

        const room = await response.json();
        
        // 3. Render the live database data into the EJS template placeholders
        renderRoomDetails(room);
        
    } catch (error) {
        console.error('Error fetching room view details:', error);
        showRoomError('Unable to load room layout details at this time.');
    }
}

// Inject the real MongoDB data directly into the designed layout structure
function renderRoomDetails(room) {
    // Update Document Title
    document.title = `${room.name} | Village Goose B&B`;

    // Target structural DOM nodes
    const titleNode = document.getElementById('room-title');
    const metaNode = document.getElementById('room-meta');
    const paragraphsNode = document.getElementById('room-paragraphs');
    const amenitiesNode = document.getElementById('room-amenities-list');
    const sliderContainer = document.getElementById('slider-container');
    const summaryNameNode = document.getElementById('summary-room-name');
    const summaryImgNode = document.getElementById('summary-room-img');

    // Populate core text strings
    if (titleNode) titleNode.textContent = room.name;
    if (summaryNameNode) summaryNameNode.textContent = room.name;
    
    if (metaNode) {
        const primaryBed = room.amenities && room.amenities.includes('King Bed') ? '1 KING BED' : '2 TWIN BEDS';
        metaNode.textContent = `MAX ${room.maxGuests} GUESTS / ${primaryBed} / $${room.pricePerNight} PER NIGHT`;
    }

    // Set fallback image asset if database array is completely empty
    const mainImgSrc = room.images && room.images.length > 0 ? `/${room.images[0]}` : '/assets/blue-room.jpg';
    
    if (sliderContainer) {
        sliderContainer.innerHTML = `<img src="${mainImgSrc}" alt="${room.name}" class="slider-img active">`;
    }
    if (summaryImgNode) {
        summaryImgNode.src = mainImgSrc;
        summaryImgNode.alt = room.name;
    }

    // Populate the Description Blocks dynamically
    if (paragraphsNode && room.description) {
        paragraphsNode.innerHTML = `<p>${room.description}</p>`;
    }

    // Populate the Interactive "What This Room Offers" dynamic list
    if (amenitiesNode && room.amenities) {
        amenitiesNode.innerHTML = room.amenities.map(amenity => `<li>${amenity}</li>`).join('');
    }
}

// Fallback message helper if fetch loop breaks or ID is incorrect
function showRoomError(message) {
    const mainContent = document.querySelector('.room-page-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem;">
                <h2 style="font-family: Georgia, serif; color: #334231;">Accommodation Not Found</h2>
                <p style="margin: 1rem 0 2rem; color: #666;">${message}</p>
                <a href="/" style="background: #838e7f; color: #fff; padding: 0.75rem 2rem; text-decoration: none;">Return Home</a>
            </div>
        `;
    }
}