import React from 'react'
import './App.css';
import { Container } from '@mui/material';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from '@auth-kit/react-router/RequireAuth'
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Test from './components/Test';

const App = () => {
  const login = localStorage.getItem("authToken")
  return (
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute/>}>
              <Route element={<Home/>} path='/home'/>
          </Route>
          <Route path="/" element={<Login />}/>
          <Route path='/test' element={<Test />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
