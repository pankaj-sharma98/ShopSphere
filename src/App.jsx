import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowRight, Bell, CheckCircle2, ChevronRight, CircleCheckBig, CircleUserRound, CreditCard, Dumbbell, Filter, Heart, Home, Laptop, Mail, MapPin, Menu, Package, Percent, Phone, Search, ShieldCheck, Shirt, ShoppingBag, Sparkles, Star, Store, TrendingUp, Truck, Users, Watch, X } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Toaster, toast } from 'sonner'
import { categories, promoCards, reviews } from './data/mockData'
import { addToCart, clearCart, removeFromCart, updateQuantity } from './store/cartSlice'
import { fetchProducts, selectProducts } from './store/productsSlice'
import { setCategory, setMaxPrice, setQuery, setSort } from './store/filterSlice'
import { toggleWishlist } from './store/wishlistSlice'
import { addAddress, login, logout, placeOrder, register, updateProfile } from './store/userSlice'
import { setMobileNavOpen } from './store/uiSlice'

const iconMap = {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Watch,
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const productSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Phone number is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'ZIP is required'),
  country: z.string().min(2, 'Country is required'),
})

const createOrderId = () => `SO-${Date.now().toString().slice(-6)}`
const createAddressId = () => `addr-${Date.now()}`

function App() {
  return <ShopSphereApp />
}

function ShopSphereApp() {
  const dispatch = useDispatch()
  const products = useSelector(selectProducts)
  const { status } = useSelector((state) => state.products)
  const { query, category, sort, maxPrice } = useSelector((state) => state.filters)
  const cartItems = useSelector((state) => state.cart)
  const wishlist = useSelector((state) => state.wishlist)
  const user = useSelector((state) => state.user)
  const mobileMenuOpen = useSelector((state) => state.ui.mobileNavOpen)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const matchesQuery =
        !normalized ||
        product.title.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized) ||
        product.brand.toLowerCase().includes(normalized)
      const matchesCategory = category === 'all' || product.category === category
      const matchesPrice = product.price <= maxPrice
      return matchesQuery && matchesCategory && matchesPrice
    })

    switch (sort) {
      case 'price-low':
        return [...filtered].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...filtered].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating)
      case 'newest':
        return [...filtered].sort((a, b) => b.id - a.id)
      default:
        return filtered
    }
  }, [products, query, category, sort, maxPrice])

  const featuredProducts = products.slice(0, 4)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const wishlistCount = wishlist.length

  return (
    <div className={"min-h-screen bg-slate-50 text-slate-900"}>
      <Toaster richColors closeButton position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              user={user}
              mobileMenuOpen={mobileMenuOpen}
              products={products}
              query={query}
            />
          }
        >
          <Route index element={<HomePage products={featuredProducts} wishlist={wishlist} status={status} />} />
          <Route path="products" element={<ProductsPage products={visibleProducts} wishlist={wishlist} status={status} />} />
          <Route path="categories" element={<CategoriesPage products={products} />} />
          <Route path="products/:productId" element={<ProductDetailPage products={products} wishlist={wishlist} />} />
          <Route path="wishlist" element={<WishlistPage wishlist={wishlist} products={products} />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success" element={<OrderSuccessPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="dashboard" element={<AccountDashboardPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="addresses" element={<SavedAddressesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="search" element={<SearchResultsPage products={products} wishlist={wishlist} />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  )
}

function Layout({ cartCount, wishlistCount, user, mobileMenuOpen, products, query,}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const inputValue = query
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const categoryBarItems = categories.slice(0, 6)

  const suggestions = products.filter((item) => {
    const label = `${item.title} ${item.category}`.toLowerCase()
    return label.includes((inputValue || '').toLowerCase())
  })

  const handleSearch = (value) => {
    dispatch(setQuery(value))
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`)
    } else {
      navigate('/products')
    }
  }

  useEffect(() => {
    if (location.pathname !== '/products' && location.pathname !== '/search') {
      dispatch(setQuery(''))
    }
  }, [dispatch, location.pathname])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="bg-slate-900 px-4 py-2 text-center text-xs font-medium text-slate-100">
          Free shipping on orders over $75 • New season drops now live
        </div>

        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 lg:hidden"
                onClick={() => dispatch(setMobileNavOpen(!mobileMenuOpen))}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                  S
                </div>
                <div>
                  <div className="text-lg font-extrabold tracking-tight text-slate-900">ShopSphere</div>
                </div>
              </Link>
            </div>

            <nav className="hidden items-center gap-6 lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition ${isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden flex-1 justify-center px-6 xl:flex">
              <div className="relative w-full max-w-lg">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={inputValue}
                  onChange={(event) => handleSearch(event.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                  placeholder="Search for essentials, style and tech"
                />
                {suggestions.length > 0 && inputValue && (
                  <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                    {suggestions.slice(0, 4).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                        onClick={() => handleSearch(item.title)}
                      >
                        <span className="text-sm text-slate-700">{item.title}</span>
                        <span className="text-xs text-slate-500">{item.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/wishlist" className="relative rounded-full border border-slate-200 p-2.5 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 ">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative rounded-full border border-slate-200 p-2.5 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 ">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="hidden sm:block">
                {user.isAuthenticated ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen((current) => !current)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5"
                    >
                      <CircleUserRound className="h-5 w-5 text-slate-600" />
                      <div className="text-sm font-medium text-slate-700">{user.currentUser?.name?.split(' ')[0]}</div>
                    </button>
                    {accountMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                        <Link to="/dashboard" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Dashboard</Link>
                        <Link to="/profile" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                        <Link to="/orders" className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Orders</Link>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(logout())
                            setAccountMenuOpen(false)
                            navigate('/')
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span>Logout</span>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => dispatch(setMobileNavOpen(false))}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex gap-2 pt-2">
                <Link to="/products" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700">
                  Shop now
                </Link>
                <Link to="/dashboard" className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-medium text-white">
                  Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {categoryBarItems.map((category) => {
            const Icon = iconMap[category.icon] ?? Sparkles
            return (
              <button
                key={category.name}
                type="button"
                onClick={() => {
                  dispatch(setCategory(category.name))
                  navigate('/products')
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main>

      <footer className="border-t border-slate-200 bg-white ">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">S</div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">ShopSphere</span>
            </div>
            <p className="text-sm text-slate-600">Curated essentials for home, style, travel and everyday living.</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Shop</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/products">Shop all</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/admin">Admin dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Customer care</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Support</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Follow</h3>
            <div className="flex gap-2">
              <button className="rounded-full border border-slate-200 p-2 text-slate-600">◎</button>
              <button className="rounded-full border border-slate-200 p-2 text-slate-600">◎</button>
              <button className="rounded-full border border-slate-200 p-2 text-slate-600">◎</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

function HomePage({ products, wishlist, status }) {
  const dispatch = useDispatch()
  const bestSellers = products.slice(0, 4)
  const isLoading = status === 'loading'

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-soft sm:p-8 lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
              Fresh arrivals
            </span>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Smarter shopping for the life you live.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
              Discover elevated essentials across tech, style, home and wellness. Quality you can trust, curated for everyday moments.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                Shop collection
              </Link>
              <Link to="/categories" className="rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                Explore categories
              </Link>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-2xl font-black">24k+</div>
                <div className="text-sm text-slate-300">happy shoppers</div>
              </div>
              <div>
                <div className="text-2xl font-black">4.9/5</div>
                <div className="text-sm text-slate-300">avg rating</div>
              </div>
              <div>
                <div className="text-2xl font-black">48h</div>
                <div className="text-sm text-slate-300">dispatch time</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
                alt="Modern home interior"
                className="h-[420px] w-full rounded-[24px] object-cover"
              />
            </div>
            <div className="absolute -left-4 bottom-8 rounded-2xl border border-white/15 bg-slate-950/80 p-4 shadow-soft backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-300">This week</div>
              <div className="mt-2 text-2xl font-black">Up to 40% off</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Top collections</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Shop by category</h2>
          </div>
          <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Sparkles
            return (
              <Link
                key={category.name}
                to="/products"
                onClick={() => dispatch(setCategory(category.name))}
                className="group rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${category.accent} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-bold text-slate-900">{category.name}</div>
                <div className="mt-2 text-sm text-slate-500">Curated picks</div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {promoCards.map((card) => (
          <div key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-32 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500" />
            <div className="text-2xl font-black text-slate-900">{card.title}</div>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              {card.cta} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Best sellers</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Most-loved right now</h2>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="h-64 animate-pulse bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-6 w-full animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-6 w-28 animate-pulse rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} wishlist={wishlist} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Why shoppers choose us</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Thoughtful service, premium value</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Free delivery', 'On all orders above $75'],
            ['Secure checkout', 'Protected payment with 24/7 monitoring'],
            ['Easy returns', '30-day hassle-free returns'],
            ['Curated quality', 'Products chosen by design-conscious shoppers'],
          ].map(([title, subtitle]) => (
            <div key={title} className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-slate-900 p-2 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-slate-900">{title}</div>
              <div className="mt-2 text-sm text-slate-600">{subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.name} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex gap-1 text-amber-400">
              {[...Array(5)].map((_, index) => (
                <Star key={`${review.name}-${index}`} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-base text-slate-700">“{review.quote}”</p>
            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="font-bold text-slate-900">{review.name}</div>
              <div className="text-sm text-slate-500">{review.title}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function CategoriesPage({ products }) {
  const categoryGroups = categories.map((category) => ({
    ...category,
    count: products.filter((product) => product.category === category.name).length,
  }))

  return (
    <div className="space-y-8">
      <PageHeader title="Browse categories" description="Fresh picks tailored to your everyday lifestyle." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categoryGroups.map((item) => {
          const Icon = iconMap[item.icon] ?? Sparkles
          return (
            <Link
              key={item.name}
              to="/products"
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.count} curated items</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ProductsPage({ products, wishlist, status }) {
  const dispatch = useDispatch()
  const { category, maxPrice, sort } = useSelector((state) => state.filters)
  const isLoading = status === 'loading'

  const availableCategories = ['all', ...new Set(products.map((product) => product.category))]

  return (
    <div className="space-y-8">
      <PageHeader title="Shop the collection" description="Explore premium essentials made for modern living." />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
            <Filter className="h-5 w-5 text-slate-500" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Categories</div>
              <div className="space-y-2">
                {availableCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => dispatch(setCategory(item === 'all' ? 'all' : item))}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${category === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {item === 'all' ? 'All categories' : item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Max price</div>
              <input
                type="range"
                min="20"
                max="400"
                value={maxPrice}
                onChange={(event) => dispatch(setMaxPrice(Number(event.target.value)))}
                className="w-full accent-slate-900"
              />
              <div className="mt-2 text-sm text-slate-600">Up to ${maxPrice}</div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">{products.length} products available</div>
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-slate-700">Sort by</label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => dispatch(setSort(event.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`product-skeleton-${index}`} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                  <div className="h-64 animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-6 w-full animate-pulse rounded-xl bg-slate-200" />
                    <div className="h-6 w-24 animate-pulse rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-3xl font-black text-slate-900">No products match your filters.</div>
              <button type="button" onClick={() => dispatch(setCategory('all'))} className="mt-4 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} wishlist={wishlist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductDetailPage({ products, wishlist }) {
  const dispatch = useDispatch()
  const { productId } = useParams()
  const product = products.find((item) => String(item.id) === String(productId))
  const related = products.filter((item) => item.category === product?.category && item.id !== product?.id).slice(0, 3)

  if (!product) {
    return <NotFoundPage />
  }

  const images = product.images?.length ? product.images : [product.thumbnail, product.thumbnail, product.thumbnail]

  return (
    <div className="space-y-10">
      <div className="grid gap-8 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[28px] bg-slate-100">
            <img src={images[0]} alt={product.title} className="h-[420px] w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {images.slice(0, 3).map((image, index) => (
              <img key={`${product.id}-${index}`} src={image} alt={`${product.title} ${index + 1}`} className="h-28 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-3 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            {product.category}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{product.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-slate-800">{product.rating}</span>
            </div>
            <span>•</span>
            <span>{product.stock} in stock</span>
          </div>
          <div className="mt-5 text-3xl font-black text-slate-900">${product.price}</div>
          <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => dispatch(addToCart({ ...product, id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail, category: product.category }))}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => dispatch(toggleWishlist(product.id))}
              className={`rounded-full border px-6 py-3 text-sm font-semibold ${wishlist.includes(product.id) ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-700'}`}
            >
              {wishlist.includes(product.id) ? 'Saved' : 'Save for later'}
            </button>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free shipping</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure payment</div>
            <div className="flex items-center gap-2"><CircleCheckBig className="h-4 w-4" /> 30-day returns</div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-5 text-2xl font-black tracking-tight text-slate-900">Related products</div>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} wishlist={wishlist} />
          ))}
        </div>
      </section>
    </div>
  )
}

function WishlistPage({ wishlist, products }) {
  const savedProducts = products.filter((product) => wishlist.includes(product.id))

  return (
    <div className="space-y-6">
      <PageHeader title="Your wishlist" description="Saved picks for a later checkout or inspiration board." />

      {savedProducts.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-2xl font-black text-slate-900">Your wishlist is empty.</div>
          <Link to="/products" className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} wishlist={wishlist} />
          ))}
        </div>
      )}
    </div>
  )
}

function CartPage() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart)
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 75 ? 0 : 12
  const total = subtotal + shipping

  return (
    <div className="space-y-8">
      <PageHeader title="Shopping cart" description="Review your items and get ready for checkout." />

      {cartItems.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-2xl font-black text-slate-900">Your cart is empty.</div>
          <Link to="/products" className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100">
                  <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <Link to={`/products/${item.id}`} className="text-lg font-bold text-slate-900 hover:text-brand-600">{item.title}</Link>
                    <div className="mt-1 text-sm text-slate-500">{item.category}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1">
                      <button type="button" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="h-6 w-6 text-lg">−</button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button type="button" onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="h-6 w-6 text-lg">+</button>
                    </div>
                    <div className="w-20 text-right text-lg font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</div>
                    <button type="button" onClick={() => dispatch(removeFromCart(item.id))} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xl font-black text-slate-900">Order summary</div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>$0.00</span></div>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between text-lg font-black text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="mt-6 block rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800">
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart)
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 75 ? 0 : 12
  const total = subtotal + shipping

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = (values) => {
    const orderNumber = createOrderId()
    dispatch(
      placeOrder({
        id: orderNumber,
        status: 'Processing',
        amount: total,
        items: cartItems,
        customer: values.fullName,
      }),
    )
    dispatch(clearCart())
    toast.success('Order placed successfully!')
    navigate('/order-success')
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Secure checkout" description="Complete your purchase in a few quick steps." />

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="mb-4 text-xl font-black text-slate-900">Shipping details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Full name" name="fullName" register={formRegister} error={errors.fullName} />
              <InputField label="Email" name="email" register={formRegister} error={errors.email} type="email" />
              <InputField label="Phone" name="phone" register={formRegister} error={errors.phone} />
              <InputField label="Country" name="country" register={formRegister} error={errors.country} />
              <InputField label="Address" name="addressLine1" register={formRegister} error={errors.addressLine1} className="sm:col-span-2" />
              <InputField label="City" name="city" register={formRegister} error={errors.city} />
              <InputField label="State" name="state" register={formRegister} error={errors.state} />
              <InputField label="ZIP code" name="zipCode" register={formRegister} error={errors.zipCode} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Payment</div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <CreditCard className="h-4 w-4" />
              Card ending in 4242 • Visa
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xl font-black text-slate-900">Order summary</div>
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                <div>
                  <div className="font-medium text-slate-700">{item.title}</div>
                  <div className="text-slate-500">Qty {item.quantity}</div>
                </div>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>$0.00</span></div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-black text-slate-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button type="submit" className="mt-6 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Place order
          </button>
        </div>
      </form>
    </div>
  )
}

function OrderSuccessPage() {
  const order = useSelector((state) => state.user.lastOrder)

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Order confirmed!</h1>
        <p className="mt-3 text-slate-600">Thanks for shopping at ShopSphere. Your order is now being processed.</p>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
          <div className="flex justify-between"><span>Order ID</span><span className="font-semibold text-slate-900">{order?.id ?? 'SO-000000'}</span></div>
          <div className="mt-2 flex justify-between"><span>Amount</span><span className="font-semibold text-slate-900">${order?.amount?.toFixed(2) ?? '0.00'}</span></div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/orders" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">
            View orders
          </Link>
          <Link to="/products" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  })

  const onSubmit = (values) => {
    dispatch(login({ name: 'Ariana Stone', email: values.email }))
    toast.success('Welcome back!')
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your account, saved items and order history.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Email" name="email" type="email" register={formRegister} error={errors.email} />
        <InputField label="Password" name="password" type="password" register={formRegister} error={errors.password} />
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div />
          <Link to="/forgot-password" className="font-medium text-slate-900 hover:text-brand-600">Forgot password?</Link>
        </div>
        <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Sign in</button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-600">
        New customer? <Link to="/register" className="font-semibold text-slate-900">Create account</Link>
      </div>
    </AuthLayout>
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (values) => {
    dispatch(register({ name: values.name, email: values.email }))
    toast.success('Account created successfully!')
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Create your account" subtitle="Get access to exclusive deals and manage your checkout details.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Full name" name="name" register={formRegister} error={errors.name} />
        <InputField label="Email" name="email" type="email" register={formRegister} error={errors.email} />
        <InputField label="Password" name="password" type="password" register={formRegister} error={errors.password} />
        <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Create account</button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-semibold text-slate-900">Sign in</Link>
      </div>
    </AuthLayout>
  )
}

function ForgotPasswordPage() {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
  })

  const onSubmit = (values) => {
    toast.success(`Password reset email sent to ${values.email}`)
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we’ll send a secure reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField label="Email" name="email" type="email" register={formRegister} error={errors.email} />
        <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Send reset link</button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-600">
        Back to <Link to="/login" className="font-semibold text-slate-900">login</Link>
      </div>
    </AuthLayout>
  )
}

function ProfilePage() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.currentUser)
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onSubmit = (values) => {
    dispatch(updateProfile(values))
    toast.success('Profile updated successfully')
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My profile" description="Keep your account details up to date." />
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
          <InputField label="Full name" name="name" register={formRegister} error={errors.name} />
          <InputField label="Email" name="email" type="email" register={formRegister} error={errors.email} />
          <InputField label="Phone" name="phone" register={formRegister} error={errors.phone} className="md:col-span-2" />
          <button type="submit" className="md:col-span-2 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save profile</button>
        </form>
      </div>
    </div>
  )
}

function AccountDashboardPage() {
  const user = useSelector((state) => state.user)
  const ownerName = user.currentUser?.name ?? 'Guest'
  const orderCount = user.orders.length
  const cartItems = useSelector((state) => state.cart)

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, ${ownerName.split(' ')[0]}`} description="Here’s a quick overview of your account activity." />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Orders" value={String(orderCount)} icon={Package} />
        <StatCard label="Saved items" value={String(useSelector((state) => state.wishlist).length)} icon={Heart} />
        <StatCard label="Cart items" value={String(cartItems.reduce((total, item) => total + item.quantity, 0))} icon={ShoppingBag} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-xl font-black text-slate-900">Recent activity</div>
          <div className="space-y-4">
            {user.orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <div className="font-semibold text-slate-900">{order.id}</div>
                  <div className="text-sm text-slate-500">{format(new Date(order.date), 'MMM dd, yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">${order.amount.toFixed(2)}</div>
                  <div className="text-xs font-medium text-emerald-600">{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-xl font-black text-slate-900">Quick links</div>
          <div className="space-y-2">
            <QuickLink to="/profile" label="Profile" />
            <QuickLink to="/orders" label="Orders" />
            <QuickLink to="/addresses" label="Saved addresses" />
            <QuickLink to="/wishlist" label="Wishlist" />
            <QuickLink to="/admin" label="Admin dashboard" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MyOrdersPage() {
  const orders = useSelector((state) => state.user.orders)

  return (
    <div className="space-y-8">
      <PageHeader title="My orders" description="Track all current and past purchases in one place." />
      <div className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        {orders.map((order) => (
          <div key={order.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">{order.id}</div>
              <div className="text-sm text-slate-500">{format(new Date(order.date), 'MMM dd, yyyy')}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-slate-700">{order.items.length} items</div>
              <div className="text-sm font-semibold text-slate-900">${order.amount.toFixed(2)}</div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{order.status}</span>
              <Link to={`/orders/${order.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">View details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderDetailsPage() {
  const { orderId } = useParams()
  const orders = useSelector((state) => state.user.orders)
  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return <NotFoundPage />
  }

  return (
    <div className="space-y-8">
      <PageHeader title={`Order ${order.id}`} description="Detailed breakdown of your recent purchase." />
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Summary</div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Status</span><span className="font-semibold text-slate-900">{order.status}</span></div>
              <div className="flex justify-between"><span>Date</span><span className="font-semibold text-slate-900">{format(new Date(order.date), 'MMM dd, yyyy')}</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-semibold text-slate-900">${order.amount.toFixed(2)}</span></div>
            </div>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Items</div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-slate-500">Qty {item.quantity}</div>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SavedAddressesPage() {
  const addresses = useSelector((state) => state.user.addresses)
  const dispatch = useDispatch()
  const { register: formRegister, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      label: 'New address',
      name: '',
      addressLine1: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: '',
    },
  })

  const onSubmit = (values) => {
    dispatch(addAddress({ id: createAddressId(), ...values }))
    reset()
    toast.success('Address saved')
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Saved addresses" description="Manage your shipping and billing details for faster checkout." />
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900">{address.label}</div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">Default</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <div>{address.name}</div>
                <div>{address.addressLine1}</div>
                <div>{address.city}, {address.state} {address.zipCode}</div>
                <div>{address.country}</div>
                <div>{address.phone}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-xl font-black text-slate-900">Add new address</div>
          <InputField label="Label" name="label" register={formRegister} error={errors.label} />
          <InputField label="Name" name="name" register={formRegister} error={errors.name} />
          <InputField label="Address" name="addressLine1" register={formRegister} error={errors.addressLine1} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="City" name="city" register={formRegister} error={errors.city} />
            <InputField label="State" name="state" register={formRegister} error={errors.state} />
            <InputField label="ZIP code" name="zipCode" register={formRegister} error={errors.zipCode} />
            <InputField label="Country" name="country" register={formRegister} error={errors.country} />
          </div>
          <InputField label="Phone" name="phone" register={formRegister} error={errors.phone} />
          <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Save address</button>
        </form>
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="About ShopSphere" description="We design modern essentials that make daily routines easier and more elevated." />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base leading-7 text-slate-600">
            ShopSphere was built to make quality shopping feel effortless. We curate products we believe in, from everyday essentials to statement pieces that bring comfort and confidence to your home, work and lifestyle.
          </p>
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Products" value="24k+" icon={Store} />
            <StatCard label="Cities" value="120" icon={MapPin} />
            <StatCard label="Support" value="24/7" icon={Bell} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactPage() {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', message: '' },
  })

  const onSubmit = () => toast.success('Message sent successfully')

  return (
    <div className="space-y-8">
      <PageHeader title="Contact us" description="We are here to help with product questions, orders and general support." />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <InfoRow icon={Mail} label="Email" value="hello@shopsphere.com" />
          <InfoRow icon={Phone} label="Phone" value="+1 (800) 555-2399" />
          <InfoRow icon={MapPin} label="Address" value="241 Market Street, San Francisco, CA" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <InputField label="Name" name="name" register={formRegister} error={errors.name} />
          <InputField label="Email" name="email" type="email" register={formRegister} error={errors.email} />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
            <textarea {...formRegister('message')} className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-900" />
          </div>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Send message</button>
        </form>
      </div>
    </div>
  )
}

function FaqPage() {
  const faqs = [
    ['How long does shipping take?', 'Most domestic orders ship within 24–48 hours and arrive in 3–7 business days.'],
    ['Do you offer returns?', 'Yes. We offer free returns within 30 days on eligible items in original condition.'],
    ['Can I track my order?', 'Once shipped, you’ll receive tracking details by email and in your order dashboard.'],
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Frequently asked questions" description="Helpful answers to the most common customer questions." />
      <div className="space-y-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        {faqs.map(([question, answer]) => (
          <div key={question} className="rounded-2xl bg-slate-50 p-4">
            <div className="font-bold text-slate-900">{question}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{answer}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrivacyPage() {
  return (
    <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
      <PageHeader title="Privacy policy" description="Your personal data is handled with care and transparency." />
      <p className="text-slate-600 leading-7">ShopSphere respects your privacy. We use the information we collect to process orders, improve our services and personalize your shopping experience. We do not sell personal data to third parties.</p>
    </div>
  )
}

function TermsPage() {
  return (
    <div className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
      <PageHeader title="Terms & conditions" description="By using ShopSphere, you agree to these terms." />
      <p className="text-slate-600 leading-7">These terms govern your access and use of our storefront. We reserve the right to update product availability, pricing or content as needed. Please review policies before making a purchase.</p>
    </div>
  )
}

function SearchResultsPage({ products, wishlist }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const results = products.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-8">
      <PageHeader title={`Search results for “${query}”`} description={`${results.length} products matched your search.`} />
      {results.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} wishlist={wishlist} />
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-2xl font-black text-slate-900">No results found.</div>
          <Link to="/products" className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">
            Browse all products
          </Link>
        </div>
      )}
    </div>
  )
}

function AdminDashboardPage() {
  const revenueData = [
    { name: 'Jan', sales: 1200 },
    { name: 'Feb', sales: 1500 },
    { name: 'Mar', sales: 1700 },
    { name: 'Apr', sales: 2100 },
    { name: 'May', sales: 2600 },
    { name: 'Jun', sales: 3000 },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Admin dashboard" description="Performance overview for the storefront and operations." />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Revenue" value="$128.4K" icon={TrendingUp} />
        <StatCard label="Orders" value="1,984" icon={Package} />
        <StatCard label="Customers" value="9,412" icon={Users} />
        <StatCard label="Conversion" value="4.8%" icon={Percent} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-xl font-black text-slate-900">Revenue overview</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-xl font-black text-slate-900">Traffic source</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Search', value: 44 }, { name: 'Social', value: 26 }, { name: 'Email', value: 18 }, { name: 'Direct', value: 12 }]}> 
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="text-6xl font-black text-slate-900">404</div>
        <h1 className="mt-4 text-3xl font-black text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you were looking for doesn't exist or has moved.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Back to home</Link>
      </div>
    </div>
  )
}

function ProductCard({ product, wishlist }) {
  const dispatch = useDispatch()
  const saved = wishlist.includes(product.id)

  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative">
        <img src={product.thumbnail} alt={product.title} className="h-64 w-full object-cover transition duration-300 group-hover:scale-105" />
        <button
          type="button"
          onClick={() => dispatch(toggleWishlist(product.id))}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border ${saved ? 'border-red-200 bg-red-50 text-red-500' : 'border-white/80 bg-white/90 text-slate-600'} shadow-sm`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category}</div>
        <Link to={`/products/${product.id}`} className="block text-xl font-bold text-slate-900 hover:text-brand-600">
          {product.title}
        </Link>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            {product.rating}
          </div>
          <span>•</span>
          <span>{product.stock} left</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tight text-slate-900">${product.price}</div>
          <button
            type="button"
            onClick={() => dispatch(addToCart({ ...product, id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail, category: product.category }))}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">ShopSphere</div>
      <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-lg text-slate-600">{description}</p>
    </div>
  )
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-md rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">ShopSphere</div>
        <h1 className="mt-3 text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function QuickLink({ label, to }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
      <span>{label}</span>
      <ChevronRight className="h-4 w-4" />
    </Link>
  )
}

function InputField({ label, name, register, error, type = 'text', className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={name}
        type={type}
        {...register(name)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900"
      />
      {error && <div className="mt-1 text-xs text-red-600">{error.message}</div>}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</div>
        <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
      </div>
    </div>
  )
}

export default App
