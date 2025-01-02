import React, { Key, useEffect, useState } from 'react';
import './Home.css';
import SearchBar from './SearchBar'
import {Book} from '../types'
import { Box, Button, Card, CardContent, IconButton, Modal, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FileWatcherEventKind } from 'typescript';
import InnerCard from './InnerCard';


export const ENDPOINT = "http://localhost:3000";


function Home() {
    const [books, setBooks] = useState<Book[]>([]);
    const [filtered, setFiltered] = useState<Book[]>([]);
    const [selected, setSelected] = useState<String[]>([]);
    
    // For Modal:
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    useEffect(() => {
      const fetchBooks = async () => {
        const response = await fetch(`${ENDPOINT}/books`);
        const books = await response.json() as Book[];
        setBooks(books)
        setFiltered(books)
      }
  
      fetchBooks();
    }, []);

    const handleSearch = (query: string) => {
      const newFiltered = books.filter((book) => book.name.includes(query))
      setFiltered(newFiltered)
    }

    const handleSelect = (book: string) => {
      setSelected([...selected, book])
      console.log(selected)
    }

    return (
      <div className="App">
        <h1>Fetching Data</h1>
        <Box display="flex" justifyContent="center" alignItems="center" paddingBottom={'20px'}>
          <SearchBar books={books} onSearch={handleSearch} onSelect={handleSelect}/>
        </Box>

        <Grid container justifyContent="center">
          {filtered?.map((book) => 
                <Grid key={book.id} size={12}>
                  <Button onClick={handleOpen} style={{textTransform: 'none'}}>
                  <Card sx={{ display: 'flex', justifyContent: 'space-evenly', margin: 'auto', width: '500px', flexDirection: 'row' }}>
                    <Box alignItems='center' justifyContent='center' margin='auto'>
                      Icon
                    </Box>
                    
                    <Box margin='auto' >
                      <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography component="div" variant="h5">
                          {book.name.toLowerCase()}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          sx={{ color: 'text.secondary' }}
                        >
                          {book.author.toLowerCase()}
                          Helooooooo
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

      </div>
    );
}

export default Home;
