import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDw5aeA0uwE7R06Ht1wjkx6TcehPWs0Hac",
    authDomain: "hotel-booking-3aad3.firebaseapp.com",
    projectId: "hotel-booking-3aad3",
    storageBucket: "hotel-booking-3aad3.firebasestorage.app",
    messagingSenderId: "385718256742",
    appId: "1:385718256742:web:03fc7761dbf7e7345ad9a7",
    measurementId: "G-KQCGJEBKQE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");
document.getElementById("room-id").textContent = roomId || "Not Selected";

document.getElementById("confirm-booking").addEventListener("click", async () => {
    const checkIn = document.getElementById("check-in").value;
    const checkOut = document.getElementById("check-out").value;

    if (!checkIn || !checkOut) {
        document.getElementById("booking-status").textContent = "Please select check-in and check-out dates.";
        return;
    }

    try {
        await addDoc(collection(db, "bookings"), {
            roomId,
            checkIn,
            checkOut
        });

        document.getElementById("booking-status").textContent = "Booking confirmed!";
    } catch (error) {
        console.error("Error booking room: ", error);
        document.getElementById("booking-status").textContent = "Booking failed. Try again.";
    }
});
