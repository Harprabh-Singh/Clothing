/**
 * DoorScrollSequence — the entry experience as a click-driven frame player.
 *
 * The 241 processed AVIF frames (public/kimi_folder) show the camera walking
 * up to the closed hallway door, opening it, and arriving at the closet's
 * brass rod. They play like a smooth ~30fps video — but NEVER from scrolling.
 *
 * Behavior (per owner spec):
 *   • Idle at frame 1 with a "click to enter" cue — the page is scroll-locked,
 *     clicking the door is the ONLY way forward
 *   • Click → auto-play, scroll-locked, LINEAR motion all the way to frame 236
 *     (no easing — the reel must not slow down near the last frames)
 *   • Stopped at 236, the page unlocks: the walk-in section continues below and
 *     scrolls freely — scrolling never moves the playhead
 *   • The ONLY way back to frame 1 is the "go back" button on the completed
 *     hero — it rewinds (linear, scroll-locked) to frame 1, where the page
 *     locks again until the next click
 *
 * Frames: 241 processed AVIFs in public/kimi_folder; forward play stops at
 * 236 per owner spec. Adjust PLAY_END here if the reel changes.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ─── tuning ────────────────────────────────────────────────────────────────
const FRAME_COUNT = 241   // frames present in public/kimi_folder
const PLAY_END    = 236   // forward auto-play stops on THIS frame
const PLAY_MS     = 7000  // forward auto-play duration (~30fps feel)
const REWIND_MS   = 4500  // rewind is a reset — slightly quicker

const FRAME_URL = (n) =>
  `/kimi_folder/ezgif-frame-${String(n).padStart(3, '0')}.avif`

const CREAM = '#f5f1e8'
const FAINT = 'rgba(242, 231, 208, 0.32)'

// ─── scroll locking (module-level so add/removeEventListener stay paired) ──
const block = (e) => e.preventDefault()
const blockKeys = (e) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) {
    e.preventDefault()
  }
}
const snapTop = () => { if (window.scrollY !== 0) window.scrollTo(0, 0) }

function lockScroll(snap = false) {
  if (snap) window.scrollTo(0, 0) // idle always means the top of the page
  window.addEventListener('wheel', block, { passive: false })
  window.addEventListener('touchmove', block, { passive: false })
  window.addEventListener('keydown', blockKeys)
  if (snap) window.addEventListener('scroll', snapTop)
  window.__lenis?.stop()
}
function unlockScroll() {
  window.removeEventListener('wheel', block)
  window.removeEventListener('touchmove', block)
  window.removeEventListener('keydown', blockKeys)
  window.removeEventListener('scroll', snapTop)
  window.__lenis?.start()
}

export default function DoorScrollSequence({ onPassedChange }) {
  const canvasRef = useRef(null)
  const imagesRef  = useRef([])     // Image elements, index = frame-1
  const decodedRef = useRef([])     // boolean per frame
  const drawnRef   = useRef(0)      // last frame actually drawn
  const frameRef   = useRef(1)      // current playhead (float)
  const rafRef     = useRef(null)
  const passedRef  = useRef(false)
  const phaseRef   = useRef('idle') // 'idle' | 'playing' | 'complete' | 'rewinding'

  const [ready, setReady]     = useState(false)
  const [loadPct, setLoadPct] = useState(0)
  const [phase, setPhase]     = useState('idle')

  // keep the ref mirror in sync; expose a tiny debug handle in dev
  useEffect(() => {
    phaseRef.current = phase
    if (import.meta.env.DEV) window.__doorPhase = phase
  }, [phase])

  // ── preloading: first window eagerly (playback can start), rest in bg ──
  useEffect(() => {
    let cancelled = false
    const images = new Array(FRAME_COUNT)
    const decoded = new Array(FRAME_COUNT).fill(false)
    imagesRef.current = images
    decodedRef.current = decoded

    const load = (n) =>
      new Promise((resolve) => {
        const img = new Image()
        img.src = FRAME_URL(n)
        img.decode?.().catch(() => {}).finally(() => {
          if (cancelled) return
          images[n - 1] = img
          decoded[n - 1] = true
          resolve()
        }) ?? (img.onload = () => {
          if (cancelled) return
          images[n - 1] = img
          decoded[n - 1] = true
          resolve()
        })
      })

    ;(async () => {
      const FIRST = 24
      let done = 0
      await Promise.all(
        Array.from({ length: FIRST }, (_, i) => load(i + 1).then(() => {
          done += 1
          if (!cancelled) setLoadPct(Math.round((done / FIRST) * 100))
        })),
      )
      if (!cancelled) setReady(true)
      // background: the rest of the reel
      for (let n = FIRST + 1; n <= FRAME_COUNT; n += 1) {
        if (cancelled) return
        // eslint-disable-next-line no-await-in-loop
        await load(n)
        if (import.meta.env.DEV) window.__doorLoaded = n
      }
    })()

    return () => { cancelled = true }
  }, [])

  // ── draw one frame (cover-fit), falling back to the nearest decoded frame ──
  const draw = useCallback((frameFloat) => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    let n = Math.round(frameFloat)
    // fall back to the nearest decoded frame so playback never blanks
    while (n > 1 && !decodedRef.current[n - 1]) n -= 1
    if (n === drawnRef.current || !decodedRef.current[n - 1]) return
    const img = imagesRef.current[n - 1]
    const cw = c.width
    const ch = c.height
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const dw = img.naturalWidth * s
    const dh = img.naturalHeight * s
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    drawnRef.current = n
    if (import.meta.env.DEV) window.__doorFrame = n
  }, [])

  // ── canvas sizing ─────────────────────────────────────────────────────────
  useEffect(() => {
    const size = () => {
      const c = canvasRef.current
      if (!c) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      c.width  = Math.round(c.clientWidth * dpr)
      c.height = Math.round(c.clientHeight * dpr)
      drawnRef.current = 0        // force redraw (resize clears the canvas)
      draw(frameRef.current)
    }
    size()
    window.addEventListener('resize', size)
    return () => window.removeEventListener('resize', size)
  }, [ready, draw])

  // draw the first frame as soon as playback could start
  useEffect(() => {
    if (ready) draw(1)
  }, [ready, draw])

  // ── time-based playback — strictly LINEAR, scroll is never involved ──
  const play = useCallback((goalFrame, done) => {
    const from = frameRef.current
    const dur = goalFrame > from ? PLAY_MS : REWIND_MS
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur)
      frameRef.current = from + (goalFrame - from) * t // linear: constant speed
      draw(frameRef.current)
      if (t >= 1) {
        rafRef.current = null
        done?.()
        return
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }, [draw])

  // click-to-enter: the ONLY way the forward play starts
  const enter = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    setPhase('playing')
    play(PLAY_END, () => {
      setPhase('complete')
      if (!passedRef.current) {
        passedRef.current = true
        onPassedChange?.(true)
      }
    })
  }, [play, onPassedChange])

  // go back: the ONLY way back to frame 1
  const goBack = useCallback(() => {
    if (phaseRef.current !== 'complete') return
    setPhase('rewinding')
    play(1, () => setPhase('idle'))
  }, [play])

  // ── scroll lock follows the phase: locked everywhere except "complete" ──
  useEffect(() => {
    if (phase === 'complete') unlockScroll()
    else lockScroll(phase === 'idle') // idle also snaps the page back to top
    return () => unlockScroll()
  }, [phase])

  // cancel any in-flight playback on unmount
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section
      className="relative h-[100dvh] overflow-hidden"
      style={{ background: '#060402' }}
      aria-label="The closet door — click to enter"
    >
      <div
        className={`absolute inset-0 ${phase === 'idle' ? 'cursor-pointer' : ''}`}
        onClick={() => { if (ready) enter() }}
        role={phase === 'idle' ? 'button' : undefined}
        aria-label={phase === 'idle' ? 'Enter the walk-in closet' : undefined}
      >
        {/* the frame reel */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        {/* loading state */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span
              className="font-display text-sm"
              style={{ letterSpacing: '0.42em', color: CREAM, opacity: 0.85 }}
            >
              VOLT/AGE
            </span>
            <span
              className="font-body text-[9px] uppercase"
              style={{ letterSpacing: '0.5em', color: FAINT }}
            >
              loading — {loadPct}%
            </span>
          </div>
        )}

        {/* click-to-enter cue — idle only */}
        {ready && phase === 'idle' && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
            <span style={{ width: 1, height: 40, background: 'rgba(232,213,174,0.35)' }} aria-hidden="true" />
            <span
              className="font-body text-[10px] uppercase"
              style={{ letterSpacing: '0.5em', color: 'rgba(242,231,208,0.6)' }}
            >
              click to enter
            </span>
          </div>
        )}

        {/* go back — the ONLY way back to frame 1 */}
        {ready && phase === 'complete' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goBack() }}
            className="absolute inset-x-0 bottom-8 mx-auto flex w-fit cursor-pointer flex-col items-center gap-3 bg-transparent"
            aria-label="Go back to the start"
          >
            <span
              className="font-body text-[10px] uppercase"
              style={{ letterSpacing: '0.5em', color: 'rgba(242,231,208,0.6)' }}
            >
              go back
            </span>
            <span style={{ width: 1, height: 40, background: 'rgba(232,213,174,0.35)' }} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
