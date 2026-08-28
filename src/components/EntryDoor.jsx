import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import CabinetRoom from './CabinetRoom'

/*
 * The entry — a click-triggered, fixed-timeline pass through the closet door.
 *
 * This component deliberately does NOT use scroll, and it does NOT use a
 * library animation pipeline either: this project's framer-motion build has
 * twice produced silent animation failures (frozen opacity under scroll;
 * a full no-op of an animate() sequence in a real browser while timers kept
 * running). So the sequence runs on ONE master clock instead:
 *
 *   - a single requestAnimationFrame loop started by the click
 *   - every layer's transform/opacity is a pure function of elapsed seconds,
 *     evaluated from the TRACKS table below (absolute time windows, fixed
 *     keyframes, per-segment easing) and written to the DOM imperatively
 *   - completion is triggered by the SAME clock, so the cut to the finished
 *     state can never outrun the visuals — the previous failure mode (timer
 *     fired while no animation frame ever rendered) is impossible by design
 *
 * That is exactly the brief's critical requirement: one shared timeline
 * instance, explicit fixed numeric offsets, nothing tuned independently.
 *
 * Pre-rendered image layers (masters in assets-src/entry, web files in
 * public/images/entry), stacked bottom → top:
 *   frame    - hallway wall with the doorway already open (aspect-matched)
 *   interior - the walk-in closet: bg (full frame) < mid (wardrobe blocks,
 *              alpha) < fg (nearest edges + floor strip, alpha); hidden until
 *              the door's swing is visibly underway, then arrives over the
 *              frame while the facade is still dissolving — the overlap is
 *              what makes the handoff continuous
 *   door     - the oak slab (aspect-matched to the frame so it tracks the
 *              doorway at any viewport); clickable once
 *
 * The door SWINGS, it does not slide: hinged at its left edge (the handle is
 * on the slab's right), it compresses scaleX 1 → 0.08 for perspective
 * foreshortening, adds a subtle skewY, pulls slightly toward the hinge, and
 * the edge-on sliver dissolves as it passes the camera plane. A flat
 * translateX reads as an image sliding off-screen; this reads as opening.
 *
 * Timeline (seconds, absolute from the click):
 *   0.0–0.3   door "give": micro shudder + 1.5% scale bump, then settles
 *   0.3–1.3   door swings open: scaleX 1 → 0.08 around the left hinge,
 *             skewY 0 → 2.5deg → 1deg, x drift −1.5% toward the hinge
 *   1.0–1.4   the edge-on sliver fades out (door opacity 1 → 0)
 *   1.0–1.8   interior fades in over the frame — strictly AFTER the swing
 *             began, while the facade is still present
 *   1.0–2.6   interior scales down 1.45 → 1.0 with most of the move DURING
 *             the door's swing and the facade handoff (forward motion never
 *             stops), then a barely-perceptible micro-push to 1.012 by 3.2
 *   1.6–2.6   facade (frame AND door wrapper, identical tracks) zooms 1 → 1.6
 *             and fades out; mid/fg parallax scale in at differentiated rates
 *   1.6–2.2   brand chrome fades
 *   3.2       done: frame/door are REMOVED from the DOM (not just hidden),
 *             will-change is dropped, and the homepage mounts
 *
 * Skip: a deliberately faint control visible during playback runs the same
 * clock at 8x — a fast-forward through the remaining frames to the resting
 * state, never a cut to a blank page.
 *
 * Only transform/opacity are animated; images are static pre-renders (no live
 * 3D). Doorway geometry was measured off 5% grid overlays of the masters —
 * desktop frame 16:9, mobile frame a 2:3 center crop (x 31.25%..68.75%), with
 * the door rect re-mapped into crop coordinates.
 */
const CREAM = '#f5f1e8'
const FAINT = 'rgba(242, 231, 208, 0.32)'
const SEQUENCE_END = 3.2 // seconds; every track ends by here
const SKIP_SPEED = 8

// easing — pure functions, no library dependency
const linear = (t) => t
const easeIn = (t) => t * t * t
const easeOut = (t) => 1 - (1 - t) ** 3
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// THE timeline: absolute time windows on one shared clock. Every value comes
// from the same elapsed time — layers cannot desync by construction.
//
// Interior parallax design (t = 1.0 → 3.2):
//   The 'group' wrapper carries the global arrival zoom (1.45 → 1.012) and
//   the opacity fade-in.  On top of that base motion, each of the 5 depth
//   layers adds its OWN scale + translate at a DIFFERENT rate — that
//   differential is what makes it read as 3D depth instead of a flat zoom.
//
//   depth order (far → near, slowest → fastest motion):
//     back  — far back wall / center corridor (lowest rates)
//     left  — left wardrobe columns (medium, translates left)
//     right — right wardrobe columns (medium, translates right)
//     ceil  — ceiling band (high, translates up)
//     floor — floor plane (highest, translates down)
//
//   The bg image underneath never moves independently — it stays pinned to
//   the group so it acts as a fill, preventing any transparent gaps as the
//   parallax layers spread apart.
const TRACKS = [
  // cue dissolves on click
  { layer: 'cue', prop: 'opacity', keys: [1, 0], times: [0, 0.25], eases: [easeOut] },
  // 0.0–0.3 the give: shudder + scale bump (hinge-anchored, subtle)
  { layer: 'door', prop: 'xPct', keys: [0, -0.5, 0.2, 0, -1.5], times: [0, 0.1, 0.2, 0.3, 1.3], eases: [easeOut, easeInOut, easeInOut, easeInOut] },
  { layer: 'door', prop: 'scale', keys: [1, 1.015, 1], times: [0, 0.15, 0.3], eases: [easeInOut, easeInOut] },
  // 0.3–1.3 the swing: foreshorten around the left hinge, accelerate like a
  // real swing (easeIn), a whisper of skew for perspective
  { layer: 'door', prop: 'scaleX', keys: [1, 1, 0.08], times: [0, 0.3, 1.3], eases: [linear, easeIn] },
  { layer: 'door', prop: 'skewY', keys: [0, 0, 2.5, 1], times: [0, 0.3, 1.0, 1.3], eases: [linear, easeInOut, easeOut] },
  // the edge-on sliver dissolves as it passes the camera plane
  { layer: 'door', prop: 'opacity', keys: [1, 1, 0], times: [0, 1.05, 1.4], eases: [linear, easeInOut] },
  // ── interior group ───────────────────────────────────────────────────────
  // The group carries the global arrival zoom + opacity.  It starts when the
  // swing is visibly underway so the overlap is continuous, never a cut.
  { layer: 'group', prop: 'opacity', keys: [0, 1], times: [1.0, 1.8], eases: [easeInOut] },
  { layer: 'group', prop: 'scale', keys: [1.45, 1.18, 1, 1.012], times: [1.0, 1.8, 2.6, 3.2], eases: [easeOut, easeInOut, easeOut] },
  // the handoff: frame and door wrapper run IDENTICAL tracks — locked by construction
  { layer: 'frameWrap', prop: 'scale', keys: [1, 1.6], times: [1.6, 2.6], eases: [easeInOut] },
  { layer: 'frameWrap', prop: 'opacity', keys: [1, 0], times: [1.6, 2.6], eases: [easeInOut] },
  { layer: 'doorWrap', prop: 'scale', keys: [1, 1.6], times: [1.6, 2.6], eases: [easeInOut] },
  { layer: 'doorWrap', prop: 'opacity', keys: [1, 0], times: [1.6, 2.6], eases: [easeInOut] },
  // ── 5-layer depth parallax (all times relative to shared clock) ──────────
  // CRITICAL: each layer has a fixed transformOrigin in JSX (floor=bottom,
  // ceiling=top, left=left, right=right, back=center) — that anchor is what
  // makes scale push in the right direction. Without it every layer scales
  // from center and looks identical. Translate values are also aggressive
  // (12–16%) so the effect reads clearly even on a phone.
  //
  // back wall: far end of corridor — barely moves (furthest depth)
  { layer: 'layerBack',  prop: 'scale',  keys: [1.00, 1.03], times: [1.0, 3.2], eases: [easeOut] },
  // left wall: anchored left-center; scale grows rightward + translateX pulls left
  { layer: 'layerLeft',  prop: 'scale',  keys: [1.00, 1.18], times: [1.0, 3.2], eases: [easeOut] },
  { layer: 'layerLeft',  prop: 'xPct',   keys: [0, -12],     times: [1.0, 3.2], eases: [easeOut] },
  // right wall: mirror of left
  { layer: 'layerRight', prop: 'scale',  keys: [1.00, 1.18], times: [1.0, 3.2], eases: [easeOut] },
  { layer: 'layerRight', prop: 'xPct',   keys: [0,  12],     times: [1.0, 3.2], eases: [easeOut] },
  // ceiling: anchored top-center; scale grows downward + translateY pulls up
  { layer: 'layerCeil',  prop: 'scale',  keys: [1.00, 1.22], times: [1.0, 3.2], eases: [easeOut] },
  { layer: 'layerCeil',  prop: 'yPct',   keys: [0,  -14],    times: [1.0, 3.2], eases: [easeOut] },
  // floor: anchored bottom-center; scale grows upward + translateY pushes down
  { layer: 'layerFloor', prop: 'scale',  keys: [1.00, 1.22], times: [1.0, 3.2], eases: [easeOut] },
  { layer: 'layerFloor', prop: 'yPct',   keys: [0,   16],    times: [1.0, 3.2], eases: [easeOut] },
  { layer: 'chrome', prop: 'opacity', keys: [1, 0], times: [1.6, 2.2], eases: [easeInOut] },
]

const evalTrack = (track, t) => {
  const { keys, times, eases } = track
  if (t <= times[0]) return keys[0]
  const last = times.length - 1
  if (t >= times[last]) return keys[last]
  let i = 0
  while (i < last - 1 && t > times[i + 1]) i += 1
  const segT = (t - times[i]) / (times[i + 1] - times[i])
  return keys[i] + (keys[i + 1] - keys[i]) * eases[i](segT)
}

function EntryDoor({ onPassedChange }) {
  const [phase, setPhase] = useState('idle') // idle → playing → done
  const phaseRef = useRef('idle')
  const skippingRef = useRef(false)
  const finishedRef = useRef(false)
  const rafRef = useRef(null)
  const speedRef = useRef(1)

  const frameWrapRef  = useRef(null)
  const doorWrapRef   = useRef(null)
  const doorRef       = useRef(null)
  const groupRef      = useRef(null)
  // 5 depth-parallax layer refs (replace old mid/fg pair)
  const layerBackRef  = useRef(null)
  const layerLeftRef  = useRef(null)
  const layerRightRef = useRef(null)
  const layerCeilRef  = useRef(null)
  const layerFloorRef = useRef(null)
  const chromeRef     = useRef(null)
  const cueRef        = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  // one writer: evaluate every track at time t, compose per-layer styles,
  // write transform/opacity imperatively — nothing else touches these styles
  const applyFrame = useCallback((t) => {
    const v = {}
    for (const track of TRACKS) {
      const layer = v[track.layer] || (v[track.layer] = {})
      layer[track.prop] = evalTrack(track, t)
    }
    if (cueRef.current && v.cue)    cueRef.current.style.opacity   = String(v.cue.opacity)
    if (chromeRef.current && v.chrome) chromeRef.current.style.opacity = String(v.chrome.opacity)
    if (doorRef.current && v.door) {
      const d = v.door
      doorRef.current.style.transform = `translateX(${d.xPct ?? 0}%) scale(${d.scale ?? 1}) scaleX(${d.scaleX ?? 1}) skewY(${d.skewY ?? 0}deg)`
      doorRef.current.style.opacity   = String(d.opacity ?? 1)
    }
    if (frameWrapRef.current && v.frameWrap) {
      frameWrapRef.current.style.transform = `scale(${v.frameWrap.scale ?? 1})`
      frameWrapRef.current.style.opacity   = String(v.frameWrap.opacity ?? 1)
    }
    if (doorWrapRef.current && v.doorWrap) {
      doorWrapRef.current.style.transform = `scale(${v.doorWrap.scale ?? 1})`
      doorWrapRef.current.style.opacity   = String(v.doorWrap.opacity ?? 1)
    }
    if (groupRef.current && v.group) {
      groupRef.current.style.transform = `scale(${v.group.scale ?? 1.45})`
      groupRef.current.style.opacity   = String(v.group.opacity ?? 0)
    }
    // ── 5 depth-parallax layers — each written independently ───────────────
    // back wall: scale only, no translate (approaching vanishing point)
    if (layerBackRef.current && v.layerBack) {
      layerBackRef.current.style.transform = `scale(${v.layerBack.scale ?? 1})`
    }
    // left wall: scale + translateX (recedes left as camera moves forward)
    if (layerLeftRef.current && v.layerLeft) {
      layerLeftRef.current.style.transform =
        `translateX(${v.layerLeft.xPct ?? 0}%) scale(${v.layerLeft.scale ?? 1})`
    }
    // right wall: mirror of left
    if (layerRightRef.current && v.layerRight) {
      layerRightRef.current.style.transform =
        `translateX(${v.layerRight.xPct ?? 0}%) scale(${v.layerRight.scale ?? 1})`
    }
    // ceiling: scale + translateY upward
    if (layerCeilRef.current && v.layerCeil) {
      layerCeilRef.current.style.transform =
        `translateY(${v.layerCeil.yPct ?? 0}%) scale(${v.layerCeil.scale ?? 1})`
    }
    // floor: scale + translateY downward (largest apparent motion = nearest)
    if (layerFloorRef.current && v.layerFloor) {
      layerFloorRef.current.style.transform =
        `translateY(${v.layerFloor.yPct ?? 0}%) scale(${v.layerFloor.scale ?? 1})`
    }
  }, [])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    applyFrame(SEQUENCE_END) // pin exact resting values before the DOM swap
    setPhase('done')
    onPassedChange?.(true)
  }, [applyFrame, onPassedChange])

  const play = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    phaseRef.current = 'playing'
    setPhase('playing')
    const start = performance.now()
    const tick = (now) => {
      const t = ((now - start) / 1000) * speedRef.current
      applyFrame(Math.min(t, SEQUENCE_END))
      if (t >= SEQUENCE_END) {
        rafRef.current = null
        finish()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [applyFrame, finish])

  // skip = same clock, faster — a fast-forward through the remaining frames
  const skip = useCallback(() => {
    if (phaseRef.current !== 'playing' || skippingRef.current) return
    skippingRef.current = true
    speedRef.current = SKIP_SPEED
  }, [])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  // reduced-motion renders the static arrival frame — report passed immediately
  useEffect(() => {
    if (shouldReduceMotion && onPassedChange) onPassedChange(true)
  }, [shouldReduceMotion, onPassedChange])

  if (shouldReduceMotion) {
    return (
      <section className="relative flex h-[100dvh] items-end overflow-hidden" style={{ background: '#060402' }} aria-label="The walk-in closet">
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/entry/interior-mobile.webp" />
          <img
            src="/images/entry/interior-desktop.webp"
            alt="Inside the warm walk-in closet"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div className="absolute left-6 top-6 sm:left-10 sm:top-8">
          <span className="font-display text-sm" style={{ letterSpacing: '0.42em', color: CREAM, opacity: 0.85 }}>
            VOLT/AGE
          </span>
          <span className="mt-1 block font-body text-[8px] uppercase" style={{ letterSpacing: '0.5em', color: FAINT }}>
            the walk-in
          </span>
        </div>
      </section>
    )
  }

  const idle = phase === 'idle'
  const done = phase === 'done'
  const playing = phase === 'playing'

  return (
    <section
      className="relative h-[100dvh] overflow-hidden"
      style={{ background: '#060402' }}
      aria-label="The closet door — click to enter"
    >
      {/* frame — hallway wall with the open doorway (bottom layer) */}
      {!done && (
        <div ref={frameWrapRef} className="absolute inset-0" style={{ willChange: 'transform, opacity' }} data-layer="frame">
          <div className="absolute left-1/2 top-1/2 h-[max(100vh,150vw)] w-[max(100vw,66.67vh)] -translate-x-1/2 -translate-y-1/2 md:h-[max(100vh,56.25vw)] md:w-[max(100vw,177.78vh)]">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/entry/frame-mobile.webp" />
              <img
                src="/images/entry/frame-desktop.webp"
                alt="A dark hallway at home, an open doorway glowing warm ahead"
                draggable="false"
                className="absolute inset-0 h-full w-full"
              />
            </picture>
          </div>
        </div>
      )}

      {/* interior — 5-layer depth-parallax group over the frame
           hidden until the door swing is visibly underway so the overlap
           is continuous (see TRACKS group.opacity, t=1.0→1.8)

           Layer stack, bottom to top (far → near, slowest → fastest motion):
             bg          full image pinned to group, acts as a seamless fill
                         so transparent gaps never appear between moving layers
             layer-back  center corridor / far back wall
             layer-left  left wardrobe wall columns
             layer-right right wardrobe wall columns
             layer-ceil  ceiling band
             layer-floor floor plane (nearest, most motion)
      */}
      <div
        ref={groupRef}
        className="absolute inset-0"
        style={done
          ? { opacity: 1, transform: 'scale(1.012)' }
          : { opacity: 0, transform: 'scale(1.45)', willChange: 'transform, opacity' }}
        data-layer="group"
      >
        {/* ── bg — full image, stays locked to group, never moves independently ── */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/entry/interior-mobile.webp" />
          <img
            src="/images/entry/interior-desktop.webp"
            alt="Inside the warm walk-in closet"
            draggable="false"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>

        {/* ── back wall: far corridor, barely moves — transformOrigin center ── */}
        <div
          ref={layerBackRef}
          className="absolute inset-0"
          style={done
            ? { transform: 'scale(1.03)', transformOrigin: 'center center' }
            : { willChange: 'transform', transformOrigin: 'center center' }}
          aria-hidden="true"
          data-layer="back"
        >
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/entry/layer-back-mobile.webp" />
            <img
              src="/images/entry/layer-back-desktop.webp"
              alt=""
              draggable="false"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>

        {/* ── left wall: anchored left-center so scale grows rightward, translate pulls left ── */}
        <div
          ref={layerLeftRef}
          className="absolute inset-0"
          style={done
            ? { transform: 'translateX(-12%) scale(1.18)', transformOrigin: 'left center' }
            : { willChange: 'transform', transformOrigin: 'left center' }}
          aria-hidden="true"
          data-layer="left"
        >
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/entry/layer-left-mobile.webp" />
            <img
              src="/images/entry/layer-left-desktop.webp"
              alt=""
              draggable="false"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>

        {/* ── right wall: anchored right-center, mirror of left ── */}
        <div
          ref={layerRightRef}
          className="absolute inset-0"
          style={done
            ? { transform: 'translateX(12%) scale(1.18)', transformOrigin: 'right center' }
            : { willChange: 'transform', transformOrigin: 'right center' }}
          aria-hidden="true"
          data-layer="right"
        >
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/entry/layer-right-mobile.webp" />
            <img
              src="/images/entry/layer-right-desktop.webp"
              alt=""
              draggable="false"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>

        {/* ── ceiling: anchored top-center so scale grows downward, translate pulls up ── */}
        <div
          ref={layerCeilRef}
          className="absolute inset-0"
          style={done
            ? { transform: 'translateY(-14%) scale(1.22)', transformOrigin: 'top center' }
            : { willChange: 'transform', transformOrigin: 'top center' }}
          aria-hidden="true"
          data-layer="ceil"
        >
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/entry/layer-ceil-mobile.webp" />
            <img
              src="/images/entry/layer-ceil-desktop.webp"
              alt=""
              draggable="false"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>

        {/* ── floor: anchored bottom-center so scale grows upward, translate pushes down ── */}
        <div
          ref={layerFloorRef}
          className="absolute inset-0"
          style={done
            ? { transform: 'translateY(16%) scale(1.22)', transformOrigin: 'bottom center' }
            : { willChange: 'transform', transformOrigin: 'bottom center' }}
          aria-hidden="true"
          data-layer="floor"
        >
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/entry/layer-floor-mobile.webp" />
            <img
              src="/images/entry/layer-floor-desktop.webp"
              alt=""
              draggable="false"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>
      </div>

      {/* door — aspect-matched to the frame so it tracks the doorway (top layer) */}
      {!done && (
        <div ref={doorWrapRef} className="absolute inset-0" style={{ willChange: 'transform, opacity' }} data-layer="door-wrap">
          <div className="absolute left-1/2 top-1/2 h-[max(100vh,150vw)] w-[max(100vw,66.67vh)] -translate-x-1/2 -translate-y-1/2 md:h-[max(100vh,56.25vw)] md:w-[max(100vw,177.78vh)]">
            <div
              ref={doorRef}
              className={`absolute left-[20.67%] top-[7.5%] h-[84.3%] w-[59.73%] md:left-[39%] md:w-[22.4%] ${
                idle ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40' : 'pointer-events-none'
              }`}
              style={{ willChange: 'transform, opacity', transformOrigin: 'left center' }}
              role={idle ? 'button' : undefined}
              tabIndex={idle ? 0 : undefined}
              aria-label={idle ? 'Open the closet door' : undefined}
              data-layer="door"
              onClick={idle ? play : undefined}
              onKeyDown={idle
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      play()
                    }
                  }
                : undefined}
            >
              <img
                src="/images/entry/door.webp"
                alt="The closed oak closet door"
                draggable="false"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* static vignette — part of the frame, never animated */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 78% 68% at 50% 46%, transparent 52%, rgba(4,3,1,0.72) 100%)' }}
        aria-hidden="true"
      />

      {/* brand mark */}
      {!done && (
        <div ref={chromeRef} className="absolute left-6 top-6 sm:left-10 sm:top-8" style={{ willChange: 'opacity' }} data-layer="chrome">
          <span className="font-display text-sm" style={{ letterSpacing: '0.42em', color: CREAM, opacity: 0.85 }}>
            VOLT/AGE
          </span>
          <span className="mt-1 block font-body text-[8px] uppercase" style={{ letterSpacing: '0.5em', color: FAINT }}>
            the walk-in
          </span>
        </div>
      )}

      {/* click cue — fades out as soon as the sequence starts */}
      {!done && (
        <div
          ref={cueRef}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
          style={{ willChange: 'opacity' }}
          data-layer="cue"
        >
          <span style={{ width: 1, height: 40, background: 'rgba(232,213,174,0.35)' }} aria-hidden="true" />
          <span className="font-body text-[10px] uppercase" style={{ letterSpacing: '0.5em', color: 'rgba(242,231,208,0.6)' }}>
            click to enter
          </span>
        </div>
      )}

      {/* skip — deliberately faint, for return visitors */}
      {!done && (
        <button
          type="button"
          onClick={skip}
          className={`absolute bottom-6 right-6 font-body text-[9px] uppercase transition-opacity duration-300 ${
            playing ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          style={{ letterSpacing: '0.4em', color: 'rgba(242,231,208,0.4)' }}
          data-layer="skip"
        >
          skip
        </button>
      )}

      {/* ── cabinet room — mounted once the door sequence is fully done ── */}
      {done && <CabinetRoom />}
    </section>
  )
}

export default EntryDoor
