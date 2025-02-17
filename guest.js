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

const roomList = document.getElementById("room-list");
const searchBox = document.getElementById("search-box");
const filterAvailability = document.getElementById("filter-availability");
const sortPriceBtn = document.getElementById("sort-price");
let roomsData = [];

async function loadRooms() {
  const querySnapshot = await getDocs(collection(db, "rooms"));
  roomsData = [];
  querySnapshot.forEach((doc) => {
    roomsData.push({ id: doc.id, ...doc.data() });
  });
  displayRooms(roomsData);
}

function displayRooms(rooms) {
  roomList.innerHTML = "";
  rooms.forEach(room => {
    const row = document.createElement("tr");
    const imagePath = `images/${room.id}.jpg`; // Assuming images are named after room IDs

    row.innerHTML = `
      <td><img src="${imagePath}" alt="Room Image" class="room-image" onerror="this.onerror=null; this.src='images/default.jpg';"></td>
      <td>${room.id}</td>
      <td>${room.type}</td>
      <td>$${room.price.toFixed(2)}</td>
      <td class="${room.available ? 'available' : 'occupied'}">${room.available ? "Available" : "Occupied"}</td>
    `;
    roomList.appendChild(row);
  });
}

// Filtering Function
filterAvailability.addEventListener("change", () => {
  const filterValue = filterAvailability.value;
  let filteredRooms = roomsData;
  if (filterValue === "available") {
    filteredRooms = roomsData.filter(room => room.available);
  } else if (filterValue === "occupied") {
    filteredRooms = roomsData.filter(room => !room.available);
  }
  displayRooms(filteredRooms);
});

// Search Function
searchBox.addEventListener("input", () => {
  const query = searchBox.value.toLowerCase();
  const filteredRooms = roomsData.filter(room => 
    room.id.toLowerCase().includes(query) || 
    room.type.toLowerCase().includes(query)
  );
  displayRooms(filteredRooms);
});

// Sorting Function
let sortAsc = true;
sortPriceBtn.addEventListener("click", () => {
  sortAsc = !sortAsc;
  roomsData.sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price);
  displayRooms(roomsData);
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadRooms();
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});
