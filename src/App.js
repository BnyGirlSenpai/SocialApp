import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import Protected from './components/Protected';
import { AuthContextProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Signinpage from './pages/SignInPage';
import OwnEventpage from './pages/OwnEventPage';
import JoinedEventpage from './pages/JoinedEventPage';
import Friendpage from './pages/FriendPage';
import Mappage from './pages/MapPage';
import Calenderpage from './pages/CalenderPage';
import Settingspage from './pages/SettingsPage';
import Profilepage from './pages/ProfilePage';
import Notifications from './pages/NotificationPage';
import ProfileSettingspage from './pages/ProfileSettingsPage';
import EventFormpage from './pages/EventFormPage';
import EditEventFormpage from './pages/EditEventFormPage';
import EditItemListFormpage from './pages/EditItemListFormPage';
import EventDetailpage from './pages/EventDetailPage';
import './App.css';

const App = () => {
  return (
      <div className="App">
        <AuthContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Signinpage />} />
              <Route path='/OwnEventsPage' element={<Protected><OwnEventpage /></Protected>} />
              <Route path='/JoinedEventsPage' element={<Protected><JoinedEventpage /></Protected>} />
              <Route path='/FriendPage' element={<Protected><Friendpage /></Protected>} />
              <Route path='/MapPage' element={<Protected><Mappage /></Protected>} />
              <Route path='/CalenderPage' element={<Protected><Calenderpage /></Protected>} />
              <Route path='/SettingsPage' element={<Protected><Settingspage /></Protected>} />
              <Route path='/NotificationPage' element={<Protected><Notifications /></Protected>} />
              <Route path='/ProfilePage/:uid' element={<Protected><Profilepage /></Protected>} />
              <Route path='/ProfileSettingsPage' element={<Protected><ProfileSettingspage /></Protected>} />
              <Route path='/EventFormPage' element={<Protected><EventFormpage /></Protected>} />
              <Route path='/EditItemListFormPage/:event_id' element={<Protected><EditItemListFormpage /></Protected>} />
              <Route path='/EditEventFormPage/:event_id' element={<Protected><EditEventFormpage /></Protected>} />
              <Route path='/EventPage/EventDetailPage/:event_id' element={<Protected><EventDetailpage /></Protected>} />
              <Route path='/HomePage' element={<Protected><HomePage /></Protected>} />
            </Routes>
          </BrowserRouter>
        </AuthContextProvider>
      </div>
  );
};

export default App;
