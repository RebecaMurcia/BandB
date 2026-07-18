console.log('Frontend JavaScript successfully connected!');

// ==========================================================================
// 1. PAGE ROUTER / INITIALIZATION FLOW
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    //Homepage Initialization
    if (currentPath === '/' || currentPath === '/index.html') {
        fetchRooms();
    }
    
    //Room Details Page Initialization
    if (currentPath === '/room') {
        initRoomDetailsPage();
    }
});

// Global state management context
let activeRoomData = null;
let selectedDateRange = { checkIn: null, checkOut: null, totalNights: 0 };


// ==========================================================================
// 2. HOMEPAGE ROOMS LIST CODES
// ==========================================================================
async function fetchRooms() {
    try {
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error('Failed to fetch rooms from server');
        
        const rooms = await response.json();
        displayRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        const display = document.getElementById('rooms-display');
        if (display) {
            display.innerHTML = `<p class="error-message">Unable to load rooms at this time.</p>`;
        }
    }
}

function displayRooms(rooms) {
    const roomsContainer = document.getElementById('rooms-display');
    if (!roomsContainer) return;
    
    roomsContainer.innerHTML = '';

    if (rooms.length === 0) {
        roomsContainer.innerHTML = '<p>No accommodations are currently available.</p>';
        return;
    }

    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.classList.add('room-card');
        const roomImage = room.images && room.images.length > 0 ? room.images[0] : 'assets/blue-room.jpg';
        
        roomCard.innerHTML = `
            <a href="/room/${room._id}" class="room-card-link">
                <img src="${roomImage}" alt="${room.name}">
                <div class="room-card-meta">Max Guests: ${room.maxGuests}</div>
                <h3>${room.name}</h3>
                <p class="price">from $${room.pricePerNight}/night</p>
            </a>
        `;
        roomsContainer.appendChild(roomCard);
    });
}


// ==========================================================================
// 3. ROOM DETAILS VIEW ORCHESTRATION
// ==========================================================================
async function initRoomDetailsPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');

    if (!roomId) {
        console.error('No room ID provided in the URL query parameters.');
        showRoomError('No accommodation specified. Please return to the homepage.');
        return;
    }

    try {
        console.log("Checking roomId before fetch:", roomId);
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) throw new Error('Could not find room data in database.');

        const room = await response.json();
        
        // Render texts and kickstart calendar flow safely
        renderRoomDetails(room);
        initializeCalendarFlow(room, room.existingBookings || []);
        
    } catch (error) {
        console.error('Error fetching room view details:', error);
        showRoomError('Unable to load room layout details at this time.');
    }
}

function renderRoomDetails(room) {
    document.title = `${room.name} | Village Goose B&B`;

    const titleNode = document.getElementById('room-title');
    const metaNode = document.getElementById('room-meta');
    const paragraphsNode = document.getElementById('room-paragraphs');
    const amenitiesNode = document.getElementById('room-amenities-list');
    const sliderContainer = document.getElementById('slider-container');
    const summaryNameNode = document.getElementById('summary-room-name');
    const summaryImgNode = document.getElementById('summary-room-img');

    if (titleNode) titleNode.textContent = room.name;
    if (summaryNameNode) summaryNameNode.textContent = room.name;
    
    if (metaNode) {
        const primaryBed = room.amenities && room.amenities.includes('King Bed') ? '1 KING BED' : '2 TWIN BEDS';
        metaNode.textContent = `MAX ${room.maxGuests} GUESTS / ${primaryBed} / $${room.pricePerNight} PER NIGHT`;
    }

    const mainImgSrc = room.images && room.images.length > 0 ? `/${room.images[0]}` : '/assets/blue-room.jpg';
    
    if (sliderContainer) sliderContainer.innerHTML = `<img src="${mainImgSrc}" alt="${room.name}" class="slider-img active">`;
    if (summaryImgNode) {
        summaryImgNode.src = mainImgSrc;
        summaryImgNode.alt = room.name;
    }
    if (paragraphsNode && room.description) paragraphsNode.innerHTML = `<p>${room.description}</p>`;
    if (amenitiesNode && room.amenities) {
        amenitiesNode.innerHTML = room.amenities.map(amenity => `<li>${amenity}</li>`).join('');
    }
}


// ==========================================================================
// 4. CALENDAR MATRIX & REAL-TIME PRICING CALCULATOR
// ==========================================================================
function initializeCalendarFlow(room, existingBookings = []) {
    activeRoomData = room;
    
    const targetInput = document.getElementById('date-range-picker');
    const appendTarget = document.getElementById('inline-calendar-container');

    // Safe Check: Prevent silent crashes if targets aren't loaded in views
    if (!targetInput || !appendTarget) {
        console.warn("Calendar mounting targets missing from DOM.");
        return;
    }

    const disabledDates = existingBookings.map(b => ({
        from: new Date(b.checkIn),
        to: new Date(b.checkOut)
    }));

    // Flatpickr calendar matrix
    flatpickr(targetInput, {
        mode: "range",
        inline: true,
        appendTo: appendTarget,
        minDate: "today",
        showMonths: 2,
        disable: disabledDates,
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                calculatePricingState(selectedDates[0], selectedDates[1]);
            } else {
                toggleReserveButton(false);
            }
        }
    });

    // Handle "Reserve" click 
    const reserveBtn = document.getElementById('reserve-stage-btn');
    if (reserveBtn) {
        // Clean out old listeners before assigning a fresh one
        const clone = reserveBtn.cloneNode(true);
        reserveBtn.parentNode.replaceChild(clone, reserveBtn);
        clone.addEventListener('click', () => renderReceiptSidebar());
    }
}

function calculatePricingState(checkIn, checkOut) {
    const timeDifference = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDifference / (1000 * 3600 * 24));

    selectedDateRange.checkIn = checkIn.toISOString().split('T')[0];
    selectedDateRange.checkOut = checkOut.toISOString().split('T')[0];
    selectedDateRange.totalNights = nights;

    const basePriceTotal = activeRoomData.pricePerNight * nights;
    
    const previewText = document.getElementById('aggregate-price-preview');
    if (previewText) {
        previewText.textContent = `From $${basePriceTotal} total for ${nights} night${nights > 1 ? 's' : ''}`;
    }
    toggleReserveButton(true);
}

function toggleReserveButton(isEnabled) {
    const btn = document.getElementById('reserve-stage-btn');
    if (btn) btn.disabled = !isEnabled;
}


// ==========================================================================
// 5. RECEIPT & CACHING STAGE
// ==========================================================================
function renderReceiptSidebar() {
    const sidebar = document.getElementById('receipt-sidebar-panel');
    if (!sidebar) return;

    const nights = selectedDateRange.totalNights;
    const baseTotal = activeRoomData.pricePerNight * nights;
    const taxesAndFees = +(baseTotal * 0.12).toFixed(2); 
    const overallTotal = +(baseTotal + taxesAndFees).toFixed(2);

    const guestSelect = document.getElementById('booking-guests');
    const guestCount = guestSelect ? guestSelect.value : "1";

    sidebar.innerHTML = `
        <div class="receipt-card">
            <img src="${activeRoomData.images && activeRoomData.images[0] ? '/' + activeRoomData.images[0] : '/assets/blue-room.jpg'}" alt="${activeRoomData.name}">
            <h2>${activeRoomData.name}</h2>
            <p class="rate-subtext">Breakfast Inclusive / ${nights} Night stay</p>
            
            <div class="receipt-billing-row">
                <span>Room Charges</span>
                <span>$${baseTotal.toFixed(2)}</span>
            </div>
            <div class="receipt-billing-row">
                <span>Taxes and fees</span>
                <span>$${taxesAndFees.toFixed(2)}</span>
            </div>
            
            <div class="receipt-billing-row date-marker">
                <span>${selectedDateRange.checkIn} to ${selectedDateRange.checkOut}</span>
                <span>${guestCount} Adult</span>
            </div>

            <div class="receipt-total-row">
                <strong>Total <br><small>Including taxes and fees</small></strong>
                <strong>$${overallTotal.toFixed(2)}</strong>
            </div>

            <button id="checkout-redirect-btn" class="checkout-now-action">Checkout</button>
        </div>
    `;
    sidebar.style.display = 'block';

    document.getElementById('checkout-redirect-btn').addEventListener('click', () => {
        const cartPayload = {
            room: activeRoomData,
            stay: selectedDateRange,
            financials: { baseTotal, taxesAndFees, overallTotal }
        };
        localStorage.setItem('pendingGooseCart', JSON.stringify(cartPayload));
        window.location.href = '/checkout';
    });
}

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