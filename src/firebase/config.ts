import { initializeApp } from "firebase/app"
import { collection, getFirestore , Timestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCl_E1aS8lkBkC2MWWp2ixgWdsr1DhUTKM",
  authDomain: "corpcanteen-token-management.firebaseapp.com",
  projectId: "corpcanteen-token-management",
  storageBucket: "corpcanteen-token-management.appspot.com",
  messagingSenderId: "161957948816",
  appId: "1:161957948816:web:4a5144e12e3a4d14271715",
  measurementId: "G-3ENBN7YR3V",
}

// init firebase
initializeApp(firebaseConfig)

// init services
const db = getFirestore()
const auth = getAuth()

console.log(db)
export { db , auth};
