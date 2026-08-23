import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import GarmentArt from './GarmentArt'
import garmentImage from './your-image.png'

const moments = [
  { label: 'CUT IN SMALL RUNS', offset: 0.08 },
  { label: 'EVERY STITCH LOGGED', offset: 0.5 },
  { label: 'GONE WHEN IT\'S GONE', offset: 0.88 },
]

function ParticleMark({ progress, left, top, size, color, driftX, driftY, rotateMax, opacityRange }) {
  const x = useTransform(progress, [0, 1], [0, driftX])
  const y = useTransform(progress, [0, 1], [0, driftY])
  const opacity = useTransform(progress, [0, 0.4, 0.7, 1], opacityRange)
  const rotate = useTransform(progress, [0, 1], [0, rotateMax])

  return (
    <motion.div
      className="absolute"
      style={{ left, top, width: size, height: size, backgroundColor: color, opacity, x, y, rotate }}
    />
  )
}

function GarmentSequence() {
  const containerRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] })

  const progress = useTransform(scrollYProgress, [0, 1], [0, 1])
  const x = useTransform(progress, [0, 0.22, 0.48, 0.72, 1], ['18vw', '28vw', '38vw', '46vw', '54vw'])
  const y = useTransform(progress, [0, 0.24, 0.5, 0.74, 1], ['34vh', '18vh', '-4vh', '-14vh', '-24vh'])
  const rotate = useTransform(progress, [0, 0.23, 0.49, 0.72, 1], [-15, 8, 0, -6, 12])
  const scale = useTransform(progress, [0, 0.22, 0.42, 0.7, 1], [0.45, 0.95, 1.6, 1.1, 0.5])
  const opacity = useTransform(progress, [0, 0.06, 0.92, 1], [0, 1, 1, 0])

  const frontOpacity = useTransform(progress, [0, 0.12, 0.32, 0.56, 0.72], [0, 1, 1, 0.24, 0])
  const detailOpacity = useTransform(progress, [0.24, 0.36, 0.5, 0.72, 0.84], [0, 0.2, 1, 0.8, 0])
  const backOpacity = useTransform(progress, [0.68, 0.8, 0.9, 1], [0, 1, 1, 0])

  const bgPosition = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], ['18% 18%', '36% 20%', '54% 30%', '62% 24%', '76% 18%'])
  const bgOpacity = useTransform(progress, [0, 0.2, 0.5, 0.8, 1], [0.18, 0.38, 0.78, 0.46, 0.18])

  const firstTextOpacity = useTransform(progress, [0.05, 0.12, 0.2, 0.34, 0.46], [0, 1, 1, 1, 0])
  const firstTextY = useTransform(progress, [0.05, 0.12, 0.2, 0.34, 0.46], [18, 8, 0, 0, 12])
  const firstTextScale = useTransform(progress, [0.05, 0.12, 0.2, 0.34, 0.46], [0.96, 0.98, 1, 1, 0.96])
  const firstLabelColor = useTransform(progress, [0.05, 0.12, 0.18, 0.3], ['var(--color-bone)', 'var(--color-blaze)', 'var(--color-toxic)', 'var(--color-toxic)'])

  const secondTextOpacity = useTransform(progress, [0.3, 0.4, 0.5, 0.62, 0.74], [0, 1, 1, 1, 0])
  const secondTextY = useTransform(progress, [0.3, 0.4, 0.5, 0.62, 0.74], [18, 8, 0, 0, 12])
  const secondTextScale = useTransform(progress, [0.3, 0.4, 0.5, 0.62, 0.74], [0.96, 0.98, 1, 1, 0.96])
  const secondLabelColor = useTransform(progress, [0.3, 0.4, 0.5, 0.6], ['var(--color-bone)', 'var(--color-blaze)', 'var(--color-toxic)', 'var(--color-toxic)'])

  const thirdTextOpacity = useTransform(progress, [0.68, 0.78, 0.88, 0.94, 1], [0, 1, 1, 1, 0])
  const thirdTextY = useTransform(progress, [0.68, 0.78, 0.88, 0.94, 1], [18, 8, 0, 0, 12])
  const thirdTextScale = useTransform(progress, [0.68, 0.78, 0.88, 0.94, 1], [0.96, 0.98, 1, 1, 0.96])
  const thirdLabelColor = useTransform(progress, [0.68, 0.78, 0.84, 0.92], ['var(--color-bone)', 'var(--color-blaze)', 'var(--color-toxic)', 'var(--color-toxic)'])

  const springX = useSpring(x, { stiffness: 110, damping: 24 })
  const springY = useSpring(y, { stiffness: 110, damping: 24 })
  const springRotate = useSpring(rotate, { stiffness: 90, damping: 24 })
  const springScale = useSpring(scale, { stiffness: 100, damping: 24 })
  const springOpacity = useSpring(opacity, { stiffness: 90, damping: 24 })

  const textBlocks = [
    {
      label: moments[0].label,
      body: 'Every hoodie and shell is cut in a small run so the drop still feels like a live event.',
      opacity: firstTextOpacity,
      y: firstTextY,
      scale: firstTextScale,
      labelColor: firstLabelColor,
    },
    {
      label: moments[1].label,
      body: 'The batch code and status tag turn each item into a traceable artifact, not a generic product.',
      opacity: secondTextOpacity,
      y: secondTextY,
      scale: secondTextScale,
      labelColor: secondLabelColor,
    },
    {
      label: moments[2].label,
      body: 'A piece does not linger forever. When the run closes, it becomes a memory in the archive.',
      opacity: thirdTextOpacity,
      y: thirdTextY,
      scale: thirdTextScale,
      labelColor: thirdLabelColor,
    },
  ]

  if (shouldReduceMotion) {
    return (
      <section className="border-t border-[var(--color-bone)]/20 bg-[var(--color-surface)] px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="border border-[var(--color-bone)]/20 bg-[var(--color-ink)]/80 p-8">
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">SCROLL STORY</p>
            <h2 className="font-anton text-[clamp(2rem,3vw,2.6rem)] uppercase leading-[0.95]">The garment reshapes as the story advances from front view to detail to exit.</h2>
          </div>
          <div className="border border-[var(--color-bone)]/20 bg-[linear-gradient(135deg,var(--color-blaze),var(--color-ink))] p-8">
            <div className="border border-[var(--color-bone)]/20 bg-[var(--color-ink)]/85 p-8 text-[var(--color-bone)]">
              <div className="mb-8 border border-[var(--color-bone)]/20 bg-[var(--color-surface)]/80 p-4">
                <div className="mx-auto flex aspect-[4/5] w-full max-w-[13rem] items-center justify-center bg-[linear-gradient(135deg,var(--color-blaze),var(--color-ink))] p-4">
                  <div className="h-full w-full border border-[var(--color-bone)]/25 bg-[var(--color-surface)]/90 p-4">
                    <GarmentArt view="front" />
                  </div>
                </div>
              </div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-toxic)]">CUT IN SMALL RUNS</p>
              <p className="mt-4 font-sans text-[1rem] leading-8 text-[var(--color-bone)]/80">Every stitch logs a drop and every drop leaves a trace.</p>
              <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-toxic)]">EVERY STITCH LOGGED</p>
              <p className="mt-4 font-sans text-[1rem] leading-8 text-[var(--color-bone)]/80">The garment carries the run code like a postage stamp from the street.</p>
              <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-toxic)]">GONE WHEN IT'S GONE</p>
              <p className="mt-4 font-sans text-[1rem] leading-8 text-[var(--color-bone)]/80">Once the drop closes, the piece goes from product to memory.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={containerRef} className="relative h-[240vh] border-t border-[var(--color-bone)]/20 bg-[var(--color-ink)] px-4 py-18 sm:px-6 lg:px-8">
      <div className="sticky top-0 mx-auto flex h-[100dvh] max-w-7xl items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,46,0,0.26) 0%, transparent 58%)', backgroundPosition: bgPosition, opacity: bgOpacity }} />

        <div className="absolute inset-0 overflow-hidden">
          <ParticleMark progress={progress} left="16%" top="20%" size="8px" color="var(--color-toxic)" driftX={20} driftY={26} rotateMax={18} opacityRange={[0.12, 0.45, 0.7, 0.16]} />
          <ParticleMark progress={progress} left="78%" top="18%" size="7px" color="var(--color-blaze)" driftX={-16} driftY={18} rotateMax={-16} opacityRange={[0.12, 0.42, 0.7, 0.16]} />
          <ParticleMark progress={progress} left="72%" top="72%" size="10px" color="rgba(247, 241, 220, 0.7)" driftX={-14} driftY={-24} rotateMax={12} opacityRange={[0.08, 0.4, 0.7, 0.1]} />
          <ParticleMark progress={progress} left="24%" top="74%" size="6px" color="var(--color-toxic)" driftX={18} driftY={-18} rotateMax={-10} opacityRange={[0.06, 0.36, 0.64, 0.1]} />
          <ParticleMark progress={progress} left="58%" top="34%" size="9px" color="var(--color-blaze)" driftX={-12} driftY={12} rotateMax={14} opacityRange={[0.1, 0.4, 0.68, 0.12]} />
          <ParticleMark progress={progress} left="30%" top="40%" size="5px" color="rgba(247, 241, 220, 0.8)" driftX={16} driftY={-12} rotateMax={-8} opacityRange={[0.08, 0.36, 0.65, 0.1]} />
        </div>

        <motion.div
          style={{ x: springX, y: springY, rotate: springRotate, scale: springScale, opacity: springOpacity }}
          className="absolute left-0 top-0 z-20 flex h-[62vh] w-[min(24rem,76vw)] items-center justify-center overflow-visible sm:w-[min(28rem,70vw)]"
        >
          <div className="relative h-full w-full overflow-visible p-0">
            <motion.div style={{ opacity: frontOpacity }} className="absolute inset-0">
              <GarmentArt view="front" imageOnly={true} imageSrc={garmentImage} />
            </motion.div>
            <motion.div style={{ opacity: detailOpacity, scale: 1.03, y: -6 }} className="absolute inset-0">
              <GarmentArt view="detail" imageOnly={true} imageSrc={garmentImage} />
            </motion.div>
            <motion.div style={{ opacity: backOpacity, scale: 0.98 }} className="absolute inset-0">
              <GarmentArt view="back" imageOnly={true} imageSrc={garmentImage} />
            </motion.div>
          </div>
        </motion.div>

        <div className="relative z-10 ml-auto max-w-md space-y-10">
          {textBlocks.map((moment) => (
            <motion.div
              key={moment.label}
              initial={false}
              style={{ opacity: moment.opacity, y: moment.y, scale: moment.scale }}
              transition={{ duration: 0.2 }}
              className="border border-[var(--color-bone)]/20 bg-[var(--color-surface)]/90 p-6"
            >
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.35em]" style={{ color: moment.labelColor }}>
                {moment.label}
              </p>
              <p className="mt-3 font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/80">{moment.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GarmentSequence
