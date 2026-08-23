import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '../../components/RevealText'

gsap.registerPlugin(ScrollTrigger)

function AboutPage() {
  const valuesRef = useRef(null)

  useEffect(() => {
    const el = valuesRef.current
    if (!el) return

    const cards = el.querySelectorAll('.value-card')
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--color-ink)] px-4 py-28 text-[var(--color-bone)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero section */}
        <section className="mb-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <RevealText direction="up">
            <div className="border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(255,46,0,0.08),transparent_70%)]" />
              <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                ABOUT VOLT/AGE
              </p>
              <h1 className="font-anton text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[0.92]">
                The label started as a flyer and kept the same pulse.
              </h1>
            </div>
          </RevealText>

          <RevealText direction="up" delay={0.1}>
            <div className="flex flex-col justify-center">
              <p className="font-sans text-[1.05rem] leading-8 text-[var(--color-bone)]/75">
                We began by stapling spray-painted posters onto poles, then turned that same urgency into a label. The pieces still carry the roughness of that first moment: compressed time, loud color, and a refusal to make everything available forever.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px w-12 bg-[var(--color-blaze)]" />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-blaze)]">
                  EST. 2021 / UNDERGROUND
                </span>
              </div>
            </div>
          </RevealText>
        </section>

        {/* Values grid */}
        <div ref={valuesRef} className="mb-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="value-card border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 transition-colors duration-500 hover:border-[var(--color-blaze)]/30">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)] mb-4">01</p>
            <h3 className="font-anton text-2xl uppercase tracking-[0.04em] mb-4">Small Runs</h3>
            <p className="font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/70">
              We never produce more than 24 pieces per drop. Most drops are 12. This keeps every release feeling like an event.
            </p>
          </div>

          <div className="value-card border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 transition-colors duration-500 hover:border-[var(--color-blaze)]/30">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)] mb-4">02</p>
            <h3 className="font-anton text-2xl uppercase tracking-[0.04em] mb-4">No Restocks</h3>
            <p className="font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/70">
              When a piece sells out, it enters the archive. No second waves. No surprise restocks. What's gone is gone.
            </p>
          </div>

          <div className="value-card border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 transition-colors duration-500 hover:border-[var(--color-blaze)]/30">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)] mb-4">03</p>
            <h3 className="font-anton text-2xl uppercase tracking-[0.04em] mb-4">Raw Energy</h3>
            <p className="font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/70">
              Every design starts as a hand sketch. No AI. No stock templates. Just raw ideas that need to exist.
            </p>
          </div>
        </div>

        {/* Manifesto & Process */}
        <div className="grid gap-5 lg:grid-cols-2">
          <RevealText direction="left">
            <div className="border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[radial-gradient(circle,rgba(204,255,0,0.06),transparent_70%)]" />
              <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                MANIFESTO
              </p>
              <p className="font-sans text-[1.05rem] leading-8 text-[var(--color-bone)]/80">
                We build for the people who know a drop is a moment, not a menu. If a piece sells out, it should leave a mark. If it comes back, it should feel like a second chance and not a default.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--color-blaze)] rotate-45" />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
                  NO COMPROMISE
                </span>
              </div>
            </div>
          </RevealText>

          <RevealText direction="right" delay={0.1}>
            <div className="border border-[var(--color-blaze)]/20 bg-[var(--color-surface)] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[radial-gradient(circle,rgba(255,46,0,0.06),transparent_70%)]" />
              <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                PROCESS
              </p>
              <p className="font-sans text-[1.05rem] leading-8 text-[var(--color-bone)]/80">
                A design starts as a flyer sketch, gets turned into a sample, then into a tight run. Every line is meant to hold the energy of a poster and the function of a garment.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--color-toxic)] rotate-45" />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
                  SKETCH → SAMPLE → RUN
                </span>
              </div>
            </div>
          </RevealText>
        </div>
      </div>
    </main>
  )
}

export default AboutPage
