import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

const CREAM = '#f8f4ea'
const MUTED = 'rgba(248,244,234,0.62)'
const FAINT = 'rgba(248,244,234,0.32)'
const PINK = '#ff3ea5'
const CYAN = '#2ee6ff'

function SplitChars({ text }) {
  return (
    <span aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} className="ext-char" style={{ display: 'inline-block', willChange: 'transform' }} aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

function Exterior({ flashRef, onEntered }) {
  const rootRef = useRef(null)
  const imgRef = useRef(null)
  const uiRef = useRef(null)
  const enterBtnRef = useRef(null)
  const [entering, setEntering] = useState(false)

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // Entrance reveal + Ken Burns settle
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current, { scale: 1.18 }, { scale: 1.04, duration: 3.2, ease: 'expo.out' })

      const chars = rootRef.current.querySelectorAll('.ext-char')
      gsap.set(chars, { yPercent: 115, rotateX: -45, transformPerspective: 600 })
      gsap.to(chars, { yPercent: 0, rotateX: 0, duration: 1.15, ease: 'expo.out', stagger: 0.022, delay: 0.45 })

      gsap.set('.ext-ui-item', { opacity: 0, y: 24 })
      gsap.to('.ext-ui-item', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 1 })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  // Mouse parallax
  useEffect(() => {
    if (reduced) return
    const el = rootRef.current
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      gsap.to(imgRef.current, { x: nx * -14, y: ny * -8, duration: 1, ease: 'power2.out' })
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [reduced])

  // Magnetic ENTER button
  useEffect(() => {
    const btn = enterBtnRef.current
    if (!btn || reduced) return undefined
    const onMove = (e) => {
      const r = btn.getBoundingClientRect()
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.3,
        y: (e.clientY - r.top - r.height / 2) * 0.3,
        duration: 0.4,
        ease: 'power2.out',
      })
    }
    const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' })
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    return () => {
      btn.removeEventListener('mousemove', onMove)
      btn.removeEventListener('mouseleave', onLeave)
    }
  }, [reduced])

  const enterStore = () => {
    if (entering) return
    setEntering(true)

    if (reduced) {
      onEntered()
      return
    }

    // Camera flies through the double doors at image center
    const tl = gsap.timeline()
    tl.to(uiRef.current, { opacity: 0, y: -40, duration: 0.5, ease: 'power2.in' }, 0)
      .to(imgRef.current, { scale: 3.1, duration: 1.55, ease: 'power2.in' }, 0)
      .to(flashRef.current, { opacity: 1, duration: 0.4, ease: 'power2.in' }, 1.1)
      .call(() => onEntered())
  }

  return (
    <section ref={rootRef} className="relative h-[100svh] overflow-hidden" style={{ background: '#07060a' }}>
      {/* Storefront photo — doors sit at 50% / 58% */}
      <img
        ref={imgRef}
        src="/images/store/exterior.png"
        alt="VOLT/AGE graffiti-covered storefront at night"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transformOrigin: '50% 58%', willChange: 'transform' }}
        draggable="false"
      />

      {/* Readability scrims */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(7,6,10,0.62) 0%, rgba(7,6,10,0.08) 26%, rgba(7,6,10,0.05) 55%, rgba(7,6,10,0.66) 84%, rgba(7,6,10,0.92) 100%)',
        }}
      />

      {/* UI overlay */}
      <div ref={uiRef} className="absolute inset-0 z-10 flex flex-col items-center justify-between px-6 pb-8 pt-28 text-center">
        <div className="ext-ui-item">
          <span
            className="font-body inline-flex items-center gap-4"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: CYAN }}
          >
            <span style={{ width: 40, height: 1, background: CYAN }} />
            FLAGSHIP — SECTOR 004 · OPEN LATE
            <span style={{ width: 40, height: 1, background: CYAN }} />
          </span>
        </div>

        <div className="flex flex-col items-center gap-7">
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(3rem, 12vw, 8.5rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
              color: CREAM,
              textShadow: '0 4px 40px rgba(0,0,0,0.55)',
            }}
          >
            <SplitChars text="THE STORE" />
            <br />
            <span className="font-serif-accent" style={{ color: PINK, fontSize: '0.92em', textShadow: '0 0 34px rgba(255,62,165,0.55)' }}>
              <SplitChars text="is open." />
            </span>
          </h1>

          <p className="ext-ui-item max-w-md font-body" style={{ color: MUTED, fontSize: 'clamp(0.9rem, 2.4vw, 1.05rem)', lineHeight: 1.7, textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
            One building. Two walls. Every drop we have ever made, hanging under neon — come in and browse.
          </p>

          <button
            ref={enterBtnRef}
            type="button"
            onClick={enterStore}
            disabled={entering}
            className="enter-glow ext-ui-item font-body"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: PINK,
              color: '#0b0610',
              padding: '16px 44px',
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              willChange: 'transform',
            }}
          >
            Enter the store
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="ext-ui-item flex w-full max-w-3xl items-center justify-between font-body" style={{ color: FAINT, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          <span>1212 MERIDIAN AVE</span>
          <span className="hidden sm:inline">24 / 7 — NO APPOINTMENT</span>
          <span>40.7128° N</span>
        </div>
      </div>

      {/* graffiti tag stickers */}
      <span
        className="ext-ui-item font-marker pointer-events-none absolute select-none"
        style={{ left: '6%', top: '24%', transform: 'rotate(-7deg)', color: CYAN, fontSize: 'clamp(1rem, 2.4vw, 1.6rem)', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}
        aria-hidden="true"
      >
        fresh paint!
      </span>
      <span
        className="ext-ui-item font-marker pointer-events-none absolute select-none"
        style={{ right: '7%', bottom: '22%', transform: 'rotate(5deg)', color: PINK, fontSize: 'clamp(1rem, 2.4vw, 1.6rem)', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}
        aria-hidden="true"
      >
        est. 2019 — never clean
      </span>
    </section>
  )
}

export default Exterior
