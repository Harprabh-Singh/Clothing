import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}#$%&@!?'

function TextScramble({ text, className = '', as: Tag = 'span', delay = 0, duration = 1200, trigger = true }) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!trigger || hasAnimated.current) return
    hasAnimated.current = true

    const timeout = setTimeout(() => {
      setIsAnimating(true)
      const originalChars = text.split('')
      const totalFrames = Math.ceil(duration / 30)
      let frame = 0

      const interval = setInterval(() => {
        frame++
        const progress = frame / totalFrames

        const currentText = originalChars.map((char, i) => {
          if (char === ' ') return ' '
          const charProgress = i / originalChars.length
          if (progress > charProgress + 0.3) return char
          if (progress < charProgress) return CHARS[Math.floor(Math.random() * CHARS.length)]
          return Math.random() > 0.5 ? char : CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')

        setDisplayText(currentText)

        if (frame >= totalFrames) {
          clearInterval(interval)
          setDisplayText(text)
          setIsAnimating(false)
        }
      }, 30)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [trigger, text, delay, duration])

  return (
    <Tag className={`${className} ${isAnimating ? 'glitch-text active' : ''}`} data-text={displayText}>
      {displayText}
    </Tag>
  )
}

export default TextScramble
