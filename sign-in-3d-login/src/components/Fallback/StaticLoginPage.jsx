import { LoginForm } from '../LoginForm/LoginForm'
import styles from './StaticLoginPage.module.css'

/**
 * Rendered instead of the 3D scene when WebGL isn't available. Same visual
 * language (obsidian glass card, blue accent glow) and the exact same
 * `LoginForm`, so functionality never depends on WebGL — only the
 * character-delivery flourish does.
 */
export function StaticLoginPage({ onSubmit }) {
  return (
    <div className={styles.stage}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card}>
        <LoginForm onSubmit={onSubmit} />
      </div>
    </div>
  )
}
