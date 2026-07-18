document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // 1. CAROUSEL IMAGES SLIDER FLOW
    let currentIndex = 0;

    function showSlide(index) {
        if (slides.length <= 1) return; // Guard clause if single asset exists
        
        // Handle boundaries
        if (index >= slides.length) currentIndex = 0;
        else if (index < 0) currentIndex = slides.length - 1;
        else currentIndex = index;

        // Update slides
        slides.forEach(slide => slide.classList.remove('active'));
        slides[currentIndex].classList.add('active');

        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }

    // Event Listeners for Buttons (Only initialize if buttons exist in view)
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
        prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    }

    // Event Listeners for Dots
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const targetIndex = parseInt(e.target.dataset.index);
            showSlide(targetIndex);
        });
    });

    // Optional: Auto-play every 5 seconds
    if (slides.length > 1) {
        setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    }

    // =========================================================================
    // 2. INLINE DOUBLE CALENDAR & RECEIPT SIDEBAR SYSTEM
    // =========================================================================
    const dateRangePicker = document.getElementById('date-range-picker');
    const reserveBtn = document.getElementById('reserve-stage-btn');
    const pricePreview = document.getElementById('aggregate-price-preview');
    
    let globalTotalNights = 0; // Tracks stay window duration globally inside DOM scope

    if (dateRangePicker) {
        flatpickr("#inline-calendar-container", {
            inline: true,          // Keeps the calendar permanently open on the page grid
            mode: "range",         // Allows clicking a check-in date followed by a check-out date
            showMonths: 2,         // Displays a double-month split screen panel
            minDate: "today",      // Disables past dates so guests can't book backwards
            dateFormat: "Y-m-d",
            
            onChange: function(selectedDates, dateStr, instance) {
                // Sync the selected date range text into your input display bar
                dateRangePicker.value = dateStr;

                // Once they choose BOTH check-in and check-out, unlock the screen flow
                if (selectedDates.length === 2) {
                    reserveBtn.disabled = false;
                    
                    // Calculate total nights
                    const msPerDay = 1000 * 60 * 60 * 24;
                    globalTotalNights = Math.round((selectedDates[1] - selectedDates[0]) / msPerDay);
                    
                    pricePreview.textContent = `${globalTotalNights} night${globalTotalNights > 1 ? 's' : ''} selected. Ready to book!`;
                } else {
                    // Lock button back down if they only picked one date
                    reserveBtn.disabled = true;
                    globalTotalNights = 0;
                    pricePreview.textContent = "Select check-out date to view pricing details";
                }
            }
        });
    }

    // Handle clicks on the Reserve button to show the sidebar breakout panel
   // Handle clicks on the Reserve button to show the sidebar breakout panel
    if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
            const receiptSidebar = document.getElementById('receipt-sidebar-panel');
            const pricePerNight = parseFloat(reserveBtn.getAttribute('data-price')) || 0;
            
            if (globalTotalNights > 0 && receiptSidebar) {
                // Calculate financial metrics
                const subtotal = pricePerNight * globalTotalNights;
                const tax = subtotal * 0.10; // Standard 10% room occupancy tax rate
                const grandTotal = subtotal + tax;

                // Inject the receipt breakout template layout panel
                receiptSidebar.innerHTML = `
                    <div class="receipt-card">
                        <h3>Reservation Summary</h3>
                        <hr class="receipt-divider">
                        <div class="receipt-row">
                            <span>$${pricePerNight} x ${globalTotalNights} night${globalTotalNights > 1 ? 's' : ''}</span>
                            <strong>$${subtotal.toFixed(2)}</strong>
                        </div>
                        <div class="receipt-row">
                            <span>Occupancy Taxes & Fees (10%)</span>
                            <span>$${tax.toFixed(2)}</span>
                        </div>
                        <hr class="receipt-divider">
                        <div class="receipt-row total-row">
                            <span>Total Est. Cost</span>
                            <span class="total-price-accent">$${grandTotal.toFixed(2)}</span>
                        </div>
                        <button class="confirm-booking-btn" id="sidebar-confirm-pay-btn">
                            Confirm & Pay
                        </button>
                    </div>
                `;

                // Reveal the side breakout panel smoothly
                receiptSidebar.style.display = 'block';
                
                // Smooth scroll to view it cleanly on smaller device bounds
                receiptSidebar.scrollIntoView({ behavior: 'smooth' });

                // =========================================================================
                // 💡 CONNECT TO CHECKOUT FLOW VIA LOCALSTORAGE
                // =========================================================================
                const confirmPayBtn = document.getElementById('sidebar-confirm-pay-btn');
                if (confirmPayBtn) {
                    confirmPayBtn.addEventListener('click', () => {
                        // Dynamically grab the first slider image URL directly from your page layout elements
                        const firstSlideImg = document.querySelector('.carousel-slide img');
                        const detectedImageSrc = firstSlideImg ? firstSlideImg.getAttribute('src').replace(/^\//, '') : 'assets/blue-room.jpg';

                        // 1. Build the exact payload format your checkout.js expects
                        const bookingPayload = {
                            room: {
                                _id: window.location.pathname.split('/').pop(), // Grabs the active room MongoDB ID from the URL path
                                name: document.querySelector('.room-text-details h1')?.textContent || 'Boutique Room',
                                images: [detectedImageSrc] 
                            },
                            stay: {
                                checkIn: dateRangePicker.value.split(' to ')[0] || '',
                                checkOut: dateRangePicker.value.split(' to ')[1] || '',
                                totalNights: globalTotalNights
                            },
                            financials: {
                                baseTotal: subtotal,
                                taxesAndFees: tax,
                                overallTotal: grandTotal
                            }
                        };

                        // 2. Save payload to local cache
                        localStorage.setItem('pendingGooseCart', JSON.stringify(bookingPayload));

                        // 3. Sweep the guest to the final confirmation form layout
                        window.location.href = '/checkout';
                    });
                }
            }
        });
    }
});