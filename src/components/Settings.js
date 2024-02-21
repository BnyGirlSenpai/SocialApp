import React, { useState, useEffect, useContext } from 'react';
import { UserAuth } from '../context/AuthContext';
import { auth, db, onAuthStateChanged } from '../firebase';
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

const Settings = () => {
    
    const { user } = UserAuth();
    const collectionUserRef = collection(db, "users");
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        dateOfBirth: '',
        password: '',
        address: '',
        country: '',
        region: '',
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged( auth, user => {
          if (user) {
            loadProfile(user.uid);
          }
        });
    
        return () => unsubscribe();
      }, []);
    
      const loadProfile = async (uid) => {
        try {
          const q = query(collectionUserRef, where('uid', '==', uid));
          const querySnapshot = await getDocs(q);
    
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setProfileData(userData);
            console.log('Loaded profile data:', userData);
          } else {
            console.log('No matching documents for the user');
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      };
  
      const handleSaveProfile = async () => {
        try {
            const q = query(collectionUserRef, where("uid", "==", user.uid));
            const docs = await getDocs(q);

            if (docs.docs.length !== 0) {
                const userDocRef = docs.docs[0].ref;

                // Extract fields that are not empty from profileData
                const updatedProfileData = Object.fromEntries(
                    Object.entries(profileData)
                );

                await updateDoc(userDocRef, updatedProfileData);
                console.log('Profile data updated successfully');

                // Set the button clicked state to true for 1 second
                setIsButtonClicked(true);
                setTimeout(() => {
                    setIsButtonClicked(false);
                }, 1000);
            } else {
                console.log("User not found!");
            }
        } catch (error) {
            console.error('Error updating profile data:', error);
        }
    };
  
    const handleInputChange = (e) => {
            const { name, value } = e.target;
            setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

return (
    <div className="container d-flex justify-content-center align-items-center">
        <div className="card">
            <div className="upper">
        </div>

        <div className="user text-center">
            <div className="profile">
            <img src={user?.photoURL} className="rounded-circle" width="80" alt="Profile" />
            </div>
            <p>{user?.displayName}</p>
        </div>
        
        <div className="p-3 py-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="text-right">Profile Settings</h4>
            </div>
        
            <div className="row mt-2">
            <div className="col-md-6">
                <label className="labels">Username</label>
                <input type="text" className="form-control" placeholder={""} name="username" value={profileData?.username} onChange={handleInputChange} />
            </div> 
            </div>
            <div className="row mt-2">
            <div className="col-md-6">
                <label className="labels">Email</label>
                <input required type="text" className="form-control" placeholder={""} name="email" value={profileData?.email} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
                <label className="labels">Date of Birth</label>
                <input type="date" className="form-control" placeholder={""} name="dateOfBirth" value={profileData?.dateOfBirth} onChange={handleInputChange} />
            </div>
            </div>
            <div className="row mt-2">
            <div className="col-md-6">
                <label className="labels">Password</label>
                <input type="password" className="form-control" placeholder={""} name="password" value={profileData?.password} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
                <label className="labels">Repeat Password</label>
                <input type="password" className="form-control" placeholder={""} name="password" value={""} onChange={handleInputChange} />
            </div>
            </div>
            <div className="row mt-3">
            <div className="col-md-12">
                <label className="labels">Address</label>
                <input type="text" className="form-control" placeholder={""} name="address" value={profileData?.address} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
                <label className="labels">Country</label>
                <input type="text" className="form-control" placeholder={""} name="country" value={profileData?.country} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
                <label className="labels">State/Region</label>
                <input type="text" className="form-control" placeholder={""} name="region" value={profileData?.region} onChange={handleInputChange} />
            </div>
            </div>
            <div className="mt-5 text-center">
            <button
                    className={`btn ${isButtonClicked ? 'btn-success' : 'btn-primary'} profile-button`}
                    type="button"
                    onClick={handleSaveProfile}
                >
                    {isButtonClicked ? 'Profile Saved' : 'Save Profile'}
                </button>
            </div>
        </div>
    </div>
</div>
)};

export default Settings;