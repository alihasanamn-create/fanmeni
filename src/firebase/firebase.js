import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCzT60r411C8_LIIxluPdeiFvj7qaiek3I",
  authDomain: "fanmeni-26.firebaseapp.com",
  projectId: "fanmeni-26",
  storageBucket: "fanmeni-26.firebasestorage.app",
  messagingSenderId: "232654506607",
  appId: "1:232654506607:web:c26a907533c45b5d24db9a",
  measurementId: "G-3BYHR36TQ2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);