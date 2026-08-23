import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import TextScramble from '../../../../components/TextScramble'

function HeroSection({ tickerItems }) {
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [mouseReady, setMouseReady] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const sectionRef = useRef(null)

  // Parallax transforms
  const tearProgress = useTransform(scrollY, [0, 400], [0, 1])
  const topShiftX = useTransform(scrollY, [0, 400], [0, -40])
  const topShiftY = useTransform(scrollY, [0, 400], [0, -30])
  const clipPath = useTransform(scrollY, [0, 400], [
    'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    'polygon(0 0, 100% 0, 100% 58%, 0 100%)'
  ])
  const accentOpacity = useTransform(scrollY, [0, 400], [0.12, 0.95])
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0])
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.92])
  const heroY = useTransform(scrollY, [0, 600], [0, -80])

  // Background parallax layers
  const bgLayer1Y = useTransform(scrollY, [0, 600], [0, 120])
  const bgLayer2Y = useTransform(scrollY, [0, 600], [0, 60])
  const gridOpacity = useTransform(scrollY, [0, 300], [0.7, 0.3])

  const springX = useSpring(0, { stiffness: 180, damping: 20, mass: 0.5 })
  const springY = useSpring(0, { stiffness: 180, damping: 20, mass: 0.5 })

  useEffect(() => {
    if (shouldReduceMotion) return
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mediaQuery.matches) return

    setMouseReady(true)
    const handleMove = (event) => {
      setCursor({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [shouldReduceMotion])

  useEffect(() => {
    if (shouldReduceMotion || !mouseReady) return
    springX.set(cursor.x)
    springY.set(cursor.y)
  }, [cursor.x, cursor.y, shouldReduceMotion, springX, springY, mouseReady])

  const marqueeItems = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-[100dvh] overflow-hidden bg-[var(--color-ink)]">
      {/* Custom cursor glow */}
      {mouseReady && !shouldReduceMotion && (
        <>
          <motion.div
            className="pointer-events-none fixed z-[90] hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
            style={{
              left: springX,
              top: springY,
              background: 'radial-gradient(circle, rgba(255,46,0,0.08) 0%, transparent 70%)',
            }}
          />
          <motion.div
            className="pointer-events-none fixed z-[91] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-blaze)]/50 bg-[var(--color-blaze)]/10 lg:block"
            style={{ left: springX, top: springY }}
          />
        </>
      )}

      {/* Parallax background layers */}
      <motion.div
        className="absolute inset-0 gradient-mesh"
        style={{ y: bgLayer1Y, opacity: gridOpacity }}
      />

      {/* Grid overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgLayer2Y, opacity: gridOpacity }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:240px_240px]" />
      </motion.div>

      {/* Scanline */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-30" />

      {/* Main content */}
      <motion.div
        className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-between px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-32"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        <div className="relative flex flex-1 flex-col justify-center">
          <div className="max-w-5xl">
            {/* Label with scramble */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              <TextScramble
                text="UNDERGROUND / DROP CULTURE / STENCIL SYSTEM"
                className="font-mono text-[0.72rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]"
                delay={300}
                duration={800}
              />
            </motion.div>

            {/* Main title with tear effect */}
            <div className="relative">
              {/* Glow backdrop */}
              <motion.div
                style={{ opacity: accentOpacity }}
                className="absolute left-0 top-2 h-[72%] w-[85%] bg-[var(--color-blaze)]/20 blur-3xl"
              />

              {/* Main title - base layer */}
              <motion.h1
                className="font-anton relative z-10 whitespace-nowrap text-[clamp(3.5rem,14vw,10rem)] uppercase leading-[0.78] tracking-[0.04em] text-[var(--color-bone)]"
                style={{
                  x: shouldReduceMotion ? 0 : topShiftX,
                  y: shouldReduceMotion ? 0 : topShiftY,
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              >
                <TextScramble text="VOLT/AGE" delay={500} duration={1000} />
              </motion.h1>

              {/* Tear layer - blaze color */}
              <motion.div
                className="absolute inset-0 z-20 font-anton whitespace-nowrap text-[clamp(3.5rem,14vw,10rem)] uppercase leading-[0.78] tracking-[0.04em] text-[var(--color-blaze)]"
                style={{
                  clipPath: shouldReduceMotion ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : clipPath,
                  x: shouldReduceMotion ? 0 : topShiftX,
                  y: shouldReduceMotion ? 0 : topShiftY,
                  opacity: shouldReduceMotion ? 0.9 : tearProgress,
                }}
              >
                VOLT/AGE
              </motion.div>

              {/* Shadow layer - toxic color */}
              <motion.div
                className="absolute inset-0 z-10 font-anton whitespace-nowrap text-[clamp(3.5rem,14vw,10rem)] uppercase leading-[0.78] tracking-[0.04em]"
                style={{
                  opacity: shouldReduceMotion ? 0.3 : 0.5,
                  color: 'var(--color-toxic)',
                  transform: shouldReduceMotion ? 'translate(0,0)' : `translate(${topShiftX.get ? topShiftX.get() * 0.35 : 0}px, ${topShiftY.get ? topShiftY.get() * 0.35 : 0}px)`,
                }}
              >
                VOLT/AGE
              </motion.div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 max-w-lg font-sans text-[1rem] leading-7 text-[var(--color-bone)]/65"
            >
              Limited runs. Spray-painted beginnings. No soft launch, no polished lie.
            </motion.p>
          </div>

          {/* Marquee ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 max-w-4xl overflow-hidden border-y border-[var(--color-bone)]/20 py-4"
          >
            <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
              {marqueeItems.map((item, index) => (
                <span key={`${item}-${index}`} className="font-mono text-[0.72rem] uppercase tracking-[0.4em] text-[var(--color-bone)]/70 flex items-center gap-10">
                  {item}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-blaze)]" />
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-8 flex flex-col gap-4 border-t border-[var(--color-bone)]/20 pt-6 text-sm text-[var(--color-bone)]/80 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-md font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/60">
            DROP 004 — AUG 14 — 12 PIECES — LIMITED RUN
          </p>
          <a
            href="/shop"
            className="group relative inline-flex w-fit items-center gap-3 overflow-hidden border border-[var(--color-blaze)] px-6 py-3.5 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--color-bone)] transition-colors duration-300 hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blaze)]"
          >
            <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">Enter the drop</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true">↗</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--color-ink)] to-transparent pointer-events-none z-10" />
    </section>
  )
}

export default HeroSection
