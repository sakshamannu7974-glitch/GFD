import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useFBX, useAnimations, OrbitControls, ContactShadows, RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

/* 
 * ── SYNCHRONIZED 3D CHARACTER & LOGIN FORM STORYLINE SYSTEM ──
 * Project: man login
 * Uses ONLY existing public models & FBX assets:
 *   - Untitled.glb (Character + Walk animation)
 *   - Breathing Idle.fbx
 *   - Waving.fbx
 *   - Pull Heavy Object.fbx
 *   - Walking Backwards.fbx
 *   - Dwarf Idle.fbx (Playing at the end when form is delivered!)
 *
 * Storyline Sequence (ONE-SHOT WITH 4-FRAME WARMUP SHIELD AGAINST T-POSE ON RELOAD):
 * 1. (`0.0s – 1.8s`): Character walks in smoothly from off-screen left (`x = -4.2` to `-1.2`). Form rests off-screen right (`x = 4.28`).
 * 2. (`1.8s – 4.4s`): Character STOPS walking, turns toward camera (`rotation.y = 0`), plays Waving (`Waving.fbx`),
 *                     and speech bubble #1 pops up (NO BLUE DOT): "Wait a second! Let me grab the login form for you! 👋"
 * 3. (`4.4s – 6.4s`): Character turns right (`+X`) and walks over (`x = -1.2` to `2.73`) right beside the peeking form (`x = 4.28`).
 * 4. (`6.4s – 12.0s`): Character plays authentic full-body `Pull Heavy Object.fbx` (`Pull`) animation!
 *                      His hands reach out, clamp down (`isAttached = true`), and his whole body strains leaning back,
 *                      continuously pulling the heavy form from off-screen (`x = 4.28`) all the way to center (`x = 0.0`).
 * 5. (`12.0s+ FOREVER`): Character releases form AT EXACT CENTER (`x = 0.0`), steps beside it (`x = -1.5`), plays `DwarfIdle` (`Dwarf Idle.fbx`),
 *                        and speech bubble #2 pops up above his head (NO BLUE DOT): "Here is your form! ✨"
 *                        It stays in Phase 5 continuously without ever looping or resetting until the browser is reloaded!
 */

// Preload existing model & animation assets
useGLTF.preload('models/Untitled.glb')
useFBX.preload('models/Breathing Idle.fbx')
useFBX.preload('models/Waving.fbx')
useFBX.preload('models/Pull Heavy Object.fbx')
useFBX.preload('models/Walking Backwards.fbx')
useFBX.preload('models/Dwarf Idle.fbx')

// Helper: Normalizes FBX animation clips (`mixamorigHips.quaternion` and `mixamorigHips.position`)
// to match Untitled.glb's root Armature coordinate space (+90° X Armature rotation).
function normalizeFBXClip(clip, name) {
  if (!clip) return null
  const cloned = clip.clone()
  cloned.name = name

  const qOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)

  cloned.tracks.forEach((track) => {
    if (track.name.includes('Hips.quaternion') || track.name.includes('Hips.rotation')) {
      const values = track.values
      for (let i = 0; i < values.length; i += 4) {
        const q = new THREE.Quaternion().fromArray(values, i)
        q.premultiply(qOffset)
        q.toArray(values, i)
      }
    } else if (track.name.includes('Hips.position')) {
      const values = track.values
      for (let i = 0; i < values.length; i += 3) {
        const x = values[i + 0]
        const y = values[i + 1]
        const z = values[i + 2]
        values[i + 0] = x
        values[i + 1] = z
        values[i + 2] = -y
      }
    }
  })

  return cloned
}

function Character({ onFormPositionUpdate, onFormReleaseState, onSpeechBubbleUpdate }) {
  const groupRef = useRef()
  const startTimeRef = useRef(null)
  const warmupFramesRef = useRef(0)

  // 1. Load existing assets
  const gltf = useGLTF('models/Untitled.glb')
  const idleFbx = useFBX('models/Breathing Idle.fbx')
  const waveFbx = useFBX('models/Waving.fbx')
  const pullFbx = useFBX('models/Pull Heavy Object.fbx')
  const walkBackFbx = useFBX('models/Walking Backwards.fbx')
  const dwarfIdleFbx = useFBX('models/Dwarf Idle.fbx')

  // 2. Prepare normalized animation clips array (`all full-body, authentic 100% model animations`)
  const clips = useMemo(() => {
    const walkClip = gltf.animations[0]?.clone()
    if (walkClip) walkClip.name = 'Walk'

    const idleClip = normalizeFBXClip(idleFbx.animations[0], 'Idle')
    const waveClip = normalizeFBXClip(waveFbx.animations[0], 'Wave')
    const pullClip = normalizeFBXClip(pullFbx.animations[0], 'Pull')
    const walkBackClip = normalizeFBXClip(walkBackFbx.animations[0], 'WalkBackwards')
    const dwarfIdleClip = normalizeFBXClip(dwarfIdleFbx.animations[0], 'DwarfIdle')

    return [walkClip, idleClip, waveClip, pullClip, walkBackClip, dwarfIdleClip].filter(Boolean)
  }, [gltf, idleFbx, waveFbx, pullFbx, walkBackFbx, dwarfIdleFbx])

  // 3. Initialize animation mixer and hooks
  const { actions, mixer } = useAnimations(clips, groupRef)
  const activeActionRef = useRef('')

  // Enhanced playAction: Direct play without crossfade delay when starting up (`!prevAction || prevName === ''`)
  const playAction = (name, fadeDuration = 0.35, timeScale = 1.0) => {
    if (!actions[name]) return

    const prevName = activeActionRef.current
    const nextAction = actions[name]
    const prevAction = prevName ? actions[prevName] : null

    if (activeActionRef.current === name) {
      nextAction.setEffectiveTimeScale(timeScale)
      return
    }

    nextAction.reset()
    nextAction.setEffectiveTimeScale(timeScale)
    nextAction.setEffectiveWeight(1.0)

    if (!prevAction || prevName === '') {
      nextAction.play()
    } else {
      nextAction.fadeIn(fadeDuration)
      nextAction.play()
      if (prevAction) prevAction.fadeOut(fadeDuration)
    }

    activeActionRef.current = name
  }

  // Ensure character model casts/receives shadows and materials look crisp
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

  // 4. Synchronized Storyline & Kinematics Engine (`useFrame`)
  useFrame((state, delta) => {
    if (!groupRef.current) return

    const initialFormX = 4.28 // Pushed off-screen right (`form thora sa aur screen sa bahar ho`)

    // ── 4-FRAME WARMUP SHIELD (10000% T-Pose & Slide Prevention on Reload) ──
    // Why did the character T-pose and slide right on reload? Because Three.js takes several frames after hydration
    // to bind bone hierarchies (`mixamorigLeftArm`, `mixamorigHips`) and pose them out of the default bind pose.
    // By keeping the character INVISIBLE (`visible = false`) and locked at `x = -4.2` for the first 4 render frames while
    // forcing `mixer.update()`, the skeleton fully deforms into `Walk` stride in the background BEFORE ever becoming visible!
    if (warmupFramesRef.current < 4) {
      groupRef.current.visible = false
      groupRef.current.position.x = -4.2
      groupRef.current.rotation.y = Math.PI / 2

      if (actions['Walk']) {
        actions['Walk'].reset()
        actions['Walk'].setEffectiveTimeScale(1.25)
        actions['Walk'].setEffectiveWeight(1.0)
        actions['Walk'].play()
        activeActionRef.current = 'Walk'
        if (mixer) mixer.update(0.03)
      }

      warmupFramesRef.current += 1
      startTimeRef.current = null
      onFormPositionUpdate(initialFormX, false)
      onFormReleaseState(false)
      onSpeechBubbleUpdate(false, -4.2, '')
      return
    }

    // Once 4 warmup frames have passed and bones are 100% in Walk stride, reveal the character and begin timeline!
    if (!groupRef.current.visible) {
      groupRef.current.visible = true
    }

    // Clamp delta against browser tab refocus/reload lag spikes
    const safeDelta = Math.min(delta, 0.05)

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.getElapsedTime()
    }

    // Local elapsed time since the character finished warmup and became visible (`time = 0.00s at start`)
    const time = state.clock.getElapsedTime() - startTimeRef.current

    if (time < 1.8) {
      /* Phase 1: Enter walking forward from off-screen left (`timeScale = 1.25`) */
      playAction('Walk', 0.2, 1.25)
      
      const progress = time / 1.8
      groupRef.current.position.x = THREE.MathUtils.lerp(-4.2, -1.2, progress)
      groupRef.current.position.z = 0
      groupRef.current.rotation.y = Math.PI / 2 // Facing right (+X)
      
      onFormPositionUpdate(initialFormX, false)
      onFormReleaseState(false)
      onSpeechBubbleUpdate(false, groupRef.current.position.x, '')

    } else if (time < 4.4) {
      /* Phase 2: STOP walking, face camera, wave, and show English speech dialog! */
      playAction('Wave', 0.3, 1.0)
      
      groupRef.current.position.x = -1.2
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.05, safeDelta * 6)
      
      onFormPositionUpdate(initialFormX, false)
      onFormReleaseState(false)
      onSpeechBubbleUpdate(true, -1.2, 'Wait a second! Let me grab the login form for you! 👋')

    } else if (time < 6.4) {
      /* Phase 3: Turn right toward form (`+X`) and walk over (`x = -1.2` to `2.73` -> timeScale = 1.3 to prevent sliding!) */
      playAction('Walk', 0.2, 1.3)
      
      const progress = (time - 4.4) / (6.4 - 4.4)
      groupRef.current.position.x = THREE.MathUtils.lerp(-1.2, 2.73, progress)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.PI / 2, safeDelta * 8)
      
      onFormPositionUpdate(initialFormX, false)
      onFormReleaseState(false)
      onSpeechBubbleUpdate(false, groupRef.current.position.x, '')

    } else if (time < 12.0) {
      /* Phase 4: REAL FULL-BODY GRAB & PULL (`Pull Heavy Object.fbx`) ALL THE WAY TO CENTER (`6.4s – 12.0s`)! */
      playAction('Pull', 0.25, 1.0)

      const totalPullProgress = (time - 6.4) / (12.0 - 6.4)

      // Character leans and steps backward from x = 2.73 down to x = -1.5
      const charX = THREE.MathUtils.lerp(2.73, -1.5, totalPullProgress)
      groupRef.current.position.x = charX
      groupRef.current.rotation.y = Math.PI / 2 // Facing right toward the form while pulling backward (-X)

      // Login form stays continuously locked to his hands (`charX + 1.55`) moving from x = 4.28 all the way to exact center (`x = 0.0`)!
      const formX = THREE.MathUtils.lerp(initialFormX, 0.0, totalPullProgress)
      onFormPositionUpdate(formX, true)
      onFormReleaseState(false)
      onSpeechBubbleUpdate(false, charX, '')

    } else {
      /* Phase 5 (12.0s+ FOREVER): Release form AT EXACT CENTER (`x = 0.0`), play `DwarfIdle`, and say "Here is your form!" indefinitely until reload! */
      playAction('DwarfIdle', 0.4, 1.0)
      
      groupRef.current.position.x = -1.5
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0.3, safeDelta * 4)

      onFormPositionUpdate(0.0, false)
      onFormReleaseState(true)
      onSpeechBubbleUpdate(true, -1.5, 'Aa gai surprise dekhne kya baat hai ✨')
    }
  })

  return (
    <group ref={groupRef} position={[-4.2, 0, 0]} scale={[1.0, 1.0, 1.0]} visible={false}>
      <primitive object={gltf.scene} />
    </group>
  )
}

// ── SPEECH BUBBLE COMPONENT (CLEAN & PURE: NO BLUE DOT AS REQUESTED) ──
function SpeechBubble({ visible, positionX, text }) {
  const bubbleRef = useRef()

  useFrame(() => {
    if (!bubbleRef.current) return
    bubbleRef.current.position.x = positionX
  })

  return (
    <group ref={bubbleRef} position={[positionX, 2.35, 0]}>
      <Html
        transform
        position={[0, 0, 0]}
        scale={0.18}
        className="speech-bubble-html"
      >
        <div style={{
          padding: '12px 20px',
          background: 'rgba(15, 18, 28, 0.96)',
          borderRadius: '24px',
          border: '1px solid rgba(138, 180, 248, 0.4)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.8), 0 0 20px rgba(138, 180, 248, 0.18)',
          color: '#FFFFFF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Blue dot removed completely ("blue dot htaw") */}
          <span style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '-0.2px', color: '#F8FAFC' }}>
            {text || 'Wait a second! Let me grab the login form for you! 👋'}
          </span>
          
          <div style={{
            position: 'absolute',
            bottom: '-7px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '13px',
            height: '13px',
            background: 'rgba(15, 18, 28, 0.96)',
            borderRight: '1px solid rgba(138, 180, 248, 0.4)',
            borderBottom: '1px solid rgba(138, 180, 248, 0.4)'
          }} />
        </div>
      </Html>
    </group>
  )
}

// ── 3D ULTRA-PREMIUM DUAL-LAYER LOGIN FORM (`wo layer rakhow bss 2 -> EXACTLY 2 clean layers!`) ──
function LoginForm({ positionX, isAttached, isReleased }) {
  const formGroupRef = useRef()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeField, setActiveField] = useState(null)

  useFrame((state) => {
    if (!formGroupRef.current) return
    formGroupRef.current.position.x = positionX

    if (isReleased) {
      const hover = Math.sin(state.clock.getElapsedTime() * 2.2) * 0.025
      formGroupRef.current.position.y = 1.15 + hover
    } else {
      formGroupRef.current.position.y = 1.15
    }
  })

  return (
    <group ref={formGroupRef} position={[positionX, 1.15, 0]}>
      {/* 
        LAYER 1: Inner Dark Obsidian Glass Card Face (`Front Layer`)
        Clean 0.1 depth right where the UI sits.
      */}
      <RoundedBox
        args={[2.0, 2.15, 0.1]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
        material={new THREE.MeshStandardMaterial({
          color: isReleased ? '#10131E' : '#0B0D14',
          roughness: 0.18,
          metalness: 0.38
        })}
      />

      {/* 
        LAYER 2: Outer Glowing Rim / Backplate (`Back Layer - exactly 2 layers as requested!`)
        Sits right behind Layer 1 (`z = -0.04`) to give that distinct, dual-layer glowing Apple frame (`wo layer rakhow bss 2`)!
      */}
      <RoundedBox
        args={[2.06, 2.21, 0.06]}
        radius={0.11}
        smoothness={4}
        position={[0, 0, -0.04]}
        material={new THREE.MeshBasicMaterial({
          color: isAttached ? '#60A5FA' : (isReleased ? '#3B82F6' : '#222736')
        })}
      />

      {/* Interactive Ultra-Premium HTML Login Overlay (`Welcome Back + Email + Password + Login Button`) */}
      <Html
        transform
        position={[0, 0, 0.052]}
        scale={0.175}
        className="login-form-html"
      >
        <div style={{
          width: '340px',
          padding: '32px 28px',
          background: 'rgba(16, 19, 30, 0.96)',
          borderRadius: '20px',
          border: 'none',
          boxShadow: 'none',
          color: '#FFFFFF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          pointerEvents: isReleased ? 'auto' : 'none',
          transition: 'all 0.35s ease',
          opacity: isReleased ? 1 : 0.88
        }}>
          {/* Stunning Welcome Back Title */}
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <h2 style={{
              margin: '0 0 6px 0',
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.6px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 35%, #60A5FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Aaja Aaja
            </h2>
            <div style={{
              height: '3px',
              width: '36px',
              background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
              borderRadius: '2px',
              margin: '0 auto'
            }} />
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeField === 'email' ? '#60A5FA' : '#CBD5E1',
              marginBottom: '8px',
              transition: 'color 0.2s ease'
            }}>
              <span>✉️</span> Email Address
            </label>
            <input
              type="email"
              placeholder="developer@codexr.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
              disabled={!isReleased}
              style={{
                width: '100%',
                padding: '13px 16px',
                background: activeField === 'email' ? 'rgba(15, 18, 28, 0.95)' : 'rgba(12, 14, 22, 0.8)',
                border: activeField === 'email' ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: isReleased ? 'text' : 'not-allowed',
                boxShadow: activeField === 'email' ? '0 0 0 3px rgba(96, 165, 250, 0.2), inset 0 2px 4px rgba(0,0,0,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeField === 'password' ? '#60A5FA' : '#CBD5E1',
              marginBottom: '8px',
              transition: 'color 0.2s ease'
            }}>
              <span>🔒</span> Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField(null)}
              disabled={!isReleased}
              style={{
                width: '100%',
                padding: '13px 16px',
                background: activeField === 'password' ? 'rgba(15, 18, 28, 0.95)' : 'rgba(12, 14, 22, 0.8)',
                border: activeField === 'password' ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: isReleased ? 'text' : 'not-allowed',
                boxShadow: activeField === 'password' ? '0 0 0 3px rgba(96, 165, 250, 0.2), inset 0 2px 4px rgba(0,0,0,0.5)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* High-Impact Glowing Login Button */}
          <button
            disabled={!isReleased}
            onClick={() => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!email || !emailRegex.test(email.trim())) {
                alert('Sahi email address dalo jaan! ✉️')
              } else if (password !== 'Annu@0325') {
                alert('Galat password hai jaan! Sahi password dalo 😉')
              } else {
                sessionStorage.setItem('authenticated', 'true')
                window.location.replace('../')
              }
            }}
            style={{
              width: '100%',
              padding: '15px',
              background: isReleased ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : '#22293A',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              cursor: isReleased ? 'pointer' : 'not-allowed',
              boxShadow: isReleased ? '0 8px 22px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (isReleased) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }
            }}
            onMouseOut={(e) => {
              if (isReleased) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
              }
            }}
          >
            Sign In
          </button>
        </div>
      </Html>
    </group>
  )
}

function App() {
  const [formPositionX, setFormPositionX] = useState(4.28)
  const [isFormAttached, setIsFormAttached] = useState(false)
  const [isFormReleased, setIsFormReleased] = useState(false)
  const [isBubbleVisible, setIsBubbleVisible] = useState(false)
  const [bubblePositionX, setBubblePositionX] = useState(-1.2)
  const [bubbleText, setBubbleText] = useState('')

  return (
    <main className="pure-black-stage">
      <Canvas
        shadows
        camera={{ position: [0, 1.45, 6.2], fov: 38 }}
        style={{ width: '100vw', height: '100vh', background: '#000000' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[5, 7, 6]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#89B3F8" />
        <pointLight position={[0, 4, 3]} intensity={0.6} color="#FFFFFF" />

        <Character
          onFormPositionUpdate={(x, attached) => {
            setFormPositionX(x)
            setIsFormAttached(attached)
          }}
          onFormReleaseState={(released) => {
            setIsFormReleased(released)
          }}
          onSpeechBubbleUpdate={(visible, x, text) => {
            setIsBubbleVisible(visible)
            setBubblePositionX(x)
            setBubbleText(text)
          }}
        />

        {/* Dynamic Speech Bubble above character's head (NO BLUE DOT) */}
        <SpeechBubble visible={isBubbleVisible} positionX={bubblePositionX} text={bubbleText} />

        {/* Dual-Layer Peeking & Dragged Login Form (`Welcome Back + Email + Password + Login`) */}
        <LoginForm
          positionX={formPositionX}
          isAttached={isFormAttached}
          isReleased={isFormReleased}
        />

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.75}
          scale={16}
          blur={1.8}
          far={1.5}
          resolution={1024}
          color="#000000"
        />

        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 10]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.04}
          minPolarAngle={Math.PI / 2 - 0.25}
          target={[0, 1.1, 0]}
        />
      </Canvas>
    </main>
  )
}

export default App
