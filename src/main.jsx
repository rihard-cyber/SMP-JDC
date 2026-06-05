import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0f19', color: '#f8fafc', fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
          <img src="logo.png" alt="SMPJDC" style={{ width: '80px', opacity: 0.5 }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Terjadi Kesalahan</h1>
          <p style={{ color: '#94a3b8', maxWidth: '400px' }}>Aplikasi mengalami error. Silakan refresh halaman.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            Refresh Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
