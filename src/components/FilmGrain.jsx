import { useEffect, useRef } from 'react'

function FilmGrain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    let animationId
    let isVisible = true

    // Render at quarter resolution for performance, upscale with CSS
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    const scale = 0.5

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * scale)
      canvas.height = Math.floor(window.innerHeight * scale)
    }

    resize()
    window.addEventListener('resize', resize)

    // Pre-allocate image data buffer
    let imageData = null

    const generateNoise = () => {
      const w = canvas.width
      const h = canvas.height

      if (!imageData || imageData.width !== w || imageData.height !== h) {
        imageData = ctx.createImageData(w, h)
      }

      const data = imageData.data
      const len = data.length

      for (let i = 0; i < len; i += 4) {
        const v = Math.random() * 255
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }

      ctx.putImageData(imageData, 0, 0)
    }

    // ~10fps throttled
    let lastTime = 0
    const interval = 100

    const throttledAnimate = (currentTime) => {
      animationId = requestAnimationFrame(throttledAnimate)
      if (!isVisible) return
      if (currentTime - lastTime < interval) return
      lastTime = currentTime
      generateNoise()
    }

    animationId = requestAnimationFrame(throttledAnimate)

    // Pause when tab is hidden
    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="noise-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.035,
        imageRendering: 'auto',
      }}
      aria-hidden="true"
    />
  )
}

export default FilmGrain
