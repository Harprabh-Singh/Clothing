import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

const CREAM = '#f5f1e8'
const FAINT = 'rgba(242, 231, 208, 0.32)'

/*
 * Geometry (world units = px). The viewer sits at z = +1200 (the perspective
 * distance) looking down -z. The room is a real box: back wall at z=-700 with
 * a doorway cut into it, floor/ceiling/side walls wrapping around it, and a
 * warm corridor continuing behind the doorway. Sized so the wall/floor/ceiling
 * edges sit just inside the frustum and read as a receding room.
 */
const P = 1200
const H = 765 // floor y=+765, ceiling y=-765
const W = 1300 // side walls at x = ±1300
const BACK_Z = -700
const FRONT_Z = 1500 // room extends behind the viewer
const CZ = (BACK_Z + FRONT_Z) / 2 // 400
const DEPTH = FRONT_Z - BACK_Z // 2200
const DOOR_W = 523
const DOOR_H = 1163 // doorway spans y -398..765 (meets the floor)

/* walk-in closet beyond the corridor: two facing cabinet pairs, 001/002 up front */
const CLOSET = { nearZ: -1900, farZ: -4600, halfW: 850 }
const CABINETS = [
  { side: 'L', z: -3100, drop: '001', art: '/images/store/g-05.png', accent: '#8a94a6' },
  { side: 'R', z: -3100, drop: '002', art: '/images/store/g-02.png', accent: '#c98a5e' },
  { side: 'L', z: -4100, drop: '003', art: '/images/store/g-04.png', accent: '#9db8a4' },
  { side: 'R', z: -4100, drop: '004', art: '/images/store/g-07.png', accent: '#d8b26a' },
]

/*
 * Camera rig — first person. state = { cx, cz, yaw }; the room renders
 * rotateY(-yaw) translate3d(-cx, 0, -cz), so the camera stands at (cx, cz)
 * facing (sin yaw, -cos yaw). One target transform per cabinet; the nav and
 * the entry walk both animate toward these.
 */
const VIEWS = [
  { id: '001', cx: 200, cz: -2200, yaw: -44, zone: { left: '30%', width: '38%' } },
  { id: '002', cx: -200, cz: -2200, yaw: 44, zone: { left: '32%', width: '38%' } },
  { id: '003', cx: 200, cz: -3200, yaw: -44, zone: { left: '30%', width: '38%' } },
  { id: '004', cx: -200, cz: -3200, yaw: 44, zone: { left: '32%', width: '38%' } },
]

const MOTES = Array.from({ length: 9 }, (_, i) => ({
  left: 37 + ((i * 41) % 28),
  top: 22 + ((i * 61) % 46),
  size: 1.5 + (i % 3),
  dur: 9 + (i % 5) * 3.1,
  delay: -(i * 2.3),
  o: 0.06 + (i % 4) * 0.035,
}))

/*
 * The entry — a full-viewport 3D room. You are standing in a dark bedroom
 * facing the closet door; warm light bleeds out through its frame. Click the
 * door (or "step inside") and the camera walks through into the light.
 */
function EntryRoom({ onDone }) {
  const rootRef = useRef(null)
  const roomRef = useRef(null)
  const slabRef = useRef(null)
  const handleRef = useRef(null)
  const uiRef = useRef(null)
  const cueRef = useRef(null)
  const skipRef = useRef(null)
  const navRef = useRef(null)
  const [grainUrl, setGrainUrl] = useState('')
  const [hovering, setHovering] = useState(false)
  const [resting, setResting] = useState(false)
  const [viewIndex, setViewIndex] = useState(0)
  const [hoverCab, setHoverCab] = useState(-1)
  const busyRef = useRef(false)

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  /* film grain tile */
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = 160
    c.height = 160
    const ctx = c.getContext('2d')
    const img = ctx.createImageData(160, 160)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + Math.random() * 90
      img.data[i] = v
      img.data[i + 1] = v
      img.data[i + 2] = v
      img.data[i + 3] = 26
    }
    ctx.putImageData(img, 0, 0)
    setGrainUrl(c.toDataURL())
  }, [])

  /* scroll lock, intro fades, breathing light, skip reveal */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from('.er-ui', { opacity: 0, duration: 1.4, ease: 'power2.out', stagger: 0.25, delay: 0.5 })
        gsap.to('.er-breathe', { opacity: 0.55, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        gsap.to(skipRef.current, { autoAlpha: 1, duration: 1.2, delay: 3.2 })
      } else {
        gsap.set(skipRef.current, { autoAlpha: 1 })
      }
    }, rootRef)
    return () => {
      document.body.style.overflow = ''
      ctx.revert()
    }
  }, [reduced])

  /* door hover — creak-ready micro-shift + handle brighten */
  const hoverSlab = useCallback(
    (on) => {
      if (reduced || busyRef.current) return
      setHovering(on)
      gsap.to(slabRef.current, { rotationY: on ? -1.6 : 0, duration: 0.9, ease: 'power2.out', overwrite: 'auto' })
    },
    [reduced],
  )

  const finish = useCallback(() => {
    sessionStorage.setItem('va-entry', 'done')
    onDone()
  }, [onDone])

  const skip = useCallback(() => {
    if (reduced) {
      finish()
      return
    }
    gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.55, ease: 'power2.in', onComplete: finish })
  }, [finish, reduced])

  /* camera rig — one continuous transform: rotate about the camera, then place it */
  const camState = useRef({ ...VIEWS[0] })
  const apply = useCallback(() => {
    const s = camState.current
    if (roomRef.current) roomRef.current.style.transform = `translate3d(0px, 0px, 1200px) rotateY(${s.yaw}deg) translate3d(${-s.cx}px, 0px, ${-s.cz}px)`
  }, [])

  const goToView = useCallback(
    (i) => {
      if (!resting || i === viewIndex) return
      setViewIndex(i)
      const v = VIEWS[i]
      gsap.to(camState.current, {
        cx: v.cx,
        cz: v.cz,
        yaw: v.yaw,
        duration: 1.7,
        ease: 'power2.inOut',
        overwrite: 'auto',
        onUpdate: apply,
      })
    },
    [resting, viewIndex, apply],
  )

  /* the walk-through — door swing → push through → curve left → rest on 001.
     One continuous camera on the same scene tree; no cuts, no fades masking motion. */
  const enter = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    setHovering(false)
    gsap.killTweensOf(slabRef.current)
    if (reduced) {
      gsap.set(slabRef.current, { rotationY: 100 })
      camState.current = { ...VIEWS[0] }
      apply()
      setResting(true)
      return
    }
    const s = camState.current
    s.cx = 0
    s.cz = 0
    s.yaw = 0
    const tl = gsap.timeline()
    tl.to([uiRef.current, cueRef.current, skipRef.current], { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0)
      .to(slabRef.current, { rotationY: 100, duration: 1.7, ease: 'power3.inOut' }, 0.2)
      // walk: doorway → corridor → down the closet path
      .to(s, { cz: -2200, duration: 4.8, ease: 'power2.inOut', onUpdate: apply }, 1.15)
      // natural head/body sway while walking
      .to(s, { yaw: -1.25, cx: -24, duration: 2.05, ease: 'sine.inOut', onUpdate: apply }, 1.15)
      .to(s, { yaw: 1.0, cx: 18, duration: 1.6, ease: 'sine.inOut', onUpdate: apply }, 3.2)
      // the weighted turn — the camera chooses cabinet 001: drift toward the left wall and yaw to face it
      .to(s, { cx: VIEWS[0].cx, yaw: VIEWS[0].yaw, duration: 1.15, ease: 'power2.inOut', onUpdate: apply }, 4.8)
      // soft light wash as the door frame sweeps past the periphery
      .to('.er-flash', { opacity: 0.3, duration: 0.3, ease: 'power2.in' }, 2.85)
      .to('.er-flash', { opacity: 0, duration: 0.7, ease: 'power2.out' }, 3.25)
      .call(
        () => {
          setResting(true)
          gsap.fromTo(navRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out' })
        },
        null,
        5.95,
      )
  }, [reduced, apply])

  return (
    <section
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: '#060402' }}
      aria-label="The closet door — step inside"
    >
      {/* ===== 3D room ===== */}
      <div className="absolute inset-0" style={{ perspective: `${P}px`, perspectiveOrigin: '50% 46%' }}>
        <div ref={roomRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {/* floor */}
          <Plane
            w={2600}
            h={DEPTH}
            t={`translate3d(0px, ${H}px, ${CZ}px) rotateX(90deg)`}
            style={{
              background: [
                'radial-gradient(ellipse 40% 24% at 50% 11%, rgba(255,214,140,0.32) 0%, rgba(255,214,140,0.09) 46%, transparent 68%)',
                'repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0 3px, transparent 3px 110px)',
                'linear-gradient(to bottom, #241809 0%, #170f08 45%, #0b0705 100%)',
              ].join(', '),
            }}
          />
          {/* ceiling */}
          <Plane
            w={2600}
            h={DEPTH}
            t={`translate3d(0px, ${-H}px, ${CZ}px) rotateX(-90deg)`}
            style={{
              background: [
                'radial-gradient(ellipse 40% 26% at 50% 88%, rgba(255,214,140,0.10) 0%, transparent 62%)',
                'linear-gradient(to bottom, #171009 0%, #0c0805 100%)',
              ].join(', '),
            }}
          />
          {/* side walls */}
          <Plane
            w={DEPTH}
            h={H * 2}
            t={`translate3d(${-W}px, 0px, ${CZ}px) rotateY(90deg)`}
            style={{
              background: [
                'radial-gradient(ellipse 34% 44% at 84% 56%, rgba(255,214,140,0.16) 0%, transparent 68%)',
                'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
                'linear-gradient(to bottom, #1f160c, #130d07)',
              ].join(', '),
            }}
          />
          <Plane
            w={DEPTH}
            h={H * 2}
            t={`translate3d(${W}px, 0px, ${CZ}px) rotateY(-90deg)`}
            style={{
              background: [
                'radial-gradient(ellipse 34% 44% at 16% 56%, rgba(255,214,140,0.16) 0%, transparent 68%)',
                'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
                'linear-gradient(to bottom, #1f160c, #130d07)',
              ].join(', '),
            }}
          />
          {/* back wall — three segments around the doorway */}
          <BackWall slabRef={slabRef} handleRef={handleRef} hovering={hovering} />
          {/* corridor beyond the doorway */}
          <Corridor />
          {/* the walk-in closet */}
          <ClosetRoom viewIndex={viewIndex} hoverCab={hoverCab} />
        </div>
      </div>

      {/* threshold light wash as the frame sweeps past */}
      <div className="er-flash pointer-events-none absolute inset-0 z-30" style={{ opacity: 0, background: 'radial-gradient(circle at 50% 55%, rgba(255,231,180,0.75) 0%, rgba(232,201,138,0.3) 45%, transparent 78%)' }} aria-hidden="true" />

      {/* rest-state nav + focused-cabinet hover zone */}
      <div
        ref={navRef}
        className="absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-3"
        style={{ opacity: 0, visibility: 'hidden', pointerEvents: resting ? 'auto' : 'none' }}
      >
        <div className="flex items-center gap-3">
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              aria-label={`View drop ${v.id}`}
              onClick={() => goToView(i)}
              className="font-body flex items-center gap-3"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  color: i === viewIndex ? CREAM : FAINT,
                  textShadow: i === viewIndex ? `0 0 14px ${CABINETS[i].accent}66` : 'none',
                  transition: 'color 0.6s ease, text-shadow 0.6s ease',
                }}
              >
                {v.id}
              </span>
              {i < VIEWS.length - 1 && <span style={{ width: i === viewIndex || i + 1 === viewIndex ? 34 : 22, height: 1, background: 'rgba(232,213,174,0.3)', transition: 'width 0.6s ease' }} />}
            </button>
          ))}
        </div>
        <span className="font-body text-[9px] uppercase" style={{ letterSpacing: '0.5em', color: FAINT }}>
          four drops · four doors
        </span>
      </div>
      {resting && (
        <button
          type="button"
          aria-label={`View drop ${VIEWS[viewIndex].id} art`}
          onMouseEnter={() => setHoverCab(viewIndex)}
          onMouseLeave={() => setHoverCab(-1)}
          className="absolute"
          style={{
            left: VIEWS[viewIndex].zone.left,
            width: VIEWS[viewIndex].zone.width,
            top: '12%',
            height: '82%',
            zIndex: 25,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        />
      )}

      {/* screen-space door hit area (3D hit-testing is unreliable) */}
      <button
        type="button"
        aria-label="Open the closet door"
        onClick={enter}
        onMouseEnter={() => hoverSlab(true)}
        onMouseLeave={() => hoverSlab(false)}
        className="absolute"
        style={{
          left: '41.2%',
          top: '22.5%',
          width: '17.4%',
          height: '68%',
          zIndex: 25,
          background: 'none',
          border: 'none',
          cursor: busyRef.current ? 'default' : 'pointer',
        }}
      />

      {/* dust motes in the light */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="dl-mote"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              opacity: m.o,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>

      {/* film grain */}
      {grainUrl && (
        <div
          className="dl-grain pointer-events-none absolute inset-0 z-20"
          style={{ backgroundImage: `url(${grainUrl})`, backgroundSize: '160px 160px', mixBlendMode: 'overlay', opacity: 0.5 }}
          aria-hidden="true"
        />
      )}

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: 'radial-gradient(ellipse 78% 68% at 50% 46%, transparent 52%, rgba(4,3,1,0.72) 100%)' }}
        aria-hidden="true"
      />

      {/* minimal UI */}
      <div ref={uiRef} className="er-ui absolute left-6 top-6 z-30 sm:left-10 sm:top-8">
        <span className="font-display text-sm" style={{ letterSpacing: '0.42em', color: CREAM, opacity: 0.85 }}>
          VOLT/AGE
        </span>
        <span className="mt-1 block font-body text-[8px] uppercase" style={{ letterSpacing: '0.5em', color: FAINT }}>
          the walk-in
        </span>
      </div>

      <button
        ref={cueRef}
        type="button"
        onClick={enter}
        className="er-ui absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-3"
        style={{ cursor: 'pointer', background: 'none', border: 'none' }}
      >
        <span className="hint-line" style={{ width: 56, height: 1, background: 'rgba(232,213,174,0.35)' }} />
        <span className="font-body text-[10px] uppercase" style={{ letterSpacing: '0.5em', color: 'rgba(242,231,208,0.6)' }}>
          step inside
        </span>
      </button>

      <button
        ref={skipRef}
        type="button"
        onClick={skip}
        className="font-body absolute bottom-8 right-8 z-30"
        style={{
          opacity: 0,
          visibility: 'hidden',
          background: 'none',
          border: 'none',
          color: FAINT,
          fontSize: 10,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
        onMouseLeave={(e) => (e.currentTarget.style.color = FAINT)}
      >
        skip
      </button>

    </section>
  )
}

function Plane({ w, h, t, style, children }) {
  return (
    <div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        width: w,
        height: h,
        transform: `translate(-50%, -50%) ${t}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* back wall with the doorway cut in, the casing, the light leaks and the slab */
function BackWall({ slabRef, handleRef, hovering }) {
  const base = 'linear-gradient(to bottom, #221809 0%, #150e07 100%)'
  return (
    <Plane
      w={2600}
      h={1530}
      t={`translateZ(${BACK_Z}px)`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* wall segments around the opening (opening: local x 1020..1580, y 367..1530) */}
      <div className="absolute" style={{ left: 0, top: 0, width: 1020, height: 1530, background: [ 'radial-gradient(ellipse 46% 52% at 100% 62%, rgba(255,214,140,0.20) 0%, transparent 68%)', 'linear-gradient(to right, rgba(0,0,0,0.75), transparent 45%)', base ].join(', ') }} />
      <div className="absolute" style={{ left: 1580, top: 0, width: 1020, height: 1530, background: [ 'radial-gradient(ellipse 46% 52% at 0% 62%, rgba(255,214,140,0.20) 0%, transparent 68%)', 'linear-gradient(to left, rgba(0,0,0,0.75), transparent 45%)', base ].join(', ') }} />
      <div className="absolute" style={{ left: 1020, top: 0, width: 560, height: 367, background: [ 'radial-gradient(ellipse 70% 130% at 50% 100%, rgba(255,214,140,0.26) 0%, transparent 74%)', base ].join(', ') }} />

      {/* casing */}
      <div className="absolute" style={{ left: 996, top: 343, width: 24, height: 1187, background: 'linear-gradient(to right, #4a3823, #2a1e11)', boxShadow: 'inset 0 0 0 1px rgba(232,213,174,0.14)' }} />
      <div className="absolute" style={{ left: 1580, top: 343, width: 24, height: 1187, background: 'linear-gradient(to left, #4a3823, #2a1e11)', boxShadow: 'inset 0 0 0 1px rgba(232,213,174,0.14)' }} />
      <div className="absolute" style={{ left: 996, top: 343, width: 608, height: 24, background: 'linear-gradient(to bottom, #4a3823, #2a1e11)', boxShadow: 'inset 0 0 0 1px rgba(232,213,174,0.14)' }} />

      {/* light leaking through the frame gap */}
      <div className="er-breathe absolute" style={{ left: 1016, top: 369, width: 4, height: 1161, background: 'linear-gradient(to bottom, #ffdf9e, #d8a860)', boxShadow: '0 0 20px 5px rgba(255,214,140,0.55)', filter: 'blur(0.5px)' }} />
      <div className="er-breathe absolute" style={{ left: 1580, top: 369, width: 4, height: 1161, background: 'linear-gradient(to bottom, #ffdf9e, #d8a860)', boxShadow: '0 0 20px 5px rgba(255,214,140,0.55)', filter: 'blur(0.5px)' }} />
      <div className="er-breathe absolute" style={{ left: 1020, top: 369, width: 560, height: 4, background: 'linear-gradient(to right, #ffdf9e, #fff1cd, #ffdf9e)', boxShadow: '0 0 24px 7px rgba(255,214,140,0.5)' }} />
      {/* under-door spill */}
      <div className="er-breathe absolute" style={{ left: 1024, top: 1524, width: 552, height: 6, borderRadius: 4, background: 'linear-gradient(to right, transparent, #ffdf9e 18%, #ffdf9e 82%, transparent)', boxShadow: '0 0 30px 10px rgba(255,214,140,0.45)' }} />

      {/* the door slab — flush oak, hinge on the left, opens into the light.
          Interaction lives on a screen-space hit area above the scene. */}
      <div
        className="absolute"
        style={{
          left: 1038,
          top: 367,
          width: DOOR_W,
          height: DOOR_H,
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          ref={slabRef}
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            background: [
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.055) 0 3px, transparent 3px 13px, rgba(255,235,200,0.03) 13px 16px, transparent 16px 31px)',
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.045) 0 2px, transparent 2px 23px)',
              'radial-gradient(ellipse at 32% 14%, rgba(255,240,214,0.12) 0%, transparent 55%)',
              'linear-gradient(90deg, #9a6d40 0%, #a97946 22%, #93663a 45%, #a3763f 63%, #8f6238 82%, #a3763f 100%)',
            ].join(', '),
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 22px 50px rgba(255,235,200,0.09), 10px 0 40px rgba(0,0,0,0.5)',
            willChange: 'transform',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,240,214,0.13) 0%, transparent 32%, rgba(0,0,0,0.22) 100%)' }} />
          {/* brass handle — brightens on hover */}
          <div
            ref={handleRef}
            className="absolute"
            style={{
              right: '7.5%',
              top: '44%',
              width: 11,
              height: '13%',
              borderRadius: 8,
              background: 'linear-gradient(to bottom, #f0dfae 0%, #d8b26a 45%, #8a744d 100%)',
              boxShadow: hovering
                ? '0 0 26px 6px rgba(232,213,174,0.55), 0 3px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,244,214,0.8)'
                : '0 3px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,244,214,0.7)',
              filter: hovering ? 'brightness(1.3)' : 'brightness(1)',
              transition: 'box-shadow 0.5s ease, filter 0.5s ease',
            }}
          />
          {/* small pull tag */}
          <span
            className="font-body absolute"
            style={{
              right: '6.4%',
              top: '58.5%',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.42em',
              color: 'rgba(58,42,16,0.65)',
              textTransform: 'uppercase',
              writingMode: 'vertical-rl',
            }}
          >
            pull
          </span>
        </div>
      </div>
    </Plane>
  )
}

/* the short corridor between the bedroom door and the closet */
function Corridor() {
  return (
    <>
      {/* corridor walls */}
      <Plane
        w={1200}
        h={1163}
        t="translate3d(-280px, 183px, -1300px) rotateY(90deg)"
        style={{ background: ['radial-gradient(ellipse 40% 55% at 96% 52%, rgba(255,214,140,0.22) 0%, transparent 70%)', 'linear-gradient(to right, #170f08 0%, #2a1c0d 70%, #3a2812 100%)'].join(', ') }}
      />
      <Plane
        w={1200}
        h={1163}
        t="translate3d(280px, 183px, -1300px) rotateY(-90deg)"
        style={{ background: ['radial-gradient(ellipse 40% 55% at 4% 52%, rgba(255,214,140,0.22) 0%, transparent 70%)', 'linear-gradient(to left, #170f08 0%, #2a1c0d 70%, #3a2812 100%)'].join(', ') }}
      />
      {/* corridor floor + ceiling */}
      <Plane
        w={560}
        h={1200}
        t="translate3d(0px, 765px, -1300px) rotateX(90deg)"
        style={{ background: ['radial-gradient(ellipse 70% 40% at 50% 88%, rgba(255,214,140,0.28) 0%, rgba(255,214,140,0.07) 55%, transparent 80%)', 'linear-gradient(to bottom, #3a2812, #170f08)'].join(', ') }}
      />
      <Plane
        w={560}
        h={1200}
        t="translate3d(0px, -398px, -1300px) rotateX(-90deg)"
        style={{ background: 'linear-gradient(to bottom, #241809, #3a2812 90%)' }}
      />
    </>
  )
}

/* the walk-in closet: two facing pairs of art-bearing wardrobe cabinets */
function ClosetRoom({ viewIndex, hoverCab }) {
  const near = CLOSET.nearZ
  const far = CLOSET.farZ
  const depth = near - far // positive: 2700
  const wallZ = (near + far) / 2
  // wash positions: left wall local +x points away from the entrance, right wall toward it
  const washL = CABINETS.filter((c) => c.side === 'L').map((c) => `${((100 * (near - c.z)) / depth).toFixed(1)}%`)
  const washR = CABINETS.filter((c) => c.side === 'R').map((c) => `${((100 * (c.z - far)) / depth).toFixed(1)}%`)
  const poolY = washR // floor y% per pair
  const ceilY = washL // ceiling y% per pair
  return (
    <>
      {/* closet floor — matte dark wood, ambient pools, contact shadows, light reflections */}
      <Plane
        w={1700}
        h={depth}
        t={`translate3d(0px, ${H}px, ${wallZ}px) rotateX(90deg)`}
        style={{
          background: [
            `radial-gradient(ellipse 17% 8% at 21% ${poolY[0]}, rgba(255,214,140,0.36) 0%, rgba(255,214,140,0.11) 52%, transparent 72%)`,
            `radial-gradient(ellipse 17% 8% at 79% ${poolY[0]}, rgba(255,214,140,0.36) 0%, rgba(255,214,140,0.11) 52%, transparent 72%)`,
            `radial-gradient(ellipse 17% 8% at 21% ${poolY[1]}, rgba(255,214,140,0.36) 0%, rgba(255,214,140,0.11) 52%, transparent 72%)`,
            `radial-gradient(ellipse 17% 8% at 79% ${poolY[1]}, rgba(255,214,140,0.36) 0%, rgba(255,214,140,0.11) 52%, transparent 72%)`,
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0.20) 0 2px, transparent 2px 130px)',
            'linear-gradient(to bottom, #100b06 0%, #241a0e 45%, #2e2113 100%)',
          ].join(', '),
        }}
      >
        {/* contact shadows — where the cabinets actually meet the floor */}
        {CABINETS.map((c, i) => (
          <div
            key={`sh-${i}`}
            className="absolute"
            style={{
              left: c.side === 'L' ? '1.5%' : '72.5%',
              top: `calc(${poolY[i % 2]} - 4%)`,
              width: '26%',
              height: '9%',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              filter: 'blur(10px)',
            }}
          />
        ))}
        {/* reflections — flipped, faded, blurred copies of the warm sources */}
        {CABINETS.map((c, i) => (
          <div key={`rf-${i}`} className="absolute" style={{ left: c.side === 'L' ? '13%' : '74%', top: `calc(${poolY[i % 2]} + 2%)`, width: '13%', height: '17%', background: 'linear-gradient(to bottom, rgba(255,224,166,0.30) 0%, rgba(255,214,140,0.08) 55%, transparent 80%)', filter: 'blur(6px)', borderRadius: 10 }} />
        ))}
        {CABINETS.map((c, i) => (
          <div key={`rb-${i}`} className="absolute" style={{ left: c.side === 'L' ? '12%' : '73%', top: `calc(${poolY[i % 2]} + 0.4%)`, width: '15%', height: '1%', background: 'linear-gradient(to right, transparent, #ffdf9e 25%, #fff1cd 50%, #ffdf9e 75%, transparent)', boxShadow: '0 0 16px 5px rgba(255,214,140,0.35)', filter: 'blur(4px)', opacity: 0.32 }} />
        ))}
      </Plane>
      {/* side walls with sconce washes, receding into darkness */}
      <Plane
        w={depth}
        h={H * 2}
        t={`translate3d(${-CLOSET.halfW}px, 0px, ${wallZ}px) rotateY(90deg)`}
        style={{
          background: [
            `radial-gradient(ellipse 13% 20% at ${washL[0]} 15%, rgba(255,214,140,0.26) 0%, transparent 72%)`,
            `radial-gradient(ellipse 13% 20% at ${washL[1]} 15%, rgba(255,214,140,0.26) 0%, transparent 72%)`,
            'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 62%, rgba(0,0,0,0.72) 100%)',
            'linear-gradient(to bottom, #221809, #140e08)',
          ].join(', '),
        }}
      >
        <div className="absolute inset-x-0 bottom-0" style={{ height: 10, background: 'linear-gradient(to bottom, rgba(232,213,174,0.15), rgba(232,213,174,0.04))', boxShadow: '0 -1px 0 rgba(232,213,174,0.16)' }} />
        <div className="absolute inset-x-0 top-0" style={{ height: 2, background: 'rgba(232,213,174,0.09)' }} />
        <div className="absolute" style={{ right: 0, top: 0, bottom: 0, width: 2, background: 'rgba(232,213,174,0.08)' }} />
      </Plane>
      <Plane
        w={depth}
        h={H * 2}
        t={`translate3d(${CLOSET.halfW}px, 0px, ${wallZ}px) rotateY(-90deg)`}
        style={{
          background: [
            `radial-gradient(ellipse 13% 20% at ${washR[0]} 15%, rgba(255,214,140,0.26) 0%, transparent 72%)`,
            `radial-gradient(ellipse 13% 20% at ${washR[1]} 15%, rgba(255,214,140,0.26) 0%, transparent 72%)`,
            'linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 62%, rgba(0,0,0,0.72) 100%)',
            'linear-gradient(to bottom, #221809, #140e08)',
          ].join(', '),
        }}
      >
        <div className="absolute inset-x-0 bottom-0" style={{ height: 10, background: 'linear-gradient(to bottom, rgba(232,213,174,0.15), rgba(232,213,174,0.04))', boxShadow: '0 -1px 0 rgba(232,213,174,0.16)' }} />
        <div className="absolute inset-x-0 top-0" style={{ height: 2, background: 'rgba(232,213,174,0.09)' }} />
        <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 2, background: 'rgba(232,213,174,0.08)' }} />
      </Plane>
      {/* far end — the room keeps going beyond the light */}
      <Plane
        w={1700}
        h={H * 2}
        t={`translate3d(0px, 0px, ${far - 10}px)`}
        style={{ background: 'radial-gradient(ellipse 34% 40% at 50% 46%, rgba(255,214,140,0.13) 0%, rgba(255,214,140,0.03) 55%, transparent 75%), #0c0805' }}
      >
        <div className="absolute inset-x-0 bottom-0" style={{ height: 10, background: 'linear-gradient(to bottom, rgba(232,213,174,0.13), rgba(232,213,174,0.03))', boxShadow: '0 -1px 0 rgba(232,213,174,0.14)' }} />
        <div className="absolute inset-x-0 top-0" style={{ height: 2, background: 'rgba(232,213,174,0.08)' }} />
        <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 2, background: 'rgba(232,213,174,0.07)' }} />
        <div className="absolute" style={{ right: 0, top: 0, bottom: 0, width: 2, background: 'rgba(232,213,174,0.07)' }} />
      </Plane>
      {/* ceiling fixture pools above each cabinet pair */}
      <Plane w={1700} h={depth} t={`translate3d(0px, ${-H}px, ${wallZ}px) rotateX(-90deg)`} style={{ background: [
        `radial-gradient(ellipse 9% 15% at 8% ${ceilY[0]}, rgba(255,214,140,0.15) 0%, transparent 70%)`,
        `radial-gradient(ellipse 9% 15% at 92% ${ceilY[0]}, rgba(255,214,140,0.15) 0%, transparent 70%)`,
        `radial-gradient(ellipse 9% 15% at 8% ${ceilY[1]}, rgba(255,214,140,0.15) 0%, transparent 70%)`,
        `radial-gradient(ellipse 9% 15% at 92% ${ceilY[1]}, rgba(255,214,140,0.15) 0%, transparent 70%)`,
        'linear-gradient(to bottom, #0e0a06 0%, #150e08 60%, #1a1209 100%)'].join(', ') }}>
        {[0, 1].map((i) => (
          <div key={i} className="absolute" style={{ left: i === 0 ? '4%' : '88%', top: `calc(${ceilY[i]} - 0.6%)`, width: '8%', height: '1.2%', background: 'linear-gradient(to right, transparent, #ffdf9e 30%, #fff1cd 50%, #ffdf9e 70%, transparent)', boxShadow: '0 0 24px 8px rgba(255,214,140,0.35)', filter: 'blur(1px)' }} />
        ))}
      </Plane>

      {CABINETS.map((cab, i) => {
        const focus = i === viewIndex ? 'focus' : Math.floor(i / 2) === Math.floor(viewIndex / 2) ? 'soft' : 'far'
        return <Cabinet key={cab.drop} cab={cab} focus={focus} hovering={hoverCab === i} />
      })}
    </>
  )
}

/* one wardrobe cabinet: recessed box, wood sliding door, framed drop art, sconce */
function Cabinet({ cab, focus, hovering }) {
  const x = cab.side === 'L' ? -500 : 500
  const rot = cab.side === 'L' ? 90 : -90
  const boxX = cab.side === 'L' ? -675 : 675
  const isFocus = focus === 'focus'
  const sconceLevel = isFocus ? 1 : focus === 'soft' ? 0.55 : 0.18
  const artFilter = isFocus
    ? 'brightness(1.05) saturate(1)'
    : focus === 'soft'
      ? 'brightness(0.78) saturate(0.72)'
      : 'brightness(0.5) saturate(0.45)'
  const wood = [
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.055) 0 3px, transparent 3px 13px, rgba(255,235,200,0.03) 13px 16px, transparent 16px 31px)',
    'linear-gradient(90deg, #96693e 0%, #a3763f 22%, #8f6238 45%, #9d7042 63%, #8a6238 82%, #a3763f 100%)',
  ].join(', ')
  return (
    <>
      {/* sconce bar on the wall above the cabinet */}
      <Plane
        w={260}
        h={12}
        t={`translate3d(${cab.side === 'L' ? -843 : 843}px, -560px, ${cab.z}px) rotateY(${rot}deg)`}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, transparent, #ffdf9e 22%, #fff1cd 50%, #ffdf9e 78%, transparent)',
            boxShadow: '0 0 34px 12px rgba(255,214,140,0.4)',
            opacity: sconceLevel,
            transition: 'opacity 0.9s ease',
          }}
        >
          <div className="er-sconce absolute inset-0" style={{ background: 'inherit', boxShadow: 'inherit' }} />
        </div>
      </Plane>
      {/* box returns — top, bottom, camera-near side */}
      <Plane w={350} h={700} t={`translate3d(${boxX}px, -470px, ${cab.z}px) rotateX(90deg)`} style={{ background: '#241a0e' }} />
      <Plane w={350} h={700} t={`translate3d(${boxX}px, 670px, ${cab.z}px) rotateX(90deg)`} style={{ background: '#1c130a' }} />
      <Plane w={350} h={1150} t={`translate3d(${boxX}px, 100px, ${cab.z + 350}px)`} style={{ background: 'linear-gradient(to bottom, #2c2013, #1a1209)' }} />
      {/* sliding door face with framed drop art */}
      <Plane
        w={700}
        h={1150}
        t={`translate3d(${x}px, 100px, ${cab.z}px) rotateY(${rot}deg)`}
        style={{
          transformStyle: 'preserve-3d',
          background: wood,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 20px 44px rgba(255,235,200,0.08)',
        }}
      >
        {/* sconce pool on the door */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 34% at 50% 0%, rgba(255,224,160,0.22) 0%, transparent 70%)' }} />
        {/* framed art */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: 80,
            width: 540,
            height: 740,
            transform: 'translateX(-50%)',
            border: '10px solid #3a2c1a',
            background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #4a3823 0%, #2b2013 70%, #1c130a 100%)',
            boxShadow: hovering && isFocus
              ? `0 0 60px 12px ${cab.accent}66, inset 0 0 34px rgba(0,0,0,0.45)`
              : 'inset 0 0 34px rgba(0,0,0,0.45), 0 10px 30px rgba(0,0,0,0.35)',
            filter: artFilter,
            transition: 'box-shadow 0.6s ease, filter 0.9s ease',
          }}
        >
          <img
            src={cab.art}
            alt={`Drop ${cab.drop} key art`}
            draggable="false"
            className="absolute"
            style={{
              left: '50%',
              top: '44%',
              transform: `translate(-50%, -50%) scale(${hovering && isFocus ? 1.05 : 1})`,
              height: '74%',
              transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          <span
            className="font-body absolute"
            style={{
              left: '50%',
              bottom: 16,
              transform: 'translateX(-50%)',
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '0.42em',
              color: cab.accent,
              opacity: isFocus ? (hovering ? 1 : 0.85) : 0.5,
              textShadow: hovering && isFocus ? `0 0 18px ${cab.accent}88` : 'none',
              transition: 'opacity 0.6s ease, text-shadow 0.6s ease',
            }}
          >
            {cab.drop}
          </span>
          {/* surface sheen */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,240,214,0.14) 0%, transparent 38%)', pointerEvents: 'none' }} />
        </div>
        {/* plinth */}
        <div className="absolute" style={{ left: 20, right: 20, bottom: 18, height: 96, borderRadius: 4, background: 'linear-gradient(to bottom, #2c2114, #1a1209)', boxShadow: 'inset 0 1px 0 rgba(255,240,214,0.08)' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 96, height: 6, borderRadius: 4, background: 'linear-gradient(to bottom, #d8b26a, #8a6a38)' }} />
        </div>
        {/* brass handle on the path-side edge */}
        <div
          className="absolute"
          style={{
            [cab.side === 'L' ? 'right' : 'left']: '5.5%',
            top: '42%',
            width: 10,
            height: 190,
            borderRadius: 8,
            background: 'linear-gradient(to bottom, #f0dfae 0%, #d8b26a 45%, #8a744d 100%)',
            boxShadow: hovering && isFocus
              ? '0 0 22px 5px rgba(232,213,174,0.5), 0 3px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,244,214,0.75)'
              : '0 3px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,244,214,0.7)',
            filter: hovering && isFocus ? 'brightness(1.3)' : isFocus ? 'brightness(1)' : 'brightness(0.6)',
            transition: 'box-shadow 0.6s ease, filter 0.9s ease',
          }}
        />
      </Plane>
    </>
  )
}

export default EntryRoom
