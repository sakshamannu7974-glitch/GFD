import * as THREE from 'three'

const HIP_ROTATION_OFFSET = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  -Math.PI / 2,
)

/**
 * Normalizes an FBX (Mixamo-rigged) animation clip so its hip rotation and
 * translation match the coordinate space of the base character's Armature
 * (which is authored with a +90° X rotation). Without this, FBX clips play
 * back with the character lying on its side or sliding in the wrong plane.
 */
export function normalizeFBXClip(clip, name) {
  if (!clip) return null

  const normalized = clip.clone()
  normalized.name = name

  normalized.tracks.forEach((track) => {
    if (track.name.includes('Hips.quaternion') || track.name.includes('Hips.rotation')) {
      const { values } = track
      for (let i = 0; i < values.length; i += 4) {
        const rotation = new THREE.Quaternion().fromArray(values, i)
        rotation.premultiply(HIP_ROTATION_OFFSET)
        rotation.toArray(values, i)
      }
    } else if (track.name.includes('Hips.position')) {
      const { values } = track
      for (let i = 0; i < values.length; i += 3) {
        const [x, y, z] = [values[i], values[i + 1], values[i + 2]]
        values[i] = x
        values[i + 1] = z
        values[i + 2] = -y
      }
    }
  })

  return normalized
}

/** Builds the full, de-duplicated animation clip set the character rig needs. */
export function buildCharacterClips({ gltf, idleFbx, waveFbx, pullFbx, walkBackFbx, dwarfIdleFbx }) {
  const walkClip = gltf.animations[0]?.clone()
  if (walkClip) walkClip.name = 'Walk'

  return [
    walkClip,
    normalizeFBXClip(idleFbx.animations[0], 'Idle'),
    normalizeFBXClip(waveFbx.animations[0], 'Wave'),
    normalizeFBXClip(pullFbx.animations[0], 'Pull'),
    normalizeFBXClip(walkBackFbx.animations[0], 'WalkBackwards'),
    normalizeFBXClip(dwarfIdleFbx.animations[0], 'DwarfIdle'),
  ].filter(Boolean)
}
