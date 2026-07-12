console.log('Checkout Integration Script Active!');

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the cached booking payload from the calendar page
    const cachedPayload = localStorage.getItem('pendingGooseCart');

    if (!cachedPayload) {
        console.warn('No active reservation found in cart.');
        showCheckoutError('Your cart is empty. Please return to our accommodations page to select a room.');
        return;
    }

    const bookingData = JSON.parse(cachedPayload);
    
    // UI fields
    hydrateReceiptSidebar(bookingData);

    //Handle Final Checkout Order Submission
    const checkoutForm = document.getElementById('final-booking-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => handleOrderSubmission(e, bookingData));
    }
});

// Dynamically paint the right-side summary column using saved local storage data
function hydrateReceiptSidebar(payload) {
    const { room, stay, financials } = payload;
    const receiptTarget = document.getElementById('checkout-receipt-target');
    const depositHighlight = document.getElementById('deposit-highlight');

    if (depositHighlight) {
        depositHighlight.textContent = `$${financials.overallTotal.toFixed(2)} deposit due today.`;
    }

    if (receiptTarget) {
        receiptTarget.innerHTML = `
            <div class="receipt-card dynamic-checkout-view">
                <img src="${room.images && room.images[0] ? '/' + room.images[0] : '/assets/blue-room.jpg'}" alt="${room.name}">
                <h2>${room.name}</h2>
                <p class="rate-subtext">Breakfast Inclusive / ${stay.totalNights} Night stay</p>
                
                <div class="receipt-billing-row">
                    <span>Room Charges</span>
                    <span>$${financials.baseTotal.toFixed(2)}</span>
                </div>
                <div class="receipt-billing-row">
                    <span>Taxes and fees</span>
                    <span>$${financials.taxesAndFees.toFixed(2)}</span>
                </div>
                
                <div class="receipt-billing-row date-marker">
                    <span>${stay.checkIn} to ${stay.checkOut}</span>
                </div>

                <div class="receipt-total-row">
                    <strong>Total <br><small>Including taxes and fees</small></strong>
                    <strong>$${financials.overallTotal.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }
}

// Package everything together and POSTs to the backend database
async function handleOrderSubmission(e, bookingData) {
    e.preventDefault();
    
    console.log("Submitting order for Room Object:", bookingData.room);
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    // Gather all contact information from the form layout
    const orderPayload = {
        room: bookingData.room._id,
        checkInDate: bookingData.stay.checkIn,
        checkOutDate: bookingData.stay.checkOut,
        guestName: `${firstName} ${lastName}`,
        guestEmail: document.getElementById('email').value,

        totalPrice: bookingData.financials.overallTotal,
        guestPhone: document.getElementById('phoneNumber').value,
        address: {
            country: document.getElementById('country').value,
            address1: document.getElementById('address1').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
        }
    };

    try {
        // Send transaction payload directly to the backend API endpoint
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Transaction could not be completed.');
        }
        // Clean out cache upon successful booking submission
        localStorage.removeItem('pendingGooseCart');
        
        // Success layout screen
        renderSuccessScreen(result);

    } catch (error) {
        console.error('Booking Submission Error:', error);
        alert(`Sorry, we couldn't process your request: ${error.message}`);
    }
}

function renderSuccessScreen(booking) {
    const mainLayout = document.querySelector('.checkout-layout');
    const pageTitle = document.querySelector('.checkout-title');
    
    if (pageTitle) pageTitle.textContent = "Reservation Confirmed";

    if (mainLayout) {
        // 1. Safely grab elements before modifying the DOM layout
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');

        // 2. Resolve final names and emails cleanly without redeclaring variables
        const finalGuestName = (firstNameInput && lastNameInput) 
            ? `${firstNameInput.value} ${lastNameInput.value}` 
            : (booking.guestName || "Guest");
            
        const finalGuestEmail = emailInput 
            ? emailInput.value 
            : (booking.guestEmail || "your email");

        // 3. Inject the clean success template layout card
        mainLayout.innerHTML = `
            <div class="booking-success-container">
                <div class="success-icon-wrap">
                    <span class="goose-feather-icon">✨</span>
                </div>
                
                <h2>Thank you for your reservation, ${finalGuestName}!</h2>
                <p class="success-subtext">Your stay at The Village Goose Bed & Breakfast has been securely registered.</p>
                
                <hr class="decorative-divider">
                
                <div class="confirmation-details-card">
                    <h3>Reservation Summary</h3>
                    <div class="summary-line">
                        <span>Status:</span>
                        <span class="status-badge">Paid & Guaranteed</span>
                    </div>
                    <div class="summary-line">
                        <span>Confirmation Email:</span>
                        <strong>${finalGuestEmail}</strong>
                    </div>
                    <p class="itinerary-notice">
                        A digital copy of your itinerary, check-in instructions, and local property guides has been dispatched to your email address. 
                    </p>
                </div>

                <a href="/" class="return-home-btn">Return to Homepage</a>
            </div>
        `;
    }
}

function showCheckoutError(message) {
    const target = document.getElementById('checkout-receipt-target');
    if (target) {
        target.innerHTML = `<div class="error-notice" style="color: #b0413e;">${message}</div>`;
    }
}