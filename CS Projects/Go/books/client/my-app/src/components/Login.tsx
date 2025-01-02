import React from 'react'
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
  const signIn = useSignIn();
  const navigate = useNavigate();

  const onSubmit = async (values: any) => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: 'POST',
        body: JSON.stringify(values)
      })

      const data = await response.json()

      signIn({
        auth: {
          token: data.session_token,
          type: 'Bearer', 
        },
        userState: {
          username: values.username
        },
      });

      //redirect user if log in was successful?!
      navigate('/home')

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
      <nav>
        <Link to="/home">Home</Link>
      </nav>
      <Routes>
        <Route path="/home" element={<App />} />
      </Routes>
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
                defaultValue=""
              />
              <TextField
                required
                id="outlined-password-input"
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
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
