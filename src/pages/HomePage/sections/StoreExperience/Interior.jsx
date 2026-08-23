import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import drops from '../../data/drops'
import products from '../../data/products'

const CREAM = '#f8f4ea'
const MUTED = 'rgba(248,244,234,0.62)'
const FAINT = 'rgba(248,244,234,0.32)'
const HAIRLINE = 'rgba(248,244,234,0.16)'

const productById = Object.fromEntries(products.map((p) => [p.id, p]))

function Interior({ onExit }) {
  const navigate = useNavigate()
  const stageRef = useRef(null)
  const trackRef = useRef(null)
  const bgARef = useRef(null)
  const bgBRef = useRef(null)
  const rackRefs = useRef([])
  const swayRefs = useRef([])
  const stateRef = useRef({ x: 0 })
  const dragRef = useRef({ active: false, startX: 0, baseX: 0, dx: 0 })
  const wheelLock = useRef(0)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // Rack-to-rack distance on the same wall + the cross-store gap between walls
  const getMetrics = useCallback(() => {
    const S = Math.min(window.innerWidth * 0.92, 1080)
    const GAP = S * 1.7
    return { S, GAP, steps: [0, S, S + GAP, 2 * S + GAP] }
  }, [])
  const metricsRef = useRef(getMetrics())
  const [steps, setSteps] = useState(() => metricsRef.current.steps)

  /* ---------- camera positioning, depth, wall crossfade ---------- */
  const apply = useCallback(() => {
    const x = stateRef.current.x
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${x}px, 0, 0)`
    }
    const { S, GAP } = metricsRef.current
    // crossfade walls while crossing the store (between rail 2 and rail 3)
    const p = Math.max(0, Math.min(1, (-x - S) / GAP))
    if (bgBRef.current) bgBRef.current.style.opacity = String(p)
    // subtle parallax on the photos
    if (bgARef.current) bgARef.current.style.transform = `translate3d(${x * 0.05}px, 0, 0) scale(1.06)`
    if (bgBRef.current) bgBRef.current.style.transform = `translate3d(${x * 0.05}px, 0, 0) scale(1.06)`

    const mid = window.innerWidth / 2
    rackRefs.current.forEach((rack) => {
      if (!rack) return
      const r = rack.getBoundingClientRect()
      const d = Math.min(1, Math.abs(r.left + r.width / 2 - mid) / (window.innerWidth * 0.7))
      const inner = rack.firstElementChild
      if (inner) {
        inner.style.transform = `scale(${1 - d * 0.08})`
        inner.style.opacity = String(1 - d * 0.5)
      }
    })
  }, [])

  const impulseSway = useCallback(
    (dir, strong = false) => {
      if (reduced) return
      swayRefs.current.forEach((el) => {
        if (!el) return
        gsap.fromTo(
          el,
          { rotation: dir * (strong ? 9 : 5) },
          { rotation: 0, duration: strong ? 2.2 : 1.6, ease: 'elastic.out(1, 0.28)' },
        )
      })
    },
    [reduced],
  )

  const goTo = useCallback(
    (i, dir = 0) => {
      const prev = indexRef.current
      const next = Math.max(0, Math.min(drops.length - 1, i))
      const crossing = drops[prev].side !== drops[next].side
      indexRef.current = next
      setIndex(next)
      impulseSway(dir || (next >= prev ? 1 : -1), crossing)
      gsap.to(stateRef.current, {
        x: -metricsRef.current.steps[next],
        duration: reduced ? 0.01 : crossing ? 1.8 : 0.95,
        ease: crossing ? 'power2.inOut' : 'expo.out',
        onUpdate: apply,
      })
    },
    [apply, impulseSway, reduced],
  )

  /* ---------- resize ---------- */
  useEffect(() => {
    const onResize = () => {
      metricsRef.current = getMetrics()
      setSteps(metricsRef.current.steps)
      stateRef.current.x = -metricsRef.current.steps[indexRef.current]
      apply()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [apply, getMetrics])

  /* ---------- entrance ---------- */
  useEffect(() => {
    metricsRef.current = getMetrics()
    setSteps(metricsRef.current.steps)
    stateRef.current.x = -metricsRef.current.steps[indexRef.current]
    apply()
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from('.int-hud', { opacity: 0, y: 26, duration: 1, ease: 'expo.out', stagger: 0.1, delay: 0.5 })
      gsap.from(trackRef.current, { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', delay: 0.35 })
    }, stageRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- idle sway ---------- */
  useEffect(() => {
    if (reduced) return undefined
    const tweens = swayRefs.current.filter(Boolean).map((el, i) =>
      gsap.to(el, {
        rotation: i % 2 === 0 ? 1.2 : -1.2,
        duration: 2.2 + (i % 5) * 0.35,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.17,
      }),
    )
    return () => tweens.forEach((t) => t.kill())
  }, [reduced])

  /* ---------- drag / swipe ---------- */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const onDown = (e) => {
      if (!e.isPrimary) return
      dragRef.current = { active: true, startX: e.clientX, baseX: stateRef.current.x, dx: 0 }
      gsap.killTweensOf(stateRef.current)
    }
    const onMove = (e) => {
      const d = dragRef.current
      if (!d.active) return
      let dx = e.clientX - d.startX
      const { steps } = metricsRef.current
      const min = -steps[steps.length - 1]
      const projected = d.baseX + dx
      if (projected > 0 || projected < min) dx *= 0.35 // rubber band at edges
      d.dx = dx
      stateRef.current.x = d.baseX + dx
      apply()
    }
    const onUp = () => {
      const d = dragRef.current
      if (!d.active) return
      d.active = false
      const threshold = Math.min(90, metricsRef.current.S * 0.12)
      if (d.dx < -threshold) goTo(indexRef.current + 1, 1)
      else if (d.dx > threshold) goTo(indexRef.current - 1, -1)
      else goTo(indexRef.current)
    }

    stage.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      stage.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [apply, goTo])

  /* ---------- wheel (horizontal) + keyboard ---------- */
  useEffect(() => {
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      const now = Date.now()
      if (now - wheelLock.current < 550) return
      if (Math.abs(e.deltaX) > 24) {
        wheelLock.current = now
        goTo(indexRef.current + (e.deltaX > 0 ? 1 : -1), e.deltaX > 0 ? 1 : -1)
      }
    }
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goTo(indexRef.current + 1, 1)
      if (e.key === 'ArrowLeft') goTo(indexRef.current - 1, -1)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [goTo])

  const drop = drops[index]
  let swayCounter = 0

  return (
    <section
      ref={stageRef}
      className="relative h-[100svh] touch-pan-y select-none overflow-hidden"
      style={{ background: '#0a0710', cursor: 'grab' }}
      aria-label="Virtual store interior"
    >
      {/* ===== Wall photos with crossfade + parallax ===== */}
      <img
        ref={bgARef}
        src="/images/store/interior-a.png"
        alt="Graffiti wall, side A of the store"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'scale(1.06)', willChange: 'transform' }}
        draggable="false"
      />
      <img
        ref={bgBRef}
        src="/images/store/interior-b.png"
        alt="Graffiti wall, side B of the store"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0, transform: 'scale(1.06)', willChange: 'transform, opacity' }}
        draggable="false"
      />

      {/* readability scrims */}
      <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: '22%', background: 'linear-gradient(to bottom, rgba(7,6,10,0.66) 0%, transparent 100%)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: '34%', background: 'linear-gradient(to top, rgba(7,6,10,0.82) 0%, transparent 100%)' }} />

      {/* ===== Rails track ===== */}
      <div ref={trackRef} className="absolute inset-0" style={{ willChange: 'transform' }}>
        {drops.map((d, di) => (
          <div
            key={d.id}
            ref={(el) => {
              rackRefs.current[di] = el
            }}
            className="absolute top-0 h-full"
            style={{ left: `calc(50% + ${steps[di]}px)`, width: 'min(1000px, 92vw)', transform: 'translateX(-50%)' }}
          >
            <div className="relative flex h-full flex-col items-center justify-center" style={{ willChange: 'transform, opacity' }}>
              {/* rail structure */}
              <div className="relative" style={{ width: 'min(880px, 84vw)' }}>
                {/* suspension chains */}
                {[8, 92].map((x) => (
                  <div
                    key={x}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      bottom: 0,
                      height: '30svh',
                      width: 2,
                      background: 'repeating-linear-gradient(to bottom, rgba(248,244,234,0.55) 0 6px, transparent 6px 12px)',
                    }}
                  />
                ))}
                {/* the bar */}
                <div
                  className="relative h-[5px] w-full rounded-full"
                  style={{
                    background: 'linear-gradient(to bottom, #f8f4ea 0%, #8d8a96 55%, #3a3742 100%)',
                    boxShadow: `0 4px 24px ${d.accent}66, 0 1px 0 rgba(255,255,255,0.6) inset`,
                  }}
                />

                {/* hanging garments — offset up so hooks wrap over the bar */}
                <div className="absolute left-0 flex w-full items-start justify-around" style={{ top: 0 }}>
                  {d.items.map((item, ii) => {
                    const product = productById[item.productId]
                    const swayIdx = swayCounter++
                    const isPortrait = item.ratio === '2/3'
                    const width = isPortrait ? 'clamp(120px, 15vw, 200px)' : 'clamp(104px, 12vw, 160px)'
                    return (
                      <div
                        key={item.productId}
                        className="flex flex-col items-center"
                        style={{
                          width,
                          marginTop: ii % 2 === 1 ? 18 : 0,
                          transform: `translateY(calc(${width} * ${isPortrait ? '-0.11' : '-0.10'}))`,
                        }}
                      >
                        <button
                          type="button"
                          ref={(el) => {
                            swayRefs.current[swayIdx] = el
                          }}
                          onClick={() => {
                            if (Math.abs(dragRef.current.dx) > 8) return
                            navigate(`/shop/${item.productId}`)
                          }}
                          className="group block w-full"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transformOrigin: '50% 6%', willChange: 'transform' }}
                          aria-label={`View ${product?.name}`}
                        >
                          <img
                            src={item.img}
                            alt={product?.name}
                            className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]"
                            style={{ filter: 'drop-shadow(0 26px 30px rgba(0,0,0,0.55))' }}
                            draggable="false"
                          />
                        </button>
                        <div className="mt-2 text-center" style={{ transform: 'translateZ(0)' }}>
                          <div className="font-body" style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: MUTED, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                            {product?.name}
                          </div>
                          <div className="font-body" style={{ fontSize: 11, letterSpacing: '0.12em', color: d.accent, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                            {product?.price}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== HUD ===== */}
      {/* top-left wall + aisle label (below navbar) */}
      <div className="int-hud pointer-events-none absolute left-6 top-24 sm:left-10">
        <span
          className="font-body inline-flex items-center gap-4"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', color: drop.accent, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
        >
          <span style={{ width: 40, height: 1, background: drop.accent }} />
          WALL {drop.side} — DROP {drop.id} · {drop.season}
        </span>
        <div className="mt-3 font-body" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: drop.status === 'LIVE NOW' ? drop.accent : FAINT }}>
          ● {drop.status}
        </div>
      </div>

      {/* exit */}
      <button
        type="button"
        onClick={onExit}
        className="int-hud absolute right-6 top-24 font-body sm:right-10"
        style={{
          background: 'rgba(7,6,10,0.5)',
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 100,
          color: MUTED,
          padding: '10px 20px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        ← Street
      </button>

      {/* cross-store hint */}
      <div
        className="int-hud font-marker pointer-events-none absolute select-none"
        style={{ right: '5%', top: '34%', transform: 'rotate(6deg)', color: '#ffd02e', fontSize: 'clamp(0.9rem, 2vw, 1.3rem)', textShadow: '0 2px 16px rgba(0,0,0,0.8)', opacity: index === 1 ? 1 : 0, transition: 'opacity 0.6s ease' }}
        aria-hidden="true"
      >
        keep swiping — more heat on the other wall →
      </div>

      {/* bottom info block */}
      <div className="int-hud pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-6 pb-7 text-center">
        <h2
          className="font-display"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 3.4rem)', lineHeight: 0.95, letterSpacing: '-0.02em', color: CREAM, textShadow: '0 4px 30px rgba(0,0,0,0.7)' }}
        >
          DROP {drop.id}{' '}
          <span className="font-serif-accent" style={{ color: drop.accent, fontSize: '0.9em', textShadow: `0 0 30px ${drop.accent}88` }}>
            {drop.serifWord}
          </span>
        </h2>
        <p className="max-w-md font-body" style={{ color: MUTED, fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', lineHeight: 1.6, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
          {drop.note}
        </p>

        {/* controls */}
        <div className="pointer-events-auto mt-1 flex items-center gap-5">
          <button
            type="button"
            aria-label="Previous drop"
            onClick={() => goTo(indexRef.current - 1, -1)}
            disabled={index === 0}
            className="font-body"
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
              border: `1px solid ${index === 0 ? 'rgba(248,244,234,0.08)' : HAIRLINE}`,
              background: 'rgba(7,6,10,0.5)',
              color: index === 0 ? FAINT : CREAM,
              fontSize: 16,
              cursor: index === 0 ? 'default' : 'pointer',
              transition: 'border-color 0.3s ease, color 0.3s ease',
            }}
          >
            ←
          </button>

          <div className="flex items-center gap-2.5">
            {drops.map((d, i) => (
              <button
                key={d.id}
                type="button"
                aria-label={`Go to drop ${d.id}`}
                onClick={() => goTo(i, i > indexRef.current ? 1 : -1)}
                style={{
                  width: i === index ? 26 : 6,
                  height: 6,
                  borderRadius: 100,
                  border: 'none',
                  padding: 0,
                  background: i === index ? drop.accent : 'rgba(248,244,234,0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next drop"
            onClick={() => goTo(indexRef.current + 1, 1)}
            disabled={index === drops.length - 1}
            className="font-body"
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
              border: `1px solid ${index === drops.length - 1 ? 'rgba(248,244,234,0.08)' : HAIRLINE}`,
              background: 'rgba(7,6,10,0.5)',
              color: index === drops.length - 1 ? FAINT : CREAM,
              fontSize: 16,
              cursor: index === drops.length - 1 ? 'default' : 'pointer',
              transition: 'border-color 0.3s ease, color 0.3s ease',
            }}
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-4 font-body" style={{ color: FAINT, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          <span>
            {String(index + 1).padStart(2, '0')} / {String(drops.length).padStart(2, '0')}
          </span>
          <span className="hint-line" style={{ width: 64, height: 1, background: 'rgba(248,244,234,0.16)' }} />
          <span>Drag · Swipe</span>
        </div>
      </div>
    </section>
  )
}

export default Interior
