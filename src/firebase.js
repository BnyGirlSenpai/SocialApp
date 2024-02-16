// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth,onAuthStateChanged } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA24J7-65yyD_s_rxv0Sg2GGr446EqvBsU",
  authDomain: "userauthenticator-6cf7a.firebaseapp.com",
  projectId: "userauthenticator-6cf7a",
  storageBucket: "userauthenticator-6cf7a.appspot.com",
  messagingSenderId: "407023630759",
  appId: "1:407023630759:web:8075c635eba899363bde82",
  measurementId: "G-0TJKJ77TGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app)
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export  {auth ,db , onAuthStateChanged};
export default app;