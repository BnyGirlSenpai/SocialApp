import React, { useState, useEffect, useContext } from 'react';
import { UserAuth } from '../context/AuthContext';
import { auth, db, onAuthStateChanged } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";


const FriendList = () => {

  const deleteFriend = () => {

  }

  const searchUser = () => {
    
  }

  const addFriend= async () => {

  }
  return (
    <div>FriendList</div>
  )
}

export default FriendList