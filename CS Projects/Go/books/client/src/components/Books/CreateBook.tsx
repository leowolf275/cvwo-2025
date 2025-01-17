import { Box, Button, Chip, Container, MenuItem, OutlinedInput, TextField } from '@mui/material'
import React from 'react'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';

const style = {
    top: '50%',
    left: '50%',
    position: 'fixed',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#fff',
    padding: 4,
  };

const tags = [
  'Fiction',
  'Adventure',
  'Fantasy'
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


const CreateBook = () => {
  const navigate = useNavigate();

  const [booktags, setBookTags] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof booktags>) => {
    const {
      target: { value },
    } = event;
    
    setBookTags(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const onSubmit = async (values: any) => {
    console.log(1)
    try {
      const data = {
        ...values,
        tags: booktags,
        userid: parseInt(localStorage.getItem('userid') || '0')
      }
  
      const response = await fetch("http://localhost:3000/create", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify(data),
        credentials: 'include'
      })
      
      const newData = await response.json()

      if (newData) {
        navigate('/home')
      }
    } catch (error) {
      console.log(error)
      console.log("There was an error, try again bro")
    }
  }
  
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    }, onSubmit
  })

  return (
    <Container sx={style}>
        <h2>Create a Book here!</h2>
      <form onSubmit={formik.handleSubmit}>
        <TextField
            required
            id="outlined-required"
            name="title"
            label="Title"
            type='text'
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
        />
        <br></br>
        <TextField
            required
            id="outlined-password-input"
            name="description"
            type="text"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
        />
        <br></br>
        <Select
          multiple
          value={booktags}
          onChange={handleChange}
          input={<OutlinedInput label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {tags.map((tag) => (
            <MenuItem
              key={tag}
              value={tag}
            >
              {tag}
            </MenuItem>
          ))}
        </Select>  
        <button type='submit'>Create Book</button>  
      </form>
    </Container>
  )
}

export default CreateBook
