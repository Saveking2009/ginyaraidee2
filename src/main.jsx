import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register service worker for offline / installable PWA (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

// กันจอขาว — ถ้ามี error ที่ไม่คาดคิด แสดงหน้าให้รีโหลดแทนที่จะค้างเปล่าๆ
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24,
          backgroundColor: '#F7F1E6', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif",
          textAlign: 'center', color: '#27361F',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🌿</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#2E4429' }}>
            อุ๊ปส์ มีบางอย่างผิดพลาด
          </div>
          <div style={{ fontSize: 14, color: '#8A8676', marginBottom: 20 }}>
            ข้อมูลของคุณยังอยู่ครบ ลองเปิดแอปใหม่อีกครั้งนะคะ
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '14px 32px', borderRadius: 16, border: 'none',
              backgroundColor: '#4F6D45', color: 'white', fontSize: 16,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            เปิดใหม่
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
  </React.StrictMode>
);
