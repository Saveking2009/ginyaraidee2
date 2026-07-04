/* ============================================================
   GINYARAIDEE — Theme: สีและ CSS กลางของแอป
   - สีทั้งหมดเป็น CSS variables → สลับโหมดสว่าง/มืดได้ทั้งแอป
   - PALETTE.deep = เขียวเข้มคงที่ทั้งสองโหมด (ใช้เป็นพื้นการ์ดเข้ม
     และตัวหนังสือบนพื้นทอง) ส่วน PALETTE.sageDeep = สีหัวข้อ
     ที่ปรับตามโหมด (เข้มในโหมดสว่าง สว่างในโหมดมืด)
   ============================================================ */

export const PALETTE = {
  cream: 'var(--g-cream)',
  paper: 'var(--g-paper)',
  sage: 'var(--g-sage)',
  sageDark: 'var(--g-sagedark)',
  sageDeep: 'var(--g-sagedeep)', // สีหัวข้อ — ปรับตามโหมด
  deep: '#2E4429',               // เขียวเข้มคงที่ — พื้นการ์ดเข้ม / ตัวหนังสือบนพื้นทอง
  coral: 'var(--g-coral)',
  coralSoft: 'var(--g-coralsoft)',
  gold: 'var(--g-gold)',
  forest: 'var(--g-forest)',
  muted: 'var(--g-muted)',
  mist: 'var(--g-mist)',
  shell: 'var(--g-shell)',
};

// สีโปร่งแสง เช่น alpha(PALETTE.sage, 15) = sage จาง 15%
export const alpha = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

export const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Thai+Looped:wght@300;400;500;600;700&family=Bai+Jamjuree:wght@400;500;600;700&display=swap');

:root {
  --g-cream: #F7F1E6;
  --g-paper: #FEFBF4;
  --g-sage: #87A878;
  --g-sagedark: #4F6D45;
  --g-sagedeep: #2E4429;
  --g-coral: #D9684A;
  --g-coralsoft: #F2C9B8;
  --g-gold: #C9A36B;
  --g-forest: #27361F;
  --g-muted: #8A8676;
  --g-mist: #E8DFC9;
  --g-shell: #F0E7D2;
  --blob-a: 0.55;
}

html[data-theme='dark'] {
  --g-cream: #171C16;
  --g-paper: #212821;
  --g-sage: #87A878;
  --g-sagedark: #5E7F52;
  --g-sagedeep: #C6D5BC;
  --g-coral: #E07B5F;
  --g-coralsoft: #45291F;
  --g-gold: #D4B078;
  --g-forest: #ECE9DD;
  --g-muted: #A19D8F;
  --g-mist: #333B30;
  --g-shell: #2A3227;
  --blob-a: 0.28;
}

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

/* พื้นหลังเคลื่อนไหว — ก้อนสีเบลอลอยช้าๆ */
@keyframes drift1 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(50px, -70px) scale(1.18); }
}
@keyframes drift2 {
  from { transform: translate(0, 0) scale(1.1); }
  to { transform: translate(-60px, 50px) scale(0.92); }
}
@keyframes drift3 {
  from { transform: translate(0, 0) scale(0.95); }
  to { transform: translate(40px, 60px) scale(1.12); }
}
.ambient-blob {
  position: fixed;
  border-radius: 9999px;
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  will-change: transform;
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
  background: linear-gradient(90deg, var(--g-shell) 0%, var(--g-cream) 50%, var(--g-shell) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}

.smooth-tap { transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
.smooth-tap:active { transform: scale(0.97); }

.organic-shadow { box-shadow: 0 1px 2px rgba(46, 68, 41, 0.04), 0 8px 24px -8px rgba(46, 68, 41, 0.10); }
.deep-shadow { box-shadow: 0 4px 12px rgba(46, 68, 41, 0.08), 0 16px 40px -12px rgba(46, 68, 41, 0.18); }
html[data-theme='dark'] .organic-shadow { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), 0 8px 24px -8px rgba(0, 0, 0, 0.45); }
html[data-theme='dark'] .deep-shadow { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 16px 40px -12px rgba(0, 0, 0, 0.6); }

.grain-bg {
  background-image:
    radial-gradient(at 20% 10%, rgba(135, 168, 120, 0.08) 0px, transparent 50%),
    radial-gradient(at 80% 90%, rgba(217, 104, 74, 0.06) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(201, 163, 107, 0.05) 0px, transparent 50%);
}

input, textarea, button, select { font-family: inherit; }
input:focus, textarea:focus, select:focus { outline: none; }
input, textarea { caret-color: var(--g-sage); }
input::placeholder, textarea::placeholder { color: var(--g-muted); opacity: 0.7; }

.chip-input:focus-within { border-color: var(--g-sage); box-shadow: 0 0 0 4px rgba(135, 168, 120, 0.15); }

.text-tiny { font-size: 10px; line-height: 14px; }
.chat-screen-h { height: calc(100vh - 96px); min-height: 480px; }
.chip-input-field { min-width: 120px; }
.max-w-80 { max-width: 80%; }
.flex-2 { flex: 2 1 0%; }
`;
