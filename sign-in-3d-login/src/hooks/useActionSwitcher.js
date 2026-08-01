import { useRef, useCallback } from 'react'

/**
 * Wraps a three.js AnimationAction map with a `playAction(name)` helper
 * that crossfades between clips instead of hard-cutting, and is a no-op
 * when the requested clip is already playing (avoids resetting the pose
 * every frame while a phase is in progress).
 */
export function useActionSwitcher(actions) {
  const activeNameRef = useRef('')

  const playAction = useCallback(
    (name, fadeDuration = 0.35, timeScale = 1.0) => {
      const nextAction = actions[name]
      if (!nextAction) return

      if (activeNameRef.current === name) {
        nextAction.setEffectiveTimeScale(timeScale)
        return
      }

      const previousAction = activeNameRef.current ? actions[activeNameRef.current] : null

      nextAction.reset()
      nextAction.setEffectiveTimeScale(timeScale)
      nextAction.setEffectiveWeight(1.0)

      if (previousAction) {
        nextAction.fadeIn(fadeDuration)
        nextAction.play()
        previousAction.fadeOut(fadeDuration)
      } else {
        nextAction.play()
      }

      activeNameRef.current = name
    },
    [actions],
  )

  return { playAction, activeNameRef }
}
