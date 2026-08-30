/**
 * CabinetRoom v2 — full-screen one-door-at-a-time carousel.
 *
 * Layout:
 *   • Active drop's door art fills 100vw × 100vh — it IS the scene, not a panel within one
 *   • Swipe left/right or tap arrows to cycle through all 4 drops
 *   • Tap the door → it slides left (off screen), revealing full-screen garment interior
 *   • Tap a hanging piece → it pulls forward (faces you, scales up, brightens)
 *     while the rest recede; name/price appear as a quiet overlay, in-scene
 *   • Nav dots at bottom always visible
 *
 * Animation constraints (same as EntryDoor):
 *   • transform + opacity ONLY — no live CSS 3D, no layout animation
 *   • All simultaneous animations driven from a single React state tick
 */

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import cabinetDrops from '../pages/HomePage/data/cabinetDrops'

// ─── constants ────────────────────────────────────────────────────────────────
const SPRING   = { type: 'spring', stiffness: 300, damping: 34 }
const EASE_OUT = { ease: [0.22, 1, 0.36, 1], duration: 0.62 }

// Carousel slide variants — new panel comes from right (dir=1) or left (dir=-1)
// Exit goes to 20% (parallax pull-back) while enter comes from 100%
const slideVars = {
  enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0.85 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir >= 0 ? '-18%' : '18%', opacity: 0, scale: 0.97 }),
}

// ─── CabinetInterior ─────────────────────────────────────────────────────────
function CabinetInterior({ drop, isOpen, selectedItem, onSelectItem, onClose }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(175deg, #1d0f04 0%, #080402 100%)' }}
    >
      {/* ambient glow from ceiling — tinted in the drop's accent so the
          interior keeps the same mood as the door scene */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '50%',
          background: `radial-gradient(ellipse 90% 65% at 50% 0%, ${drop.accent}84, transparent)`,
        }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      {/* LED strip */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 3,
          background: drop.accent,
          boxShadow: `0 0 24px 6px ${drop.accent}b8`,
        }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        aria-hidden="true"
      />

      {/* hanging rod — full width */}
      <div
        className="pointer-events-none absolute inset-x-[4%]"
        style={{
          top: '21%',
          height: 2,
          background:
            'linear-gradient(to right, transparent 0%, rgba(195,155,80,0.88) 8%, rgba(195,155,80,0.88) 92%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* back button — top-left, below the fixed site navbar */}
      <motion.button
        className="absolute left-7 top-20 z-10 flex items-center gap-2"
        style={{ color: 'rgba(242,231,208,0.6)' }}
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -12 }}
        transition={{ duration: 0.35, delay: isOpen ? 0.55 : 0 }}
        onClick={onClose}
        aria-label="Close interior, back to door"
      >
        <ArrowLeft size={15} />
        <span className="font-body text-[9px] uppercase tracking-[0.52em]">back</span>
      </motion.button>

      {/* drop info — top-right, below the fixed site navbar */}
      <motion.div
        className="absolute right-7 top-20 text-right"
        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 12 }}
        transition={{ duration: 0.35, delay: isOpen ? 0.55 : 0 }}
      >
        <p
          className="font-body text-[8px] uppercase tracking-[0.42em]"
          style={{ color: `${drop.accent}cc` }}
        >
          {drop.label}
        </p>
        <p
          className="font-display text-base uppercase"
          style={{ color: '#f2e7d0', letterSpacing: '0.12em' }}
        >
          {drop.name}
        </p>
      </motion.div>

      {/* garment row — 3 equal columns, full height from rod to shelf.
          Default: all pieces hang in profile, slightly receded and dimmed.
          Selected: the piece pulls FORWARD — turns to face, scales up,
          drifts toward center, brightens — while the rest sink back. */}
      <div
        className="absolute flex"
        style={{ left: '4%', right: '4%', top: '21%', bottom: '14%' }}
      >
        {drop.items.map((item, i) => {
          const isSel = i === selectedItem
          const hasSel = selectedItem >= 0
          return (
            <motion.button
              key={item.id}
              id={`garment-${drop.id}-${i}`}
              aria-label={`Select ${item.name} — ${item.price}`}
              className="relative flex flex-col items-center"
              style={{ flex: '1 1 0', height: '100%' }}
              animate={{
                opacity: !isOpen ? 0 : hasSel ? (isSel ? 1 : 0.24) : 0.85,
                scale: isSel ? 1.26 : hasSel ? 0.88 : 1,
                // drift toward screen center (col 0 pushes right, col 2 left)
                x: isSel ? `${(1 - i) * 55}%` : 0,
                y: isSel ? '-4%' : 0,
                filter: isSel
                  ? 'saturate(1.12) brightness(1.1)'
                  : hasSel
                    ? 'saturate(0.45) brightness(0.62)'
                    : 'saturate(0.88) brightness(0.92)',
                zIndex: isSel ? 10 : 1,
              }}
              transition={{
                opacity: { duration: 0.38, delay: !isOpen || hasSel ? 0 : 0.44 + i * 0.09 },
                scale: { type: 'spring', stiffness: 260, damping: 26 },
                x: { type: 'spring', stiffness: 260, damping: 26 },
                y: { type: 'spring', stiffness: 260, damping: 26 },
                filter: { duration: 0.45 },
              }}
              onClick={() => isOpen && onSelectItem(i)}
            >
              {/* hanger hook line */}
              <div
                style={{
                  width: 1.5,
                  height: '7%',
                  flexShrink: 0,
                  background: 'rgba(195,155,80,0.65)',
                }}
                aria-hidden="true"
              />

              {/* garment image — scaleX 0.12 = side-profile on the rod,
                  1 = turned to face the viewer */}
              <motion.div
                className="relative overflow-hidden"
                style={{ flex: 1, width: '100%' }}
                animate={{ scaleX: isSel ? 1 : 0.12 }}
                transition={{ type: 'spring', stiffness: 330, damping: 28 }}
              >
                <img
                  src={item.frontImg}
                  alt={item.name}
                  draggable={false}
                  className="h-full w-full object-contain"
                  style={{ objectPosition: 'top center' }}
                />
                {isSel && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse 80% 80% at 50% 30%, ${drop.accent}1f, transparent)`,
                    }}
                    aria-hidden="true"
                  />
                )}
              </motion.div>

              {/* item name under selected garment */}
              <motion.p
                className="font-body text-[7px] uppercase tracking-[0.42em]"
                style={{
                  color: `${drop.accent}cc`,
                  flexShrink: 0,
                  marginTop: 6,
                  height: 16,
                }}
                animate={{ opacity: isOpen && isSel ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              >
                {item.name}
              </motion.p>
            </motion.button>
          )
        })}
      </div>

      {/* floor shelf */}
      <div
        className="pointer-events-none absolute inset-x-0"
        style={{ bottom: '12%', height: 1, background: 'rgba(195,155,80,0.18)' }}
        aria-hidden="true"
      />

      {/* "select a piece" hint */}
      <AnimatePresence>
        {isOpen && selectedItem === -1 && (
          <motion.p
            key="select-hint"
            className="pointer-events-none absolute inset-x-0 text-center font-body text-[8px] uppercase tracking-[0.52em]"
            style={{ bottom: '6%', color: 'rgba(242,231,208,0.26)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.85, duration: 0.65 }}
          >
            select a piece
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── CabinetRoom ─────────────────────────────────────────────────────────────
export default function CabinetRoom() {
  const [activeIdx,    setActiveIdx]    = useState(0)
  const [direction,    setDirection]    = useState(0)   // 1=forward, -1=back
  const [isOpen,       setIsOpen]       = useState(false)
  const [selectedItem, setSelectedItem] = useState(-1)

  const swipeRef   = useRef({ x: 0, y: 0, live: false })
  // cooldown for scroll transitions
  const wheelCooldownRef = useRef(false)
  // set when a pointerup is consumed as a swipe — the trailing click event
  // on the door's full-panel button must NOT also fire openDoor()
  const suppressClickRef = useRef(false)
  const n          = cabinetDrops.length
  const activeDrop = cabinetDrops[activeIdx]

  // ── navigation ─────────────────────────────────────────────────────────────
  function goTo(idx) {
    if (idx === activeIdx) return
    setDirection(idx > activeIdx ? 1 : -1)
    setIsOpen(false)
    setSelectedItem(-1)
    setActiveIdx(idx)
  }
  const goNext = () => {
    const next = (activeIdx + 1) % n
    setDirection(1)
    setIsOpen(false)
    setSelectedItem(-1)
    setActiveIdx(next)
  }
  const goPrev = () => {
    const prev = (activeIdx - 1 + n) % n
    setDirection(-1)
    setIsOpen(false)
    setSelectedItem(-1)
    setActiveIdx(prev)
  }

  function openDoor() {
    // a swipe that ended on the door button still emits a click — swallow it
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    setIsOpen(true)
    setSelectedItem(-1)
  }
  function closeDoor() {
    setIsOpen(false)
    setSelectedItem(-1)
  }
  function stepItem(dir) {
    setSelectedItem(prev => {
      if (prev < 0) return dir > 0 ? 0 : activeDrop.items.length - 1
      return (prev + dir + activeDrop.items.length) % activeDrop.items.length
    })
  }

  // ── scroll & swipe gestures ────────────────────────────────────────────────
  function onWheel(e) {
    if (isOpen) return // don't transition while viewing garments
    if (wheelCooldownRef.current) return

    const threshold = 30
    if (Math.abs(e.deltaY) > threshold || Math.abs(e.deltaX) > threshold) {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      const delta = isHorizontal ? e.deltaX : e.deltaY

      if (delta > 0) goNext()
      else goPrev()

      wheelCooldownRef.current = true
      setTimeout(() => {
        wheelCooldownRef.current = false
      }, 1000)
    }
  }

  // The door's full-panel click target is marked data-swipeable: a press that
  // starts on it still arms the swipe tracker (tap = open, drag = navigate).
  function onPointerDown(e) {
    const interactive = e.target.closest('button, a, [role="button"]')
    if (interactive && !interactive.hasAttribute('data-swipeable')) return
    swipeRef.current = { x: e.clientX, y: e.clientY, live: true }
  }
  function onPointerUp(e) {
    if (!swipeRef.current.live) return
    swipeRef.current.live = false
    const dx = e.clientX - swipeRef.current.x
    const dy = e.clientY - swipeRef.current.y
    if (Math.abs(dx) > 72 && Math.abs(dx) > Math.abs(dy) * 2) {
      suppressClickRef.current = true
      dx < 0 ? goNext() : goPrev()
    }
  }
  function onPointerCancel() { swipeRef.current.live = false }

  return (
    <div
      id="cabinet-room"
      className="absolute inset-0 z-10 overflow-hidden"
      style={{ background: '#060301', touchAction: 'pan-y' }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* ── door carousel — sync mode (NOT mode="wait"): the outgoing scene
          keeps sliding out while the incoming scene slides in over it, so
          the transition is one continuous whole-scene handoff with no empty
          gap exposing the entry photo underneath ── */}
      <AnimatePresence custom={direction}>
        <motion.div
          key={activeIdx}
          className="absolute inset-0"
          custom={direction}
          variants={slideVars}
          initial="enter"
          animate="center"
          exit="exit"
          transition={SPRING}
        >
          {/* ── sliding door panel — overflow-hidden so the mobile zoom-cropped
                  art (scale 1.4) never bleeds back into frame after sliding off ── */}
          <motion.div
            className="absolute inset-0 z-10 overflow-hidden"
            animate={{ x: isOpen ? '-100%' : '0%' }}
            transition={EASE_OUT}
            style={{ willChange: 'transform' }}
          >
            {/* ── scene backdrop — the SAME door art, cover-cropped, heavily
                blurred and darkened, fills the viewport so the portrait art
                never leaves dead space on wide screens. Carries the drop's
                color grade + tint: each swipe arrives in a different world ── */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <img
                src={activeDrop.doorArt}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
                style={{
                  transform: 'scale(1.18)',
                  filter: `blur(30px) brightness(0.42) ${activeDrop.grade}`,
                }}
              />
              {/* soft-light tint wash — the per-drop mood layer */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${activeDrop.tint}33 0%, ${activeDrop.tint}1f 55%, ${activeDrop.tint}40 100%)`,
                  mixBlendMode: 'soft-light',
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: `${activeDrop.tint}14` }}
              />
            </div>

            {/* ── full-screen door art ──
                desktop (md+): object-contain — the whole door (frame, LED,
                plate) is visible, no zoom-crop; the blurred backdrop fills
                the sides. mobile: cover + zoom-crop around the upper door so
                the baked brass plate stays out of frame (HTML overlay labels
                the drop instead) ── */}
            <img
              src={activeDrop.doorArt}
              alt={activeDrop.name}
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain max-md:origin-[50%_10%] max-md:scale-[1.4] max-md:object-cover"
              style={{ filter: activeDrop.grade }}
            />

            {/* full-panel grade tint — soft-light so art keeps its detail */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `${activeDrop.tint}2e`,
                mixBlendMode: 'soft-light',
              }}
              aria-hidden="true"
            />

            {/* side vignette — adds premium depth */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 100% at 50% 50%, transparent 60%, rgba(4,2,1,0.55) 100%)',
              }}
              aria-hidden="true"
            />

            {/* bottom gradient — makes text readable */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0"
              style={{
                height: '55%',
                background:
                  'linear-gradient(to top, rgba(5,2,1,0.95) 0%, rgba(5,2,1,0.4) 55%, transparent 100%)',
              }}
              aria-hidden="true"
            />

            {/* drop info — bottom left */}
            <div className="pointer-events-none absolute bottom-24 left-8 right-8">
              <p
                className="font-body text-[9px] uppercase tracking-[0.55em]"
                style={{ color: `${activeDrop.accent}cc` }}
              >
                {activeDrop.label} · {activeDrop.season}
              </p>
              <h2
                className="mt-1 font-display uppercase leading-none"
                style={{
                  color: '#f2e7d0',
                  letterSpacing: '0.05em',
                  fontSize: 'clamp(2.4rem, 6vw, 5rem)',
                }}
              >
                {activeDrop.name}
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="inline-block rounded-sm px-2.5 py-1 font-body text-[8px] uppercase tracking-[0.4em]"
                  style={{
                    background: `${activeDrop.accent}1a`,
                    border: `1px solid ${activeDrop.accent}55`,
                    color: activeDrop.accent,
                  }}
                >
                  {activeDrop.status}
                </span>
                <span
                  className="font-body text-[9px] uppercase tracking-[0.4em]"
                  style={{ color: 'rgba(242,231,208,0.38)' }}
                >
                  {activeDrop.items.length} pieces
                </span>
              </div>
            </div>

            {/* center pulse cue — "tap to enter" */}
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center pb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.7 }}
              aria-hidden="true"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center">
                  {[0, 0.5].map((delay, ri) => (
                    <motion.div
                      key={ri}
                      className="absolute rounded-full"
                      style={{
                        width: 54, height: 54,
                        border: `1px solid ${activeDrop.accent}${ri === 0 ? '70' : '40'}`,
                      }}
                      animate={{ scale: [1, 1.65 + ri * 0.2], opacity: [0.65 - ri * 0.1, 0] }}
                      transition={{
                        duration: 1.9, repeat: Infinity,
                        ease: 'easeOut', delay,
                      }}
                    />
                  ))}
                  <div
                    className="relative rounded-full"
                    style={{
                      width: 54, height: 54,
                      border: `1px solid ${activeDrop.accent}88`,
                      background: `${activeDrop.accent}12`,
                    }}
                  />
                </div>
                <p
                  className="font-body text-[8px] uppercase tracking-[0.65em]"
                  style={{ color: `${activeDrop.accent}88` }}
                >
                  tap to enter
                </p>
              </div>
            </motion.div>

            {/* full-panel click target — sits above everything on the door.
                data-swipeable: presses that start here still arm the swipe
                tracker; tap = open, horizontal drag = navigate */}
            <button
              id={`door-open-${activeDrop.id}`}
              data-swipeable
              className="absolute inset-0 z-20"
              onClick={openDoor}
              aria-label={`Open ${activeDrop.name}`}
            />
          </motion.div>

          {/* ── garment interior (behind door) ──────────────────────── */}
          <CabinetInterior
            drop={activeDrop}
            isOpen={isOpen}
            selectedItem={selectedItem}
            onSelectItem={(i) =>
              setSelectedItem((prev) => (prev === i ? -1 : i))
            }
            onClose={closeDoor}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── left / right arrows (only when door is closed) ────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <>
            <motion.button
              key="arr-prev"
              id="btn-prev-drop"
              aria-label="Previous drop"
              className="absolute left-5 top-1/2 z-20 flex items-center justify-center -translate-y-1/2"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(6,3,1,0.5)',
                border: '1px solid rgba(242,231,208,0.14)',
                color: 'rgba(242,231,208,0.65)',
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onClick={goPrev}
            >
              <ChevronLeft size={18} />
            </motion.button>

            <motion.button
              key="arr-next"
              id="btn-next-drop"
              aria-label="Next drop"
              className="absolute right-5 top-1/2 z-20 flex items-center justify-center -translate-y-1/2"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(6,3,1,0.5)',
                border: '1px solid rgba(242,231,208,0.14)',
                color: 'rgba(242,231,208,0.65)',
              }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              onClick={goNext}
            >
              <ChevronRight size={18} />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* ── nav dots ──────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-7 left-1/2 z-20 flex items-center gap-1.5"
        style={{ transform: 'translateX(-50%)' }}
        role="tablist"
        aria-label="Navigate drops"
      >
        {cabinetDrops.map((drop, i) => (
          <button
            key={drop.id}
            id={`dot-${i}`}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`${drop.name}`}
            onClick={() => goTo(i)}
            style={{ padding: '6px 3px' }}
          >
            {/* fixed-width wrapper + scaleX = GPU-compositable dot pill */}
            <span
              style={{
                display: 'block',
                width: 22, height: 2,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <motion.span
                animate={{
                  scaleX: i === activeIdx ? 1 : 5 / 22,
                  opacity: i === activeIdx ? 1 : 0.34,
                  backgroundColor:
                    i === activeIdx
                      ? cabinetDrops[activeIdx].accent
                      : 'rgba(242,231,208,0.42)',
                }}
                transition={SPRING}
                style={{
                  display: 'block',
                  width: '100%', height: '100%',
                  transformOrigin: 'left center',
                }}
              />
            </span>
          </button>
        ))}
      </div>

      {/* ── garment caption — a quiet overlay, not a sheet: the closet
              scene stays dominant; type + steppers float over it ── */}
      <AnimatePresence mode="wait">
        {isOpen && selectedItem >= 0 && (
          <motion.div
            key={`${activeIdx}-${selectedItem}`}
            className="absolute bottom-14 left-8 z-30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="font-body text-[8px] uppercase tracking-[0.48em]"
              style={{ color: `${activeDrop.accent}bb` }}
            >
              {activeDrop.label} — {activeDrop.name}
            </p>
            <h3
              className="mt-1 font-display text-xl uppercase leading-none"
              style={{ color: '#f2e7d0', letterSpacing: '0.08em' }}
            >
              {activeDrop.items[selectedItem].name}
            </h3>
            <p
              className="mt-1.5 font-body text-sm font-medium"
              style={{ color: activeDrop.accent }}
            >
              {activeDrop.items[selectedItem].price}
            </p>

            <div className="mt-3 flex items-center gap-4">
              {/* quiet steppers — same gesture as reaching along the rod */}
              <button
                onClick={() => stepItem(-1)}
                aria-label="Previous garment"
                className="flex items-center justify-center"
                style={{
                  width: 26, height: 26,
                  border: `1px solid ${activeDrop.accent}50`,
                  borderRadius: 2,
                  color: activeDrop.accent,
                }}
              >
                <ChevronLeft size={13} />
              </button>
              <span
                className="font-body text-[8px] tracking-[0.35em]"
                style={{ color: 'rgba(242,231,208,0.38)' }}
              >
                {selectedItem + 1} / {activeDrop.items.length}
              </span>
              <button
                onClick={() => stepItem(1)}
                aria-label="Next garment"
                className="flex items-center justify-center"
                style={{
                  width: 26, height: 26,
                  border: `1px solid ${activeDrop.accent}50`,
                  borderRadius: 2,
                  color: activeDrop.accent,
                }}
              >
                <ChevronRight size={13} />
              </button>

              {/* minimal text link — no CTA bar */}
              <Link
                to={`/shop/${activeDrop.items[selectedItem].id}`}
                id={`shop-cta-${activeDrop.items[selectedItem].id}`}
                className="ml-2 font-body text-[9px] uppercase tracking-[0.42em]"
                style={{ color: `${activeDrop.accent}dd` }}
              >
                View in Shop →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
