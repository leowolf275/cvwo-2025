import React, { Key, useContext, useEffect, useState } from 'react';
import './Home.css';
import SearchBar from './SearchBar'
import {Book} from '../../types/Book'
import { Box, Button, Card, CardContent, IconButton, Modal, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FileWatcherEventKind } from 'typescript';
import InnerCard from '../Books/InnerCard';
import { useNavigate } from 'react-router-dom';
import CreateBook from '../Books/CreateBook';

export const ENDPOINT = "http://localhost:3000";

function Home() {
    const navigate = useNavigate()

    const [books, setBooks] = useState<Book[]>([]);
    const [filtered, setFiltered] = useState<Book[]>([]);
    const [selected, setSelected] = useState<String[]>([]);
    
    // For Modal Books:
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    //For Modal Create Books:
    const [openCreate, setOpenCreate] = React.useState(false);
    const handleOpenCreate = () => setOpenCreate(true);
    const handleCloseCreate = () => setOpenCreate(false);
  
    useEffect(() => {
      const fetchBooks = async () => {
        const response = await fetch(`${ENDPOINT}/books`);
        const books = await response.json() as Book[];
        setBooks(books)
        setFiltered(books)
      }

      console.log(books)
  
      fetchBooks();
    }, []);

    const handleSearch = (query: string) => {
      const newFiltered = books.filter((book) => book.title.includes(query))
    }

    const handleSelect = (book: string) => {
      setSelected([...selected, book])
    }

    const handleLogout = async () => {
      try {
        const response = await fetch("http://localhost:3000/logout", {
          method: "POST",
          credentials: "include", // Include cookies
        })

        localStorage.removeItem("authToken")
        localStorage.removeItem("userid")

        navigate("/")
      } catch (error) {
        console.error("There was an error!")
      }
    }


    return (
      <div className="App">
        <h1>Fetching Data</h1>
        <Box display="flex" justifyContent="center" alignItems="center" paddingBottom={'20px'}>
          <SearchBar books={books} onSearch={handleSearch} onSelect={handleSelect}/>
        </Box>
        <Box display="flex" justifyContent="center">
          <Button sx={{marginLeft: '350px'}} variant="contained" onClick={handleOpenCreate}>Create Book</Button>
          <Modal
                open={openCreate}
                onClose={handleCloseCreate}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
          >
              <CreateBook/>
          </Modal>
        </Box>
        <Grid container justifyContent="center">
          {filtered?.map((book) => 
                <Grid key={book.id} size={12}>
                  <Button onClick={handleOpen} style={{textTransform: 'none'}}>
                  <Card sx={{ display: 'flex', justifyContent: 'space-evenly', margin: 'auto', width: '500px', flexDirection: 'row' }}>
                    <Box alignItems='center' justifyContent='center' margin='auto'>
                      Tags:
                      {book.tags?.map((tag) => 
                      <div>
                        {tag}
                      </div>)}
                    </Box>
                                        
                    <Box margin='auto' >
                      <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography component="div" variant="h5">
                          {book.title.toLowerCase()}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          sx={{ color: 'text.secondary' }}
                        >
                          {book.description.toLowerCase()}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                  </Button>
                  <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                      <InnerCard/>
                  </Modal>
                </Grid>
          )}
        </Grid>

        <button onClick={handleLogout}>Logout</button>  
      </div>
    );
}

export default Home;
