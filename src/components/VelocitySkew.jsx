import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function VelocitySkew({ children, maxSkew = 2, className = '' }) {
  const containerRef = useRef(null)
  const skewToRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let currentSkew = 0
    let targetSkew = 0
    let lastUpdate = 0

    // Use a single shared quickTo instance
    skewToRef.current = gsap.quickTo(el, 'skewY', { duration: 0.4, ease: 'power2.out' })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocity = self.getVelocity()
        targetSkew = Math.max(-maxSkew, Math.min(maxSkew, velocity / 800))
      },
    })

    // Throttled ticker: only update every 2nd frame (30fps equivalent)
    const ticker = () => {
      const now = performance.now()
      if (now - lastUpdate < 33) {
        rafRef.current = requestAnimationFrame(ticker)
        return
      }
      lastUpdate = now

      currentSkew += (targetSkew - currentSkew) * 0.08
      targetSkew *= 0.9

      // Only apply if change is meaningful
      if (Math.abs(currentSkew) > 0.01) {
        skewToRef.current(currentSkew)
      }

      rafRef.current = requestAnimationFrame(ticker)
    }

    rafRef.current = requestAnimationFrame(ticker)

    return () => {
      trigger.kill()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (skewToRef.current) {
        // Reset transform on unmount
        gsap.set(el, { skewY: 0 })
      }
    }
  }, [maxSkew])

  return (
    <div ref={containerRef} className={`velocity-skew ${className}`} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}

export default VelocitySkew
