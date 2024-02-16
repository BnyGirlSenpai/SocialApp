import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import Protected from './components/Protected';
import { AuthContextProvider } from './context/AuthContext';
import HomePage from './Pages/HomePage';
import Signin from './Pages/SignInPage';
import Eventpage from './Pages/EventPage';
import Friendpage from './Pages/FriendPage';
import Mappage from './Pages/MapPage';
import Calenderpage from './Pages/CalenderPage';
import Profilepage from './Pages/ProfilePage';

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
