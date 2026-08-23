import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000, className = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()
    const startValue = 0
    const endValue = target

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startValue + (endValue - startValue) * eased)
      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

function MetricsSection() {
  const metrics = [
    { value: 47, suffix: '+', label: 'Drops Released', description: 'Since 2021' },
    { value: 12, suffix: '', label: 'Pieces Per Drop', description: 'Intentionally limited' },
    { value: 98, suffix: '%', label: 'Sell-Through Rate', description: 'Within 72 hours' },
    { value: 3, suffix: 'K+', label: 'Community Members', description: 'Worldwide' },
  ]

  return (
    <section className="relative border-t border-[var(--color-bone)]/10 bg-[var(--color-ink)] px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,46,0,0.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16">
          <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
            BY THE NUMBERS
          </p>
          <h2 className="font-anton text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.95] text-[var(--color-bone)]">
            The data behind the noise.
          </h2>
        </div>

        <div className="grid gap-px bg-[var(--color-bone)]/10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="relative bg-[var(--color-ink)] p-8 sm:p-10 group hover:bg-[var(--color-surface)] transition-colors duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-blaze)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <p className="font-anton text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.85] text-[var(--color-bone)] tabular-nums">
                <AnimatedCounter target={metric.value} suffix={metric.suffix} duration={2000 + index * 300} />
              </p>
              <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-blaze)]">
                {metric.label}
              </p>
              <p className="mt-1 font-sans text-[0.85rem] text-[var(--color-bone)]/50">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MetricsSection
