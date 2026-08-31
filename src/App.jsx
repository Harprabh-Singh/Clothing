import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import ScrollProgress from './components/ScrollProgress'
import SmoothScroll from './components/SmoothScroll'
import HomePage from './pages/HomePage/HomePage'
import ClosetInterior from './components/ClosetInterior'
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
  const isHome = location.pathname === '/'
  // the entry sequence owns the opening viewport on the homepage — the page
  // progress bar only appears once the visitor has passed the door
  const [entryPassed, setEntryPassed] = useState(false)

  return (
    <CartProvider>
      <SmoothScroll>
        {(!isHome || entryPassed) && <ScrollProgress />}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<motion.div key="home" {...pageTransition}><HomePage onEntryPassed={setEntryPassed} /></motion.div>} />
            <Route path="/shop" element={<motion.div key="shop" {...pageTransition}><ShopPage /></motion.div>} />
            <Route path="/shop/:productId" element={<motion.div key="detail" {...pageTransition}><ProductDetailPage /></motion.div>} />
            <Route path="/drops" element={<motion.div key="drops" {...pageTransition}><DropsPage /></motion.div>} />
            <Route path="/about" element={<motion.div key="about" {...pageTransition}><AboutPage /></motion.div>} />
            <Route path="/contact" element={<motion.div key="contact" {...pageTransition}><ContactPage /></motion.div>} />
            {/* temporary dev route: the standalone closet interior, developed
                and tested independently of the entry-door sequence */}
            <Route path="/closet" element={<motion.div key="closet" {...pageTransition}><ClosetInterior /></motion.div>} />
          </Routes>
        </AnimatePresence>
      </SmoothScroll>
    </CartProvider>
  )
}

export default App
