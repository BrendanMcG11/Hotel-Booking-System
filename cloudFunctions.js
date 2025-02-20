/***************************************************
 * 1. IMPORTS (Firebase Authentication & Firestore)
 ***************************************************/
// Import Firebase Authentication module
import { 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Import Firestore modules
import { 
  runTransaction, 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Reference Firebase Auth & Firestore (Assuming they are initialized elsewhere)
import { auth, db } from "./firebase-config.js"; // Ensure firebase-config.js initializes Firebase

/***************************************************
* 2. DOM ELEMENT REFERENCES
***************************************************/
// Get reference to the "Create Employee" button
const createEmployeeBtn = document.getElementById("create-employee-btn");

// Attach event listener to handle employee creation on button click
createEmployeeBtn.addEventListener("click", async () => {
  try {
      // 1) Gather user input values
      const empName  = document.getElementById("new-emp-name").value.trim();
      const empPhone = document.getElementById("new-emp-phone").value.trim();
      const empEmail = document.getElementById("new-emp-email").value.trim();

      // 2) Validate input fields
      if (!empName || !empPhone || !empEmail) {
          alert("⚠️ Please enter all required employee fields.");
          return;
      }

      // 3) Generate a new Employee ID (e.g., "EMP-1001")
      const newEmpId = await generateNewEmployeeId();

      // 4) Create a default password using the numeric portion of Employee ID
      // Extract the numeric part (e.g., "1001" from "EMP-1001")
      const numericPart = newEmpId.split("-")[1];
      const empPassword = "password" + numericPart; // Example: "password1001"

      // 5) Create a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, empEmail, empPassword);
      const newUser = userCredential.user;
      console.log("✅ Created new employee user:", newUser.uid);

      // 6) Save employee information in Firestore under "users" collection
      const userRef = doc(db, "users", newUser.uid);
      await setDoc(userRef, {
          userId: newEmpId,  // e.g., "EMP-1001"
          name: empName,
          phone: empPhone,
          email: empEmail,
          role: "employee" // Assign the role as "employee"
      });

      // 7) Display success message with Employee ID & Temporary Password
      alert(`🎉 Employee Created!\n\n🆔 ID: ${newEmpId}\n🔑 Temp Password: ${empPassword}`);

  } catch (error) {
      console.error("❌ Error creating employee:", error);
      alert("Error creating employee: " + error.message);
  }
});

/***************************************************
* 3. GENERATE NEW EMPLOYEE ID (Using Firestore Counter)
***************************************************/
// This function generates a unique employee ID based on an auto-incrementing counter in Firestore.
async function generateNewEmployeeId() {
  const counterRef = doc(db, "counters", "employeeCounter"); // Reference to employee counter document
  let newIdNumber = 0;

  try {
      // Run Firestore transaction to ensure atomic update
      await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);

          // Validate that the counter document exists
          if (!counterDoc.exists()) {
              throw new Error("⚠️ Employee counter document does not exist!");
          }

          // Get the current counter value
          const currentVal = counterDoc.data().current;
          newIdNumber = currentVal + 1; // Increment counter

          // Update Firestore counter document with the new value
          transaction.update(counterRef, { current: newIdNumber });
      });

      // Return the newly generated Employee ID (e.g., "EMP-1001")
      return "EMP-" + newIdNumber;

  } catch (error) {
      console.error("❌ Error generating Employee ID:", error);
      throw error; // Rethrow error to be handled by caller
  }
}
