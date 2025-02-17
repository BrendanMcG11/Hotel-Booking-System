// admin.js

/***************************************************
 * 1. IMPORTS & FIREBASE CONFIG
 ***************************************************/
import { 
    initializeApp 
  } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
  
  import {
    getAuth, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword
  } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
  
  import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    runTransaction
  } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
  
  // Your Firebase configuration
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
  const db   = getFirestore(app);
  
  /***************************************************
   * 2. DOM ELEMENTS
   ***************************************************/
  const adminOnlySection   = document.getElementById("admin-only-section");
  const createEmployeeBtn  = document.getElementById("create-employee-btn");
  const logoutBtn          = document.getElementById("logout-btn");
  const usersList = document.getElementById("users-list");
  const loginsList = document.getElementById("logins-list");

  /***************************************************
   * 3. AUTH STATE CHECK
   ***************************************************/
  // If user is not admin, redirect. If admin, show admin section.
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // No user logged in, redirect to index
      window.location.href = "index.html";
      return;
    }
  
    // Check Firestore to see if user is admin
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
  
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.role === "admin") {
        // Show the admin section
        adminOnlySection.style.display = "block";
      } else {
        // Not admin; redirect to employee or guest page as needed
        alert("Unauthorized access. Redirecting...");
        window.location.href = "index.html";
      }
    } else {
      // If the document doesn't exist, redirect
      alert("No user data found. Redirecting...");
      window.location.href = "index.html";
    }
  });

  // Function to load all users (Guests & Employees)
async function loadUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    
    if (querySnapshot.empty) {
      console.log("❌ No users found in Firestore.");
      usersList.innerHTML = "<tr><td colspan='4'>No users found</td></tr>";
      return;
    }

    usersList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      console.log("✅ User found:", user);  // Debugging log

      usersList.innerHTML += `
        <tr>
          <td>${user.fname ? user.fname + " " + user.surname : "N/A"}</td>
          <td>${user.email}</td>
          <td>${user.phone || "N/A"}</td>
          <td>${user.role}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    usersList.innerHTML = "<tr><td colspan='4'>Error loading users</td></tr>";
  }
}

// Function to load Employee Logins
async function loadEmployeeLogins() {
  try {
    const querySnapshot = await getDocs(collection(db, "logins"));
    
    if (querySnapshot.empty) {
      console.log("❌ No employee logins found.");
      loginsList.innerHTML = "<tr><td colspan='3'>No logins found</td></tr>";
      return;
    }

    loginsList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const loginData = doc.data();
      console.log("✅ Employee login found:", loginData);  // Debugging log

      loginsList.innerHTML += `
        <tr>
          <td>${loginData.name}</td>
          <td>${loginData.email}</td>
          <td>${new Date(loginData.lastLogin).toLocaleString()}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("❌ Error fetching logins:", error);
    loginsList.innerHTML = "<tr><td colspan='3'>Error loading logins</td></tr>";
  }
}

// Check Admin Authentication & Load Data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ Admin logged in:", user.email);
    await loadUsers();
    await loadEmployeeLogins();
  } else {
    console.log("❌ No admin detected. Redirecting to login.");
    window.location.replace("index.html");
  }
});
  
  /***************************************************
   * 4. CREATE EMPLOYEE (Example Implementation)
   ***************************************************/
  // We'll use a "counter" doc in Firestore to generate incremental IDs
  async function generateNewEmployeeId() {
    const counterRef = doc(db, "counters", "employeeCounter");
    let newIdNumber = 0;
  
    // Use a transaction to safely increment
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        throw new Error("Counter doc does not exist!");
      }
      const currentVal = counterDoc.data().current;
      newIdNumber = currentVal + 1;
      // Update
      transaction.update(counterRef, { current: newIdNumber });
    });
  
    // Return "EMP-1001" style
    return "EMP-" + newIdNumber;
  }
  
  createEmployeeBtn.addEventListener("click", async () => {
    try {
      // 1) Gather inputs
      const empName  = document.getElementById("new-emp-name").value.trim();
      const empPhone = document.getElementById("new-emp-phone").value.trim();
      const empEmail = document.getElementById("new-emp-email").value.trim();
  
      if (!empName || !empPhone || !empEmail) {
        alert("Please fill in all fields.");
        return;
      }
  
      // 2) Generate the new Employee ID
      const newEmpId = await generateNewEmployeeId(); // e.g. "EMP-1001"
      // Extract numeric part to build password
      const numericId = newEmpId.split("-")[1]; // e.g. "1001"
      const empPassword = "password" + numericId; // e.g. "password1001"
  
      // 3) Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, empEmail, empPassword);
      const newUser = userCredential.user;
      console.log("Created new employee Auth user:", newUser.uid);
  
      // 4) Save user record in Firestore
      const newUserDocRef = doc(db, "users", newUser.uid);
      await setDoc(newUserDocRef, {
        userId: newEmpId,
        name: empName,
        phone: empPhone,
        email: empEmail,
        role: "employee"
      });
  
      alert(`Employee created!\nID: ${newEmpId}\nPassword: ${empPassword}`);
  
      // Optional: clear form
      document.getElementById("new-emp-name").value = "";
      document.getElementById("new-emp-phone").value = "";
      document.getElementById("new-emp-email").value = "";
  
    } catch (err) {
      console.error(err);
      alert("Error creating employee: " + err.message);
    }
  });
  
  /***************************************************
   * 5. LOGOUT
   ***************************************************/
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      sessionStorage.setItem("logout", "true");
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        window.location.replace("index.html");
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout error: " + error.message);
    }
  });
  