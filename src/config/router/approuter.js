import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../../Pages/Admindashbord'
import Login from '../../Pages/Login'
import Studentdashbord from '../../Pages/Studentdashbord'
import Teacherdashbord from '../../Pages/Teacherdashbord'

function Approuter() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route path="/student-dashboard/*" element={<Studentdashbord/>} />
      <Route path="/teacher-dashboard/*" element={<Teacherdashbord/>} />
        <Route path='/' element={<Login/>}/>
        <Route path='/*' element={<Home/> }/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Approuter
