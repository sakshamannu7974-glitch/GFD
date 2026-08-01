import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useResponsiveViewport } from '../../hooks/useResponsiveViewport'
import styles from './SpeechBubble.module.css'

/**
 * Speech bubble anchored above the character's head. Purely decorative
 * (`aria-hidden`) — its messages are also announced through the live
 * region in `Scene` so screen reader users get the same information.
 */
export function SpeechBubble({ visible, positionX, text }) {
  const groupRef = useRef()
  const { isMobile, isSmallMobile } = useResponsiveViewport()

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.x = positionX
  })

  const bubbleY = isSmallMobile ? 2.15 : isMobile ? 2.25 : 2.35
  const bubbleScale = isSmallMobile ? 0.135 : isMobile ? 0.16 : 0.18

  return (
    <group ref={groupRef} position={[positionX, bubbleY, 0]}>
      <Html transform position={[0, 0, 0]} scale={bubbleScale} className={styles.wrapper}>
        <div
          aria-hidden="true"
          className={styles.bubble}
          data-visible={visible}
        >
          <span className={styles.text}>{text}</span>
          <div className={styles.tail} />
        </div>
      </Html>
    </group>
  )
}
