import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAaLDZK7QUXjyeWlOYVlLAt5EL24Gl7pn0",
  authDomain: "stackoverflow-clone-944fd.firebaseapp.com",
  projectId: "stackoverflow-clone-944fd",
  storageBucket: "stackoverflow-clone-944fd.firebasestorage.app",
  messagingSenderId: "1039164759009",
  appId: "1:1039164759009:web:4c66beb199620f7f2f50a0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);