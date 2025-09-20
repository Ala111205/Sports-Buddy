import { useContext, useState } from 'react';
import './App.css';
import { AuthContext } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/navbar';
import Register from './pages/Register';
import Login from './pages/login';
import CreateEvent from './pages/createEvent';
import Events from './pages/Events';
import EventsDetails from './pages/Events';
import SportsAvailability from './pages/sports';
import Home from './pages/home';

function App() {
  const {user, loading} = useContext(AuthContext);

  if(loading) return <p className='loader'><span></span> <span></span> <span></span></p>

  return (
    <>
      <div className="container">
        <Router>
          <Navbar />
          <Routes>
            <Route path='/Login' element={<Login />} />
            <Route path='/Register' element={<Register />} />
            <Route path='/Create' element={<CreateEvent />} />
            <Route path='/events' element={<Events />} />
            <Route path='/events/:sportId' element={<EventsDetails />} />
            <Route path='/Sports' element={<SportsAvailability />} />
            <Route path='/' element={<Home />} />
          </Routes>
        </Router>

      </div>
    </>
  )
}

export default App
