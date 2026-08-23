import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

function FooterSection() {
  const footerRef = useRef(null)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    gsap.fromTo(
      footer.querySelectorAll('.footer-col'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, [])

  return (
    <footer ref={footerRef} className="relative border-t border-[var(--color-bone)]/10 bg-[var(--color-ink)] px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-blaze)]/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-8">
          {/* Brand column */}
          <div className="footer-col">
            <Link to="/" className="inline-block">
              <p className="font-anton text-2xl uppercase tracking-[0.15em] text-[var(--color-bone)]">VOLT/AGE</p>
            </Link>
            <p className="mt-4 max-w-xs font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/60">
              Loud graphics. Small runs. Streetborn energy in every release. Born from flyers, built for the archive.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-8 bg-[var(--color-blaze)]" />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-blaze)]">EST. 2021</span>
            </div>
          </div>

          {/* Social */}
          <div className="footer-col">
            <p className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/50">SOCIAL</p>
            <ul className="space-y-3">
              {['INSTAGRAM', 'TIKTOK', 'X', 'DISCORD'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-2 font-mono text-[0.82rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/70 transition-colors duration-300 hover:text-[var(--color-blaze)]"
                  >
                    <span className="w-0 h-px bg-[var(--color-blaze)] transition-all duration-300 group-hover:w-3" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="footer-col">
            <p className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/50">INFO</p>
            <ul className="space-y-3">
              {['SIZE GUIDE', 'SHIPPING', 'RETURNS', 'PRIVACY'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-2 font-mono text-[0.82rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/70 transition-colors duration-300 hover:text-[var(--color-blaze)]"
                  >
                    <span className="w-0 h-px bg-[var(--color-blaze)] transition-all duration-300 group-hover:w-3" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <p className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/50">CONTACT</p>
            <div className="space-y-3 font-mono text-[0.82rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/70">
              <p className="text-[var(--color-toxic)]">hello@voltage.ltd</p>
              <p className="text-[var(--color-bone)]/50 text-[0.72rem]">FOR WHOLESALE / PRESS</p>
            </div>

            <div className="mt-6 border border-[var(--color-bone)]/15 px-4 py-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">NEXT DROP</p>
              <p className="mt-1 font-anton text-xl text-[var(--color-bone)]">AUG 14</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--color-bone)]/10 pt-8 text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 VOLT/AGE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>DROP 004</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-blaze)]" />
            <span>12 PIECES</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-blaze)]" />
            <span className="text-[var(--color-toxic)]">LIMITED RELEASING</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
