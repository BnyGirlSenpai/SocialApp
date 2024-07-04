import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import '../styles/navbar.css';

function Navbar() {
  const { user, logOut } = UserAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logOut()
      navigate('/');
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <header className="p-3 mb-3 border-bottom">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>
      <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossOrigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossOrigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossOrigin="anonymous"></script>

      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-center">
          <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 link-body-emphasis text-decoration-none">
            <svg className="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap">
              <use xlinkHref="#bootstrap"></use>
            </svg>
          </a>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li><a href="/HomePage" className="nav-link px-2 link-body-emphasis">Home</a></li>
            <li><a href="/FriendPage" className="nav-link px-2 link-secondary">Friends</a></li>
            <li><a href="/EventPage" className="nav-link px-2 link-body-emphasis">Events</a></li>
            <li><a href="/MapPage" className="nav-link px-2 link-body-emphasis">Map</a></li>
            <li><a href="/CalenderPage" className="nav-link px-2 link-body-emphasis">Calender</a></li>
          </ul>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
            <li><a href={`/profilepage/${user.uid}`} className="nav-link px-2 link-body-emphasis">Profile</a></li>
            <li><a href="/NotificationPage" className="nav-link px-2 link-body-emphasis">Notifications</a></li>
            <li><a href="/SettingsPage" className="nav-link px-2 link-body-emphasis">Settings</a></li>
          </ul>

          <div className="dropdown text-end">
            {user?.displayName ? (
                <button onClick={handleSignOut}>Logout</button>
              ) : (
                <Link to='/'>Sign in</Link>
              )}
          </div>
          
          <div className="ccol-12 col-lg-auto mb-3 mb-lg-0 me-lg-3">
            <img src={user.photoURL} alt={user.username} className="profile-photo-lg" />
          </div>

        </div>
      </div>
    </header>  
  );
}

export default Navbar;
