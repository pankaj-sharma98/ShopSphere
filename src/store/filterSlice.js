import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  query: '',
  category: 'all',
  sort: 'featured',
  maxPrice: 300,
}

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload
    },
    setCategory: (state, action) => {
      state.category = action.payload
    },
    setSort: (state, action) => {
      state.sort = action.payload
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload
    },
    clearFilters: () => initialState,
  },
})

export const { setQuery, setCategory, setSort, setMaxPrice, clearFilters } = filterSlice.actions
export default filterSlice.reducer
