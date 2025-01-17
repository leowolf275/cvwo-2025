/**
 * Imported the Search Input Component from the MUI library.
 * Code can be found here: 
 * https://mui.com/material-ui/react-autocomplete/#search-input
 */

import * as React from 'react';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import {Book} from '../../types/Book'
import { ListItem, MenuItem, Stack } from '@mui/material';

interface SearchBarProps {
  books: Book[]
  onSearch: (query: string) => void
  onSelect: (query: string) => void
}

export default function SearchBar(props: SearchBarProps) {
    const {books, onSearch, onSelect} = props

    const [query, setQuery] = useState('')

    const handleInput = (query: string) => {
      setQuery(query)
      onSelect(query)
      onSearch(query)
    }

    return (
      <Stack spacing={2} sx={{ width: 300 }}>
        <Autocomplete
          freeSolo
          id="free-solo-2-demo"
          disableClearable
          value={query}
          onInput={(e) => {
            const elem = e.target as HTMLInputElement
            handleInput(elem.value)
          }}
          options={books}
          getOptionLabel={(option) => typeof option === "string" ? option : option['title']}
          renderOption={(props, option) => (
            <MenuItem key={option.id} value={option.title} onClick={() => handleInput(option.title)}>
              {option.title}
            </MenuItem>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search input"
              slotProps={{
                input: {
                  ...params.InputProps,
                  type: 'search',
                },
              }}
            />
          )}
        />
      </Stack>
    );
}