import { createSlice } from '@reduxjs/toolkit'

const readWishlist = () => {
  try {
    const value = localStorage.getItem('shopsphere-wishlist')
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: readWishlist(),
  reducers: {
    toggleWishlist: (state, action) => {
      const itemId = action.payload
      const exists = state.includes(itemId)

      const nextState = exists ? state.filter((id) => id !== itemId) : [...state, itemId]
      localStorage.setItem('shopsphere-wishlist', JSON.stringify(nextState))
      return nextState
    },
    removeFromWishlist: (state, action) => {
      const nextState = state.filter((id) => id !== action.payload)
      localStorage.setItem('shopsphere-wishlist', JSON.stringify(nextState))
      return nextState
    },
  },
})

export const { toggleWishlist, removeFromWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
