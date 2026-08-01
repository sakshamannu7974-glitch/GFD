import { Component } from 'react'

/**
 * Catches render/runtime errors from the 3D scene subtree (a corrupt model
 * download, a driver-level WebGL crash, etc.) and swaps in the caller's
 * fallback UI instead of leaving the visitor on a blank black screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Scene crashed, falling back to static login page:', error, info)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
