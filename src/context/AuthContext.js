import { useContext, createContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, /*signInWithEmailAndPassword ,createUserWithEmailAndPassword ,signInWithRedirect,*/ signOut} from 'firebase/auth';
import { auth, db, onAuthStateChanged } from '../firebase';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import mysql from 'mysql2/promise';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  //const [userData, setUserData] = useState();
  const collectionUserRef =  collection(db, "users");

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const popup = await signInWithPopup(auth, provider)
      const user = popup.user;

      // SQL Logic:
      await storeUserInSQL(user);

    } catch (error) {
      console.log(error);
    }
  }

  const storeUserInSQL = async (user) => {
    try {
      // Replace with the connection logic for your SQL database
      const connection = await establishSQLConnection(); 

      // Replace with your SQL query syntax
      const query = "INSERT INTO users (uid, authprovider, name, email, image) VALUES (?, ?, ?, ?, ?)";
      const values = [user.uid, popup?.providerId, user?.displayName, user?.email, user?.photoURL];
      await connection.query(query, values);

    } catch(error) {
      console.error("Error storing user in SQL:", error);
    }
  }

  async function establishSQLConnection() {
    // Replace with your database details
    const connectionConfig = {
      host: 'your_database_host', 
      port: your_database_port, // e.g., 3306 for MySQL, 5432 for PostgreSQL
      user: 'your_database_username',
      password: 'your_database_password',
      database: 'your_database_name'
    };
  

  
    try {
      const connection = await library.createConnection(connectionConfig); 
      return connection;
    } catch (error) {
        console.error("Error connecting to SQL database:", error);
        throw error; // Re-throw the error to allow for error handling
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