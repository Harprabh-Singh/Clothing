import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'

function ProductCard({ product, index }) {
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  // Use a ref for tilt to avoid React re-renders on every mousemove
  const tiltRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  const applyTilt = useCallback((rx, ry) => {
    const el = cardRef.current
    if (!el || shouldReduceMotion) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`
    })
  }, [shouldReduceMotion])

  const handleMove = useCallback((event) => {
    if (shouldReduceMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const rotateY = ((x / bounds.width) * 2 - 1) * 6
    const rotateX = ((1 - y / bounds.height) * 2 - 1) * 6
    tiltRef.current = { x: rotateX, y: rotateY }
    applyTilt(rotateX, rotateY)
  }, [shouldReduceMotion, applyTilt])

  const handleLeave = useCallback(() => {
    tiltRef.current = { x: 0, y: 0 }
    applyTilt(0, 0)
    setIsHovered(false)
  }, [applyTilt])

  const statusClasses = {
    'SOLD OUT': 'bg-[var(--color-blaze)] text-[var(--color-ink)]',
    LIMITED: 'bg-[var(--color-toxic)] text-[var(--color-ink)]',
    RESTOCKED: 'bg-[var(--color-toxic)] text-[var(--color-ink)]',
    'IN STOCK': 'border border-[var(--color-bone)]/30 text-[var(--color-bone)]',
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={() => setIsHovered(true)}
      className="group relative flex min-h-[24rem] flex-col border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-3 transition-colors duration-500 hover:border-[var(--color-blaze)]/40"
      style={{
        transform: shouldReduceMotion ? undefined : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.15s ease-out, border-color 0.5s ease',
        willChange: 'transform',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-[var(--color-blaze)] to-transparent transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0, width: '100%' }}
      />

      {/* Image area */}
      <div
        className="relative mb-4 flex min-h-[14rem] items-end overflow-hidden"
        style={{ background: product.accent }}
      >
        {/* Static grain texture — CSS only, no SVG filters */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(140deg,transparent_5%,rgba(255,255,255,0.1)_50%,transparent_95%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_35%)]" />

        {/* Scanline on hover */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.3 : 0 }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-[var(--color-toxic)]/30 animate-pulse" />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/70">
              {product.id}
            </span>
            {product.status ? (
              <span className={`inline-flex items-center px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] ${statusClasses[product.status] || ''}`}>
                {product.status}
              </span>
            ) : null}
          </div>

          {/* Center placeholder text with hover effect */}
          <div className="self-start border border-[var(--color-bone)]/20 bg-[var(--color-ink)]/70 px-3 py-2 text-[var(--color-bone)] backdrop-blur-sm transition-all duration-300 group-hover:bg-[var(--color-ink)]/90 group-hover:border-[var(--color-blaze)]/30">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em]">{product.imagePlaceholder}</p>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col justify-end">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50">
              {product.category}
            </p>
            <h3 className="mt-1.5 font-anton text-xl sm:text-2xl uppercase tracking-[0.04em] text-[var(--color-bone)] truncate">
              {product.name}
            </h3>
          </div>
          <span className="font-mono text-[0.92rem] uppercase tracking-[0.3em] text-[var(--color-toxic)] shrink-0">
            {product.price}
          </span>
        </div>

        {/* Description - revealed on hover */}
        <motion.p
          className="mt-3 font-sans text-[0.85rem] leading-6 text-[var(--color-bone)]/60 overflow-hidden"
          animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {product.description}
        </motion.p>

        {/* Bottom line */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
            DROP 004
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 group-hover:text-[var(--color-blaze)] transition-colors duration-300">
            VIEW →
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export default ProductCard
