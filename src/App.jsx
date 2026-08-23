import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import ScrollProgress from './components/ScrollProgress'
import SmoothScroll from './components/SmoothScroll'
import FilmGrain from './components/FilmGrain'
import HomePage from './pages/HomePage/HomePage'
import ShopPage from './pages/ShopPage/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage'
import DropsPage from './pages/DropsPage/DropsPage'
import AboutPage from './pages/AboutPage/AboutPage'
import ContactPage from './pages/ContactPage/ContactPage'

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] },
}

function App() {
  const location = useLocation()

  return (
    <CartProvider>
      <SmoothScroll>
        <FilmGrain />
        <ScrollProgress />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div key="home" {...pageTransition}>
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/shop"
              element={
                <motion.div key="shop" {...pageTransition}>
                  <ShopPage />
                </motion.div>
              }
            />
            <Route
              path="/shop/:productId"
              element={
                <motion.div key="detail" {...pageTransition}>
                  <ProductDetailPage />
                </motion.div>
              }
            />
            <Route
              path="/drops"
              element={
                <motion.div key="drops" {...pageTransition}>
                  <DropsPage />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div key="about" {...pageTransition}>
                  <AboutPage />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div key="contact" {...pageTransition}>
                  <ContactPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </SmoothScroll>
    </CartProvider>
  )
}

export default App
