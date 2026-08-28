import { MotionConfig, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import drops from '../pages/HomePage/data/drops'
import products from '../pages/HomePage/data/products'

/*
 * THE WALK-IN — a virtual version of a real walk-in closet.
 *
 * One continuous built-in wardrobe wall, rendered entirely in CSS wood and
 * light (no stock photography): cornice with a warm LED valance, four bays
 * divided by solid stiles, plinth and floor below. Each bay belongs to one
 * drop. Its sliding door is a display panel — the drop's hero piece hangs on
 * a hanger inside a lit niche, like the glass-front cabinets of a real
 * wardrobe room. Tap/click the door and it slides into the wall cavity; the
 * bay inside lights up: brass rod, the drop's garments on individual hangers,
 * name + price tags. Tap a garment to open its product page.
 *
 * Mobile-first and power-conscious:
 * - the wardrobe is wider than a phone screen on purpose — you drag sideways
 *   along the wall like walking the closet (native overflow scroll + CSS
 *   scroll-snap; compositor-driven, zero JS animation loop)
 * - transform/opacity animations only, fired on interaction; nothing animates
 *   continuously; no backdrop-filter, no parallax, no WebGL
 * - honors prefers-reduced-motion via MotionConfig
 *
 * Data-driven from src/pages/HomePage/data/drops.js (+ products.js for
 * names/prices). One cabinet open at a time — a single lit bay stays
 * cinematic, several read as clutter.
 */
const CREAM = '#f5f1e8'
const FAINT = 'rgba(242, 231, 208, 0.34)'
const WOOD_FRAME =
  'linear-gradient(180deg, #33240f 0%, #241708 38%, #180e05 72%, #100903 100%)'
const WOOD_DOOR =
  'linear-gradient(180deg, #2c1e0e 0%, #201305 52%, #150c04 100%)'
const CAVITY =
  'linear-gradient(180deg, #040202 0%, #0d0803 55%, #160d05 100%)'

const productById = (id) => products.find((p) => p.id === id)

/* a real clothes hanger — brass hook over the rod, wooden bar below */
function Hanger({ className }) {
  return (
    <svg viewBox="0 0 40 22" className={className} aria-hidden="true">
      <path
        d="M20 8 V6.5 C20 3.6 22.6 3.4 22.6 1.6 C22.6 0.5 21.5 -0.1 20.5 0.4"
        fill="none"
        stroke="#c9b48a"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M20 8 L2.8 19.4 Q1.8 20.2 3.4 20.2 H36.6 Q38.2 20.2 37.2 19.4 Z" fill="#4c3819" />
      <path
        d="M20 8 L3.6 19.6 M20 8 L36.4 19.6"
        fill="none"
        stroke="#8f6f42"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

const garmentVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function Bay({ drop, open, onToggle, onPickItem, className }) {
  // doors track toward their wall side; the 4% accent edge stays as the grab
  const slideTo = drop.side === 'A' ? '-96%' : '96%'
  const hero = drop.items[0]

  return (
    <div
      className={`relative min-h-0 overflow-hidden ${className}`}
      data-cabinet-frame={drop.id}
      style={{
        background: CAVITY,
        boxShadow: 'inset 0 14px 28px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(0,0,0,0.6)',
      }}
    >
      {/* ——— inside the bay ——— */}
      {/* LED strip across the top of the cavity */}
      <motion.div
        className="absolute left-[8%] right-[8%] top-[3%] h-[3px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #ffd98a 30%, #ffe9b8 50%, #ffd98a 70%, transparent)',
          boxShadow: '0 2px 14px rgba(255, 205, 120, 0.55)',
        }}
        animate={{ opacity: open ? 1 : 0.12 }}
        transition={{ duration: 0.5, delay: open ? 0.3 : 0 }}
      />
      {/* warm wash once the light is on */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 95% 60% at 50% 0%, rgba(255,196,110,0.26), transparent 68%)' }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.6, delay: open ? 0.3 : 0 }}
      />

      {/* brass closet rod + brackets */}
      <div className="absolute left-[7%] right-[7%] top-[17%] h-[3px] rounded-full bg-gradient-to-b from-[#e6d7b4] via-[#b39a6b] to-[#5f5138]" />
      <div className="absolute left-[7%] top-[17%] h-[9px] w-[3px] bg-gradient-to-b from-[#b39a6b] to-[#4a3d27]" />
      <div className="absolute right-[7%] top-[17%] h-[9px] w-[3px] bg-gradient-to-b from-[#b39a6b] to-[#4a3d27]" />

      {/* garments on hangers — stagger in once the light comes up */}
      <motion.div
        className="absolute inset-x-[5%] bottom-[17%] top-[13.5%] flex items-stretch justify-around gap-1"
        initial="hidden"
        animate={open ? 'show' : 'hidden'}
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } } }}
      >
        {drop.items.map((item) => {
          const product = productById(item.productId)
          return (
            <motion.button
              key={item.productId}
              type="button"
              variants={garmentVariants}
              onClick={() => onPickItem(item.productId)}
              className="group flex h-full min-w-0 flex-1 flex-col items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
              aria-label={`View ${product?.name ?? 'item'}`}
              data-garment={item.productId}
            >
              <Hanger className="h-[13%] w-auto shrink-0" />
              <span className="flex min-h-0 w-full flex-1 items-start justify-center">
                <img
                  src={item.img}
                  alt={product?.name ?? 'garment'}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  className="-mt-[2px] h-full w-auto max-w-full object-contain object-top transition-transform duration-300 group-hover:-translate-y-1"
                />
              </span>
              <span
                className="mt-1 block w-full min-w-0 shrink-0 break-words text-center font-body text-[7px] uppercase leading-tight md:text-[8px]"
                style={{ letterSpacing: '0.12em', color: FAINT }}
              >
                {product?.name}
                <span className="block" style={{ color: drop.accent }}>{product?.price}</span>
              </span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* folded shelf at the bottom of the bay */}
      <div className="absolute bottom-[9%] left-[10%] right-[10%]">
        <div className="mx-auto flex w-3/5 flex-col items-center gap-[3px] opacity-70">
          <div className="h-[5px] w-full rounded-[2px] bg-gradient-to-b from-[#3a3a38] to-[#1c1c1a]" />
          <div className="h-[5px] w-[92%] rounded-[2px] bg-gradient-to-b from-[#2e2c28] to-[#171512]" />
        </div>
        <div className="mt-[4px] h-[3px] w-full rounded-full bg-gradient-to-b from-[#5a4a2e] to-[#241a0c]" />
      </div>

      {/* the dark veil — lifts after the door has mostly slid = lights come on */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        animate={{ opacity: open ? 0 : 0.62 }}
        transition={{ duration: 0.55, delay: open ? 0.35 : 0 }}
      />

      {/* close control */}
      <motion.button
        type="button"
        onClick={onToggle}
        className="absolute right-[4%] top-[4%] z-20 font-body text-[8px] uppercase"
        style={{ letterSpacing: '0.3em', color: FAINT }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, delay: open ? 0.5 : 0 }}
        aria-label={`Close drop ${drop.id}`}
        data-close={drop.id}
      >
        close ×
      </motion.button>

      {/* ——— the sliding door ——— */}
      <motion.div
        className="absolute inset-0 z-10 cursor-pointer"
        style={{
          background: WOOD_DOOR,
          boxShadow: 'inset 0 0 0 1px rgba(74,53,32,0.9), inset 0 1px 0 rgba(214,178,110,0.14), 0 10px 30px rgba(0,0,0,0.5)',
        }}
        animate={{ x: open ? slideTo : '0%' }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        onClick={onToggle}
        role="button"
        aria-expanded={open}
        aria-label={`${open ? 'Close' : 'Open'} drop ${drop.id} — ${drop.name}`}
        data-cabinet-door={drop.id}
      >
        {/* wood grain + accent crown + grab edge */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: 'repeating-linear-gradient(90deg, transparent 0 7px, rgba(0,0,0,0.12) 7px 8px)' }}
        />
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: drop.accent }} />
        <div
          className={`absolute top-0 h-full w-[3px] ${drop.side === 'A' ? 'left-0' : 'right-0'}`}
          style={{ background: drop.accent, opacity: 0.85 }}
        />

        {/* lit display niche — the hero piece hangs on a hanger, like a
            glass-front cabinet in a real wardrobe room */}
        <div
          className="absolute inset-x-[9%] top-[6%] h-[50%] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #050302 0%, #100903 60%, #180e05 100%)',
            boxShadow: 'inset 0 10px 22px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(0,0,0,0.55), 0 1px 0 rgba(214,178,110,0.12)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255,196,110,0.20), transparent 70%)' }}
          />
          <div className="absolute left-[14%] right-[14%] top-[13%] h-[2px] rounded-full bg-gradient-to-b from-[#dccb9f] to-[#6a5a3d]" />
          <div className="absolute inset-x-0 bottom-[6%] top-[9%] flex flex-col items-center">
            <Hanger className="h-[17%] w-auto shrink-0" />
            <img
              src={hero?.img}
              alt=""
              loading="lazy"
              decoding="async"
              draggable="false"
              className="-mt-[2px] min-h-0 w-auto max-w-[86%] flex-1 object-contain object-top opacity-95"
            />
          </div>
        </div>

        {/* engraved plate */}
        <div className="absolute inset-x-[9%] bottom-[5%] top-[62%] flex flex-col justify-center">
          <span className="font-body text-[8px] uppercase md:text-[9px]" style={{ letterSpacing: '0.42em', color: drop.accent }}>
            drop {drop.id}
          </span>
          <h3 className="mt-1 font-display text-xl leading-none md:text-2xl" style={{ color: CREAM }}>
            {drop.name}
          </h3>
          <span className="mt-1 block font-body text-[7px] uppercase md:text-[8px]" style={{ letterSpacing: '0.28em', color: FAINT }}>
            {drop.season} · {drop.status}
          </span>
          <span className="mt-2 block font-body text-[7px] uppercase opacity-70 md:text-[8px]" style={{ letterSpacing: '0.24em', color: FAINT }}>
            {drop.side === 'A' ? '← slides' : 'slides →'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function ClosetInterior() {
  const navigate = useNavigate()
  const [openId, setOpenId] = useState(null)
  const [activeBay, setActiveBay] = useState(0)
  const wallRef = useRef(null)
  const toggle = (id) => setOpenId((current) => (current === id ? null : id))
  const pickItem = (productId) => navigate(`/shop/${productId}`)

  // cheap passive scroll → which bay is centered (mobile wall-drag legend)
  const onWallScroll = (e) => {
    const el = e.currentTarget
    const bay = el.querySelector('[data-cabinet-frame]')
    if (!bay) return
    const step = bay.offsetWidth + 8
    setActiveBay(Math.max(0, Math.min(drops.length - 1, Math.round(el.scrollLeft / step))))
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative h-[100dvh] overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #070402 0%, #0a0603 55%, #050302 100%)' }}
        aria-label="The Walk-In — four drops, four doors"
      >
        {/* back wall panel seams + ceiling glow (pure CSS, static) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'repeating-linear-gradient(90deg, transparent 0 118px, rgba(0,0,0,0.35) 118px 120px)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 34% at 50% 0%, rgba(255,196,110,0.10), transparent 70%)' }}
          aria-hidden="true"
        />

        {/* floor + shadow pool under the wardrobe */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[15%]"
          style={{ background: 'linear-gradient(180deg, #150d05 0%, #0a0603 45%, #030201 100%)', borderTop: '1px solid rgba(214,178,110,0.14)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[2%] left-1/2 h-[9%] w-[86%] -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse 50% 100% at 50% 50%, rgba(0,0,0,0.65), transparent 70%)' }}
          aria-hidden="true"
        />

        {/* scene title */}
        <div className="absolute inset-x-0 top-5 flex flex-col items-center gap-1 text-center sm:top-7">
          <span className="font-display text-sm sm:text-base" style={{ letterSpacing: '0.42em', color: CREAM, opacity: 0.92 }}>
            THE WALK-IN
          </span>
          <span className="font-body text-[8px] uppercase sm:text-[9px]" style={{ letterSpacing: '0.44em', color: FAINT }}>
            four drops · four doors
          </span>
          <span className="mt-1 font-body text-[7px] uppercase sm:text-[8px] md:hidden" style={{ letterSpacing: '0.3em', color: FAINT }}>
            drag the wall · tap a door
          </span>
          <span className="mt-1 hidden font-body text-[8px] uppercase md:block" style={{ letterSpacing: '0.3em', color: FAINT }}>
            click a door to open its drop
          </span>
        </div>

        {/* the wardrobe */}
        <div className="absolute left-1/2 top-[15%] bottom-[13%] w-[94vw] max-w-[1480px] -translate-x-1/2 sm:top-[16%]">
          <div
            className="flex h-full flex-col p-[8px]"
            style={{
              background: WOOD_FRAME,
              boxShadow: '0 34px 70px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(74,53,32,0.85), inset 0 1px 0 rgba(214,178,110,0.16)',
            }}
          >
            {/* cornice + LED valance */}
            <div className="relative h-[12px] shrink-0" style={{ background: 'linear-gradient(180deg, #3d2c17, #221508)' }}>
              <div
                className="absolute inset-x-[3%] bottom-[1px] h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,217,138,0.85) 25%, rgba(255,233,184,0.95) 50%, rgba(255,217,138,0.85) 75%, transparent)', boxShadow: '0 3px 16px rgba(255,205,120,0.35)' }}
              />
            </div>

            {/* bays — the wall runs wider than a phone; drag it like walking
                the closet. All four fit side by side on desktop. */}
            <div
              ref={wallRef}
              onScroll={onWallScroll}
              className="flex min-h-0 flex-1 snap-x snap-mandatory gap-[8px] overflow-x-auto scroll-smooth py-[8px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:snap-none md:overflow-visible"
            >
              {drops.map((drop) => (
                <Bay
                  key={drop.id}
                  drop={drop}
                  open={openId === drop.id}
                  onToggle={() => toggle(drop.id)}
                  onPickItem={pickItem}
                  className="w-[68vw] max-w-[300px] flex-none snap-center md:w-auto md:max-w-none md:flex-1"
                />
              ))}
            </div>

            {/* plinth */}
            <div
              className="h-[12px] shrink-0 border-t border-black/60"
              style={{ background: 'linear-gradient(180deg, #221508, #0c0703)' }}
            />
          </div>
        </div>

        {/* mobile wall position legend */}
        <div className="absolute inset-x-0 bottom-[5.5%] flex items-center justify-center gap-4 md:hidden">
          {drops.map((drop, i) => (
            <span
              key={drop.id}
              className="font-body text-[8px] uppercase transition-opacity duration-300"
              style={{ letterSpacing: '0.22em', color: i === activeBay ? drop.accent : FAINT, opacity: i === activeBay ? 1 : 0.55 }}
            >
              {drop.id}
            </span>
          ))}
        </div>
      </section>
    </MotionConfig>
  )
}

export default ClosetInterior
