import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import products from '../HomePage/data/products'
import RevealText from '../../components/RevealText'

const categories = ['all', 'tees', 'outerwear', 'bottoms', 'accessories']
const statuses = ['all', 'in stock', 'limited', 'sold out', 'restocked']

function ShopPage() {
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = category === 'all' || product.category === category
      const statusValue = product.status?.toLowerCase() || 'in stock'
      const normalizedStatus =
        statusValue === 'limited' || statusValue === 'restocked'
          ? statusValue
          : statusValue === 'sold out'
            ? 'sold out'
            : 'in stock'
      const statusMatch = status === 'all' || normalizedStatus === status
      return categoryMatch && statusMatch
    })
  }, [category, status])

  return (
    <main className="min-h-screen bg-[var(--color-ink)] px-4 pb-24 pt-28 text-[var(--color-bone)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 border-b border-[var(--color-bone)]/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <RevealText direction="up">
            <div>
              <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                SHOP / CATALOG
              </p>
              <h1 className="font-anton text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[0.92]">
                All pieces are still<br />in motion.
              </h1>
            </div>
          </RevealText>

          <RevealText direction="up" delay={0.1}>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="appearance-none border border-[var(--color-bone)]/20 bg-[var(--color-surface)] px-5 py-2.5 pr-10 font-mono text-[0.72rem] uppercase tracking-[0.3em] outline-none transition-colors duration-300 hover:border-[var(--color-blaze)]/40 focus:border-[var(--color-blaze)]"
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-bone)]/50 text-xs">▼</span>
              </div>
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="appearance-none border border-[var(--color-bone)]/20 bg-[var(--color-surface)] px-5 py-2.5 pr-10 font-mono text-[0.72rem] uppercase tracking-[0.3em] outline-none transition-colors duration-300 hover:border-[var(--color-blaze)]/40 focus:border-[var(--color-blaze)]"
                >
                  {statuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-bone)]/50 text-xs">▼</span>
              </div>
            </div>
          </RevealText>
        </div>

        {/* Results count */}
        <motion.p
          key={`${category}-${status}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50"
        >
          Showing {filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''}
        </motion.p>

        {/* Grid */}
        <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="group relative overflow-hidden border border-[var(--color-bone)]/15 bg-[var(--color-surface)] transition-colors duration-300 hover:border-[var(--color-blaze)]/30"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-blaze)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="border-b border-[var(--color-bone)]/10 p-4" style={{ background: product.accent }}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/80">
                      {product.id}
                    </span>
                    {product.status && (
                      <span
                        className={`font-mono text-[0.62rem] uppercase tracking-[0.3em] px-2.5 py-1 ${
                          product.status === 'SOLD OUT'
                            ? 'bg-[var(--color-blaze)] text-[var(--color-ink)]'
                            : product.status === 'LIMITED' || product.status === 'RESTOCKED'
                              ? 'bg-[var(--color-toxic)] text-[var(--color-ink)]'
                              : 'border border-[var(--color-bone)]/30 text-[var(--color-bone)]'
                        }`}
                      >
                        {product.status}
                      </span>
                    )}
                  </div>
                  <div className="mt-6 min-h-[10rem] border border-[var(--color-bone)]/15 bg-[var(--color-ink)]/20 p-4 flex items-center justify-center">
                    <p className="font-mono text-[0.85rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/60">
                      {product.imagePlaceholder}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="font-anton text-xl sm:text-2xl uppercase leading-[0.9]">{product.name}</h2>
                    <span className="font-mono text-[0.85rem] uppercase tracking-[0.3em] text-[var(--color-toxic)]">
                      {product.price}
                    </span>
                  </div>
                  <p className="mb-5 font-sans text-[0.9rem] leading-7 text-[var(--color-bone)]/65 line-clamp-2">
                    {product.description}
                  </p>
                  <Link
                    to={`/shop/${product.id}`}
                    className="group/btn relative inline-flex items-center gap-2 overflow-hidden border border-[var(--color-blaze)] px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-bone)] transition-colors duration-300 hover:text-[var(--color-ink)]"
                  >
                    <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10">View piece</span>
                    <span className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 text-center"
          >
            <p className="font-anton text-2xl uppercase text-[var(--color-bone)]/40">
              Nothing matches that filter.
            </p>
            <p className="mt-2 font-mono text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/30">
              Try loosening the constraints.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  )
}

export default ShopPage
