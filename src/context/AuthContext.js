import { useContext, createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, /*signInWithEmailAndPassword ,createUserWithEmailAndPassword ,signInWithRedirect,*/ signOut} from 'firebase/auth';
import { auth, db, onAuthStateChanged } from '../firebase';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  //const [userData, setUserData] = useState();
  const collectionUserRef =  collection(db, "users");

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // signInWithRedirect(auth, provider);
      const popup = await signInWithPopup(auth, provider)
      const user = popup.user;
      const q = query(collectionUserRef, where("uid", "==", user.uid));
      const docs = await getDocs(q)
  
      if (docs.docs.length === 0) {
        await addDoc(collectionUserRef ,{
          uid: user?.uid,
          name: user?.displayName,
          email: user?.email,
          image: user?.photoURL,
          authprovider: popup?.providerId,
        });
      } else {
        console.log("User allready exists!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*const loginWithUserAndEmail = async(email, password) =>{
    try {
      await signInWithEmailAndPassword(auth, email, password);
      });
    } catch (error) {
      console.log(error);
    }
  }*/

  /*cosnt sendPasswordToEmail = async() => {

  } */

/*const registerWithUserAndEmail =  async(name, username, email, password) =>{
    try {
      const res = await createUserWithEmailAndPassword (auth, email, password);
      const user = res.user;
      await addDoc(collectionUserRef,{
        uid: user.uid,
        username,
        name,
        providerId: "email/password",
        email: user.email,
      });
    } catch (error) {
      console.log(error);
    }
  }*/

  const logOut = () => {
      signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log(currentUser)
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ googleSignIn, logOut, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};