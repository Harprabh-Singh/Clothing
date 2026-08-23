import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Exterior from './Exterior'
import Interior from './Interior'

/**
 * The virtual store flow:
 *   exterior  — futuristic storefront on the street, ENTER button
 *   interior  — camera has flown in; drops hang on rails, swipe to browse
 * The fly-in itself is choreographed inside Exterior; this component owns
 * the phase swap and the warm light flash that stitches the two scenes.
 */
function StoreExperience() {
  const [phase, setPhase] = useState('exterior')
  const flashRef = useRef(null)

  // Lock scroll while standing on the street / flying in
  useEffect(() => {
    if (phase !== 'interior') {
      window.scrollTo(0, 0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  const handleEntered = useCallback(() => {
    setPhase('interior')
    gsap.to(flashRef.current, { opacity: 0, duration: 1.3, ease: 'expo.out', delay: 0.25 })
  }, [])

  const handleExit = useCallback(() => {
    gsap.to(flashRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setPhase('exterior')
        gsap.to(flashRef.current, { opacity: 0, duration: 1, ease: 'expo.out', delay: 0.15 })
      },
    })
  }, [])

  return (
    <div className="relative">
      {phase === 'interior' ? (
        <Interior onExit={handleExit} />
      ) : (
        <Exterior flashRef={flashRef} onEntered={handleEntered} />
      )}

      {/* warm light flash bridging the two scenes */}
      <div
        ref={flashRef}
        className="pointer-events-none fixed inset-0 z-[90]"
        style={{
          opacity: 0,
          background: 'radial-gradient(circle at 50% 62%, #ff3ea5 0%, #2ee6ff 42%, #0a0710 100%)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}

export default StoreExperience
