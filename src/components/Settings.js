import React, { useState, useEffect, useContext } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend,updateUserDataInDb }  from '../apis/UserDataApi';

const Settings = () => {
    const { user } = UserAuth();
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        dateOfBirth: '',
        password: '',
        address: '',
        country: '',
        region: '',
        phoneNumber: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const data = await getDataFromBackend(user.uid);
                    setProfileData(data);
                    console.log("Loaded data from server:", data);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
        return () => {
        };
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(() => ({
            
            [name]: value,
            uid: user.uid 
        }));
    };
    
    const handleSaveProfile = async () => { 
        try {
            if (profileData) {
                console.log('Data to server:', profileData);
                updateUserDataInDb(profileData); 
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

return (
    <form> 
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
                            <input required type="text" className="form-control" placeholder={""} name="username" value={profileData?.[0]?.username} onChange={handleInputChange} />
                        </div> 

                        <div className="col-md-6">
                            <label className="labels">Email</label>
                            <input required type="text" className="form-control" placeholder={""} name="email" value={profileData?.[0]?.email} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-md-6">
                            <label className="labels">Password</label>
                            <input required type="password" className="form-control" placeholder={""} name="password" value={profileData?.[0]?.password} onChange={handleInputChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="labels">Date of Birth</label>
                            <input required type="date" className="form-control" placeholder={""} name="dateOfBirth" value={profileData?.[0]?.dateOfBirth} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="row mt-2">
                    
                    </div>

                    <div className="row mt-3">
                        <div className="col-md-6">
                            <label className="labels">Address</label>
                            <input type="text" className="form-control" placeholder={""} name="address" value={profileData?.[0]?.address} onChange={handleInputChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="labels">PhoneNumber</label>
                            <input type="text" className="form-control" placeholder={""} name="phoneNumber" value={profileData?.[0]?.phoneNumber} onChange={handleInputChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="labels">Country</label>
                            <input type="text" className="form-control" placeholder={""} name="country" value={profileData?.[0]?.country} onChange={handleInputChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="labels">State/Region</label>
                            <input type="text" className="form-control" placeholder={""} name="region" value={profileData?.[0]?.region} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <button
                            className={`btn ${isButtonClicked ? 'btn-success' : 'btn-primary'} profile-button`}
                            type="button"
                            onClick={() => handleSaveProfile()}> {/* Pass user object to handleSaveProfile */}
                            {isButtonClicked ? 'Profile Saved' : 'Save Profile'}
                        </button> 
                    </div>
                </div>
            </div>
        </div> 
    </form>
)}; 
export default Settings;
