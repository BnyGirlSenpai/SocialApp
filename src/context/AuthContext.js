import { useContext, createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, onAuthStateChanged } from '../firebase';
import { sendDataToBackend }  from '../apis/UserDataApi';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const googleSignIn = async () => {
    try {
      const popup = await signInWithPopup(auth,  new GoogleAuthProvider())
      const user = popup.user;
      sendDataToBackend(user,'http://localhost:3001/api/users');
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
