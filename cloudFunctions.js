// employee.js
import { 
    createUserWithEmailAndPassword 
  } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
  
  const createEmployeeBtn = document.getElementById("create-employee-btn");
  
  createEmployeeBtn.addEventListener("click", async () => {
    try {
      // 1) Gather input
      const empName  = document.getElementById("new-emp-name").value.trim();
      const empPhone = document.getElementById("new-emp-phone").value.trim();
      const empEmail = document.getElementById("new-emp-email").value.trim();
  
      if (!empName || !empPhone || !empEmail) {
        alert("Please enter all required employee fields.");
        return;
      }
  
      // 2) Generate the new Employee ID
      const newEmpId = await generateNewEmployeeId(); // "EMP-1001", etc.
  
      // 3) Create the employee’s password from the numeric portion
      //    If you used "EMP-1001", extract the numeric part -> 1001
      const numericPart = newEmpId.split("-")[1]; // "1001"
      const empPassword = "password" + numericPart; // "password1001"
  
      // 4) Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, empEmail, empPassword);
      const newUser = userCredential.user;
      console.log("Created new employee user:", newUser.uid);
  
      // 5) Save user info in Firestore
      const userRef = doc(db, "users", newUser.uid);
      await setDoc(userRef, {
        userId: newEmpId,   // e.g. EMP-1001
        name: empName,
        phone: empPhone,
        email: empEmail,
        role: "employee"
      });
  
      alert(`Employee created!\nID: ${newEmpId}\nTemp Password: ${empPassword}`);
  
    } catch (error) {
      console.error(error);
      alert("Error creating employee: " + error.message);
    }
  });

  import { runTransaction, doc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Called whenever admin wants to create a new employee
async function generateNewEmployeeId() {
  const counterRef = doc(db, "counters", "employeeCounter");
  let newIdNumber = 0;
  
  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    if (!counterDoc.exists()) {
      throw "Counter document does not exist!";
    }

    const currentVal = counterDoc.data().current;
    newIdNumber = currentVal + 1;

    // Update Firestore
    transaction.update(counterRef, { current: newIdNumber });
  });

  // Return the new ID, e.g. "EMP-1001"
  return "EMP-" + newIdNumber;
}

  