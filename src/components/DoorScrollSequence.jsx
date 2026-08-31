/**
 * DoorScrollSequence — the entry experience as a scroll-driven frame player.
 *
 * The 241 processed AVIF frames (public/kimi_folder) show the camera walking
 * up to the closed hallway door, opening it, and arriving at the closet's
 * brass rod. Scrolling plays them like a smooth 30fps video.
 *
 * Behavior (per owner spec):
 *   • Idle at frame 1 with a "click to enter" cue — scrolling past does NOT
 *     start the sequence (manual scroll still scrubs the frames slowly)
 *   • Click the door → auto-play, locked, through to frame 236, then stop
 *     there (the walk-in section continues below in the page flow)
 *   • Stopped at 236, ANY scroll upward → auto-play back to frame 1, locked
 *   • Manual scroll input is blocked while an auto-play is running
 *
 * Frames: 241 processed AVIFs in public/kimi_folder; forward play stops at
 * 236 per owner spec (the last few frames are only reachable by manual
 * scrub). Adjust PLAY_END here if the reel changes.
 *
 * Smoothing: Lenis already smooths wheel input; on top of that the displayed
 * frame lerps toward the scroll target every rAF, so motion never jumps.
 */

import { useEffect, useRef, useState } from 'react'

// ─── tuning ────────────────────────────────────────────────────────────────
const FRAME_COUNT  = 241            // frames present in public/kimi_folder
const PLAY_END     = 236            // forward auto-play stops on THIS frame —
                                    // scrolling up from it (below 236) rewinds
const TRACK_VH     = 520            // scroll-track length for the sequence
const PLAY_MS      = 7000           // forward auto-play duration (~30fps feel)
const REWIND_MS    = 4500           // rewind is a reset — slightly quicker
const LERP         = 0.16           // display smoothing factor per rAF tick

const FRAME_URL = (n) =>
  `/kimi_folder/ezgif-frame-${String(n).padStart(3, '0')}.avif`

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

const CREAM = '#f5f1e8'
const FAINT = 'rgba(242, 231, 208, 0.32)'

export default function DoorScrollSequence({ onPassedChange }) {
  const sectionRef  = useRef(null)
  const canvasRef   = useRef(null)
  const imagesRef   = useRef([])        // Image elements, index = frame-1
  const decodedRef  = useRef([])        // boolean per frame
  const displayedRef = useRef(1)        // smoothed playhead (float)
  const drawnRef    = useRef(0)         // last frame actually drawn
  const autoRef     = useRef(null)      // {fromY, toY, t0, dur, goal} | null
  const completeRef = useRef(false)
  const passedRef   = useRef(false)

  const [ready, setReady]       = useState(false)
  const [loadPct, setLoadPct]   = useState(0)
  const [complete, setComplete] = useState(false)
  const enterRef = useRef(null) // click-to-enter trigger, set by the rAF effect

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
      }
    })()

    return () => { cancelled = true }
  }, [])

  // ── canvas sizing ─────────────────────────────────────────────────────────
  useEffect(() => {
    const size = () => {
      const c = canvasRef.current
      if (!c) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      c.width  = Math.round(c.clientWidth * dpr)
      c.height = Math.round(c.clientHeight * dpr)
      drawnRef.current = 0 // force redraw
    }
    size()
    window.addEventListener('resize', size)
    return () => window.removeEventListener('resize', size)
  }, [ready])

  // ── main loop: scroll → frame mapping, auto-play, drawing ────────────────
  useEffect(() => {
    if (!ready) return undefined
    let raf

    // the section is NOT necessarily at the top of the page (it sits at the
    // bottom of /drops) — all mapping is relative to its document position
    const trackStart = () => {
      const el = sectionRef.current
      return el ? el.getBoundingClientRect().top + window.scrollY : 0
    }
    const yForFrame = (f) => {
      const el = sectionRef.current
      if (!el) return 0
      const track = el.offsetHeight - window.innerHeight
      return trackStart() + ((f - 1) / (FRAME_COUNT - 1)) * track
    }

    const block = (e) => e.preventDefault()
    const blockKeys = (e) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
      }
    }
    const lock = () => {
      window.addEventListener('wheel', block, { passive: false })
      window.addEventListener('touchmove', block, { passive: false })
      window.addEventListener('keydown', blockKeys)
      window.__lenis?.stop()
    }
    const unlock = () => {
      window.removeEventListener('wheel', block)
      window.removeEventListener('touchmove', block)
      window.removeEventListener('keydown', blockKeys)
      window.__lenis?.start()
    }

    const startAuto = (goalFrame) => {
      const forward = goalFrame > 1
      autoRef.current = {
        fromY: window.scrollY,
        toY: yForFrame(goalFrame),
        t0: performance.now(),
        dur: forward ? PLAY_MS : REWIND_MS,
        goal: goalFrame,
      }
      lock()
    }
    // click-to-enter: the only way the forward auto-play starts
    enterRef.current = () => {
      if (!autoRef.current && !completeRef.current) startAuto(PLAY_END)
    }

    const draw = (frameFloat) => {
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
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)

      // ── auto-play drives the real scroll position ──
      const auto = autoRef.current
      if (auto) {
        const t = Math.min(1, (now - auto.t0) / auto.dur)
        const y = auto.fromY + (auto.toY - auto.fromY) * easeInOutCubic(t)
        window.scrollTo(0, y)
        if (t >= 1) {
          autoRef.current = null
          unlock()
          if (auto.goal === PLAY_END && !completeRef.current) {
            completeRef.current = true
            setComplete(true)
            if (!passedRef.current) {
              passedRef.current = true
              onPassedChange?.(true)
            }
          }
          if (auto.goal === 1 && completeRef.current) {
            completeRef.current = false
            setComplete(false)
          }
        }
      }

      // ── map scroll → target frame (relative to the section's position) ──
      const el = sectionRef.current
      if (!el) return
      const track = el.offsetHeight - window.innerHeight
      const progress = Math.min(1, Math.max(0, (window.scrollY - trackStart()) / track))
      const target = progress * (FRAME_COUNT - 1) + 1

      // ── rewind trigger: stopped at PLAY_END (236), so ANY scroll upward
      //    lands below it and rewinds to frame 1 ──
      if (!autoRef.current && completeRef.current && target < PLAY_END - 0.5) {
        startAuto(1)
      }

      // ── humanlike smoothing: ease the playhead toward the target ──
      displayedRef.current += (target - displayedRef.current) * LERP
      draw(displayedRef.current)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      enterRef.current = null
    }
  }, [ready, onPassedChange])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${TRACK_VH}vh`, background: '#060402' }}
      aria-label="The closet door — click to enter"
    >
      <div
        className={`sticky top-0 h-[100dvh] overflow-hidden ${!complete ? 'cursor-pointer' : ''}`}
        onClick={() => { if (ready && !complete) enterRef.current?.() }}
        role={!complete ? 'button' : undefined}
        aria-label={!complete ? 'Enter the walk-in closet' : undefined}
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

        {/* scroll cue — visible until the walk finishes */}
        {ready && !complete && (
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

        {/* when the camera reaches the rod (last frame), the walk-in
            section simply continues below — no overlay fades in */}
      </div>
    </section>
  )
}
