document.addEventListener('DOMContentLoaded', () => {
    const lookupForm = document.getElementById('lookup-form');
    const errorNotice = document.getElementById('lookup-error');
    const searchSection = document.getElementById('search-section');
    const itineraryCard = document.getElementById('itinerary-card');

    if (lookupForm) {
        lookupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorNotice.style.display = 'none';

            const bookingId = document.getElementById('lookupId').value.trim();
            const email = document.getElementById('lookupEmail').value.trim();

            try {
                const response = await fetch('/api/bookings/lookup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId, email })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Could not retrieve your booking.');
                }

                // Format Dates beautifully
                const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                const checkInFormatted = new Date(result.checkInDate).toLocaleDateString('en-US', options);
                const checkOutFormatted = new Date(result.checkOutDate).toLocaleDateString('en-US', options);

                // Populate Dynamic Fields
                document.getElementById('itinerary-id').textContent = `Confirmation Code: ${result._id}`;
                document.getElementById('room-name').textContent = result.room.name;
                document.getElementById('room-img').src = result.room.images && result.room.images[0] ? '/' + result.room.images[0] : '/assets/blue-room.jpg';
                document.getElementById('check-in-val').textContent = checkInFormatted;
                document.getElementById('check-out-val').textContent = checkOutFormatted;
                document.getElementById('guest-name-val').textContent = result.guestName;
                document.getElementById('total-price-val').textContent = `$${result.totalPrice.toFixed(2)}`;

                // Transition Views
                searchSection.style.display = 'none';
                itineraryCard.style.display = 'block';

            } catch (error) {
                errorNotice.textContent = error.message;
                errorNotice.style.display = 'block';
            }
        });
    }
});