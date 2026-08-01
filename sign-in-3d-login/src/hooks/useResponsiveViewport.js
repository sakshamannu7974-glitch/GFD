import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768
const SMALL_MOBILE_BREAKPOINT = 480

function getViewport() {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 800, isMobile: false, isSmallMobile: false }
  }
  const width = window.innerWidth
  const height = window.innerHeight
  return {
    width,
    height,
    isMobile: width < MOBILE_BREAKPOINT,
    isSmallMobile: width < SMALL_MOBILE_BREAKPOINT,
  }
}

/**
 * Lightweight, debounced viewport tracker so the 3D scene can pick a
 * camera framing and HTML-overlay scale appropriate for the device
 * without re-rendering on every pixel of a resize.
 */
export function useResponsiveViewport() {
  const [viewport, setViewport] = useState(getViewport)

  useEffect(() => {
    let frame = null
    const handleResize = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setViewport(getViewport()))
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return viewport
}
