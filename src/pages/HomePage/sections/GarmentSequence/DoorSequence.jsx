/**
 * DoorSequence — Apple-style scroll-linked canvas image sequence.
 *
 * Architecture:
 *  1. Preload all 300 frames into Image objects before anything plays.
 *  2. Show a cinematic loading overlay until every frame is decoded.
 *  3. GSAP ScrollTrigger pins the section and scrubs a progress value.
 *  4. On each scrub tick, clamp + round the frame index and drawImage.
 *
 * Key choices:
 *  - `scrub: true`  (not `scrub: 1`) because Lenis already smooths the
 *    scroll; adding GSAP scrub delay on top creates a double-lag effect.
 *  - `will-change: transform` on the canvas keeps it on its own
 *    compositor layer so repaints never block the main thread.
 *  - All scroll-to-frame math happens inside onUpdate; no React state
 *    is mutated during the animation so re-renders are zero.
 */

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Config ───────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 241
const SCROLL_MULTIPLIER = 6   // section height = SCROLL_MULTIPLIER × 100vh
const BASE_PATH = '/door_animation/ezgif-frame-'

/** Zero-pads a number to 3 digits: 1 → "001" */
const pad = (n) => String(n).padStart(3, '0')

/** Build the ordered URL array (1-indexed, 001 … 300) */
const FRAME_URLS = Array.from({ length: TOTAL_FRAMES }, (_, i) => `${BASE_PATH}${pad(i + 1)}.jpg`)

// ─── Preloader ────────────────────────────────────────────────────────────────
/**
 * Loads all frames in parallel and calls `onProgress(loaded, total)` for
 * each resolved image, then resolves with the array of Image objects.
 */
function preloadFrames(urls, onProgress) {
  const images = new Array(urls.length)
  let loaded = 0

  return Promise.all(
    urls.map(
      (url, i) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = img.onerror = () => {
            images[i] = img
            loaded += 1
            onProgress(loaded, urls.length)
            resolve()
          }
          img.src = url
        }),
    ),
  ).then(() => images)
}

// ─── Component ────────────────────────────────────────────────────────────────
function DoorSequence() {
  const sectionRef  = useRef(null)
  const canvasRef   = useRef(null)
  const imagesRef   = useRef([])       // decoded Image objects, filled after preload
  const frameRef    = useRef(0)        // current logical frame index (0-based)
  const rafRef      = useRef(null)     // pending rAF handle
  const ctxRef      = useRef(null)     // 2D canvas context
  const stRef       = useRef(null)     // ScrollTrigger instance

  const [loadPct, setLoadPct]     = useState(0)     // 0-100
  const [isReady, setIsReady]     = useState(false)  // all frames decoded

  // ── Resize handler: keep canvas pixels == physical pixels ──────────────────
  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = window.innerWidth  * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width  = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    ctxRef.current = canvas.getContext('2d')
    // Redraw current frame after resize
    drawFrame(frameRef.current)
  }

  // ── Draw a single frame by index ───────────────────────────────────────────
  const drawFrame = (index) => {
    const ctx  = ctxRef.current
    const img  = imagesRef.current[index]
    const canvas = canvasRef.current
    if (!ctx || !img || !canvas || !img.complete) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // "cover" the canvas: scale to fill, centre-crop
    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const scale = Math.max(cw / iw, ch / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2

    ctx.drawImage(img, dx, dy, dw, dh)
  }

  // ── Scheduled rAF draw so multiple scrub ticks collapse into one paint ──────
  const scheduleFrame = (index) => {
    frameRef.current = index
    if (rafRef.current) return                     // already scheduled
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      drawFrame(frameRef.current)
    })
  }

  // ── Preload → then wire up ScrollTrigger ───────────────────────────────────
  useEffect(() => {
    let cancelled = false

    preloadFrames(FRAME_URLS, (loaded, total) => {
      if (!cancelled) setLoadPct(Math.round((loaded / total) * 100))
    }).then((imgs) => {
      if (cancelled) return
      imagesRef.current = imgs
      setIsReady(true)
    })

    return () => { cancelled = true }
  }, [])

  // ── After ready: set up canvas, resize listener, ScrollTrigger ────────────
  useEffect(() => {
    if (!isReady) return

    resizeCanvas()
    drawFrame(0)                                   // show frame 1 immediately

    window.addEventListener('resize', resizeCanvas)

    // ScrollTrigger: pin the section, scrub progress 0→1
    stRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${SCROLL_MULTIPLIER * 100}%`,
      pin: true,
      anticipatePin: 1,
      scrub: true,                                 // tied 1-to-1 with scroll
      onUpdate: (self) => {
        const raw   = self.progress * (TOTAL_FRAMES - 1)
        const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(raw)))
        scheduleFrame(index)
      },
    })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      stRef.current?.kill()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="door-sequence"
      style={{
        position: 'relative',
        height: '100vh',          // GSAP pin spacer handles the scroll budget
        width: '100%',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* Canvas (always mounted so GSAP can pin it) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:      0,
          display:    'block',
          willChange: 'transform',   // own compositor layer → no jank
          opacity:    isReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Loading overlay (visible until all frames are ready) */}
      {!isReady && (
        <div
          style={{
            position:      'absolute',
            inset:         0,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'center',
            background:    '#0a0a0a',
            zIndex:        10,
            gap:           '28px',
          }}
        >
          {/* Wordmark */}
          <p
            style={{
              fontFamily:    "'Archivo Black', 'Arial Black', sans-serif",
              fontSize:      'clamp(1.4rem, 5vw, 3rem)',
              letterSpacing: '-0.03em',
              color:         '#F2E7D0',
              margin:        0,
              opacity:       0.9,
            }}
          >
            LOADING
          </p>

          {/* Progress track */}
          <div
            style={{
              width:        'clamp(200px, 40vw, 360px)',
              height:       '2px',
              background:   'rgba(242,231,208,0.12)',
              borderRadius: '2px',
              overflow:     'hidden',
              position:     'relative',
            }}
          >
            <div
              style={{
                position:     'absolute',
                inset:        '0 auto 0 0',
                width:        `${loadPct}%`,
                background:   '#B6912E',
                borderRadius: '2px',
                transition:   'width 0.18s ease',
              }}
            />
          </div>

          {/* Percentage */}
          <p
            style={{
              fontFamily:    "'Work Sans', sans-serif",
              fontSize:      '11px',
              fontWeight:    700,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color:         'rgba(242,231,208,0.45)',
              margin:        0,
            }}
          >
            {loadPct}%
          </p>
        </div>
      )}

      {/* Scroll hint (visible once loaded) */}
      {isReady && (
        <div
          style={{
            position:      'absolute',
            bottom:        '36px',
            left:          '50%',
            transform:     'translateX(-50%)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '10px',
            zIndex:        5,
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontFamily:    "'Work Sans', sans-serif",
              fontSize:      '10px',
              fontWeight:    700,
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color:         'rgba(242,231,208,0.55)',
              margin:        0,
            }}
          >
            Scroll
          </p>
          {/* Animated dot rail */}
          <div style={{ width: '2px', height: '44px', background: 'rgba(242,231,208,0.18)', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                position:     'absolute',
                top:          0,
                left:         0,
                width:        '100%',
                height:       '40%',
                background:   '#B6912E',
                borderRadius: '2px',
                animation:    'doorScrollDot 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* Keyframe for scroll hint dot */}
      <style>{`
        @keyframes doorScrollDot {
          0%   { transform: translateY(0%);   opacity: 1; }
          80%  { transform: translateY(160%); opacity: 0.4; }
          100% { transform: translateY(160%); opacity: 0; }
        }
      `}</style>
    </section>
  )
}

export default DoorSequence
