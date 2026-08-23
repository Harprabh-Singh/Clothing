import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import products from '../HomePage/data/products'
import RevealText from '../../components/RevealText'

const sizes = ['S', 'M', 'L', 'XL', 'XXL']

function ProductDetailPage() {
  const { productId } = useParams()
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState('M')
  const [added, setAdded] = useState(false)

  const product = useMemo(() => products.find((item) => item.id === productId), [productId])
  const relatedProducts = useMemo(
    () => products.filter((item) => item.id !== productId && item.category === product?.category).slice(0, 3),
    [productId, product?.category]
  )

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--color-ink)] px-4 py-28 text-[var(--color-bone)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-[var(--color-blaze)]/30 bg-[var(--color-surface)] p-10">
          <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">DROP GONE</p>
          <h1 className="font-anton text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.95]">
            This drop no longer exists in the archive.
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-[0.95rem] leading-8 text-[var(--color-bone)]/65">
            The piece you requested is no longer in circulation. Browse the current catalog or get back to the drops timeline.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group relative inline-flex items-center gap-2 overflow-hidden border border-[var(--color-blaze)] px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-bone)] transition-colors duration-300 hover:text-[var(--color-ink)]"
            >
              <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <span className="relative z-10">Back to shop</span>
            </Link>
            <Link
              to="/drops"
              className="inline-flex items-center gap-2 border border-[var(--color-bone)]/20 px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/70 transition-colors duration-300 hover:border-[var(--color-toxic)] hover:text-[var(--color-toxic)]"
            >
              View drops
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--color-ink)] px-4 py-28 text-[var(--color-bone)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <RevealText direction="up">
          <div className="mb-8 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
            <Link to="/shop" className="hover:text-[var(--color-blaze)] transition-colors">SHOP</Link>
            <span>/</span>
            <span className="text-[var(--color-toxic)]">{product.name}</span>
          </div>
        </RevealText>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Image */}
          <RevealText direction="left">
            <div className="group relative overflow-hidden border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-4">
              <div className="min-h-[28rem] sm:min-h-[32rem] border border-[var(--color-bone)]/10 p-6 transition-transform duration-700 ease-out" style={{ background: product.accent }}>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/70">
                    {product.id}
                  </span>
                  {product.status && (
                    <span
                      className={`font-mono text-[0.62rem] uppercase tracking-[0.3em] px-3 py-1 ${
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
                <div className="mt-12 flex h-full min-h-[20rem] items-center justify-center border border-[var(--color-bone)]/15 bg-[var(--color-ink)]/20 p-6">
                  <p className="font-anton text-[clamp(2rem,6vw,3.5rem)] uppercase tracking-[0.15em] text-[var(--color-bone)]/40">
                    {product.imagePlaceholder}
                  </p>
                </div>
              </div>
            </div>
          </RevealText>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <RevealText direction="right" delay={0.05}>
              <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                PIECE PROFILE
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.1}>
              <h1 className="font-anton text-[clamp(2.5rem,5vw,3.5rem)] uppercase leading-[0.92]">
                {product.name}
              </h1>
            </RevealText>

            <RevealText direction="right" delay={0.15}>
              <p className="mt-4 font-mono text-[0.85rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50">
                {product.price}
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.2}>
              <p className="mt-6 max-w-lg font-sans text-[1rem] leading-8 text-[var(--color-bone)]/70">
                {product.description}
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.25}>
              <div className="mt-8">
                <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/60">
                  SIZE
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.2rem] border px-4 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.3em] transition-all duration-300 ${
                        selectedSize === size
                          ? 'border-[var(--color-blaze)] bg-[var(--color-blaze)] text-[var(--color-ink)]'
                          : 'border-[var(--color-bone)]/20 text-[var(--color-bone)]/70 hover:border-[var(--color-toxic)] hover:text-[var(--color-toxic)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </RevealText>

            <RevealText direction="right" delay={0.3}>
              <div className="mt-10 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.status === 'SOLD OUT'}
                  className={`group relative inline-flex items-center gap-3 overflow-hidden border px-6 py-3.5 font-mono text-[0.7rem] uppercase tracking-[0.3em] transition-all duration-300 ${
                    product.status === 'SOLD OUT'
                      ? 'border-[var(--color-bone)]/10 text-[var(--color-bone)]/30 cursor-not-allowed'
                      : 'border-[var(--color-blaze)] text-[var(--color-bone)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {!added && product.status !== 'SOLD OUT' && (
                    <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  )}
                  <span className="relative z-10">
                    {product.status === 'SOLD OUT'
                      ? 'SOLD OUT'
                      : added
                        ? 'ADDED ✓'
                        : 'Add to cart'}
                  </span>
                </button>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border border-[var(--color-bone)]/15 px-6 py-3.5 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/70 transition-all duration-300 hover:border-[var(--color-toxic)] hover:text-[var(--color-toxic)]"
                >
                  Back to catalog
                </Link>
              </div>
            </RevealText>

            {/* Details */}
            <RevealText direction="right" delay={0.35}>
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--color-bone)]/10 pt-6">
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 mb-1">Category</p>
                  <p className="font-mono text-[0.75rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">{product.category}</p>
                </div>
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 mb-1">Drop</p>
                  <p className="font-mono text-[0.75rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">004</p>
                </div>
              </div>
            </RevealText>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <RevealText direction="up">
              <p className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.35em] text-[var(--color-toxic)]">
                RELATED PIECES
              </p>
            </RevealText>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={`/shop/${item.id}`}
                    className="group block border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-5 transition-colors duration-300 hover:border-[var(--color-blaze)]/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50">
                        {item.id}
                      </p>
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-toxic)]">
                        {item.price}
                      </span>
                    </div>
                    <h2 className="font-anton text-xl uppercase text-[var(--color-bone)] group-hover:text-[var(--color-blaze)] transition-colors duration-300">
                      {item.name}
                    </h2>
                    <p className="mt-2 font-sans text-[0.85rem] leading-6 text-[var(--color-bone)]/50 line-clamp-2">
                      {item.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ProductDetailPage
