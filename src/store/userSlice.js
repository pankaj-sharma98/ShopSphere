import { createSlice } from '@reduxjs/toolkit'
import { defaultAddresses, orderHistory } from '../data/mockData'

const initialState = {
  isAuthenticated: false,
  currentUser: {
    name: 'Ariana Stone',
    email: 'ariana@shopsphere.com',
    phone: '+1 (212) 555-0123',
  },
  addresses: defaultAddresses,
  orders: orderHistory,
  lastOrder: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true
      state.currentUser = action.payload
    },
    register: (state, action) => {
      state.isAuthenticated = true
      state.currentUser = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.currentUser = null
    },
    updateProfile: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload }
    },
    addAddress: (state, action) => {
      state.addresses = [action.payload, ...state.addresses]
    },
    placeOrder: (state, action) => {
      const order = {
        ...action.payload,
        date: new Date().toISOString().slice(0, 10),
      }
      state.lastOrder = order
      state.orders = [order, ...state.orders]
    },
  },
})

export const { login, register, logout, updateProfile, addAddress, placeOrder } = userSlice.actions
export default userSlice.reducer
