import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { LoginForm } from './LoginForm'
import { theme } from '../../config/theme'
import styles from './LoginForm3D.module.css'

/**
 * Two-layer glass card in 3D space: an inner obsidian face and a glowing
 * rim behind it, carrying the real HTML `LoginForm` on its front face via
 * drei's `Html` (so it stays a fully accessible, tabbable DOM form even
 * though it's rendered inside the WebGL scene).
 */
export function LoginForm3D({ positionX, isAttached, isReleased, htmlScale, onSubmit }) {
  const groupRef = useRef()

  const faceMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: theme.color.cardFace,
        roughness: 0.18,
        metalness: 0.38,
      }),
    [],
  )

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return
    group.position.x = positionX
    faceMaterial.color.set(isReleased ? theme.color.cardFaceActive : theme.color.cardFace)

    if (isReleased) {
      const hover = Math.sin(state.clock.getElapsedTime() * 2.2) * 0.025
      group.position.y = 1.15 + hover
    } else {
      group.position.y = 1.15
    }
  })

  const rimColor = isAttached
    ? theme.color.cardRimAttached
    : isReleased
      ? theme.color.cardRimReleased
      : theme.color.cardRimIdle

  return (
    <group ref={groupRef} position={[positionX, 1.15, 0]}>
      {/* Layer 1 — inner glass face */}
      <RoundedBox
        args={[2.0, 2.15, 0.1]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
        material={faceMaterial}
      >
        {null}
      </RoundedBox>

      {/* Layer 2 — glowing rim / backplate */}
      <RoundedBox args={[2.06, 2.21, 0.06]} radius={0.11} smoothness={4} position={[0, 0, -0.04]}>
        <meshBasicMaterial color={rimColor} />
      </RoundedBox>

      <Html
        transform
        position={[0, 0, 0.052]}
        scale={htmlScale}
        className={styles.overlay}
        occlude={false}
      >
        <div className={styles.card} data-released={isReleased}>
          <LoginForm disabled={!isReleased} onSubmit={onSubmit} />
        </div>
      </Html>
    </group>
  )
}
