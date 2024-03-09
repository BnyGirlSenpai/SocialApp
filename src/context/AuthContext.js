import { useContext, createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, onAuthStateChanged } from '../firebase';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const popup = await signInWithPopup(auth, provider)
      const user = popup.user;

      console.log(user);

      // Call a server-side API endpoint to handle database interaction 
      await fetch('/api/store-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

    } catch (error) {
      console.log(error);
    }
  }

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
