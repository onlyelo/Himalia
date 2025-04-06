// src/utils/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TA_CLE_API",
  authDomain: "himalia-d212d.firebaseapp.com",
  projectId: "himalia-d212d",
  storageBucket: "himalia-d212d.appspot.com",
  messagingSenderId: "TON_ID",
  appId: "TON_APP_ID"
};

// 🛡️ NE PAS RÉINITIALISER si déjà fait
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
