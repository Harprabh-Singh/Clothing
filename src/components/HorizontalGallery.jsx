import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function HorizontalGallery({ items, title, subtitle }) {
  const containerRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const totalScroll = track.scrollWidth - window.innerWidth

    const tween = gsap.to(track, {
      x: -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${totalScroll}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      tween.kill()
    }
  }, [items])

  return (
    <section ref={containerRef} className="relative h-screen bg-[var(--color-ink)] overflow-hidden">
      <div className="absolute top-0 left-0 w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8 z-10">
        <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
          {subtitle}
        </p>
        <h2 className="font-anton text-[clamp(2rem,5vw,4rem)] uppercase leading-[0.95] text-[var(--color-bone)]">
          {title}
        </h2>
      </div>

      <div
        ref={trackRef}
        className="horizontal-scroll-container items-center h-full pt-40 pl-4 sm:pl-6 lg:pl-8 gap-6"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-[70vw] sm:w-[50vw] lg:w-[35vw] h-[60vh] group"
          >
            <div className="absolute inset-0 border border-[var(--color-bone)]/20 bg-[var(--color-surface)] overflow-hidden">
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ background: item.gradient }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(10,10,10,0.9)_100%)]" />

              <div className="absolute bottom-0 left-0 w-full p-6">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[var(--color-toxic)] mb-2">
                  {item.label}
                </p>
                <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-[0.04em] text-[var(--color-bone)]">
                  {item.title}
                </h3>
                <p className="mt-2 font-sans text-[0.9rem] leading-6 text-[var(--color-bone)]/70 max-w-sm">
                  {item.description}
                </p>
              </div>

              <div className="absolute top-4 right-4 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </div>
            </div>
          </div>
        ))}

        <div className="flex-shrink-0 w-[20vw]" />
      </div>
    </section>
  )
}

export default HorizontalGallery
