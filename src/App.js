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


function App() {
  return (
    <div className="App">    
      <AuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Signin />} />
            <Route path='/EventPage' element={<Eventpage />} />
            <Route path='/FriendPage' element={<Friendpage />} />
            <Route path='/MapPage' element={<Mappage />} />
            <Route path='/CalenderPage' element={<Calenderpage />} />
            <Route path='/SettingsPage' element={<Settingspage />} />
            <Route path='/NotificationPage' element={<Notifications />} />
            <Route path='/ProfilePage' element={<Profilepage />} />
            <Route path='/HomePage'element={
                <Protected>
                  <HomePage />
                </Protected>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthContextProvider>   
    </div>
  );
}

export default App;
