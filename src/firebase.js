import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6Eu8yKfYbpmfROUURTpvosEt7tDTwQYg",
  authDomain: "scoreclash-4fa78.firebaseapp.com",
  projectId: "scoreclash-4fa78",
  storageBucket: "scoreclash-4fa78.firebasestorage.app",
  messagingSenderId: "783244227672",
  appId: "1:783244227672:web:64d9992f23a41c837f062d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── Firestore helpers ────────────────────────────────────────────────────────
// These mirror the old storage.get/set API but talk to Firestore.
// All data lives in a single "store" collection, one document per key,
// with a { value: <JSON string> } shape — minimal schema change from the old code.

export async function fsGet(key) {
  try {
    const snap = await getDoc(doc(db, "store", key));
    if (!snap.exists()) return null;
    return JSON.parse(snap.data().value);
  } catch {
    return null;
  }
}

export async function fsSet(key, value) {
  await setDoc(doc(db, "store", key), { value: JSON.stringify(value) });
}

export async function fsDel(key) {
  await deleteDoc(doc(db, "store", key));
}

// Subscribe to a key and call callback whenever it changes in Firestore.
// Returns an unsubscribe function.
export function fsSubscribe(key, callback) {
  return onSnapshot(doc(db, "store", key), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    try { callback(JSON.parse(snap.data().value)); }
    catch { callback(null); }
  });
}
