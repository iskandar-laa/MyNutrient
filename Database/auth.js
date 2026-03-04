import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    OAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// Added Firestore imports to check device status
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCbjp1_h9feR6ZQhA9tJNRt6C2kypQ1ENg",
    authDomain: "agriculture-fbed7.firebaseapp.com",
    projectId: "agriculture-fbed7",
    storageBucket: "agriculture-fbed7.firebasestorage.app",
    messagingSenderId: "502086630462",
    appId: "1:502086630462:web:024b5f54a3a3c21fbd656f",
    measurementId: "G-2KRSHBB9TW",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 


async function verifyDeviceAndRedirect(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        
        if (userSnap.exists() && userSnap.data().deviceCode) {
            window.location.href = "Dashboard.html";
        } else {
            
            alert("No hardware linked to this account. Please register your device.");
            window.location.href = "Register.html";
        }
    } catch (error) {
        console.error("Verification Error:", error);
        alert("Session error. Please try logging in again.");
    }
}


const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            verifyDeviceAndRedirect(userCredential.user);
        })
        .catch((error) => {
            alert("Login Failed: " + error.message);
        });
});


const googleProvider = new GoogleAuthProvider();
const googleBtn = document.getElementById('googleBtn');
googleBtn.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            verifyDeviceAndRedirect(result.user);
        })
        .catch((error) => {
            alert("Google Login Error: " + error.message);
        });
});


const appleProvider = new OAuthProvider('apple.com');
const appleBtn = document.getElementById('appleBtn');
appleBtn.addEventListener('click', () => {
    signInWithPopup(auth, appleProvider)
        .then((result) => {
            verifyDeviceAndRedirect(result.user);
        })
        .catch((error) => {
            alert("Apple Login Error: " + error.message);
        });
});