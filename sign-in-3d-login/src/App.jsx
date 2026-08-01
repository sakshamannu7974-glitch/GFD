import { lazy, Suspense, useCallback } from 'react'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'
import { StaticLoginPage } from './components/Fallback/StaticLoginPage'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { useWebGLSupport } from './hooks/useWebGLSupport'
import './styles/global.css'

// The 3D scene pulls in three.js + @react-three/fiber + drei — by far the
// heaviest part of the bundle. Loading it as its own chunk means the very
// first paint (this shell + the loading screen) ships in a tiny bundle,
// and the 3D chunk streams in on top of it.
const Scene = lazy(() => import('./components/Scene/Scene').then((m) => ({ default: m.Scene })))

/**
 * Demo sign-in handler. Swap this out for a real API call — the contract
 * (`credentials, finish`) is the only thing `LoginForm` depends on.
 */
function handleDemoSubmit(_credentials, finish) {
  window.setTimeout(() => finish(true), 900)
}

export default function App() {
  const isWebGLSupported = useWebGLSupport()
  const onSubmit = useCallback((credentials, finish) => handleDemoSubmit(credentials, finish), [])

  return (
    <main className="app-shell">
      <a href="#email" className="skip-link">
        Skip to sign-in form
      </a>
      <h1 className="visually-hidden">Sign in to your account</h1>

      {isWebGLSupported ? (
        <ErrorBoundary fallback={<StaticLoginPage onSubmit={onSubmit} />}>
          <Suspense fallback={<LoadingScreen />}>
            <Scene onSubmit={onSubmit} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <StaticLoginPage onSubmit={onSubmit} />
      )}
    </main>
  )
}
