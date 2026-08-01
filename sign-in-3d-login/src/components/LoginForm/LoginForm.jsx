import { useId, useState } from 'react'
import styles from './LoginForm.module.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Self-contained, validated sign-in form. No network call is wired up —
 * `onSubmit` receives the credentials and a `finish(success, message)`
 * callback so a real backend can be dropped in without touching markup.
 *
 * Fully keyboard operable and screen-reader friendly: real <label for>,
 * live-announced errors, and a visible focus state on every control.
 */
export function LoginForm({ disabled = false, onSubmit }) {
  // Fixed (not useId-generated) so the app shell's "skip to sign-in form"
  // link has a stable target — safe because only one LoginForm is ever
  // mounted at a time (the 3D card and the static fallback are mutually exclusive).
  const emailId = 'email'
  const passwordId = 'password'
  const errorId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success

  function validate() {
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Enter your password.'
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (disabled || status === 'submitting') return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')

    const finish = (success, message) => {
      setStatus(success ? 'success' : 'idle')
      if (!success && message) setErrors({ form: message })
    }

    if (onSubmit) {
      onSubmit({ email, password, rememberMe }, finish)
    } else {
      // No handler wired up (e.g. this is a design preview) — simulate one.
      window.setTimeout(() => finish(true), 900)
    }
  }

  const isBusy = status === 'submitting'
  const isDone = status === 'success'

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome Back</h2>
        <div className={styles.divider} aria-hidden="true" />
      </div>

      <div className={styles.field}>
        <label
          htmlFor={emailId}
          className={styles.label}
          data-active={email.length > 0}
        >
          Email address
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="developer@codexr.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? errorId : undefined}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.passwordRow}>
          <label htmlFor={passwordId} className={styles.label}>
            Password
          </label>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setShowPassword((v) => !v)}
            disabled={disabled}
            aria-pressed={showPassword}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          id={passwordId}
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? errorId : undefined}
          className={styles.input}
        />
      </div>

      <div className={styles.metaRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={disabled}
            className={styles.checkbox}
          />
          Remember me
        </label>
        <a href="#forgot-password" className={styles.linkButton}>
          Forgot password?
        </a>
      </div>

      <div id={errorId} role="alert" className={styles.errorText}>
        {errors.email || errors.password || errors.form || ''}
      </div>

      <button
        type="submit"
        disabled={disabled || isBusy}
        data-state={isDone ? 'success' : isBusy ? 'busy' : 'idle'}
        className={styles.submit}
      >
        {isDone ? 'Signed in ✓' : isBusy ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
