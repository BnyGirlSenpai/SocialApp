import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend,updateDataInDb }  from '../apis/UserDataApi';

const ProfileSettings = () => {
    const { user } = UserAuth();
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const data = await getDataFromBackend(`http://localhost:3001/api/users/${user.uid}`);
                    setUsername(data[0]?.username || '');
                    setEmail(data[0]?.email || '');
                    setDateOfBirth(data[0]?.dateOfBirth || '');
                    setPassword(data[0]?.password || '');
                    setAddress(data[0]?.address || '');
                    setCountry(data[0]?.country || '');
                    setRegion(data[0]?.region || '');
                    setPhoneNumber(data[0]?.phoneNumber || '');
                    setDescription(data[0]?.description || '');
                    console.log("Loaded data from server:", data);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'username':
                setUsername(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'dateOfBirth':
                setDateOfBirth(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'address':
                setAddress(value);
                break;
            case 'country':
                setCountry(value);
                break;
            case 'region':
                setRegion(value);
                break;
            case 'phoneNumber':
                setPhoneNumber(value);
                break;
            case 'description':
                setDescription(value);
                break;
            default:
                break;
        }
    };
    
    const handleSaveProfile = async () => { 
        try {
            if (user) {
                const updatedData = [username, email, dateOfBirth, password, address, country, region, phoneNumber, description, user.uid];
                console.log('Data to server:', updatedData);
                await updateDataInDb(JSON.stringify(updatedData), 'http://localhost:3001/api/users/update'); 
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
                                <input required type="text" className="form-control" placeholder={""} name="username" value={username} onChange={handleInputChange} />
                            </div> 

                            <div className="col-md-6">
                                <label className="labels">Email</label>
                                <input required type="text" className="form-control" placeholder={""} name="email" value={email} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-6">
                                <label className="labels">Password</label>
                                <input required type="password" className="form-control" placeholder={""} name="password" value={password} onChange={handleInputChange} />
                            </div>

                            <div className="col-md-6">
                                <label className="labels">Date of Birth</label>
                                <input required type="date" className="form-control" placeholder={""} name="dateOfBirth" value={dateOfBirth} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <label className="labels">Address</label>
                                <input type="text" className="form-control" placeholder={""} name="address" value={address} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="labels">PhoneNumber</label>
                                <input type="text" className="form-control" placeholder={""} name="phoneNumber" value={phoneNumber} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="labels">Country</label>
                                <input type="text" className="form-control" placeholder={""} name="country" value={country} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="labels">State/Region</label>
                                <input type="text" className="form-control" placeholder={""} name="region" value={region} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-12">
                            <label className="labels">Description</label>
                            <textarea className="form-control" placeholder={""} name="description" value={description} onChange={handleInputChange} />
                        </div>
                        </div>
                        <div className="mt-5 text-center">
                            <button
                                className={`btn ${isButtonClicked ? 'btn-success' : 'btn-primary'} profile-button`}
                                type="button"
                                onClick={handleSaveProfile}> 
                                {isButtonClicked ? 'Profile Saved' : 'Save Profile'}
                            </button> 
                        </div>
                    </div>
                </div>
            </div> 
        </form>
    );
};

export default ProfileSettings;