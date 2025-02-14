import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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
const roomList = document.getElementById("room-list");
const welcomeText = document.getElementById("welcome-text");

// Fetch rooms from Firestore
async function loadRooms() {
  const querySnapshot = await getDocs(collection(db, "rooms"));
  roomList.innerHTML = ""; // Clear table before loading
  querySnapshot.forEach((doc) => {
    const room = doc.data();
    roomList.innerHTML += `
      <tr>
        <td>${doc.id}</td>
        <td>${room.type}</td>
        <td>$${room.price}</td>
        <td>${room.available ? "Available" : "Occupied"}</td>
      </tr>
    `;
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User authenticated:", user.uid);
    await loadRooms(); // Load rooms after confirming authentication
  } /*else {
    console.log("No user detected. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "index.html"; // Ensure redirection only happens once
    }, 1000); // Add a slight delay to avoid instant redirection loops
  }*/

    // 1) Load the user's name and phone
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const fullName = `${userData.fname} ${userData.surname}`;
      document.getElementById("welcome-text") = `Welcome, ${fullName}!`;
      console.log("User data:", userData);
    } else {
      // If no doc, might be an error or you haven't stored it
      document.getElementById("welcome-text") = "Welcome!";
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




