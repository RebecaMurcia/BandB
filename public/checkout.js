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
    
    // Gather all contact information from the form layout
    const orderPayload = {
        roomId: bookingData.room._id,
        checkIn: bookingData.stay.checkIn,
        checkOut: bookingData.stay.checkOut,
        totalPrice: bookingData.financials.overallTotal,
        guestInfo: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phoneNumber').value,
            email: document.getElementById('email').value,
        },
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
        renderSuccessScreen(result.booking);

    } catch (error) {
        console.error('Booking Submission Error:', error);
        alert(`Sorry, we couldn't process your request: ${error.message}`);
    }
}

function renderSuccessScreen(booking) {
    const mainLayout = document.querySelector('.checkout-layout');
    if (mainLayout) {
        mainLayout.innerHTML = `
            <div class="booking-success-message" style="grid-column: span 2; text-align: center; padding: 4rem 1rem;">
                <h2 style="color: #334231; font-size: 2rem; margin-bottom: 1rem;">✨ Reservation Confirmed!</h2>
                <p style="font-size: 1.2rem; color: #555;">Thank you for choosing Village Goose Bed & Breakfast.</p>
                <p style="margin: 1rem 0 3rem; color: #777;">A detailed summary itinerary has been sent to your email.</p>
                <a href="/" style="background: #334231; color: #fff; padding: 1rem 3rem; text-transform: uppercase; text-decoration: none; letter-spacing: 0.1rem;">Return to Homepage</a>
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