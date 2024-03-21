import {React, useState, useEffect} from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Protected = ({ children }) => {
  const { user } = UserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust the delay time as needed (in milliseconds)
    return () => clearTimeout(delay);
  }, []);

  if (loading) {
    // Render loading indicator or message while waiting
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to='/' />;
  }
  return children;
};

export default Protected;