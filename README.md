# ShopSphere

ShopSphere is a modern, production-style React e-commerce frontend built as a portfolio-ready storefront for a fresher/junior frontend developer. The app is designed to feel like a commercial shopping platform with responsive layouts, polished cards, shopping flows, and a clean premium visual system.

## Overview

This project demonstrates:
- React + Vite application architecture
- Redux Toolkit state management
- Product browsing, filtering, and search flows
- Wishlist and cart functionality
- Checkout and order confirmation flow
- Authentication screens and account dashboard
- Responsive design across desktop, tablet, and mobile
- Use of Tailwind CSS, modern UI patterns, and reusable components

## Tech Stack

- React
- Vite
- JavaScript (ES6+)
- Redux Toolkit
- React Router
- React Hook Form
- Zod
- Tailwind CSS
- Recharts
- Sonner
- date-fns
- Lucide React

## Features

### Storefront
- Responsive home page with hero section and featured categories
- Product listing page with filters and sorting
- Category browsing page
- Search suggestions and search result page
- Product detail page with related items
- Wishlist management
- Shopping cart with quantity controls and total summary
- Checkout form with validation
- Order success confirmation page

### User Experience
- Login and registration pages
- Forgot password flow
- User profile management
- Account dashboard overview
- Order history and order detail views
- Saved addresses management
- About, contact, FAQ, privacy, and terms pages
- 404 page

### Admin-style frontend
- Admin dashboard overview
- Analytics cards and chart widgets
- Sales/traffic chart visualization

### UX enhancements
- Responsive mobile navigation
- Dark mode toggle with persisted preference
- Loading skeleton states
- Modern card-based layouts
- Smooth hover effects and polished styling

## Project Structure

```bash
src/
├── App.jsx
├── main.jsx
├── index.css
├── data/
│   └── mockData.js
├── store/
│   ├── cartSlice.js
│   ├── wishlistSlice.js
│   ├── productsSlice.js
│   ├── filterSlice.js
│   ├── userSlice.js
│   ├── uiSlice.js
│   └── store.js
└── assets/
```

## Data Sources

The app uses a public product API layer via DummyJSON for product data. A fallback mock dataset is included in case the API is unavailable or rate-limited.

## Installation

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
```

## Run locally

```bash
npm run dev -- --host 0.0.0.0
```

Then open:

```bash
http://localhost:5173/
```

## Notes

- This is a frontend-only app.
- No custom backend, database, or server-side authentication is used.
- Browser storage is used for cart, wishlist, and theme persistence.
- The project is structured to be deployable on Vercel or Netlify.

## Portfolio Use

This project is intended to serve as a polished frontend portfolio piece demonstrating modern React practices, reusable UI patterns, and a strong design sense for an e-commerce product.

## License

This project is created for learning and portfolio demonstration purposes.
