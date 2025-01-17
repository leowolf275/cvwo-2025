import React, { useContext } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import App from '../App'
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useNavigate } from 'react-router-dom';


// const LoginButton = styled(Button)({
//   textTransform: 'none',
//   fontSize: '16px',
//   width: '100%'
// })


const Login = () => {
  const navigate = useNavigate();

  const onSubmit = async (values: any) => {
    try {

      const response = await fetch("http://localhost:3000/login", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.session_token) {
        localStorage.setItem('authToken', data.session_token)
        localStorage.setItem('userid', data.userid)
        navigate('/home')
      }

    } catch (error) {
      console.log(error)
      console.log("There was an error, try again bro")
    }
  }

  const formik = useFormik({
    initialValues: {
      username: "",
      password: ""
    }, onSubmit
  });

  return (
    <div>
    <div className='center-compo'>
          <Card sx={{ display: 'flex', justifyContent: 'space-evenly', margin: 'auto', width: '300px', padding: '20px', flexDirection: 'column' }}>
            <Box>
              <h3>Login Form</h3>
            </Box>
            <CardContent>
            <Box sx={{display: 'flex', justifyContent: 'space-evenly', height: '150px', flexDirection: 'column', margin: 'auto'}}>
              <form onSubmit={formik.handleSubmit}>
              <TextField
                required
                id="outlined-required"
                name="username"
                label="Username"
                type='text'
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
              <TextField
                required
                id="outlined-password-input"
                name="password"
                type="password"
                label="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <button type='submit'>Login</button>
              </form>
            </Box>
            </CardContent>
            <p>If you are a new user, simply create a username and password!</p>
          </Card>
    </div>
    </div>
  )
}

export default Login
