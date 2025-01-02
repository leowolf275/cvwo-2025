import React from 'react'
import './App.css';
import { Container } from '@mui/material';
import Home from './components/Home';
import Login from './components/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from '@auth-kit/react-router/RequireAuth'

const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={
              <Home />
            }/>
          <Route path="/" element={<Login />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
