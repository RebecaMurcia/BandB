document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  // =========================================================================
  // TOP SLIDER BANNER
  // =========================================================================
  let currentIndex = 0;

  function showSlide(index) {
    if (slides.length <= 1) return;

    if (index >= slides.length) currentIndex = 0;
    else if (index < 0) currentIndex = slides.length - 1;
    else currentIndex = index;

    slides.forEach((slide) => slide.classList.remove("active"));
    slides[currentIndex].classList.add("active");

    dots.forEach((dot) => dot.classList.remove("active"));
    dots[currentIndex].classList.add("active");
  }

  // Event Listeners for Buttons
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
    prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
  }

  // Event Listeners for Dots
  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      const targetIndex = parseInt(e.target.dataset.index);
      showSlide(targetIndex);
    });
  });

  // Auto-play every 5 seconds
  if (slides.length > 1) {
    setInterval(() => {
      showSlide(currentIndex + 1);
    }, 5000);
  }

  // =========================================================================
  // INLINE DOUBLE CALENDAR & RECEIPT SIDEBAR SYSTEM
  // =========================================================================
  const dateRangePicker = document.getElementById("date-range-picker");
  const reserveBtn = document.getElementById("reserve-stage-btn");
  const pricePreview = document.getElementById("aggregate-price-preview");

  let globalTotalNights = 0;

  if (dateRangePicker) {
    flatpickr("#inline-calendar-container", {
      inline: true,
      mode: "range",
      showMonths: 2,
      minDate: "today",
      dateFormat: "Y-m-d",

      onChange: function (selectedDates, dateStr, instance) {
        dateRangePicker.value = dateStr;

        if (selectedDates.length === 2) {
          reserveBtn.disabled = false;

          const msPerDay = 1000 * 60 * 60 * 24;
          globalTotalNights = Math.round(
            (selectedDates[1] - selectedDates[0]) / msPerDay,
          );

          pricePreview.textContent = `${globalTotalNights} night${globalTotalNights > 1 ? "s" : ""} selected. Ready to book!`;
        } else {
          reserveBtn.disabled = true;
          globalTotalNights = 0;
          pricePreview.textContent =
            "Select check-out date to view pricing details";
        }
      },
    });
  }

  if (reserveBtn) {
    reserveBtn.addEventListener("click", () => {
      const receiptSidebar = document.getElementById("receipt-sidebar-panel");
      const pricePerNight =
        parseFloat(reserveBtn.getAttribute("data-price")) || 0;

      if (globalTotalNights > 0 && receiptSidebar) {
        const subtotal = pricePerNight * globalTotalNights;
        const tax = subtotal * 0.1;
        const grandTotal = subtotal + tax;

        receiptSidebar.innerHTML = `
                    <div class="receipt-card">
                        <h3>Reservation Summary</h3>
                        <hr class="receipt-divider">
                        <div class="receipt-row">
                            <span>$${pricePerNight} x ${globalTotalNights} night${globalTotalNights > 1 ? "s" : ""}</span>
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

        receiptSidebar.style.display = "block";

        receiptSidebar.scrollIntoView({ behavior: "smooth" });

        // =========================================================================
        // CONNECT TO CHECKOUT FLOW VIA LOCALSTORAGE
        // =========================================================================
        const confirmPayBtn = document.getElementById(
          "sidebar-confirm-pay-btn",
        );
        if (confirmPayBtn) {
          confirmPayBtn.addEventListener("click", () => {
            const firstSlideImg = document.querySelector(".carousel-slide img");
            const detectedImageSrc = firstSlideImg
              ? firstSlideImg.getAttribute("src").replace(/^\//, "")
              : "assets/blue-room.jpg";

            const bookingPayload = {
              room: {
                _id: window.location.pathname.split("/").pop(),
                name:
                  document.querySelector(".room-text-details h1")
                    ?.textContent || "Boutique Room",
                images: [detectedImageSrc],
              },
              stay: {
                checkIn: dateRangePicker.value.split(" to ")[0] || "",
                checkOut: dateRangePicker.value.split(" to ")[1] || "",
                totalNights: globalTotalNights,
              },
              financials: {
                baseTotal: subtotal,
                taxesAndFees: tax,
                overallTotal: grandTotal,
              },
            };

            localStorage.setItem(
              "pendingGooseCart",
              JSON.stringify(bookingPayload),
            );

            window.location.href = "/checkout";
          });
        }
      }
    });
  }
});
