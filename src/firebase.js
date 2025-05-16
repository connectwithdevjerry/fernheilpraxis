// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDRZIlt1xkkFp0230fc837ZD9ssb6TrYqY",
  authDomain: "fernheilpraxis-9449a.firebaseapp.com",
  projectId: "fernheilpraxis-9449a",
  storageBucket: "fernheilpraxis-9449a.appspot.com",
  messagingSenderId: "989539649235",
  appId: "1:989539649235:web:16425f0858d8268877f626",
  measurementId: "G-76TS27F02N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database instance
const db = getFirestore(app);

export { app, db };
