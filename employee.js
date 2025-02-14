import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, setDoc , getDoc} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const logoutBtn = document.getElementById("logout-btn");
const addRoomBtn = document.getElementById("add-room-btn");

// Add room to Firestore
addRoomBtn.addEventListener("click", async () => {
  const roomId = document.getElementById("room-id").value.trim();
  const roomType = document.getElementById("room-type").value.trim();
  const roomPrice = parseFloat(document.getElementById("room-price").value);
  const roomAvailability = document.getElementById("room-availability").value === "true";

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

  } catch (error) {
    console.error("❌ Firestore Error:", error);
    
    if (error.code === "permission-denied") {
      alert("❌ You do not have permission to add rooms. Ensure you are logged in as an employee.");
    } else {
      alert("❌ Error adding room: " + error.message);
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

      if (userData.role === "employee") {
        console.log("✅ User is an employee. Allowing room creation.");
      } else {
        console.log("❌ User is NOT an employee. Redirecting...");
        alert("You do not have permission to add rooms.");
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



