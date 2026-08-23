import { motion } from 'framer-motion'
import { useState } from 'react'
import RevealText from '../../../../components/RevealText'

function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!isValid) {
      setError('Enter a real email. No ghost addresses.')
      setSubmitted(false)
      return
    }

    setError('')
    setSubmitted(true)
  }

  return (
    <section id="contact" className="relative border-t border-[var(--color-bone)]/10 bg-[var(--color-ink)] px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(204,255,0,0.04),transparent_60%)] pointer-events-none translate-y-[-50%]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 border border-[var(--color-bone)]/10 bg-[var(--color-surface)] p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div className="flex flex-col justify-between">
            <div>
              <RevealText direction="up">
                <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                  JOIN THE LIST
                </p>
              </RevealText>
              <RevealText direction="up" delay={0.1}>
                <h2 className="font-anton text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.95] text-[var(--color-bone)]">
                  Don&apos;t miss the next drop when the street lights flicker.
                </h2>
              </RevealText>
            </div>
            <RevealText direction="up" delay={0.15}>
              <p className="mt-6 max-w-xl font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/70">
                We send the real notice: batch codes, launch times, and the occasional restock warning before the feed catches up.
              </p>
            </RevealText>
          </div>

          <RevealText direction="up" delay={0.2}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              <label htmlFor="email" className="font-mono text-[0.72rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/85">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) setError('')
                    if (submitted) setSubmitted(false)
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="you@signal.net"
                  className="w-full border-b-2 border-[var(--color-bone)]/20 bg-transparent px-0 py-4 font-mono text-[0.95rem] uppercase tracking-[0.22em] text-[var(--color-bone)] outline-none placeholder:text-[var(--color-bone)]/30 transition-colors duration-300 focus:border-[var(--color-blaze)]"
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-[var(--color-blaze)]"
                  initial={{ width: '0%' }}
                  animate={{ width: isFocused ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="group relative inline-flex items-center justify-center overflow-hidden border border-[var(--color-blaze)] px-6 py-3.5 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[var(--color-bone)] transition-colors duration-300 hover:text-[var(--color-ink)]"
                >
                  <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10">JOIN THE LIST</span>
                </motion.button>
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/50">
                  No spam. Just the drop.
                </span>
              </div>

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-sans text-[0.9rem] text-[var(--color-blaze)]"
                >
                  {error}
                </motion.p>
              ) : null}
              {submitted ? (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-sans text-[0.9rem] text-[var(--color-toxic)]"
                >
                  You&apos;re on the list. The next drop will hit fast.
                </motion.p>
              ) : null}
            </form>
          </RevealText>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
