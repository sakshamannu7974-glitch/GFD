import styles from './LoadingScreen.module.css'

/**
 * Minimal, dependency-free loading state — deliberately built from plain
 * CSS (no extra JS chunk) so it can paint the instant the initial HTML
 * arrives, before React or the 3D bundle have even finished downloading.
 */
export function LoadingScreen({ progress }) {
  return (
    <div className={styles.stage} role="status" aria-live="polite">
      <div className={styles.mark} aria-hidden="true">
        <span className={styles.ring} />
      </div>
      <p className={styles.label}>
        Loading experience{typeof progress === 'number' ? ` — ${Math.round(progress)}%` : '…'}
      </p>
    </div>
  )
}
