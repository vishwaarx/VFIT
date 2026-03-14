import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#050507',
          color: '#F8FAFC',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#FF4500' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px', textAlign: 'center', maxWidth: '400px' }}>
            {this.state.error?.message ?? 'Unknown error'}
          </p>
          <pre style={{
            fontSize: '11px',
            color: '#64748B',
            background: '#111116',
            padding: '12px',
            borderRadius: '8px',
            maxWidth: '90vw',
            overflow: 'auto',
            maxHeight: '200px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: '#FF4500',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
