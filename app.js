/***************************************************
 * 1. IMPORTS & FIREBASE CONFIG (Firebase 11.3.0)
 ***************************************************/
// Import necessary Firebase modules from the CDN
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

/**
 * Firebase config
 */
const firebaseConfig = {
  apiKey: "AIzaSyDw5aeA0uwE7R06Ht1wjkx6TcehPWs0Hac",
  authDomain: "hotel-booking-3aad3.firebaseapp.com",
  projectId: "hotel-booking-3aad3",
  storageBucket: "hotel-booking-3aad3.firebasestorage.app",
  messagingSenderId: "385718256742",
  appId: "1:385718256742:web:03fc7761dbf7e7345ad9a7",
  measurementId: "G-KQCGJEBKQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/***************************************************
 * 2. DOM ELEMENT REFERENCES
 ***************************************************/
const registerEmail    = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerRole     = document.getElementById('register-role');
const registerFname    = document.getElementById('register-fname');
const registerSurname  = document.getElementById('register-surname');
const registerPhone    = document.getElementById('register-phone');
const registerBtn      = document.getElementById('register-btn');

const loginEmail       = document.getElementById('login-email');
const loginPassword    = document.getElementById('login-password');
const loginBtn         = document.getElementById('login-btn');
const logoutBtn        = document.getElementById('logout-btn');

const employeeSection  = document.getElementById('employee-section');
const guestSection     = document.getElementById('guest-section');

/***************************************************
 * 3. REGISTER USER (Saving Role and Personal Info in Firestore)
 ***************************************************/
registerBtn.addEventListener('click', async () => {
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const fname    = registerFname.value.trim();
  const surname  = registerSurname.value.trim();
  const phone    = registerPhone.value.trim();

  if (!email || !password || !fname || !surname || !phone) {
    alert("Please enter all required fields.");
    return;
  }
  
  const role = "guest";

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User created:", user.uid);

    // Assign a unique ID for employees

    

    // Store user role and personal info in Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { 
      email, 
      role,
      fname,
      surname,
      phone
    });

    console.log("User data saved to Firestore:", { email, role });
    alert("Registered successfully! You can now log in.");
  } catch (error) {
    console.error("Error registering user:", error.message);
    alert("Registration Error: " + error.message);
  }
});

/***************************************************
 * 4. LOGIN / LOGOUT
 ***************************************************/
loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value;
  const password = loginPassword.value;
  if (!email || !password) {
    alert("Please provide login credentials.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in successfully!");
  } catch (error) {
    alert("Login Error: " + error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
  } catch (error) {
    alert("Logout Error: " + error.message);
  }
});

/***************************************************
 * 5. ON AUTH STATE CHANGED (Fetch Role from Firestore)
 ***************************************************/
onAuthStateChanged(auth, async (user) => {
  console.log("🔄 Auth State Changed:", user);

  // Prevent unnecessary redirects after logout
  if (sessionStorage.getItem("logout") === "true") {
    console.log("🚪 Logout detected. Staying on index.");
    sessionStorage.removeItem("logout"); // Clear logout flag
    return;
  }

  if (user) {
    console.log("✅ User detected. Checking Firestore...");

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log("📄 User Data:", userData);

      if (userData.role === "employee") {
        console.log("🔹 Redirecting to Employee Page...");
        setTimeout(() => {
          window.location.href = "employee.html";
        }, 500);
      } else if (userData.role === "admin") {
        // redirect to admin
        window.location.href = "admin.html";
      } else {
        console.log("🔹 Redirecting to Guest Page...");
        setTimeout(() => {
          window.location.href = "guest.html";
        }, 500);
      }
    } else {
      console.log("❌ No Firestore record found. Staying on index.html.");
    }
  } else {
    console.log("🚪 No authenticated user. Staying on index.html.");
  }
});


import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase Auth Persistence Set");
  })
  .catch((error) => {
    console.error("⚠️ Error setting persistence:", error);
  });



