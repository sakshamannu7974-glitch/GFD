import { useState } from 'react'

function detectWebGL() {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}

/**
 * Detects whether the browser/device can render WebGL at all.
 * Older devices, some in-app browsers, and locked-down corporate
 * machines can't - those users get the CSS-only login form instead
 * of a blank black screen.
 *
 * Computed once via a lazy useState initializer (not an effect) so
 * there's no extra render pass and no server/client mismatch risk
 * beyond the synchronous first render itself.
 */
export function useWebGLSupport() {
  const [supported] = useState(detectWebGL)
  return supported
}
