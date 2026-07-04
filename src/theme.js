/* ============================================================
   GINYARAIDEE — Theme: สีและ CSS กลางของแอป
   ============================================================ */

export const PALETTE = {
  cream: '#F7F1E6',
  paper: '#FEFBF4',
  sage: '#87A878',
  sageDark: '#4F6D45',
  sageDeep: '#2E4429',
  coral: '#D9684A',
  coralSoft: '#F2C9B8',
  gold: '#C9A36B',
  forest: '#27361F',
  muted: '#8A8676',
  mist: '#E8DFC9',
  shell: '#F0E7D2',
};

export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Thai+Looped:wght@300;400;500;600;700&family=Bai+Jamjuree:wght@400;500;600;700&display=swap');

* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.font-display { font-family: 'Prompt', sans-serif; letter-spacing: -0.02em; }
.font-body { font-family: 'IBM Plex Sans Thai Looped', sans-serif; }
.font-accent { font-family: 'Bai Jamjuree', sans-serif; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(135, 168, 120, 0.4); }
  50% { box-shadow: 0 0 0 14px rgba(135, 168, 120, 0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes popScore {
  0% { opacity: 0; transform: translateY(0) scale(0.6); }
  20% { opacity: 1; transform: translateY(-8px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-36px) scale(1); }
}

.anim-fadeUp { animation: fadeUp 0.5s ease-out both; }
.anim-fadeIn { animation: fadeIn 0.4s ease-out both; }
.anim-slideUp { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-float { animation: float 4s ease-in-out infinite; }
.anim-pulseGlow { animation: pulseGlow 2.2s ease-in-out infinite; }
.anim-spin-slow { animation: spinSlow 8s linear infinite; }
.anim-popScore { animation: popScore 0.8s ease-out both; }

.delay-1 { animation-delay: 60ms; }
.delay-2 { animation-delay: 120ms; }
.delay-3 { animation-delay: 180ms; }
.delay-4 { animation-delay: 240ms; }
.delay-5 { animation-delay: 300ms; }
.delay-6 { animation-delay: 360ms; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.shimmer-bg {
  background: linear-gradient(90deg, #F0E7D2 0%, #F7F1E6 50%, #F0E7D2 100%);
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}

.smooth-tap { transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
.smooth-tap:active { transform: scale(0.97); }

.organic-shadow { box-shadow: 0 1px 2px rgba(46, 68, 41, 0.04), 0 8px 24px -8px rgba(46, 68, 41, 0.10); }
.deep-shadow { box-shadow: 0 4px 12px rgba(46, 68, 41, 0.08), 0 16px 40px -12px rgba(46, 68, 41, 0.18); }

.grain-bg {
  background-image:
    radial-gradient(at 20% 10%, rgba(135, 168, 120, 0.08) 0px, transparent 50%),
    radial-gradient(at 80% 90%, rgba(217, 104, 74, 0.06) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(201, 163, 107, 0.05) 0px, transparent 50%);
}

input, textarea, button, select { font-family: inherit; }
input:focus, textarea:focus, select:focus { outline: none; }

.chip-input:focus-within { border-color: ${PALETTE.sage}; box-shadow: 0 0 0 4px rgba(135, 168, 120, 0.15); }

.text-tiny { font-size: 10px; line-height: 14px; }
.chat-screen-h { height: calc(100vh - 96px); min-height: 480px; }
.chip-input-field { min-width: 120px; }
.max-w-80 { max-width: 80%; }
.flex-2 { flex: 2 1 0%; }
`;
