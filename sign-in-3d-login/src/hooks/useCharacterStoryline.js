import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { timeline } from '../config/theme'

const WARMUP_FRAMES = 4 // frames spent posing the skeleton before it's revealed
const MAX_FRAME_DELTA = 0.05 // clamps delta spikes from tab refocus / slow frames

/**
 * Drives the five-phase intro storyline (walk in → greet → cross over →
 * pull the form → deliver & idle) by writing directly to the character
 * group's transform and animation state each frame, and reporting the
 * derived form position / speech bubble state up to the scene via callbacks.
 *
 * When `skipIntro` is true (reduced-motion preference or the user pressed
 * "Skip intro"), the character is placed straight into the resting Phase 5
 * pose so the form is immediately usable.
 */
export function useCharacterStoryline({ groupRef, playAction, skipIntro, onUpdate }) {
  const startTimeRef = useRef(null)
  const warmupFramesRef = useRef(0)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    // Reduced motion / skip: snap straight to the delivered resting pose.
    if (skipIntro) {
      group.visible = true
      group.position.x = timeline.delivered.charX
      group.rotation.y = 0.3
      playAction('DwarfIdle', 0.2, 1.0)
      onUpdate({
        formX: timeline.formCenterX,
        isFormAttached: false,
        isFormReleased: true,
        isBubbleVisible: true,
        bubbleX: timeline.delivered.charX,
        bubbleText: timeline.delivered.message,
      })
      return
    }

    // ── Warmup shield: pose the skeleton into the Walk stride while
    // invisible, so the very first visible frame is never a T-pose. ──
    if (warmupFramesRef.current < WARMUP_FRAMES) {
      group.visible = false
      group.position.x = timeline.walkIn.fromX
      group.rotation.y = Math.PI / 2
      playAction('Walk', 0, 1.25)
      warmupFramesRef.current += 1
      startTimeRef.current = null
      onUpdate({
        formX: timeline.formRestX,
        isFormAttached: false,
        isFormReleased: false,
        isBubbleVisible: false,
        bubbleX: timeline.walkIn.fromX,
        bubbleText: '',
      })
      return
    }

    if (!group.visible) group.visible = true

    const safeDelta = Math.min(delta, MAX_FRAME_DELTA)
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.getElapsedTime()
    }
    const t = state.clock.getElapsedTime() - startTimeRef.current

    if (t < timeline.walkIn.end) {
      // Phase 1 — walk on from off-screen left.
      playAction('Walk', 0.2, 1.25)
      const progress = t / timeline.walkIn.end
      group.position.x = THREE.MathUtils.lerp(timeline.walkIn.fromX, timeline.walkIn.toX, progress)
      group.rotation.y = Math.PI / 2
      onUpdate({
        formX: timeline.formRestX,
        isFormAttached: false,
        isFormReleased: false,
        isBubbleVisible: false,
        bubbleX: group.position.x,
        bubbleText: '',
      })
    } else if (t < timeline.greet.end) {
      // Phase 2 — stop, face camera, wave, greet.
      playAction('Wave', 0.3, 1.0)
      group.position.x = timeline.greet.x
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, 0.05, safeDelta * 6)
      onUpdate({
        formX: timeline.formRestX,
        isFormAttached: false,
        isFormReleased: false,
        isBubbleVisible: true,
        bubbleX: timeline.greet.x,
        bubbleText: timeline.greet.message,
      })
    } else if (t < timeline.crossOver.end) {
      // Phase 3 — turn and walk over toward the parked form.
      playAction('Walk', 0.2, 1.3)
      const progress = (t - timeline.crossOver.start) / (timeline.crossOver.end - timeline.crossOver.start)
      group.position.x = THREE.MathUtils.lerp(timeline.crossOver.fromX, timeline.crossOver.toX, progress)
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, Math.PI / 2, safeDelta * 8)
      onUpdate({
        formX: timeline.formRestX,
        isFormAttached: false,
        isFormReleased: false,
        isBubbleVisible: false,
        bubbleX: group.position.x,
        bubbleText: '',
      })
    } else if (t < timeline.pullForm.end) {
      // Phase 4 — grab and pull the form in to center.
      playAction('Pull', 0.25, 1.0)
      const progress = (t - timeline.pullForm.start) / (timeline.pullForm.end - timeline.pullForm.start)
      group.position.x = THREE.MathUtils.lerp(timeline.pullForm.fromCharX, timeline.pullForm.toCharX, progress)
      group.rotation.y = Math.PI / 2
      onUpdate({
        formX: THREE.MathUtils.lerp(timeline.formRestX, timeline.formCenterX, progress),
        isFormAttached: true,
        isFormReleased: false,
        isBubbleVisible: false,
        bubbleX: group.position.x,
        bubbleText: '',
      })
    } else {
      // Phase 5 — release the form and settle into idle, forever.
      playAction('DwarfIdle', 0.4, 1.0)
      group.position.x = timeline.delivered.charX
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, 0.3, safeDelta * 4)
      onUpdate({
        formX: timeline.formCenterX,
        isFormAttached: false,
        isFormReleased: true,
        isBubbleVisible: true,
        bubbleX: timeline.delivered.charX,
        bubbleText: timeline.delivered.message,
      })
    }
  })
}
