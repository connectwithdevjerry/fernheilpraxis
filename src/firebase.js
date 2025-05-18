// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyANuk0A_i2ucsDoE9MCTnkgBpv-OsoSxEw",
  authDomain: "rezept-datenbank-25a6b.firebaseapp.com",
  projectId: "rezept-datenbank-25a6b",
  storageBucket: "rezept-datenbank-25a6b.firebasestorage.app",
  messagingSenderId: "556209183780",
  appId: "1:556209183780:web:970137eef1f7e695814cb1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database instance
const db = getFirestore(app);

export { app, db };
