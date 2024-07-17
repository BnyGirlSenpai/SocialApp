import React, { useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import '../styles/signIn.css';

const Signin = () => {
  const { googleSignIn, user } = UserAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      alert("Something went wrong!")
      console.log(error);
    }
  };

  useEffect(() => {
    if (user != null) {
      navigate('/Homepage');
    }
  }, [user,navigate]);

  return (
    <div> 
    <video className="video-background" autoPlay loop muted>
      <source src="Videos/LoginBackground.mp4" type="video/mp4" />
      Your browser does not support the video tag!
    </video>
    <Button variant="contained" onClick={handleGoogleSignIn} className='sign-in-button'>
      Sign In with Google
    </Button>
    </div>
  );
};

export default Signin;