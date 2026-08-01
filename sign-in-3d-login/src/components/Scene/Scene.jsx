import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Character } from '../Character/Character'
import { SpeechBubble } from '../SpeechBubble/SpeechBubble'
import { LoginForm3D } from '../LoginForm/LoginForm3D'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useResponsiveViewport } from '../../hooks/useResponsiveViewport'
import { sceneConfig, timeline } from '../../config/theme'
import styles from './Scene.module.css'

const INITIAL_STORY_STATE = {
  formX: timeline.formRestX,
  isFormAttached: false,
  isFormReleased: false,
  isBubbleVisible: false,
  bubbleX: timeline.walkIn.fromX,
  bubbleText: '',
}

/**
 * Composes the full WebGL experience: lighting, the animated character,
 * the delivered login form, and the DOM affordances layered on top
 * (skip-intro button, live-announced status) that make the scene
 * accessible without watching every second of the intro.
 */
export function Scene({ onSubmit }) {
  const prefersReducedMotion = useReducedMotion()
  const { isMobile, isSmallMobile } = useResponsiveViewport()
  const [story, setStory] = useState(INITIAL_STORY_STATE)
  const [skipRequested, setSkipRequested] = useState(false)

  const skipIntro = prefersReducedMotion || skipRequested
  const camera = isSmallMobile
    ? sceneConfig.cameraSmallMobile
    : isMobile
      ? sceneConfig.cameraMobile
      : sceneConfig.camera

  const htmlScale = isSmallMobile ? 0.135 : isMobile ? 0.16 : 0.175

  return (
    <div className={styles.stage}>
      {!story.isFormReleased && !skipIntro && (
        <button
          type="button"
          className={styles.skipButton}
          onClick={() => setSkipRequested(true)}
        >
          Skip intro
        </button>
      )}

      {/* Announces the character's dialogue and form availability */}
      <div className={styles.liveRegion} role="status" aria-live="polite">
        {story.isFormReleased ? 'Sign-in form is ready.' : story.bubbleText}
      </div>

      <Canvas
        shadows
        camera={camera}
        className={styles.canvas}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={sceneConfig.lights.ambient.intensity} />
        <directionalLight
          position={sceneConfig.lights.key.position}
          intensity={sceneConfig.lights.key.intensity}
          castShadow
          shadow-mapSize-width={sceneConfig.lights.key.shadowMapSize}
          shadow-mapSize-height={sceneConfig.lights.key.shadowMapSize}
          shadow-bias={sceneConfig.lights.key.shadowBias}
        />
        <directionalLight
          position={sceneConfig.lights.fill.position}
          intensity={sceneConfig.lights.fill.intensity}
          color={sceneConfig.lights.fill.color}
        />
        <pointLight
          position={sceneConfig.lights.point.position}
          intensity={sceneConfig.lights.point.intensity}
          color={sceneConfig.lights.point.color}
        />

        <Suspense fallback={null}>
          <Character skipIntro={skipIntro} onStoryUpdate={setStory} />

          <SpeechBubble
            visible={story.isBubbleVisible}
            positionX={story.bubbleX}
            text={story.bubbleText}
          />

          <LoginForm3D
            positionX={story.formX}
            isAttached={story.isFormAttached}
            isReleased={story.isFormReleased}
            htmlScale={htmlScale}
            onSubmit={onSubmit}
          />

          <ContactShadows {...sceneConfig.contactShadows} />

          <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 10]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
        </Suspense>

        <OrbitControls {...sceneConfig.orbitControls} />
      </Canvas>
    </div>
  )
}
