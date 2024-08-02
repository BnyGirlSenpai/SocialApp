import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/navbar.css';

function NavBar() {
  const { user, logOut } = UserAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-3 border-bottom">
      <Navbar.Brand href="/">My Event App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/HomePage">Home</Nav.Link>
          <Nav.Link href="/FriendPage">Friends</Nav.Link>
          <NavDropdown title="Events" id="basic-nav-dropdown">
            <NavDropdown.Item href="/OwnEventsPage">My Events</NavDropdown.Item>
            <NavDropdown.Item href="/JoinedEventsPage">Joined Events</NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="/MapPage">Map</Nav.Link>
          <Nav.Link href="/CalenderPage">Calender</Nav.Link>
          <Nav.Link href={`/profilepage/${user?.uid}`}>Profile</Nav.Link>
          <Nav.Link href="/NotificationPage">Notifications</Nav.Link>
          <Nav.Link href="/SettingsPage">Settings</Nav.Link>
        </Nav>
        <Nav className="ml-auto">
          {user?.photoURL && (
            <img src={user.photoURL} alt={user.username} className="profile-photo-lg" />
          )}
        </Nav>
        <Nav.Link onClick={handleSignOut}>Logout</Nav.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;
