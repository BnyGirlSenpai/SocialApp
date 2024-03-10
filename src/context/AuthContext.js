import { useContext, createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, onAuthStateChanged } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const popup = await signInWithPopup(auth, provider)
      const user = popup.user;
      sendUserDataToBackend(user);
      console.log(user);
    } catch (error) {
      console.log(error);
    }
  }

  const logOut = () => {
    signOut(auth)
  }

  const sendUserDataToBackend = async () => {
    try {
        const response = await axios.post('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (response.ok) {
        console.log('User data stored successfully');
      } else {
        console.error('Error storing user data:', response);
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

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
