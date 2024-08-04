// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDKsqef6ptnYLoK3FGNgV9WuRkNwVVdbpw",
    authDomain: "pantry-tracker-7a357.firebaseapp.com",
    projectId: "pantry-tracker-7a357",
    storageBucket: "pantry-tracker-7a357.appspot.com",
    messagingSenderId: "591781625917",
    appId: "1:591781625917:web:75ada8adae7b2e6b6c2a54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export { firestore };
const app2 = initializeApp(firebaseConfig);
export const auth = getAuth(app2);

