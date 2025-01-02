import { Box } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React from 'react'
import './Home.css'

const style = {
    top: '50%',
    left: '50%',
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#fff',
    padding: 4,
  };

const InnerCard = () => {
  return (
    <div>
      <Grid container sx={style}>
        <Grid>
            Hello
        </Grid>
      </Grid>
    </div>
  )
}

export default InnerCard
