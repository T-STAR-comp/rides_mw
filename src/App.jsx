import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import DriverComp from './members/driverComp/driverComp';
import LandingPage from './landing/landingPage';

function App() {

  if (sessionStorage.getItem('userLogged')) {
    return (
      <Routes>
        <Route path='/' element={<Home/>} />
      </Routes>
    );
  }

  if (sessionStorage.getItem('driverLogged')) {
    return(
      <Routes>
        <Route path='/' element={<DriverComp/>} />
      </Routes>
    );
  }

  return (
      <Routes>
        <Route path='l' element={<DriverComp/>} />
        <Route path='/' element={<LandingPage/>} />
      </Routes>
  );
}

export default App;
