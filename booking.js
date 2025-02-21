// Minimal example: no Firestore code, just a hardcoded set of "booked" dates
// In your actual app, you might fetch these from Firestore instead.

let currentMonth = new Date().getMonth();  // 0 = January, 11 = December
let currentYear = new Date().getFullYear();

// Hardcoded booked dates (in "YYYY-MM-DD" format) for demo
const bookedDates = new Set(["2025-03-10", "2025-03-14", "2025-03-17"]);

// Track the user's selected range
let selectedCheckIn = null;
let selectedCheckOut = null;

// Track the room ID (for demo purposes, we'll use a hardcoded room ID)
const roomId = "room1";

// Data structure to store booked dates for each room
const roomBookings = {
  room1: [],
  room2: [],
  // Add more rooms as needed
};

window.addEventListener("DOMContentLoaded", () => {
  // Render the initial month on page load
  renderCalendar(currentYear, currentMonth);

  // Next/Previous month buttons
  document.getElementById("prev-month").addEventListener("click", () => {
    changeMonth(-1);
  });
  document.getElementById("next-month").addEventListener("click", () => {
    changeMonth(1);
  });

  // Confirm booking button
  document.getElementById("confirm-booking").addEventListener("click", () => {
    const statusEl = document.getElementById("booking-status");
    if (!selectedCheckIn || !selectedCheckOut) {
      statusEl.textContent = "Please select a valid date range.";
      return;
    }

    // Save the selected dates in the roomBookings array
    const checkInDate = new Date(selectedCheckIn);
    const checkOutDate = new Date(selectedCheckOut);
    for (let d = checkInDate; d < checkOutDate; d.setDate(d.getDate() + 1)) {
      roomBookings[roomId].push(d.toISOString().split("T")[0]);
    }

    statusEl.textContent = `Booked from ${selectedCheckIn} to ${selectedCheckOut} for ${roomId}!`;
    console.log(roomBookings); // For debugging purposes
  });
});

// Renders a calendar for the given year and month
function renderCalendar(year, month) {
  const container = document.getElementById("calendar-container");
  container.innerHTML = "";

  // First day (e.g., March 1)
  const firstDayOfMonth = new Date(year, month, 1);
  // Last day (e.g., March 31)
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon, ...
  const totalDays = lastDayOfMonth.getDate(); // e.g., 31

  // Blank placeholders for days before the 1st
  for (let i = 0; i < startDay; i++) {
    const placeholder = document.createElement("div");
    placeholder.classList.add("calendar-day");
    placeholder.style.visibility = "hidden";
    container.appendChild(placeholder);
  }

  // Create each day cell
  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");
    dayDiv.textContent = day;

    // Build "YYYY-MM-DD"
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().split("T")[0];

    // If date is booked, mark it as booked
    if (bookedDates.has(dateStr)) {
      dayDiv.classList.add("booked");
    } else {
      // If not booked, allow user to select it
      dayDiv.addEventListener("click", () => onDateClick(dateStr));

      // If it's in the user's selected range, highlight it
      if (isDateInSelectedRange(dateStr)) {
        dayDiv.classList.add("selected");
      }
    }

    container.appendChild(dayDiv);
  }

  // Update the "Selected Range" text
  updateSelectedRangeText();
}

// Handle user clicking on an available date
function onDateClick(dateStr) {
  // If no check-in selected, pick this as check-in
  if (!selectedCheckIn) {
    selectedCheckIn = dateStr;
    selectedCheckOut = null;
  }
  // If check-in is selected, but check-out is not
  else if (selectedCheckIn && !selectedCheckOut) {
    // Ensure check-out is after check-in
    if (dateStr > selectedCheckIn) {
      selectedCheckOut = dateStr;
    } else {
      // If user clicks an earlier date, reset
      selectedCheckIn = dateStr;
      selectedCheckOut = null;
    }
  }
  // If both are selected, reset and set new check-in
  else {
    selectedCheckIn = dateStr;
    selectedCheckOut = null;
  }

  // Re-render the calendar with updated selection
  renderCalendar(currentYear, currentMonth);
}

// Check if dateStr is within the selected range
function isDateInSelectedRange(dateStr) {
  if (!selectedCheckIn || !selectedCheckOut) return false;
  return dateStr >= selectedCheckIn && dateStr < selectedCheckOut;
}

// Update the displayed text for the selected range
function updateSelectedRangeText() {
  const rangeEl = document.getElementById("selected-range");
  if (selectedCheckIn && selectedCheckOut) {
    rangeEl.textContent = `${selectedCheckIn} to ${selectedCheckOut}`;
  } else if (selectedCheckIn) {
    rangeEl.textContent = `${selectedCheckIn} (select check-out)`;
  } else {
    rangeEl.textContent = "None";
  }
}

// Move to the previous or next month
function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
}