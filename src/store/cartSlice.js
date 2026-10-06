import { createSlice } from '@reduxjs/toolkit'

const readCart = () => {
  try {
    const value = localStorage.getItem('shopsphere-cart')
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: readCart(),
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload
      const existingItem = state.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.push({ ...product, quantity: 1 })
      }

      localStorage.setItem('shopsphere-cart', JSON.stringify(state))
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.find((entry) => entry.id === id)

      if (!item) return

      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        return state.filter((entry) => entry.id !== id)
      }

      localStorage.setItem('shopsphere-cart', JSON.stringify(state))
      return state
    },
    removeFromCart: (state, action) => {
      const nextState = state.filter((item) => item.id !== action.payload)
      localStorage.setItem('shopsphere-cart', JSON.stringify(nextState))
      return nextState
    },
    clearCart: () => {
      localStorage.setItem('shopsphere-cart', JSON.stringify([]))
      return []
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
