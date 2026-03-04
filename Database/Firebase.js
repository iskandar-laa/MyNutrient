import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCbjp1_h9feR6ZQhA9tJNRt6C2kypQ1ENg",
    authDomain: "agriculture-fbed7.firebaseapp.com",
    projectId: "agriculture-fbed7",
    storageBucket: "agriculture-fbed7.firebasestorage.app",
    messagingSenderId: "502086630462",
    appId: "1:502086630462:web:024b5f54a3a3c21fbd656f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);