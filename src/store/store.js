import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import wishlistReducer from './wishlistSlice'
import productReducer from './productsSlice'
import userReducer from './userSlice'
import filterReducer from './filterSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    user: userReducer,
    filters: filterReducer,
    ui: uiReducer,
  },
})
