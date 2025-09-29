import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDc8hYj90zPMhkMKFVD-ljtvZlIKQdjDSg",
  authDomain: "tlacenka-royale.firebaseapp.com",
  projectId: "tlacenka-royale",
  storageBucket: "tlacenka-royale.firebasestorage.app",
  messagingSenderId: "963130731069",
  appId: "1:963130731069:web:5d3ccb418feb6c2f5f1854"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;