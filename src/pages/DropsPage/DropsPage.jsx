import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import RevealText from '../../components/RevealText'

const drops = [
  { id: '001', title: 'First Cut', date: 'APR 08', count: 18, status: 'ARCHIVED', color: '#2A2A2A' },
  { id: '002', title: 'Night Break', date: 'JUN 19', count: 24, status: 'SOLD OUT', color: '#1A1A1A' },
  { id: '003', title: 'Static Pulse', date: 'JUL 30', count: 12, status: 'ARCHIVED', color: '#1C0A00' },
  { id: '004', title: 'Riot Reframe', date: 'AUG 14', count: 12, status: 'LIVE NOW', color: '#0D1A00' },
]

function DropsPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <main ref={containerRef} className="min-h-screen bg-[var(--color-ink)] px-4 py-28 text-[var(--color-bone)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <RevealText direction="up">
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
              DROP CHRONICLE
            </p>
          </RevealText>
          <RevealText direction="up" delay={0.1}>
            <h1 className="font-anton text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[0.92]">
              Each release is a chapter in the spray-stained archive.
            </h1>
          </RevealText>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-6 lg:left-8 top-0 bottom-0 w-px bg-[var(--color-bone)]/10">
            <motion.div
              className="absolute top-0 left-0 w-full origin-top bg-gradient-to-b from-[var(--color-blaze)] via-[var(--color-toxic)] to-[var(--color-blaze)]"
              style={{ height: '100%', scaleY: lineScale }}
            />
          </div>

          <div className="space-y-0">
            {drops.map((drop, index) => (
              <motion.article
                key={drop.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-14 sm:pl-18 lg:pl-24 pb-16 last:pb-0"
              >
                {/* Dot */}
                <div className="absolute left-4 sm:left-6 lg:left-8 top-6 -translate-x-1/2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                      drop.status === 'LIVE NOW'
                        ? 'border-[var(--color-toxic)] bg-[var(--color-toxic)]'
                        : 'border-[var(--color-blaze)] bg-[var(--color-ink)]'
                    }`}
                  />
                  {drop.status === 'LIVE NOW' && (
                    <div className="absolute inset-0 rounded-full bg-[var(--color-toxic)] animate-ping opacity-30" />
                  )}
                </div>

                {/* Content card */}
                <div className="group relative overflow-hidden border border-[var(--color-bone)]/15 bg-[var(--color-surface)] transition-all duration-500 hover:border-[var(--color-blaze)]/30">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--color-blaze)] via-[var(--color-toxic)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="grid gap-6 p-6 lg:grid-cols-[0.5fr_1fr_0.4fr] lg:items-center lg:p-8">
                    {/* ID & Title */}
                    <div>
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                        DROP {drop.id}
                      </p>
                      <h2 className="mt-3 font-anton text-3xl sm:text-4xl uppercase tracking-[0.04em]">
                        {drop.title}
                      </h2>
                    </div>

                    {/* Meta */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 mb-1">Date</p>
                        <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">{drop.date}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 mb-1">Pieces</p>
                        <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">{drop.count}</p>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="font-sans text-[0.9rem] leading-6 text-[var(--color-bone)]/60">
                          A raw run built around a specific color story, sound, and street context.
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center lg:justify-end">
                      <span
                        className={`inline-flex px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.3em] ${
                          drop.status === 'LIVE NOW'
                            ? 'bg-[var(--color-toxic)] text-[var(--color-ink)]'
                            : drop.status === 'SOLD OUT'
                              ? 'bg-[var(--color-blaze)] text-[var(--color-ink)]'
                              : 'border border-[var(--color-bone)]/20 text-[var(--color-bone)]/70'
                        }`}
                      >
                        {drop.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar for live drop */}
                  {drop.status === 'LIVE NOW' && (
                    <div className="mx-6 lg:mx-8 mb-6 lg:mb-8">
                      <div className="h-1 w-full bg-[var(--color-bone)]/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[var(--color-blaze)] to-[var(--color-toxic)]"
                          initial={{ width: '0%' }}
                          whileInView={{ width: '72%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                        />
                      </div>
                      <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
                        72% SOLD — ACT FAST
                      </p>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default DropsPage
