import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  const tickerFnRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // Prevent Lenis from handling elements that GSAP ScrollTrigger pins
      prevent: (node) => node.classList.contains('pin-spacer'),
    })

    lenisRef.current = lenis

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Store the ticker function so we can remove it properly on cleanup
    tickerFnRef.current = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerFnRef.current)
    gsap.ticker.lagSmoothing(0)

    return () => {
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current)
      }
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

export default SmoothScroll
