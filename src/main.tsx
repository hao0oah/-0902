import React, { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Unhandled runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>页面出现异常 / Application Error</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              {this.state.error?.message || '遇到未捕获的运行时错误，点击下方按钮重试。'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              刷新页面 (Reload Page)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

