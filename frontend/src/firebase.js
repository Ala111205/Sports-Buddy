import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPx1m7WHEZAodyrUYPEI7cLdwQiWZ8GfA",
  authDomain: "sports-buddy-14d5f.firebaseapp.com",
  projectId: "sports-buddy-14d5f",
  storageBucket: "sports-buddy-14d5f.firebasestorage.app",
  messagingSenderId: "370920685559",
  appId: "1:370920685559:web:665ca54633dbcfc476f8f2",
  measurementId: "G-8FEBD5Z8M1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
