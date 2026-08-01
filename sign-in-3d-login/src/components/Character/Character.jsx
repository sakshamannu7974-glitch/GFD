import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useFBX, useAnimations } from '@react-three/drei'
import { buildCharacterClips } from '../../utils/animationClips'
import { useActionSwitcher } from '../../hooks/useActionSwitcher'
import { useCharacterStoryline } from '../../hooks/useCharacterStoryline'
import { timeline } from '../../config/theme'

const MODEL_PATHS = {
  character: 'models/character.glb',
  idle: 'models/breathing-idle.fbx',
  wave: 'models/waving.fbx',
  pull: 'models/pull-heavy-object.fbx',
  walkBack: 'models/walking-backwards.fbx',
  dwarfIdle: 'models/dwarf-idle.fbx',
}

// Preload every asset the storyline needs as soon as this module loads,
// so the intro plays back without hitches once the Canvas mounts.
useGLTF.preload(MODEL_PATHS.character)
useFBX.preload(MODEL_PATHS.idle)
useFBX.preload(MODEL_PATHS.wave)
useFBX.preload(MODEL_PATHS.pull)
useFBX.preload(MODEL_PATHS.walkBack)
useFBX.preload(MODEL_PATHS.dwarfIdle)

/**
 * Animated 3D character driven by `useCharacterStoryline`.
 * Handles mesh setup (shadow casting/receiving) and forwards
 * story state (form position, dialogue text) up to the parent `Scene`.
 */
export function Character({ skipIntro, onStoryUpdate }) {
  const groupRef = useRef()

  const gltf = useGLTF(MODEL_PATHS.character)
  const idleFbx = useFBX(MODEL_PATHS.idle)
  const waveFbx = useFBX(MODEL_PATHS.wave)
  const pullFbx = useFBX(MODEL_PATHS.pull)
  const walkBackFbx = useFBX(MODEL_PATHS.walkBack)
  const dwarfIdleFbx = useFBX(MODEL_PATHS.dwarfIdle)

  const clips = useMemo(
    () =>
      buildCharacterClips({
        gltf,
        idleFbx,
        waveFbx,
        pullFbx,
        walkBackFbx,
        dwarfIdleFbx,
      }),
    [gltf, idleFbx, waveFbx, pullFbx, walkBackFbx, dwarfIdleFbx],
  )

  const { actions } = useAnimations(clips, groupRef)
  const { playAction } = useActionSwitcher(actions)

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [gltf.scene])

  useCharacterStoryline({
    groupRef,
    playAction,
    skipIntro,
    onUpdate: onStoryUpdate,
  })

  return (
    <group ref={groupRef} position={[timeline.walkIn.fromX, 0, 0]} visible={false}>
      <primitive object={gltf.scene} />
    </group>
  )
}
