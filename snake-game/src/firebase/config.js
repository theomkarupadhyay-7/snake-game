// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK12JjOB4fLLBXb5jKlZmefaI2i3Ce0f4",
  authDomain: "snake-game-baef2.firebaseapp.com",
  projectId: "snake-game-baef2",
  storageBucket: "snake-game-baef2.firebasestorage.app",
  messagingSenderId: "125571406842",
  appId: "1:125571406842:web:dc34366b7ba44ef9fce243"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);