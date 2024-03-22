import React, { useEffect } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
  const { googleSignIn, user } = UserAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user != null) {
      navigate('/Homepage');
    }
  }, [user]);

  return (
    <div className='Main'>
      <h2>Look like you're lost in space</h2>
      <img src="//images01.nicepage.com/c461c07a441a5d220e8feb1a/912e8a6d1ca35b4e9771774e/4566.png" alt="png"/>
        <GoogleButton onClick={handleGoogleSignIn} />
    </div>
  );
};

export default Signin;