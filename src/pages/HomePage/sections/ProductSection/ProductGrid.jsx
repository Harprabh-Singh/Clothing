import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import products from '../../data/products'
import RevealText from '../../../../components/RevealText'

function ProductGrid() {
  const count = products.length

  return (
    <section id="shop" className="relative border-t border-[var(--color-bone)]/10 bg-[var(--color-ink)] px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,46,0,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <RevealText direction="up">
            <div className="max-w-xl">
              <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                [ DROP 004 / {count} PIECES ]
              </p>
              <h2 className="font-anton text-[clamp(2.2rem,5vw,3.5rem)] uppercase leading-[0.92] text-[var(--color-bone)]">
                The next wave is already spitting sparks.
              </h2>
            </div>
          </RevealText>

          <RevealText direction="up" delay={0.1}>
            <div className="flex flex-col gap-3 max-w-sm">
              <p className="font-sans text-[0.96rem] leading-7 text-[var(--color-bone)]/65">
                Every piece is cut in small runs and shipped with the same urgency as the flyers that started it all.
              </p>
              <Link
                to="/shop"
                className="group relative inline-flex w-fit items-center gap-2 overflow-hidden border border-[var(--color-blaze)] px-5 py-3.5 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-bone)] transition-colors duration-300 hover:text-[var(--color-ink)]"
              >
                <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Browse full catalog</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </RevealText>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 6).map((product, index) => (
            <div
              key={product.id}
              className={index % 2 === 1 ? 'sm:translate-y-10' : ''}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 flex justify-center"
        >
          <Link
            to="/shop"
            className="group relative inline-flex items-center gap-3 border border-[var(--color-bone)]/20 px-8 py-4 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/70 transition-all duration-300 hover:border-[var(--color-blaze)] hover:text-[var(--color-bone)]"
          >
            <span className="absolute inset-0 bg-[var(--color-blaze)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">View all {count} pieces</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductGrid
