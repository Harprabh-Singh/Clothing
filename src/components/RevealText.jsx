import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function RevealText({ children, className = '', direction = 'up', delay = 0, duration = 0.8 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fromVars = { opacity: 0 }
    if (direction === 'up') fromVars.y = 40
    else if (direction === 'down') fromVars.y = -40
    else if (direction === 'left') fromVars.x = 40
    else if (direction === 'right') fromVars.x = -40
    else if (direction === 'scale') fromVars.scale = 0.95

    gsap.fromTo(
      el,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [direction, delay, duration])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

export default RevealText
