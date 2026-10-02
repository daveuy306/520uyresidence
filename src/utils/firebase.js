import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';

// Default Firebase configuration using environment variables or fallback configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMkglitYBIV0UdvjjpOBRyqVgYYHaVM3A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "expense-tracker-6048a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "expense-tracker-6048a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "expense-tracker-6048a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "265558693099",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:265558693099:web:8b94c4532f11555996daae"
};

let db = null;
let isFirebaseInitialized = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseInitialized = true;
} catch (e) {
  console.warn('Firebase initialization running in offline/localStorage mode', e);
}

export { db, isFirebaseInitialized };

// Real-time listener for multi-device synchronization
export const subscribeToCloudData = (onDataUpdate) => {
  if (!db || !isFirebaseInitialized) return () => {};

  try {
    const docRef = doc(db, 'budget_data', 'shared_user_data');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onDataUpdate(data);
      }
    }, (error) => {
      console.warn('Firestore snapshot listener error (using local storage fallback):', error.message);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Error subscribing to cloud data:', err);
    return () => {};
  }
};

// Sync transactions and categories to Firebase Cloud Firestore
export const saveCloudData = async (categories, transactions) => {
  if (!db || !isFirebaseInitialized) return;

  try {
    const docRef = doc(db, 'budget_data', 'shared_user_data');
    await setDoc(docRef, {
      categories,
      transactions,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving data to Firebase cloud (saved locally):', err.message);
  }
};
