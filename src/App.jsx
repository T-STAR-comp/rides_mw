import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import DriverComp from './members/driverComp/driverComp';
import LandingPage from './landing/landingPage';
import PaymentFailed from './components/PaymentFailed';
import Offline from './components/offline/Offline';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) setIsOnline(true);
    else window.location.reload();
  };

  if (!isOnline) {
    return (
      <Routes>
        <Route path="/" element={<Offline onRetry={handleRetry} />} />
      </Routes>
    );
  }

  if (sessionStorage.getItem('userLogged')) {
    return (
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/paymentstatus' element={<PaymentFailed/>} />
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
        <Route path='/' element={<LandingPage/>} />
      </Routes>
  );
}

export default App;
