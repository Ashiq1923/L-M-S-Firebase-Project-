
// firebaseconfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc , addDoc} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBzI6hT_Qu-b_Vmpf6vcwDlBPBsU5OR8QE",
  authDomain: "lms-softwear.firebaseapp.com",
  projectId: "lms-softwear",
  storageBucket: "lms-softwear.firebasestorage.app",
  messagingSenderId: "839492503089",
  appId: "1:839492503089:web:679fc8a66b40374b66f710",
  measurementId: "G-MM4HK6KBBL"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { collection, getDocs, setDoc, addDoc, doc, createUserWithEmailAndPassword };
