import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../../../context/useCart'

const links = [
  { label: 'SHOP', href: '/shop' },
  { label: 'DROPS', href: '/drops' },
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
]

function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { scrollY } = useScroll()
  const { itemCount } = useCart()

  const background = useTransform(scrollY, [0, 200], ['rgba(11, 9, 6, 0)', 'rgba(11, 9, 6, 0.92)'])
  const backdropBlur = useTransform(scrollY, [0, 200], ['blur(0px)', 'blur(12px)'])
  const borderOpacity = useTransform(scrollY, [0, 200], [0, 1])

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      if (latest < 100) {
        setIsVisible(true)
      } else if (latest > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(latest)
    })
    return () => unsubscribe()
  }, [scrollY, lastScrollY])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-[70] border-b border-[var(--color-blaze)]/0"
      style={{
        backgroundColor: background,
        backdropFilter: backdropBlur,
        WebkitBackdropFilter: backdropBlur,
        borderBottomColor: useTransform(borderOpacity, (v) => `rgba(216,178,106,${v * 0.3})`),
      }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="group relative font-display text-lg uppercase tracking-[0.35em] text-[var(--color-bone)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blaze)]"
        >
          <span className="relative z-10">VOLT/AGE</span>
          <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--color-blaze)] transition-all duration-300 group-hover:w-full" />
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className={({ isActive }) =>
                `group relative font-mono text-[0.72rem] uppercase tracking-[0.3em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blaze)] ${
                  isActive ? 'text-[var(--color-toxic)]' : 'text-[var(--color-bone)] hover:text-[var(--color-blaze)]'
                }`
              }
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--color-blaze)] transition-all duration-300 group-hover:w-full" />
            </NavLink>
          ))}

          <NavLink
            to="/shop"
            className="group relative flex h-11 w-11 items-center justify-center border border-[var(--color-bone)]/50 text-[var(--color-bone)] transition-all duration-300 hover:border-[var(--color-blaze)] hover:text-[var(--color-blaze)]"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-blaze)] px-1 text-[0.65rem] font-bold text-[var(--color-ink)]">
                {itemCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <NavLink
            to="/shop"
            className="relative flex h-11 w-11 items-center justify-center border border-[var(--color-bone)]/50 text-[var(--color-bone)]"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-blaze)] px-1 text-[0.65rem] font-bold text-[var(--color-ink)]">
                {itemCount}
              </span>
            )}
          </NavLink>
          <button
            type="button"
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center border border-[var(--color-bone)]/50 text-[var(--color-bone)] transition-all duration-300 hover:border-[var(--color-blaze)] hover:text-[var(--color-blaze)]"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex min-h-screen flex-col bg-[var(--color-ink)]/98 backdrop-blur-xl px-6 py-8 md:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <NavLink to="/" className="text-xl uppercase tracking-[0.4em] text-[var(--color-bone)]" onClick={() => setIsOpen(false)}>
                VOLT/AGE
              </NavLink>
              <button
                type="button"
                aria-label="Close navigation menu"
                className="flex h-11 w-11 items-center justify-center border border-[var(--color-bone)]/50 text-[var(--color-bone)] hover:border-[var(--color-blaze)] hover:text-[var(--color-blaze)]"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-2">
              {links.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                >
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      `block border-b border-[var(--color-bone)]/10 py-4 font-anton text-4xl uppercase tracking-[0.15em] transition-colors duration-300 ${
                        isActive ? 'text-[var(--color-toxic)]' : 'text-[var(--color-bone)] hover:text-[var(--color-blaze)]'
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-auto pt-8 border-t border-[var(--color-bone)]/10"
            >
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
                DROP 004 — AUG 14 — 12 PIECES
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default NavBar
