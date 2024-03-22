import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import Protected from './components/Protected';
import { AuthContextProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Signin from './pages/SignInPage';
import Eventpage from './pages/EventPage';
import Friendpage from './pages/FriendPage';
import Mappage from './pages/MapPage';
import Calenderpage from './pages/CalenderPage';
import Settingspage from './pages/SettingsPage';
import Profilepage from './pages/ProfilePage';
import Notifications from './pages/NotificationPage';
import ProfileSettingspage from './pages/ProfileSettingsPage';
import EventFormpage from './pages/EventFormPage';

function App() {
  return (
    <div className="App">    
      <AuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Signin />} />
            <Route path='/EventPage' element={  
              <Protected>
                <Eventpage />
              </Protected>
            } />
            <Route path='/FriendPage' element={
              <Protected>
                <Friendpage />
              </Protected>
            } />
            <Route path='/MapPage' element={
              <Protected>
                <Mappage />
              </Protected>    
            } />
            <Route path='/CalenderPage' element={
              <Protected>
                <Calenderpage />
              </Protected>           
            } />
            <Route path='/SettingsPage' element={           
              <Protected>
                <Settingspage />
              </Protected>        
            } />
            <Route path='/NotificationPage' element={
              <Protected>
                <Notifications />
              </Protected>              
            } />
            <Route path='/ProfilePage/:uid' element={
              <Protected>
                <Profilepage />
              </Protected> 
            } />
            <Route path='/ProfileSettingsPage' element={
              <Protected>
                <ProfileSettingspage />
              </Protected> 
            } />
            <Route path='/EventFormpage' element={
              <Protected>
                <EventFormpage />
              </Protected> 
            } />
            <Route path='/HomePage'element={
              <Protected>
                <HomePage />
              </Protected>
            } />
          </Routes>
        </BrowserRouter>
      </AuthContextProvider>   
    </div>
  );
}

export default App;
