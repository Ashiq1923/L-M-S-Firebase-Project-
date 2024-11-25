// app/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuz1nntANjxEPiWYlfA4ZkTfZchaGmnTs",
    authDomain: "dashbord-12306.firebaseapp.com",
    projectId: "dashbord-12306",
    storageBucket: "dashbord-12306.firebasestorage.app",
    messagingSenderId: "626283342526",
    appId: "1:626283342526:web:d9a1f759716501f53f8cef",
    measurementId: "G-C7ZE38WCM0"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Auth and Firestore Instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase Authentication Functions

// Signup Function
export const signup = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Login Function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Logout Function
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Listen for Auth State Change (to track user login/logout)
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore Functions

// Create or Update Document (Set Data)
export const setDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Document by ID
export const getDocument = async (collectionName, docId) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, docId));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Document not found!");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add Document to Collection
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;  // Return the document ID
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update Document by ID
export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(db, collectionName, docId), data);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete Document by ID
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    throw new Error(error.message);
  }
};
