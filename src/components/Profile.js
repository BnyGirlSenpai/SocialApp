import React, { useRef, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {

    const { user, userData } = useContext(AuthContext) ;

    const handleSaveProfile = () => {
      // Add logic to save the updated profile data
      // You can use the 'data' state to get the updated values
    };
  
    return (
        <div className="container d-flex justify-content-center align-items-center">
        <div className="card">
        <div className="upper">
        </div>

        <div className="user text-center">
            <div className="profile">
            <img src={userData?.photoURL || user?.photoURL} className="rounded-circle" width="80" alt="Profile" />
            </div>
            <p>{userData?.displayName || user?.displayName}</p>
        </div>

        <div className="mt-5 text-center">
            <h4 className="mb-0"></h4>

            <div className="d-flex justify-content-between align-items-center mt-4 px-4">
            <div className="stats">
                <h6 className="mb-0">Followers</h6>
                <span>8,797</span>
            </div>

            <div className="stats">
                <h6 className="mb-0">Projects</h6>
                <span>142</span>
            </div>

            <div className="stats">
                <h6 className="mb-0">Ranks</h6>
                <span>129</span>
            </div>
            </div>
        </div>

        <div className="p-3 py-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="text-right">Profile Settings</h4>
            </div>
            <div className="row mt-2">
            <div className="col-md-6">
                <label className="labels">Email</label>
                <input type="text" className="form-control" placeholder={userData?.email || user?.email} />
            </div>
            <div className="col-md-6">
                <label className="labels">Date of Birth</label>
                <input type="date" className="form-control" placeholder="" />
            </div>
            </div>
            <div className="row mt-2">
            <div className="col-md-6">
                <label className="labels">Password</label>
                <input type="password" className="form-control" placeholder="" />
            </div>
            <div className="col-md-6">
                <label className="labels">Repeat Password</label>
                <input type="password" className="form-control" placeholder="" />
            </div>
            </div>
            <div className="row mt-3">
            <div className="col-md-12">
                <label className="labels">Address</label>
                <input type="text" className="form-control" placeholder="" />
            </div>
            <div className="col-md-6">
                <label className="labels">Country</label>
                <input type="text" className="form-control" placeholder="" />
            </div>
            <div className="col-md-6">
                <label className="labels">State/Region</label>
                <input type="text" className="form-control" placeholder="" />
            </div>
            </div>
            <div className="mt-5 text-center">
            <button className="btn btn-primary profile-button" type="button">
                Save Profile
            </button>
            </div>
        </div>
        </div>
    </div>
    )
};

export default Profile;