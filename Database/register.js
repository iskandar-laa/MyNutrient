import { auth, db } from "./Firebase.js";
import { 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const deviceModal = document.getElementById('deviceModal');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
const closeModal = document.getElementById('closeModal');
let currentProvider = null;

// --- 1. SOCIAL SIGN-UP INITIALIZATION ---
document.getElementById('googleSignUpBtn')?.addEventListener('click', () => {
    currentProvider = new GoogleAuthProvider();
    deviceModal.style.display = "flex"; // Use flex to center if your CSS supports it
});

if(closeModal) closeModal.onclick = () => { deviceModal.style.display = "none"; };

// This handles the ACTUAL login after the user provides a device code in the modal
modalConfirmBtn?.addEventListener('click', async () => {
    const code = document.getElementById('modalDeviceInput').value;
    if (!code) return alert("Please enter your Device Code.");

    try {
        // Check if device exists in Firestore
        const deviceRef = doc(db, "authorized_devices", code);
        const deviceSnap = await getDoc(deviceRef);

        if (!deviceSnap.exists()) return alert("Device Code not found!");
        if (deviceSnap.data().isUsed) return alert("This Device Code is already linked to another account.");

        // Now trigger the Google Popup
        const result = await signInWithPopup(auth, currentProvider);
        const user = result.user;

        // Mark device as used
        await updateDoc(deviceRef, { isUsed: true, owner: user.uid });
        
        // Create user profile
        await setDoc(doc(db, "users", user.uid), {
            fullName: user.displayName || "New Farmer",
            email: user.email,
            profilePic: user.photoURL || "",
            deviceCode: code,
            soilPh: 7.0,
            soilType: "Loamy",
            createdAt: serverTimestamp()
        });

        window.location.href = "Dashboard.html";
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
});

// --- 2. EMAIL REGISTRATION ---
document.getElementById('registerBtn')?.addEventListener('click', async () => {
    const fullName = document.getElementById('regFullName')?.value; // Fixed ID
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const code = document.getElementById('deviceCode').value;

    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (!fullName || !code) return alert("Please fill in all fields.");

    try {
        const deviceRef = doc(db, "authorized_devices", code);
        const deviceSnap = await getDoc(deviceRef);

        if (!deviceSnap.exists() || deviceSnap.data().isUsed) {
            return alert("Invalid or already used Device Code.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateDoc(deviceRef, { isUsed: true, owner: user.uid });
        
        await setDoc(doc(db, "users", user.uid), {
            fullName: fullName,
            email: user.email,
            deviceCode: code,
            soilPh: 6.8, 
            createdAt: serverTimestamp()
        });

        window.location.href = "Dashboard.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
});