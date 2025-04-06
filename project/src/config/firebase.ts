import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDRzmEme1st9SdwAHQPqwnO5KQ9YiWIUgM",
  authDomain: "himalia-d212d.firebaseapp.com",
  projectId: "himalia-d212d",
  storageBucket: "himalia-d212d.firebasestorage.app",
  messagingSenderId: "155081581144",
  appId: "1:155081581144:web:ef3243c05cda127de5602d",
  measurementId: "G-N7RLXYVLKT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, analytics, db, storage, auth };