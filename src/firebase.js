import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc, getDoc, setDoc, deleteDoc, onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";

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
export const auth = getAuth(app);

// ─── Firestore helpers ────────────────────────────────────────────────────────
export async function fsGet(key) {
  try {
    const snap = await getDoc(doc(db, "store", key));
    if (!snap.exists()) return null;
    return JSON.parse(snap.data().value);
  } catch { return null; }
}

export async function fsSet(key, value) {
  await setDoc(doc(db, "store", key), { value: JSON.stringify(value) });
}

export async function fsDel(key) {
  await deleteDoc(doc(db, "store", key));
}

export function fsSubscribe(key, callback) {
  return onSnapshot(doc(db, "store", key), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    try { callback(JSON.parse(snap.data().value)); }
    catch { callback(null); }
  });
}

// ─── Atomic single-user write ─────────────────────────────────────────────────
// Instead of reading the whole sc_users blob and rewriting it,
// we use a separate /users/{uid} document so each user only writes their own.
export async function fsWriteUser(uid, profile) {
  await setDoc(doc(db, "users", uid), profile);
}

export async function fsReadUser(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

export function fsSubscribeUser(uid, callback) {
  return onSnapshot(doc(db, "users", uid), snap => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function fbRegister(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function fbLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function fbLogout() {
  await signOut(auth);
}

export async function fbResetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function fbDeleteAccount(currentPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
}

export function fbOnAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
