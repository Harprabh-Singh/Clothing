import { motion, useScroll, useSpring } from 'framer-motion'

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[100] h-1 origin-left bg-[var(--color-blaze)]"
      style={{ scaleX }}
    />
  )
}

export default ScrollProgress
