// First, install these packages in both client and server:

// In the client directory:
// npm install firebase

// In the server directory:
// npm install firebase-admin

// Then, create a new file: client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyA_QgFRmzPBEKXM2_8NayJeVQEGA5_ZgJ8",
    authDomain: "flixbro-2266d.firebaseapp.com",
    projectId: "flixbro-2266d",
    storageBucket: "flixbro-2266d.firebasestorage.app",
    messagingSenderId: "51294615365",
    appId: "1:51294615365:web:c35bbacad51dd73eb7b02c",
    measurementId: "G-L5T0P57JXT"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };