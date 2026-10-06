import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileNavOpen: false,
    searchOpen: false,
  },
  reducers: {
    setMobileNavOpen: (state, action) => {
      state.mobileNavOpen = action.payload
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload
    },
  },
})

export const { setMobileNavOpen, setSearchOpen } = uiSlice.actions
export default uiSlice.reducer
