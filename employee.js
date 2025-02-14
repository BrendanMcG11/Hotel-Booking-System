import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDw5aeA0uwE7R06Ht1wjkx6TcehPWs0Hac",
  authDomain: "hotel-booking-3aad3.firebaseapp.com",
  projectId: "hotel-booking-3aad3",
  storageBucket: "hotel-booking-3aad3",
  messagingSenderId: "385718256742",
  appId: "1:385718256742:web:03fc7761dbf7e7345ad9a7",
  measurementId: "G-KQCGJEBKQE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const logoutBtn = document.getElementById("logout-btn");
const addRoomBtn = document.getElementById("add-room-btn");
const updateRoomBtn = document.getElementById("update-room-btn");
const roomSelect = document.getElementById("room-select");
const roomIdInput = document.getElementById("room-id");
const roomTypeSelect = document.getElementById("room-type");
const roomPriceInput = document.getElementById("room-price");
const roomAvailabilitySelect = document.getElementById("room-availability");

// Fetch rooms from Firestore and populate the room select dropdown
async function loadRooms() {
  const querySnapshot = await getDocs(collection(db, "rooms"));
  roomSelect.innerHTML = '<option value="">Add new room or select one to edit</option>'; // Reset the dropdown options
  querySnapshot.forEach((doc) => {
    const room = doc.data();
    roomSelect.innerHTML += `<option value="${doc.id}">${room.id} - ${room.type}</option>`;
  });
}

// Fetch room details and pre-fill the form for editing
roomSelect.addEventListener("change", async () => {
  const roomId = roomSelect.value;
  if (!roomId) {
    // Hide update button and show add button if no room is selected
    addRoomBtn.style.display = "block";
    updateRoomBtn.style.display = "none";
    return;
  }

  const roomDocRef = doc(db, "rooms", roomId);
  const roomDocSnap = await getDoc(roomDocRef);

  if (roomDocSnap.exists()) {
    const roomData = roomDocSnap.data();
    roomIdInput.value = roomData.id;
    roomTypeSelect.value = roomData.type;
    roomPriceInput.value = roomData.price;
    roomAvailabilitySelect.value = roomData.available ? "true" : "false";

    // Hide add button and show update button when editing
    addRoomBtn.style.display = "none";
    updateRoomBtn.style.display = "block";
  }
});

// Add room to Firestore
addRoomBtn.addEventListener("click", async () => {
  const roomId = roomIdInput.value.trim();
  const roomType = roomTypeSelect.value.trim();
  const roomPrice = parseFloat(roomPriceInput.value);
  const roomAvailability = roomAvailabilitySelect.value === "true";

  if (!roomId || !roomType || isNaN(roomPrice)) {
    alert("❌ Please fill in all required fields correctly.");
    return;
  }

  try {
    const roomRef = doc(db, "rooms", roomId);
    await setDoc(roomRef, {
      id: roomId,
      type: roomType,
      price: roomPrice,
      available: roomAvailability
    });

    console.log(`✅ Room ${roomId} added to Firestore.`);
    alert("✅ Room added successfully!");

    // Reload rooms to update the dropdown options
    await loadRooms();

  } catch (error) {
    console.error("❌ Firestore Error:", error);
    
    if (error.code === "permission-denied") {
      alert("❌ You do not have permission to add rooms. Ensure you are logged in as an employee.");
    } else {
      alert("❌ Error adding room: " + error.message);
    }
  }
});

// Update room in Firestore
updateRoomBtn.addEventListener("click", async () => {
  const roomId = roomIdInput.value.trim();
  const roomType = roomTypeSelect.value.trim();
  const roomPrice = parseFloat(roomPriceInput.value);
  const roomAvailability = roomAvailabilitySelect.value === "true";

  if (!roomId || !roomType || isNaN(roomPrice)) {
    alert("❌ Please fill in all required fields correctly.");
    return;
  }

  try {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      type: roomType,
      price: roomPrice,
      available: roomAvailability
    });

    console.log(`✅ Room ${roomId} updated in Firestore.`);
    alert("✅ Room updated successfully!");

    // Reload rooms to update the dropdown options
    await loadRooms();

    // Hide update button and show add button after updating
    addRoomBtn.style.display = "block";
    updateRoomBtn.style.display = "none";

  } catch (error) {
    console.error("❌ Firestore Error:", error);
    
    if (error.code === "permission-denied") {
      alert("❌ You do not have permission to update rooms. Ensure you are logged in as an employee.");
    } else {
      alert("❌ Error updating room: " + error.message);
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ User Logged In:", user.uid);

    // Fetch user data from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log("📄 User Data:", userData);

      if (userData.role === "employee" || userData.role === "admin") {
        console.log("✅ User is an employee or admin. Allowing room management.");
        await loadRooms(); // Load rooms after confirming authentication
        if (userData.role === "admin") {
          showAdminFeatures();
        }
      } else {
        console.log("❌ User is NOT an employee or admin. Redirecting...");
        alert("You do not have permission to manage rooms.");
        window.location.href = "index.html"; // Redirect non-employees
      }
    } else {
      console.log("❌ No Firestore document found for user.");
      alert("Error: Your account does not exist in the database.");
      window.location.href = "index.html"; // Redirect unknown users
    }
  } else {
    console.log("🚪 No authenticated user. Redirecting to login...");
    window.location.href = "index.html"; // Redirect to login page
  }
});

function showAdminFeatures() {
  // For example, unhide a special form in employee.html:
  const adminFormContainer = document.getElementById("admin-form-container");
  adminFormContainer.style.display = "block";
}

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("✅ Successfully logged out");

    // Set a flag to prevent redirect loops
    sessionStorage.setItem("logout", "true");

    // Fully clear Firebase session
    localStorage.clear();
    sessionStorage.clear();

    // Delay redirect to ensure Firebase logout completes
    setTimeout(() => {
      window.location.replace("index.html"); // Use replace to prevent back navigation
    }, 1000);
  } catch (error) {
    console.error("❌ Logout failed:", error);
    alert("Error logging out: " + error.message);
  }
});
