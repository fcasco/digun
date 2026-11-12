import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class TerminalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Terminal Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#070b09', color: '#10b981', padding: '2rem', fontFamily: 'monospace' }}>
          <div style={{ maxWidth: '600px', margin: '40px auto', border: '1px solid #10b981', padding: '24px', borderRadius: '8px', background: '#0c1611' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>
              [SYSTEM ERROR] TERMINAL RECOVERY
            </h1>
            <p style={{ fontSize: '13px', color: '#a7b8af', marginBottom: '16px' }}>
              An unexpected error interrupted the articulation engine:
            </p>
            <pre style={{ background: '#050806', padding: '12px', borderRadius: '4px', fontSize: '12px', color: '#ef4444', overflowX: 'auto', marginBottom: '16px' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => {
                try { localStorage.clear(); } catch { /* ignore */ }
                window.location.reload();
              }}
              style={{ backgroundColor: '#10b981', color: '#050806', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              RESET ENGINE & RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TerminalErrorBoundary>
      <App />
    </TerminalErrorBoundary>
  </React.StrictMode>
);
