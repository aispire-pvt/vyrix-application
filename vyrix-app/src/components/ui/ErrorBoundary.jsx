import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black px-8 text-center">
          <p className="font-unbounded text-[22px] font-medium text-white">Something went wrong</p>
          <p className="max-w-md font-sf text-[14px] leading-relaxed text-[#a3a3a3]">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-xl bg-[#b2c5f2] px-6 py-2 font-sf text-[14px] font-bold text-[#0e1022] hover:bg-[#c5d4f5]"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="font-sf text-[13px] text-[#6b6b6b] hover:text-[#a3a3a3]"
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
