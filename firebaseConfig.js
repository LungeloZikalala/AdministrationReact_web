// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB_YQMlkHQLe7lJ3OTiAjFQ7fSFSe0Sp3M",
    authDomain: "facedetection-42aab.firebaseapp.com",
    projectId: "facedetection-42aab",
    storageBucket: "facedetection-42aab.appspot.com",
    messagingSenderId: "1082500585109",
    appId: "1:1082500585109:web:24fd6716bc4d9a269ced9c",
    measurementId: "G-4RBZEJM9KF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig); 
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };