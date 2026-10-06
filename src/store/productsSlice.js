import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const fallbackProducts = [
  {
    id: 1,
    title: 'Premium Wireless Headphones',
    price: 199.99,
    rating: 4.8,
    category: 'Electronics',
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    description: 'Immersive sound with adaptive noise cancellation and all-day comfort.',
    stock: 28,
    brand: 'Auralis',
  },
  {
    id: 2,
    title: 'Urban Leather Tote',
    price: 89.0,
    rating: 4.6,
    category: 'Fashion',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    description: 'Sleek everyday carry for work, travel, and polished everyday looks.',
    stock: 42,
    brand: 'Mila Studio',
  },
  {
    id: 3,
    title: 'Minimal Desk Lamp',
    price: 64.5,
    rating: 4.7,
    category: 'Home',
    thumbnail: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'Warm ambient lighting with a clean modern silhouette.',
    stock: 15,
    brand: 'Northline',
  },
  {
    id: 4,
    title: 'Hydrating Facial Serum',
    price: 42.0,
    rating: 4.9,
    category: 'Beauty',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    description: 'A lightweight glow-boosting formula made for everyday radiance.',
    stock: 31,
    brand: 'Verve',
  },
  {
    id: 5,
    title: 'Performance Running Shoes',
    price: 129.0,
    rating: 4.5,
    category: 'Sports',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    description: 'Cushioned support built to move from everyday training to race day.',
    stock: 19,
    brand: 'Summit Run',
  },
  {
    id: 6,
    title: 'Classic Smart Watch',
    price: 179.0,
    rating: 4.8,
    category: 'Accessories',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    description: 'Track fitness goals and stay connected in a refined everyday format.',
    stock: 25,
    brand: 'Pulse',
  },
]

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await fetch('https://dummyjson.com/products?limit=24')

  if (!response.ok) {
    throw new Error('Unable to load products')
  }

  const data = await response.json()
  return data.products.length ? data.products : fallbackProducts
})

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: fallbackProducts,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const selectProducts = (state) => state.products.items
export const selectProductById = (state, productId) =>
  state.products.items.find((product) => String(product.id) === String(productId))

export default productsSlice.reducer
