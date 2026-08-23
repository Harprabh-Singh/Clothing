import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '../../../../components/RevealText'

gsap.registerPlugin(ScrollTrigger)

function AboutSection() {
  const imageRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const image = imageRef.current
    if (!image) return

    gsap.fromTo(
      image,
      { scale: 1.2, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: image,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, [])

  return (
    <section id="about" className="relative border-t border-[var(--color-bone)]/10 bg-[var(--color-surface)] px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background noise */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full">
          <filter id="about-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#about-noise)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left - Visual card */}
          <RevealText direction="left">
            <div className="relative overflow-hidden border border-[var(--color-bone)]/15">
              <div
                ref={imageRef}
                className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-blaze),var(--color-ink))]"
                style={{ opacity: 0 }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_40%)]" />

              <div className="relative flex min-h-[28rem] flex-col justify-between border border-[var(--color-bone)]/10 bg-[var(--color-ink)]/90 p-8 m-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                    FLYERS / STAPLES / DIGITAL AFTERLIFE
                  </p>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">
                    EST. 2021
                  </span>
                </div>

                <div>
                  <h2 className="font-anton text-3xl sm:text-4xl uppercase leading-[0.95] text-[var(--color-bone)]">
                    The brand was never<br />meant to be soft.
                  </h2>
                  <p className="mt-5 max-w-sm font-sans text-[0.96rem] leading-7 text-[var(--color-bone)]/75">
                    We started by stapling hand-drawn flyers onto poles, then learned how to move the same energy online.
                  </p>

                  {/* Decorative element */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-blaze)] to-transparent" />
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-blaze)]">
                      RAW / UNFILTERED / NOW
                    </span>
                  </div>
                </div>
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--color-blaze)]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--color-blaze)]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[var(--color-blaze)]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--color-blaze)]" />
            </div>
          </RevealText>

          {/* Right - Text content */}
          <div ref={textRef} className="flex flex-col justify-center">
            <RevealText direction="right" delay={0.1}>
              <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.35em] text-[var(--color-toxic)]">
                ABOUT THE LABEL
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.15}>
              <p className="mb-5 font-sans text-[1.05rem] leading-8 text-[var(--color-bone)]/85">
                VOLT/AGE stays loud because the city still is. We keep the cadence of a drop dirty and immediate: one run, one chance, one pulse of pressure before the next wave hits.
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.2}>
              <p className="mb-5 font-sans text-[1.05rem] leading-8 text-[var(--color-bone)]/85">
                Most pieces will never be restocked. That&apos;s not scarcity as theater. It&apos;s the point. When a jacket or tee is gone, it leaves a mark and a memory, the same way a flyer does after rain and traffic.
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.25}>
              <p className="font-sans text-[1.05rem] leading-8 text-[var(--color-bone)]/85">
                We build pieces that feel like they were made in the back of a warehouse, under bad lighting, with a needle in the air and a deadline snapped tight.
              </p>
            </RevealText>

            <RevealText direction="right" delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="border border-[var(--color-bone)]/15 px-5 py-3">
                  <p className="font-anton text-2xl text-[var(--color-bone)]">47+</p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50 mt-1">Drops</p>
                </div>
                <div className="border border-[var(--color-bone)]/15 px-5 py-3">
                  <p className="font-anton text-2xl text-[var(--color-bone)]">12</p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50 mt-1">Per Run</p>
                </div>
                <div className="border border-[var(--color-bone)]/15 px-5 py-3">
                  <p className="font-anton text-2xl text-[var(--color-bone)]">0</p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50 mt-1">Restocks</p>
                </div>
              </div>
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
