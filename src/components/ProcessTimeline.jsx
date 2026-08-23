import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function ProcessTimeline() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  const itemsRef = useRef([])

  const steps = [
    {
      phase: '01',
      title: 'The Spark',
      description: 'Every drop starts as a sketch on a napkin, a Polaroid, or a beat. No brief. No mood board. Just a raw idea that needs to exist.',
      accent: 'var(--color-blaze)',
    },
    {
      phase: '02',
      title: 'The Cut',
      description: 'We produce in micro-runs. Every stitch is logged. Every piece carries a batch code that ties it to the moment it was made.',
      accent: 'var(--color-toxic)',
    },
    {
      phase: '03',
      title: 'The Drop',
      description: 'No countdown clocks. No restock promises. The release hits when it hits. First come, first served. No exceptions.',
      accent: 'var(--color-blaze)',
    },
    {
      phase: '04',
      title: 'The Archive',
      description: 'Once a run closes, the piece enters the archive. It becomes a memory, a reference, a ghost that haunts the next collection.',
      accent: 'var(--color-toxic)',
    },
  ]

  useEffect(() => {
    const section = sectionRef.current
    const line = lineRef.current
    if (!section || !line) return

    // Animate the progress line
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1,
        },
      }
    )

    // Animate each step
    itemsRef.current.forEach((item, index) => {
      if (!item) return

      gsap.fromTo(
        item,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          delay: index * 0.1,
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section || itemsRef.current.includes(t.trigger)) {
          t.kill()
        }
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative border-t border-[var(--color-bone)]/10 bg-[var(--color-ink)] px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
            FROM CONCEPT TO CONCRETE
          </p>
          <h2 className="font-anton text-[clamp(2rem,5vw,4rem)] uppercase leading-[0.95] text-[var(--color-bone)]">
            How the noise gets made.
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-8 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-px bg-[var(--color-bone)]/10">
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full origin-top"
              style={{ height: '100%', background: 'linear-gradient(180deg, var(--color-blaze), var(--color-toxic))' }}
            />
          </div>

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.phase}
                ref={(el) => { itemsRef.current[index] = el }}
                className={`relative flex flex-col gap-8 lg:flex-row lg:items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'}`}>
                  <div className={`inline-block border border-[var(--color-bone)]/20 bg-[var(--color-surface)] p-6 sm:p-8 ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                    <p
                      className="font-mono text-[0.7rem] uppercase tracking-[0.4em] mb-4"
                      style={{ color: step.accent }}
                    >
                      PHASE {step.phase}
                    </p>
                    <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-[0.04em] text-[var(--color-bone)] mb-4">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/70 max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Dot */}
                <div className="absolute left-4 sm:left-8 lg:left-1/2 lg:-translate-x-1/2 top-0 w-4 h-4">
                  <div
                    className="w-full h-full rounded-full border-2"
                    style={{ borderColor: step.accent, background: 'var(--color-ink)' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: step.accent }}
                  />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden lg:block lg:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProcessTimeline
