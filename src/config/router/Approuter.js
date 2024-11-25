// app/router/AppRouter.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'; // React Router import karein
import Home from '../../Pages/Home';
import Signup from '../../Pages/SignUp';
import Login from '../../Pages/Login';
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Login/>} />

        {/* Signup Route */}
        <Route path="/signup" element={<Signup />} />
        
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Dynamic Route for Protected Home page */}
        <Route path="/*"  element={<Home />}  />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
