import { motion } from 'framer-motion'
import { useState } from 'react'
import RevealText from '../../components/RevealText'

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('All fields need a signal.')
      setSubmitted(false)
      return
    }
    if (!emailPattern.test(form.email)) {
      setError('That email address is not in the system.')
      setSubmitted(false)
      return
    }
    setError('')
    setSubmitted(true)
  }

  const fields = [
    { key: 'name', label: 'NAME', type: 'text', placeholder: 'YOUR NAME' },
    { key: 'email', label: 'EMAIL', type: 'email', placeholder: 'you@signal.net' },
    { key: 'subject', label: 'SUBJECT', type: 'text', placeholder: 'WHAT IS THIS ABOUT' },
  ]

  return (
    <main className="min-h-screen bg-[var(--color-ink)] px-4 py-28 text-[var(--color-bone)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left - Info */}
          <RevealText direction="left">
            <div className="border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(255,46,0,0.06),transparent_70%)]" />

              <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-toxic)]">
                CONTACT
              </p>
              <h1 className="font-anton text-[clamp(2.2rem,4vw,3.5rem)] uppercase leading-[0.92]">
                Send the signal. We&apos;ll answer when the line is live.
              </h1>
              <p className="mt-6 max-w-md font-sans text-[0.95rem] leading-7 text-[var(--color-bone)]/70">
                For wholesale, press, or a drop question, use the form or reach out directly.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-px bg-[var(--color-blaze)] transition-all duration-300 group-hover:w-12" />
                  <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">
                    hello@voltage.ltd
                  </p>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-px bg-[var(--color-blaze)]/50 transition-all duration-300 group-hover:w-12" />
                  <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">
                    INSTAGRAM / @voltage
                  </p>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-px bg-[var(--color-blaze)]/50 transition-all duration-300 group-hover:w-12" />
                  <p className="font-mono text-[0.8rem] uppercase tracking-[0.25em] text-[var(--color-bone)]/80">
                    DROP ALERTS / NEWSLETTER
                  </p>
                </div>
              </div>

              {/* Decorative */}
              <div className="mt-12 border border-[var(--color-bone)]/10 p-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-bone)]/40 mb-2">
                  RESPONSE TIME
                </p>
                <p className="font-anton text-2xl uppercase text-[var(--color-bone)]">
                  24-48 HOURS
                </p>
              </div>
            </div>
          </RevealText>

          {/* Right - Form */}
          <RevealText direction="right" delay={0.1}>
            <motion.form
              onSubmit={handleSubmit}
              className="border border-[var(--color-bone)]/15 bg-[var(--color-surface)] p-8 lg:p-10"
              noValidate
            >
              <div className="grid gap-6">
                {fields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/70">
                      {field.label}
                    </span>
                    <div className="relative mt-2">
                      <input
                        type={field.type}
                        value={form[field.key]}
                        onChange={(event) =>
                          setForm({ ...form, [field.key]: event.target.value })
                        }
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={field.placeholder}
                        className="w-full border-b-2 border-[var(--color-bone)]/15 bg-transparent px-0 py-3 font-mono text-[0.9rem] uppercase tracking-[0.2em] text-[var(--color-bone)] outline-none placeholder:text-[var(--color-bone)]/25 transition-colors duration-300 focus:border-[var(--color-blaze)]"
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-[var(--color-blaze)]"
                        initial={{ width: 0 }}
                        animate={{ width: focusedField === field.key ? '100%' : 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      />
                    </div>
                  </label>
                ))}

                <label className="block">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--color-bone)]/70">
                    MESSAGE
                  </span>
                  <div className="relative mt-2">
                    <textarea
                      value={form.message}
                      onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                      }
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      className="min-h-[8rem] w-full border-b-2 border-[var(--color-bone)]/15 bg-transparent px-0 py-3 font-sans text-[0.95rem] text-[var(--color-bone)] outline-none transition-colors duration-300 focus:border-[var(--color-blaze)] resize-none"
                    />
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-[var(--color-blaze)]"
                      initial={{ width: 0 }}
                      animate={{ width: focusedField === 'message' ? '100%' : 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </label>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 font-sans text-[0.9rem] text-[var(--color-blaze)]"
                >
                  {error}
                </motion.p>
              )}
              {submitted && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 font-sans text-[0.9rem] text-[var(--color-toxic)]"
                >
                  Message received. We&apos;ll hit back when the next drop opens.
                </motion.p>
              )}

              <button
                type="submit"
                className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden border border-[var(--color-blaze)] px-7 py-3.5 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[var(--color-bone)] transition-colors duration-300 hover:text-[var(--color-ink)]"
              >
                <span className="absolute inset-0 bg-[var(--color-blaze)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Send message</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </motion.form>
          </RevealText>
        </div>
      </div>
    </main>
  )
}

export default ContactPage
