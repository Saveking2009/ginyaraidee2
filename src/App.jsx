import React, { useState, useRef, useEffect } from 'react';
import {
  Home, UtensilsCrossed, Pill, MessageCircle, Brain, User,
  Camera, Send, Plus, X, Heart, Activity, Shield, ChevronRight,
  Sparkles, AlertCircle, Loader2, Eye, EyeOff, Trash2, ArrowLeft,
  Flame, Apple, Wheat, Droplet, ChevronLeft, Check, Image as ImageIcon,
  Leaf, AlertTriangle, Phone, RotateCcw, Pencil, BarChart3, TrendingUp,
  TrendingDown, Calendar, ScanLine, Newspaper, GlassWater, Moon, Dumbbell,
  Stethoscope, Bell, Printer, MoreHorizontal, Minus, FileText, Zap,
  ExternalLink, Clock, Volume2, VolumeX
} from 'lucide-react';

/* ============================================================
   GINYARAIDEE — แอปสุขภาพใจดี
   ============================================================ */

const PALETTE = {
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

const FONT_CSS = `
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

.anim-fadeUp { animation: fadeUp 0.5s ease-out both; }
.anim-fadeIn { animation: fadeIn 0.4s ease-out both; }
.anim-slideUp { animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-float { animation: float 4s ease-in-out infinite; }
.anim-pulseGlow { animation: pulseGlow 2.2s ease-in-out infinite; }
.anim-spin-slow { animation: spinSlow 8s linear infinite; }

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

.thai-deco {
  background-image:
    radial-gradient(circle at 0% 0%, transparent 28%, rgba(201, 163, 107, 0.18) 29%, rgba(201, 163, 107, 0.18) 30%, transparent 31%),
    radial-gradient(circle at 100% 100%, transparent 28%, rgba(135, 168, 120, 0.18) 29%, rgba(135, 168, 120, 0.18) 30%, transparent 31%);
  background-size: 40px 40px;
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

/* ============================================================
   Helpers
   ============================================================ */

function calcBMI(w, h) {
  if (!w || !h) return null;
  const m = h / 100;
  return +(w / (m * m)).toFixed(1);
}
function bmiCategory(bmi) {
  if (!bmi) return { label: '-', tone: PALETTE.muted };
  if (bmi < 18.5) return { label: 'ผอม', tone: '#6BA4D9' };
  if (bmi < 23) return { label: 'สมส่วน', tone: PALETTE.sage };
  if (bmi < 25) return { label: 'ท้วม', tone: PALETTE.gold };
  if (bmi < 30) return { label: 'น้ำหนักเกิน', tone: PALETTE.coral };
  return { label: 'อ้วน', tone: '#B8453A' };
}
function calcBMR({ gender, weight, height, age }) {
  if (!weight || !height || !age) return null;
  if (gender === 'female') return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}
function calcTDEE(bmr, activity = 1.4) {
  if (!bmr) return null;
  return Math.round(bmr * activity);
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function timeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function waterTargetMl(weight) {
  if (!weight) return 2000;
  return Math.round(weight * 33);
}
const EXERCISE_TYPES = [
  { id: 'walk', label: 'เดิน', met: 3.5, icon: '🚶' },
  { id: 'run', label: 'วิ่ง', met: 8, icon: '🏃' },
  { id: 'bike', label: 'ปั่นจักรยาน', met: 6, icon: '🚴' },
  { id: 'swim', label: 'ว่ายน้ำ', met: 7, icon: '🏊' },
  { id: 'gym', label: 'ยิม / weight', met: 5, icon: '💪' },
  { id: 'yoga', label: 'โยคะ', met: 3, icon: '🧘' },
  { id: 'sport', label: 'กีฬาทั่วไป', met: 5.5, icon: '⚽' },
  { id: 'house', label: 'งานบ้าน', met: 3, icon: '🏠' },
];
function exerciseCal({ met, weight, minutes }) {
  return Math.round(met * (weight || 60) * (minutes / 60));
}
function lastNDaysKeys(n) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return keys;
}

// Export AI memory to a downloadable JSON file
function exportMemory(corrections) {
  const data = {
    app: 'GINYARAIDEE',
    type: 'ai-memory',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: corrections.length,
    corrections: corrections.map(c => ({
      aiName: c.aiName,
      aiCal: c.aiCal,
      realName: c.realName,
      realCal: c.realCal,
    })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ginyaraidee-memory-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

// Import AI memory from a JSON file
async function handleImportMemory(e, addCorrection, existing) {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = '';
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.app !== 'GINYARAIDEE' || data.type !== 'ai-memory') {
      alert('ไฟล์ไม่ถูกต้อง — ต้องเป็นไฟล์ AI memory จาก GINYARAIDEE เท่านั้น');
      return;
    }
    const incoming = data.corrections || [];
    if (incoming.length === 0) {
      alert('ไฟล์ว่าง — ไม่มีข้อมูลให้นำเข้า');
      return;
    }
    // De-duplicate by (aiName + realName) — skip ones already in memory
    const existingKeys = new Set((existing || []).map(c => `${c.aiName}|${c.realName}`));
    let added = 0, skipped = 0;
    incoming.forEach(c => {
      const key = `${c.aiName}|${c.realName}`;
      if (existingKeys.has(key)) {
        skipped++;
      } else {
        existingKeys.add(key);
        addCorrection({
          id: 'c' + Date.now() + Math.random().toString(36).slice(2, 7),
          ts: Date.now(),
          aiName: c.aiName || '',
          aiCal: +c.aiCal || 0,
          realName: c.realName || '',
          realCal: +c.realCal || 0,
          imported: true,
        });
        added++;
      }
    });
    alert(`นำเข้าสำเร็จ!\nเพิ่ม ${added} รายการ\nข้ามที่มีอยู่แล้ว ${skipped} รายการ`);
  } catch (err) {
    alert('อ่านไฟล์ไม่สำเร็จ ตรวจสอบไฟล์อีกครั้ง');
  }
}

/* ============================================================
   AI Personalities — auto-select by age, user can override
   ============================================================ */

const PERSONALITIES = {
  auto: {
    id: 'auto',
    label: 'อัตโนมัติ',
    sub: 'ปรับตามอายุ',
    icon: '🪄',
    desc: 'หนูจะเลือกบุคลิกที่เหมาะกับช่วงอายุของพี่เอง',
  },
  kid: {
    id: 'kid',
    label: 'พี่เลี้ยงใจดี',
    sub: 'สำหรับเด็กเล็ก',
    icon: '🧸',
    desc: 'อบอุ่น พูดง่ายๆ เข้าใจง่าย น่ารัก',
    prompt: `คุณคือ "พี่ไกด์" พี่เลี้ยงใจดีของน้องเด็กเล็ก
- เรียกตัวเองว่า "พี่" เรียกผู้ใช้ว่า "น้อง..."
- พูดน่ารัก คำง่ายๆ เข้าใจง่าย ใช้ emoji เยอะหน่อย 🌟✨💛
- อธิบายเรื่องสุขภาพแบบสนุก เปรียบเทียบเหมือนนิทาน
- ห่วงเรื่องการกินผักผลไม้ การล้างมือ การนอน
- ถ้าน้องป่วยหนัก ให้บอกน้องไปบอกคุณพ่อคุณแม่ทันที`,
  },
  teen: {
    id: 'teen',
    label: 'เพื่อนซี้',
    sub: 'สำหรับวัยรุ่น',
    icon: '🤝',
    desc: 'เป็นกันเอง ใช้ภาษาวัยรุ่น เข้าใจกัน',
    prompt: `คุณคือ "ไกด์" เพื่อนวัยรุ่นที่คุยสบาย ไม่ทางการ
- เรียกตัวเองว่า "เรา" เรียกผู้ใช้ว่า "เธอ"
- ใช้ภาษาวัยรุ่นเป็นธรรมชาติ ไม่ฝืน เช่น "เออ", "ถ้ามันแบบ...", "งงๆ ใช่ป่ะ"
- ใส่ใจเรื่องที่วัยรุ่นกังวล: สิว ผม น้ำหนัก ความเครียดเรียน นอนน้อย หน้าจอ
- ตรงไปตรงมา แต่ไม่ judge
- เน้นว่ามีอะไรปรึกษาผู้ใหญ่ที่ไว้ใจได้`,
  },
  default: {
    id: 'default',
    label: 'น้องไกด์',
    sub: 'น้องสาวใจดี',
    icon: '🌿',
    desc: 'อบอุ่น เป็นมิตร สรรพนาม "หนู" / "พี่"',
    prompt: `คุณคือ "น้องไกด์" น้องสาวใจดี อบอุ่น เป็นมิตร
- เรียกตัวเองว่า "หนู" เรียกผู้ใช้ว่า "พี่"
- น่ารัก เป็นกันเอง อบอุ่น ใช้ emoji เล็กน้อย
- ดูแลเรื่องสุขภาพประจำวัน อาหาร การออกกำลังกาย`,
  },
  formal: {
    id: 'formal',
    label: 'ผู้ช่วยสุขภาพ',
    sub: 'สุภาพ มืออาชีพ',
    icon: '👔',
    desc: 'เป็นทางการ ข้อมูลแน่น ตรงประเด็น',
    prompt: `คุณคือผู้ช่วยสุขภาพมืออาชีพ
- เรียกตัวเองว่า "ผู้ช่วย" เรียกผู้ใช้ว่า "คุณ"
- ภาษาสุภาพ เป็นทางการ ไม่ใช้ emoji
- ข้อมูลตรงประเด็น มีโครงสร้าง
- ระวังเรื่องความดัน เบาหวาน คอเลสเตอรอล โรคเรื้อรัง
- ลงท้ายด้วย "ครับ/ค่ะ" สุภาพ`,
  },
  grandkid: {
    id: 'grandkid',
    label: 'หลานใจดี',
    sub: 'สำหรับผู้สูงวัย',
    icon: '🌷',
    desc: 'อ่อนหวาน เป็นห่วง พูดช้าๆ ชัดๆ',
    prompt: `คุณคือ "หลานไกด์" หลานสาวที่อบอุ่นและเป็นห่วงผู้สูงวัย
- เรียกตัวเองว่า "หลาน" เรียกผู้ใช้ว่า "คุณตา/คุณยาย" (เลือกตามเพศ — ชาย=ตา หญิง=ยาย)
- พูดอ่อนโยน ช้าๆ ชัดๆ ประโยคสั้น เข้าใจง่าย ไม่ใช้ศัพท์ยาก
- ใส่ใจเป็นพิเศษ: ความดัน เบาหวาน หัวใจ ข้อเข่า การหกล้ม ยาประจำ
- ย้ำเสมอว่าถ้ามีอะไรแปลกๆ ให้พบหมอ
- ลงท้ายอบอุ่น เช่น "ดูแลตัวเองด้วยนะคะ"`,
  },
  strict: {
    id: 'strict',
    label: 'โค้ชสายแข็ง',
    sub: 'พูดตรง ไม่ปลอบ',
    icon: '💪',
    desc: 'ดุ ตรง พูดความจริง เหมาะคนอยากเปลี่ยน',
    prompt: `คุณคือ "โค้ชไกด์" โค้ชสุขภาพสายดุ ตรงไปตรงมา
- เรียกตัวเองว่า "โค้ช" เรียกผู้ใช้ว่า "นาย/เธอ" (ตามเพศ)
- พูดตรง ไม่อ้อมค้อม ไม่ปลอบ ไม่หวานเลี่ยน
- ชี้ปัญหาแบบโจ๋งครึ่ม แต่ไม่ดูถูก เน้น actionable
- กระตุ้นให้ลงมือทำ ไม่ผัดวันประกันพรุ่ง
- ห้ามใช้ emoji หรือคำน่ารัก`,
  },
};

// Map age → personality id
function pickPersonalityByAge(age) {
  if (!age || isNaN(age)) return 'default';
  if (age < 13) return 'kid';
  if (age < 20) return 'teen';
  if (age < 45) return 'default';
  if (age < 60) return 'formal';
  return 'grandkid';
}

// Resolve which personality to actually use (handle 'auto')
function resolvePersonality(personalityId, age) {
  if (!personalityId || personalityId === 'auto') {
    return PERSONALITIES[pickPersonalityByAge(age)];
  }
  return PERSONALITIES[personalityId] || PERSONALITIES.default;
}

/* ============================================================
   Thai Food Dictionary — ค่าแคลอ้างอิงสำหรับอาหารไทยยอดฮิต
   ============================================================ */

const THAI_FOOD_DICT = [
  // อาหารจานเดียว — ข้าว
  { name: 'ข้าวมันไก่', kcal: 650, p: 30, c: 75, f: 25 },
  { name: 'ข้าวมันไก่ทอด', kcal: 750, p: 32, c: 75, f: 35 },
  { name: 'ข้าวขาหมู', kcal: 700, p: 35, c: 80, f: 28 },
  { name: 'ข้าวหมูแดง', kcal: 600, p: 28, c: 75, f: 22 },
  { name: 'ข้าวหมูกรอบ', kcal: 700, p: 30, c: 75, f: 32 },
  { name: 'ข้าวคลุกกะปิ', kcal: 550, p: 18, c: 80, f: 18 },
  { name: 'ข้าวผัดหมู', kcal: 600, p: 22, c: 80, f: 22 },
  { name: 'ข้าวผัดกุ้ง', kcal: 580, p: 25, c: 80, f: 20 },
  { name: 'ข้าวผัดปู', kcal: 600, p: 22, c: 80, f: 22 },
  { name: 'ข้าวผัดสับปะรด', kcal: 550, p: 18, c: 85, f: 18 },
  { name: 'ข้าวซอย', kcal: 650, p: 25, c: 70, f: 30 },
  { name: 'ข้าวเหนียวหมูปิ้ง', kcal: 500, p: 22, c: 65, f: 18 },
  { name: 'ข้าวเหนียวไก่ย่าง', kcal: 600, p: 30, c: 75, f: 20 },
  // ผัดกะเพรา
  { name: 'ผัดกะเพราหมูสับ', kcal: 450, p: 25, c: 50, f: 18 },
  { name: 'ผัดกะเพราหมูสับ + ไข่ดาว', kcal: 600, p: 32, c: 52, f: 28 },
  { name: 'ผัดกะเพราไก่', kcal: 480, p: 28, c: 52, f: 18 },
  { name: 'ผัดกะเพราไก่ + ไข่ดาว', kcal: 620, p: 35, c: 54, f: 28 },
  { name: 'ผัดกะเพราหมูกรอบ', kcal: 600, p: 25, c: 55, f: 30 },
  // ก๋วยเตี๋ยว
  { name: 'ก๋วยเตี๋ยวต้มยำ', kcal: 350, p: 18, c: 50, f: 10 },
  { name: 'ก๋วยเตี๋ยวเรือ', kcal: 380, p: 20, c: 45, f: 12 },
  { name: 'ก๋วยเตี๋ยวน้ำใส', kcal: 350, p: 18, c: 50, f: 8 },
  { name: 'ก๋วยเตี๋ยวเย็นตาโฟ', kcal: 400, p: 18, c: 55, f: 12 },
  { name: 'ผัดไทย', kcal: 550, p: 22, c: 75, f: 18 },
  { name: 'ผัดซีอิ๊ว', kcal: 600, p: 25, c: 75, f: 22 },
  { name: 'ราดหน้า', kcal: 500, p: 22, c: 65, f: 18 },
  { name: 'หมี่กรอบ', kcal: 550, p: 18, c: 70, f: 22 },
  // ส้มตำ / ยำ
  { name: 'ส้มตำไทย', kcal: 200, p: 6, c: 35, f: 5 },
  { name: 'ส้มตำปูปลาร้า', kcal: 220, p: 8, c: 35, f: 6 },
  { name: 'ส้มตำไทยไข่เค็ม', kcal: 280, p: 12, c: 35, f: 10 },
  { name: 'ยำวุ้นเส้น', kcal: 300, p: 18, c: 35, f: 10 },
  { name: 'ลาบหมู', kcal: 250, p: 25, c: 8, f: 15 },
  { name: 'น้ำตกหมู', kcal: 280, p: 25, c: 8, f: 18 },
  { name: 'หมูย่างจิ้มแจ่ว', kcal: 350, p: 30, c: 5, f: 22 },
  // แกง
  { name: 'แกงเขียวหวานไก่ + ข้าว', kcal: 550, p: 22, c: 65, f: 22 },
  { name: 'แกงมัสมั่นไก่ + ข้าว', kcal: 650, p: 25, c: 70, f: 28 },
  { name: 'แกงเผ็ดเป็ดย่าง + ข้าว', kcal: 600, p: 28, c: 65, f: 25 },
  { name: 'แกงจืดเต้าหู้หมูสับ', kcal: 180, p: 15, c: 8, f: 10 },
  { name: 'ต้มยำกุ้ง', kcal: 200, p: 22, c: 10, f: 8 },
  { name: 'ต้มข่าไก่', kcal: 250, p: 18, c: 10, f: 15 },
  // ของทอด
  { name: 'ไก่ทอด', kcal: 300, p: 25, c: 5, f: 20 }, // ต่อชิ้น
  { name: 'หมูทอดกระเทียม', kcal: 350, p: 30, c: 5, f: 22 },
  { name: 'ปลาทอด', kcal: 280, p: 25, c: 5, f: 18 },
  { name: 'ไข่เจียว', kcal: 200, p: 12, c: 2, f: 16 },
  { name: 'ไข่ดาว', kcal: 110, p: 7, c: 1, f: 9 },
  { name: 'เฟรนช์ฟราย', kcal: 350, p: 4, c: 45, f: 17 },
  // อาหารเช้า / เบา
  { name: 'โจ๊กหมูใส่ไข่', kcal: 300, p: 18, c: 40, f: 8 },
  { name: 'ข้าวต้มหมู', kcal: 250, p: 15, c: 40, f: 5 },
  { name: 'โอเลี้ยง + ปาท่องโก๋', kcal: 350, p: 5, c: 50, f: 15 },
  { name: 'ขนมปังปิ้งเนยน้ำตาล', kcal: 280, p: 5, c: 40, f: 12 },
  // ฟาสต์ฟู้ด
  { name: 'แฮมเบอร์เกอร์', kcal: 500, p: 22, c: 45, f: 25 },
  { name: 'พิซซ่า', kcal: 280, p: 12, c: 35, f: 11 }, // ต่อชิ้น
  { name: 'KFC ชิ้นเล็ก', kcal: 250, p: 18, c: 8, f: 16 },
  { name: 'ข้าวกะเพราไก่ KFC', kcal: 700, p: 35, c: 75, f: 28 },
  { name: 'ราเมง', kcal: 500, p: 22, c: 65, f: 18 },
  { name: 'ซูชิ', kcal: 50, p: 3, c: 8, f: 1 }, // ต่อชิ้น
  // เครื่องดื่ม
  { name: 'ชาเย็น', kcal: 200, p: 2, c: 35, f: 6 },
  { name: 'ชาเขียวเย็น', kcal: 180, p: 2, c: 32, f: 5 },
  { name: 'กาแฟเย็น', kcal: 220, p: 3, c: 35, f: 8 },
  { name: 'นมเย็น', kcal: 250, p: 6, c: 40, f: 7 },
  { name: 'น้ำอัดลม 250ml', kcal: 105, p: 0, c: 27, f: 0 },
  { name: 'น้ำเต้าหู้', kcal: 80, p: 4, c: 8, f: 3 },
  // ขนม / ของหวาน
  { name: 'ข้าวเหนียวมะม่วง', kcal: 400, p: 5, c: 75, f: 8 },
  { name: 'บัวลอย', kcal: 300, p: 4, c: 55, f: 7 },
  { name: 'รวมมิตร', kcal: 350, p: 4, c: 65, f: 8 },
  { name: 'น้ำแข็งใส', kcal: 200, p: 3, c: 45, f: 1 },
  { name: 'ทับทิมกรอบ', kcal: 350, p: 3, c: 65, f: 8 },
  { name: 'โดนัท 1 ชิ้น', kcal: 250, p: 4, c: 30, f: 12 },
  { name: 'เค้กช็อกโกแลต 1 ชิ้น', kcal: 350, p: 5, c: 45, f: 16 },
];

function buildDictHint() {
  // Build a compact reference for the AI
  return THAI_FOOD_DICT.map(f =>
    `- ${f.name}: ${f.kcal} kcal (P:${f.p}/C:${f.c}/F:${f.f}g)`
  ).join('\n');
}


/* ============================================================
   Brand Logo (custom SVG mark)
   ============================================================ */

function LogoMark({ size = 44 }) {
  return (
    <img
      src="/logo.png"
      alt="GINYARAIDEE"
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  );
}

/* ============================================================
   Onboarding
   ============================================================ */

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [foodAllergy, setFoodAllergy] = useState([]);
  const [drugAllergy, setDrugAllergy] = useState([]);
  const [fInput, setFInput] = useState('');
  const [dInput, setDInput] = useState('');

  const nextDisabled = () => {
    if (step === 1) return !name.trim();
    if (step === 2) return !age || !height || !weight;
    return false;
  };

  const submit = () => {
    onDone({
      name: name.trim() || 'พี่',
      age: +age,
      gender,
      height: +height,
      weight: +weight,
      foodAllergy,
      drugAllergy,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: PALETTE.cream }}>
      <div className="grain-bg absolute inset-0 pointer-events-none" />

      {/* progress */}
      <div className="px-6 pt-6 flex items-center gap-2 relative z-10">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: s <= step ? PALETTE.sage : PALETTE.mist }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-md">

          {step === 0 && (
            <div className="text-center anim-slideUp">
              <div className="anim-float inline-block mb-6">
                <LogoMark size={96} />
              </div>
              <h1 className="font-display text-5xl font-bold mb-3" style={{ color: PALETTE.sageDeep }}>
                GINYARAIDEE
              </h1>
              <div className="font-accent text-lg mb-1" style={{ color: PALETTE.gold }}>
                กินยาไรดี
              </div>
              <p className="font-body text-base mb-10" style={{ color: PALETTE.muted }}>
                เพื่อนสุขภาพใจดี<br />ที่อยู่ข้างพี่ทุกวัน
              </p>
              <button
                onClick={() => setStep(1)}
                className="smooth-tap font-display font-semibold w-full py-4 rounded-2xl text-white text-base deep-shadow"
                style={{ backgroundColor: PALETTE.sageDark }}
              >
                เริ่มกันเลย
              </button>
              <p className="font-body text-xs mt-6 leading-relaxed" style={{ color: PALETTE.muted }}>
                * แอปนี้ให้คำแนะนำเบื้องต้นเท่านั้น<br />ไม่ทดแทนการวินิจฉัยโดยแพทย์
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="anim-slideUp">
              <div className="font-accent text-sm mb-2" style={{ color: PALETTE.gold }}>STEP 01</div>
              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
                ขอเรียกพี่ว่าอะไรดี?
              </h2>
              <p className="font-body text-sm mb-8" style={{ color: PALETTE.muted }}>
                หนูอยากเรียกชื่อพี่ให้ถูกต้องเลยค่ะ
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อเล่นก็ได้นะ"
                className="font-body w-full px-5 py-4 rounded-2xl text-lg organic-shadow"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="anim-slideUp">
              <div className="font-accent text-sm mb-2" style={{ color: PALETTE.gold }}>STEP 02</div>
              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
                ขอข้อมูลพื้นฐาน
              </h2>
              <p className="font-body text-sm mb-6" style={{ color: PALETTE.muted }}>
                เพื่อคำนวณแคลและคำแนะนำที่เหมาะกับพี่
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setGender('female')}
                  className={`smooth-tap font-display font-medium py-4 rounded-2xl border-2`}
                  style={{
                    backgroundColor: gender === 'female' ? PALETTE.sageDark : PALETTE.paper,
                    color: gender === 'female' ? '#fff' : PALETTE.forest,
                    borderColor: gender === 'female' ? PALETTE.sageDark : PALETTE.mist,
                  }}
                >
                  หญิง
                </button>
                <button
                  onClick={() => setGender('male')}
                  className={`smooth-tap font-display font-medium py-4 rounded-2xl border-2`}
                  style={{
                    backgroundColor: gender === 'male' ? PALETTE.sageDark : PALETTE.paper,
                    color: gender === 'male' ? '#fff' : PALETTE.forest,
                    borderColor: gender === 'male' ? PALETTE.sageDark : PALETTE.mist,
                  }}
                >
                  ชาย
                </button>
              </div>

              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
                placeholder="อายุ (ปี)"
                inputMode="numeric"
                className="font-body w-full px-5 py-4 rounded-2xl text-base mb-3"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={height}
                  onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="สูง (ซม.)"
                  inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="หนัก (กก.)"
                  inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="anim-slideUp">
              <div className="font-accent text-sm mb-2" style={{ color: PALETTE.gold }}>STEP 03</div>
              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
                สิ่งที่พี่แพ้
              </h2>
              <p className="font-body text-sm mb-6" style={{ color: PALETTE.muted }}>
                สำคัญมาก หนูจะได้เตือนพี่ทันที (ถ้าไม่มี ข้ามได้เลย)
              </p>

              <AllergySection
                label="แพ้อาหาร"
                icon={<Apple size={16} />}
                items={foodAllergy}
                setItems={setFoodAllergy}
                input={fInput}
                setInput={setFInput}
                placeholder="เช่น กุ้ง, นม, ถั่ว..."
              />
              <div className="h-4" />
              <AllergySection
                label="แพ้ยา"
                icon={<Pill size={16} />}
                items={drugAllergy}
                setItems={setDrugAllergy}
                input={dInput}
                setInput={setDInput}
                placeholder="เช่น พาราเซตามอล, ยาแก้ปวด..."
              />
            </div>
          )}

        </div>
      </div>

      {/* nav buttons */}
      <div className="px-6 pb-8 relative z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 0 && step < 4 && (
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className="smooth-tap font-display font-medium px-5 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {step > 0 && (
            <button
              onClick={() => step === 3 ? submit() : setStep(s => s + 1)}
              disabled={nextDisabled()}
              className="smooth-tap font-display font-semibold flex-1 py-4 rounded-2xl text-white text-base flex items-center justify-center gap-2 deep-shadow disabled:opacity-40"
              style={{ backgroundColor: PALETTE.sageDark }}
            >
              {step === 3 ? 'เริ่มใช้แอป' : 'ต่อไป'}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AllergySection({ label, icon, items, setItems, input, setInput, placeholder }) {
  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) setItems([...items, v]);
    setInput('');
  };
  return (
    <div>
      <div className="font-body font-medium text-sm mb-2 flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
        <span style={{ color: PALETTE.coral }}>{icon}</span>{label}
      </div>
      <div className="chip-input rounded-2xl px-3 py-2 flex flex-wrap gap-1.5 transition-all"
        style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
      >
        {items.map((it, i) => (
          <span key={i}
            className="font-body text-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 anim-fadeIn"
            style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
          >
            {it}
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={items.length ? '' : placeholder}
          className="font-body chip-input-field flex-1 px-2 py-1.5 text-sm bg-transparent"
          style={{ color: PALETTE.forest }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Dashboard
   ============================================================ */

function Dashboard({ profile, foodLog, goto }) {
  const bmi = calcBMI(profile.weight, profile.height);
  const bmiCat = bmiCategory(bmi);
  const bmr = calcBMR(profile);
  const tdee = calcTDEE(bmr);

  const today = todayKey();
  const todayLog = foodLog.filter(f => f.day === today);
  const consumed = todayLog.reduce((s, f) => s + (f.calories || 0), 0);
  const pct = tdee ? Math.min(1, consumed / tdee) : 0;

  const hr = new Date().getHours();
  const greet = hr < 11 ? 'อรุณสวัสดิ์' : hr < 17 ? 'สวัสดียามบ่าย' : 'สวัสดียามเย็น';

  return (
    <div className="px-5 pt-6 pb-32 anim-fadeIn">
      {/* header */}
      <div className="flex items-center justify-between mb-6 anim-slideUp">
        <div>
          <div className="font-body text-sm" style={{ color: PALETTE.muted }}>{greet}</div>
          <h1 className="font-display text-2xl font-bold" style={{ color: PALETTE.sageDeep }}>
            พี่{profile.name} 👋
          </h1>
        </div>
        <button
          onClick={() => goto('profile')}
          className="smooth-tap w-12 h-12 rounded-full flex items-center justify-center organic-shadow"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <User size={20} color={PALETTE.sageDeep} />
        </button>
      </div>

      {/* calorie ring card */}
      <div className="rounded-3xl p-6 mb-4 deep-shadow anim-slideUp delay-1 relative overflow-hidden"
        style={{ backgroundColor: PALETTE.sageDeep }}
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
          style={{ backgroundColor: PALETTE.gold }}
        />
        <div className="absolute -right-12 -bottom-16 w-44 h-44 rounded-full opacity-10"
          style={{ backgroundColor: PALETTE.sage }}
        />
        <div className="relative flex items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle
                cx="56" cy="56" r="48" fill="none"
                stroke={PALETTE.gold}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${pct * 301.6} 301.6`}
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-2xl font-bold text-white">{consumed}</div>
              <div className="font-body text-tiny text-white/60">/ {tdee || '-'} kcal</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>วันนี้</div>
            <div className="font-display text-xl font-semibold text-white mb-2">
              {tdee && consumed < tdee ? `กินได้อีก ${tdee - consumed}` : tdee ? `เกินมาแล้ว ${consumed - tdee}` : 'เริ่มบันทึก'}
            </div>
            <div className="font-body text-sm text-white/70">
              {todayLog.length === 0 ? 'ยังไม่ได้บันทึกมื้อไหนเลย' : `บันทึกแล้ว ${todayLog.length} มื้อ`}
            </div>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatTile
          delay="delay-2"
          label="BMI"
          value={bmi || '-'}
          sub={bmiCat.label}
          tone={bmiCat.tone}
          icon={<Activity size={18} />}
        />
        <StatTile
          delay="delay-3"
          label="BMR"
          value={bmr || '-'}
          sub="kcal/วัน พื้นฐาน"
          tone={PALETTE.sage}
          icon={<Flame size={18} />}
        />
      </div>

      {/* quick actions */}
      <div className="font-display font-semibold text-sm mb-3 anim-slideUp delay-4" style={{ color: PALETTE.sageDeep }}>
        ทางลัด
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ActionCard delay="delay-4" onClick={() => goto('food')}
          icon={<UtensilsCrossed size={22} />} title="ถ่ายอาหาร" subtitle="ให้ AI คำนวณแคล"
          bg={PALETTE.paper} accent={PALETTE.sage} />
        <ActionCard delay="delay-5" onClick={() => goto('health')}
          icon={<Activity size={22} />} title="สุขภาพ" subtitle="น้ำ · นอน · ออกกำลังกาย"
          bg={PALETTE.paper} accent={PALETTE.coral} />
      </div>

      {/* today's food */}
      {todayLog.length > 0 && (
        <div className="anim-slideUp delay-6">
          <div className="font-display font-semibold text-sm mb-3" style={{ color: PALETTE.sageDeep }}>
            มื้อวันนี้
          </div>
          <div className="space-y-2">
            {todayLog.slice(0, 3).map((f) => (
              <div key={f.id}
                className="rounded-2xl p-3 flex items-center gap-3 organic-shadow"
                style={{ backgroundColor: PALETTE.paper }}
              >
                {f.image ? (
                  <img src={f.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: PALETTE.shell }}>
                    <UtensilsCrossed size={18} color={PALETTE.sage} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-body font-medium text-sm truncate" style={{ color: PALETTE.forest }}>
                    {f.name || 'อาหาร'}
                  </div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                    {f.time} · {f.calories} kcal
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health news */}
      <HealthNewsCard profile={profile} />

      {/* Weekly summary card */}
      {foodLog.length > 0 && (
        <WeeklySummaryCard foodLog={foodLog} tdee={tdee} profile={profile} />
      )}

      {/* disclaimer */}
      <div className="mt-6 rounded-2xl p-3 flex items-start gap-2 anim-fadeIn"
        style={{ backgroundColor: PALETTE.shell }}
      >
        <Shield size={16} className="flex-shrink-0 mt-0.5" color={PALETTE.sageDark} />
        <p className="font-body text-xs leading-relaxed" style={{ color: PALETTE.sageDark }}>
          ข้อมูลทั้งหมดเป็นคำแนะนำเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์ หากมีอาการรุนแรงควรพบแพทย์
        </p>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, tone, icon, delay }) {
  return (
    <div className={`rounded-2xl p-4 organic-shadow anim-slideUp ${delay}`}
      style={{ backgroundColor: PALETTE.paper }}
    >
      <div className="flex items-center gap-1.5 mb-2" style={{ color: tone }}>
        {icon}
        <span className="font-accent text-xs">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold" style={{ color: PALETTE.forest }}>{value}</div>
      <div className="font-body text-xs" style={{ color: tone }}>{sub}</div>
    </div>
  );
}

function WeeklySummaryCard({ foodLog, tdee, profile }) {
  const [expanded, setExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Build last 7 days
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLog = foodLog.filter(f => f.day === key);
    const cal = dayLog.reduce((s, f) => s + (f.calories || 0), 0);
    days.push({
      key, cal,
      label: ['อา','จ','อ','พ','พฤ','ศ','ส'][d.getDay()],
      date: d.getDate(),
      isToday: i === 0,
      meals: dayLog.length,
    });
  }

  const totalCal = days.reduce((s, d) => s + d.cal, 0);
  const avgCal = Math.round(totalCal / 7);
  const activeDays = days.filter(d => d.meals > 0).length;
  const maxCal = Math.max(...days.map(d => d.cal), tdee || 2000);

  const target = tdee || 2000;
  const diff = avgCal - target;
  const trend = diff > target * 0.05 ? 'over' : diff < -target * 0.05 ? 'under' : 'balanced';
  const trendInfo = {
    over: { icon: <TrendingUp size={14} />, label: 'กินเกินเป้า', tone: PALETTE.coral, text: `เฉลี่ยเกินวันละ ${diff} kcal` },
    under: { icon: <TrendingDown size={14} />, label: 'กินน้อยกว่าเป้า', tone: '#6BA4D9', text: `เฉลี่ยขาดวันละ ${Math.abs(diff)} kcal` },
    balanced: { icon: <Check size={14} />, label: 'สมดุลดี', tone: PALETTE.sage, text: 'พลังงานพอดีกับเป้าหมาย' },
  }[trend];

  const askAI = async () => {
    if (aiInsight || loadingInsight) { setExpanded(!expanded); return; }
    setLoadingInsight(true);
    setExpanded(true);
    try {
      const summary = days.map(d => `${d.label} (${d.date}): ${d.cal} kcal, ${d.meals} มื้อ`).join('\n');
      const topFoods = foodLog.slice(-15).map(f => f.name).join(', ');
      const persona = resolvePersonality(load('gyn_persona', 'auto'), profile.age);

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: persona.prompt + '\n\nให้สรุปสุขภาพรายสัปดาห์ ตอบเป็นข้อความธรรมดา ห้าม markdown ห้าม **',
          messages: [{
            role: 'user',
            content: `สรุปการกินรายสัปดาห์ของผู้ใช้ (เป้าหมายวันละ ${target} kcal):
${summary}

อาหารที่กินล่าสุด: ${topFoods}

ช่วยวิเคราะห์ 3 ส่วนสั้นๆ:
1. ภาพรวม (1 ประโยค)
2. ข้อดี/สิ่งที่ทำได้ดี (1-2 ประโยค)
3. คำแนะนำสำหรับสัปดาห์หน้า (1-2 ประโยค)

ตอบเป็นย่อหน้าธรรมดา ไม่ต้องใส่หัวข้อหรือเลข`
          }]
        })
      });
      const data = await response.json();
      const reply = data.content.map(b => b.text || '').join('').trim();
      setAiInsight(reply);
    } catch (e) {
      setAiInsight('ขอโทษค่ะ ดึงข้อมูลไม่สำเร็จ');
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="anim-slideUp mb-4">
      <div className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
        <BarChart3 size={16} color={PALETTE.gold} /> สรุปรายสัปดาห์
      </div>

      <div className="rounded-3xl p-5 deep-shadow relative overflow-hidden"
        style={{ backgroundColor: PALETTE.paper }}
      >
        {/* Top: avg + trend */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-accent text-tiny mb-1" style={{ color: PALETTE.muted }}>เฉลี่ยต่อวัน</div>
            <div className="font-display text-3xl font-bold leading-none" style={{ color: PALETTE.sageDeep }}>
              {avgCal} <span className="text-sm font-normal" style={{ color: PALETTE.muted }}>kcal</span>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: trendInfo.tone + '22', color: trendInfo.tone }}
            >
              {trendInfo.icon}
              <span className="font-display text-tiny font-semibold">{trendInfo.label}</span>
            </div>
            <div className="font-body text-tiny mt-1" style={{ color: PALETTE.muted }}>{trendInfo.text}</div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between gap-1.5 h-24 mb-3">
          {days.map((d) => {
            const h = d.cal === 0 ? 4 : Math.max(8, (d.cal / maxCal) * 100);
            const overTarget = d.cal > target;
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-md relative" style={{ height: `${h}%`, minHeight: '4px',
                  backgroundColor: d.isToday ? PALETTE.sageDeep : overTarget ? PALETTE.coral : PALETTE.sage,
                  transition: 'height 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }}>
                  {d.isToday && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: PALETTE.gold }} />
                  )}
                </div>
                <div className="font-accent text-tiny" style={{
                  color: d.isToday ? PALETTE.sageDeep : PALETTE.muted,
                  fontWeight: d.isToday ? 600 : 400,
                }}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Target line legend */}
        <div className="flex items-center justify-between mb-3 text-tiny font-accent" style={{ color: PALETTE.muted }}>
          <span>เป้าหมาย {target} kcal</span>
          <span>บันทึก {activeDays}/7 วัน</span>
        </div>

        {/* AI insight button */}
        <button onClick={askAI}
          className="smooth-tap w-full py-3 rounded-2xl font-display font-medium text-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep }}
        >
          {loadingInsight ? (
            <><Loader2 size={14} className="anim-spin-slow" /> AI กำลังวิเคราะห์...</>
          ) : aiInsight ? (
            <>{expanded ? 'ซ่อน' : 'ดู'}คำแนะนำจาก AI <ChevronRight size={14}
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.25s' }} /></>
          ) : (
            <><Sparkles size={14} color={PALETTE.gold} /> ขอคำแนะนำจาก AI</>
          )}
        </button>

        {expanded && aiInsight && (
          <div className="mt-3 rounded-2xl p-4 anim-fadeIn"
            style={{ backgroundColor: PALETTE.sageDeep }}
          >
            <div className="font-accent text-tiny mb-2 flex items-center gap-1.5" style={{ color: PALETTE.gold }}>
              <Sparkles size={12} /> AI ว่ายังไง
            </div>
            <div className="font-body text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'white' }}>
              {aiInsight}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, bg, accent, onClick, delay }) {
  return (
    <button onClick={onClick}
      className={`smooth-tap text-left rounded-2xl p-4 organic-shadow anim-slideUp ${delay}`}
      style={{ backgroundColor: bg }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: accent + '22', color: accent }}
      >
        {icon}
      </div>
      <div className="font-display font-semibold text-sm" style={{ color: PALETTE.forest }}>{title}</div>
      <div className="font-body text-xs mt-0.5" style={{ color: PALETTE.muted }}>{subtitle}</div>
    </button>
  );
}

/* ============================================================
   Food Log Screen — photo + AI analysis
   ============================================================ */

function FoodLog({ profile, foodLog, addFood, removeFood, editFood, corrections, addCorrection }) {
  const [busy, setBusy] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [result, setResult] = useState(null);
  const [originalResult, setOriginalResult] = useState(null); // before user edits — for learning
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCal, setEditCal] = useState('');
  const fileRef = useRef(null);

  const today = todayKey();
  const todayLog = foodLog.filter(f => f.day === today);
  const consumed = todayLog.reduce((s, f) => s + (f.calories || 0), 0);

  const analyze = async (file) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const [b64, dataUrl] = await Promise.all([fileToBase64(file), fileToDataURL(file)]);
      setPreviewImg(dataUrl);

      const allergyContext = profile.foodAllergy.length
        ? `ผู้ใช้แพ้อาหารต่อไปนี้: ${profile.foodAllergy.join(', ')} ถ้าเจอในรูป ให้ใส่ในช่อง warnings ทันที`
        : '';

      // Build learning context from recent corrections
      const recentCorrections = (corrections || []).slice(-15);
      const learningContext = recentCorrections.length > 0
        ? `\n\n**สิ่งที่ผู้ใช้คนนี้แก้ไขล่าสุด (เรียนรู้จากนี้ — สไตล์อาหาร/ขนาดจาน/รสนิยม):**
${recentCorrections.map((c, i) => `${i+1}. AI ทาย "${c.aiName}" ${c.aiCal} kcal → ผู้ใช้แก้เป็น "${c.realName}" ${c.realCal} kcal`).join('\n')}

ใช้ pattern นี้ปรับการทาย ถ้ารูปนี้คล้ายกับที่ผู้ใช้เคยแก้ ให้ใช้ชื่อ/แคลที่ใกล้เคียงกับที่ผู้ใช้ระบุ
`
        : '';

      const prompt = `คุณคือนักโภชนาการมืออาชีพระดับสูง วิเคราะห์รูปอาหารแบบ "แม่นยำที่สุดเท่าที่เป็นไปได้" — ตรงไปตรงมา ไม่เกรงใจ แต่ยังเป็นมิตร
${allergyContext}${learningContext}

**ฐานข้อมูลอาหารไทย (ใช้เป็นค่าอ้างอิงหลัก ถ้าตรงกับรายการในรูป ให้ใช้ค่านี้):**
${buildDictHint()}

**ขั้นตอนแรก — ตรวจสอบรูปก่อน:**
- ถ้าในรูปไม่มีอาหารชัดเจน (รูปขยะ, รูปคน, รูปสัตว์, รูปวิว, รูปเบลอมาก, รูปมืดดูไม่ออก, รูปสุ่ม)
- หรือเป็นภาพล้อเล่น ภาพการ์ตูน ภาพ meme
- → ตอบ JSON: {"rejected": true, "reason": "บอกสั้นๆ ว่าทำไมไม่วิเคราะห์ เช่น 'รูปนี้ไม่ใช่อาหารนะคะ', 'รูปเบลอมาก ถ่ายใหม่อีกครั้งได้ไหมคะ'"} แล้วหยุด

**ถ้าเป็นอาหารจริง ทำตามขั้นตอน:**
1. ระบุอาหารทุกอย่างที่เห็นในจาน (รวมเครื่องปรุง ผัก น้ำจิ้ม)
2. ประมาณ "ปริมาณจริง" จากรูป — ดูขนาดจาน/ช้อน เป็นตัวอ้างอิง:
   - จานข้าวมาตรฐาน Ø 22-25cm, ชามก๋วยเตี๋ยว 18-22cm, จานเล็ก 18cm
   - ข้าวสวย 1 ทัพพี ≈ 80g ≈ 100 kcal
   - เนื้อสัตว์ขนาดเท่าฝ่ามือ ≈ 100g
3. คำนวณแคลของแต่ละส่วนแยกกัน แล้วบวกรวม (อย่ามั่ว ให้ลองคิดทีละชิ้น)
4. ถ้าเห็นน้ำมัน/ทอด/ผัด ให้บวกแคลน้ำมันเพิ่ม (1 ช้อนโต๊ะ ≈ 120 kcal)
5. ระบุอาหารไทยให้ถูกต้อง (ผัดกะเพรา ≠ ผัดพริกหวาน, ต้มยำน้ำใส ≠ น้ำข้น)
6. ${recentCorrections.length > 0 ? 'ใช้ข้อมูลการแก้ไขข้างบนช่วยตัดสินใจ' : 'ถ้าไม่แน่ใจมาก ตั้งค่า "confidence": "ต่ำ"'}

"ตอบเป็น JSON เท่านั้น" ห้ามมี markdown ห้าม backtick ห้ามข้อความอื่น โครงสร้าง:
{
  "foods": ["ชื่ออาหารแต่ละอย่าง พร้อมปริมาณโดยประมาณ เช่น 'ข้าวสวย 1 ทัพพี', 'ไก่ทอด 2 ชิ้น'"],
  "displayName": "ชื่อสรุปจาน เช่น 'ข้าวมันไก่ + น้ำจิ้ม'",
  "totalCalories": ตัวเลขรวมที่แม่นที่สุด (integer),
  "protein": กรัม (integer),
  "carbs": กรัม (integer),
  "fat": กรัม (integer),
  "sodium": "ต่ำ/ปานกลาง/สูง/สูงมาก",
  "healthScore": 1-10 (10=ดีมาก),
  "confidence": "สูง/ปานกลาง/ต่ำ" (ความมั่นใจในการประมาณ),
  "uncertain": true/false,
  "usedMemory": ${recentCorrections.length > 0 ? 'true ถ้าใช้ข้อมูลการแก้ไขช่วย' : 'false'},
  "verdict": "คำวิจารณ์ตรงๆ 1-2 ประโยค จริงใจไม่เกรงใจ",
  "tips": "คำแนะนำสั้น ทำให้สุขภาพดีขึ้น",
  "warnings": ["คำเตือนถ้ามี เช่น 'เกลือสูง', 'น้ำตาลเยอะ', 'มีกุ้ง (พี่แพ้)'"]
}`;

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
              { type: 'text', text: prompt }
            ]
          }]
        })
      });
      const data = await response.json();
      const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);

      // If AI rejected the image (not food, blurry, etc.)
      if (parsed.rejected) {
        setError(parsed.reason || 'รูปนี้ไม่ใช่อาหาร ลองถ่ายใหม่นะคะ');
        setPreviewImg(null);
        setBusy(false);
        return;
      }

      const withImg = { ...parsed, image: dataUrl };
      setResult(withImg);
      setOriginalResult({
        displayName: parsed.displayName,
        totalCalories: parsed.totalCalories,
      });
    } catch (e) {
      setError('วิเคราะห์ไม่สำเร็จ ลองใหม่อีกครั้งนะคะ');
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) analyze(f);
  };

  const save = () => {
    if (!result) return;

    // If user edited name or calories, record the correction for learning
    if (originalResult && addCorrection) {
      const nameChanged = originalResult.displayName !== result.displayName;
      const calChanged = Math.abs((originalResult.totalCalories || 0) - (result.totalCalories || 0)) > 10;
      if (nameChanged || calChanged) {
        addCorrection({
          id: 'c' + Date.now(),
          ts: Date.now(),
          aiName: originalResult.displayName,
          aiCal: originalResult.totalCalories,
          realName: result.displayName,
          realCal: result.totalCalories,
        });
      }
    }

    addFood({
      id: 'f' + Date.now(),
      day: today,
      time: timeNow(),
      name: result.displayName || result.foods?.[0] || 'อาหาร',
      calories: result.totalCalories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      image: result.image,
      verdict: result.verdict,
      healthScore: result.healthScore,
    });
    setResult(null);
    setOriginalResult(null);
    setPreviewImg(null);
  };

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>FOOD LOG</div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
          ถ่ายแล้ว AI วิเคราะห์เลย
        </h1>
        <p className="font-body text-sm mb-5" style={{ color: PALETTE.muted }}>
          ตรงไปตรงมา ไม่เกรงใจ แต่ใจดี
        </p>
      </div>

      {/* Capture card */}
      <div className="px-5 mb-4">
        {!result && !busy && (
          <button onClick={() => fileRef.current?.click()}
            className="smooth-tap w-full rounded-3xl p-8 flex flex-col items-center gap-3 anim-pulseGlow"
            style={{
              backgroundColor: PALETTE.sageDeep,
              backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(201,163,107,0.25), transparent 50%)'
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Camera size={28} color="white" />
            </div>
            <div className="font-display font-semibold text-white text-lg">ถ่ายรูป / เลือกรูปอาหาร</div>
            <div className="font-body text-xs text-white/60">น้องไกด์จะวิเคราะห์แคลและสารอาหารให้ทันที</div>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" capture="environment" />

        {/* Loading */}
        {busy && (
          <div className="rounded-3xl p-6 anim-fadeIn" style={{ backgroundColor: PALETTE.paper }}>
            {previewImg && <img src={previewImg} className="w-full h-40 object-cover rounded-2xl mb-4" alt="" />}
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="anim-spin-slow" size={20} color={PALETTE.sage} />
              <div className="font-body text-sm" style={{ color: PALETTE.sageDark }}>
                น้องไกด์กำลังดูรูปอยู่...
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-full shimmer-bg" />
              <div className="h-3 rounded-full shimmer-bg w-3/4" />
              <div className="h-3 rounded-full shimmer-bg w-1/2" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-4 mt-3 anim-fadeIn flex items-start gap-2"
            style={{ backgroundColor: PALETTE.coralSoft }}
          >
            <AlertCircle size={18} color={PALETTE.coral} />
            <div className="font-body text-sm" style={{ color: PALETTE.coral }}>{error}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-3xl overflow-hidden anim-slideUp deep-shadow"
            style={{ backgroundColor: PALETTE.paper }}
          >
            {result.image && (
              <div className="relative">
                <img src={result.image} className="w-full h-48 object-cover" alt="" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }}
                />
                <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2 pointer-events-none">
                  {result.usedMemory ? (
                    <div className="px-2.5 py-1 rounded-full font-accent text-tiny flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(201,163,107,0.95)', color: 'white' }}
                    >
                      <Sparkles size={10} /> เรียนรู้จากที่พี่แก้
                    </div>
                  ) : <div />}
                  {result.confidence && (
                    <div className="px-2.5 py-1 rounded-full font-accent text-tiny"
                      style={{
                        backgroundColor: result.confidence === 'สูง' ? 'rgba(135,168,120,0.95)'
                          : result.confidence === 'ปานกลาง' ? 'rgba(201,163,107,0.95)'
                          : 'rgba(217,104,74,0.95)',
                        color: 'white',
                      }}
                    >
                      ความมั่นใจ: {result.confidence}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <input
                    value={result.displayName || ''}
                    onChange={e => setResult({ ...result, displayName: e.target.value })}
                    className="font-display text-xl font-bold bg-transparent w-full focus:outline-none border-b border-dashed border-white/40 pb-0.5"
                    style={{ color: 'white' }}
                  />
                  <div className="font-body text-xs opacity-80 mt-1">{result.foods?.join(' · ')}</div>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={result.totalCalories || ''}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '');
                        setResult({ ...result, totalCalories: v ? parseInt(v) : 0 });
                      }}
                      className="font-display text-4xl font-bold bg-transparent border-b border-dashed w-24 focus:outline-none"
                      style={{ color: PALETTE.sageDeep, borderColor: PALETTE.mist }}
                    />
                    <Pencil size={12} color={PALETTE.muted} />
                  </div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>kcal · แก้ไขได้</div>
                </div>
                <HealthScoreBadge score={result.healthScore} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Macro icon={<Leaf size={14} />} label="โปรตีน" value={result.protein} tone={PALETTE.sage} />
                <Macro icon={<Wheat size={14} />} label="คาร์บ" value={result.carbs} tone={PALETTE.gold} />
                <Macro icon={<Droplet size={14} />} label="ไขมัน" value={result.fat} tone={PALETTE.coral} />
              </div>

              {result.verdict && (
                <div className="rounded-2xl p-3 mb-3"
                  style={{ backgroundColor: PALETTE.shell }}
                >
                  <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>
                    น้องไกด์ว่า
                  </div>
                  <div className="font-body text-sm leading-relaxed" style={{ color: PALETTE.forest }}>
                    "{result.verdict}"
                  </div>
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="space-y-2 mb-3">
                  {result.warnings.map((w, i) => (
                    <div key={i}
                      className="rounded-xl p-2.5 flex items-start gap-2"
                      style={{ backgroundColor: PALETTE.coralSoft }}
                    >
                      <AlertTriangle size={16} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                      <div className="font-body text-xs" style={{ color: PALETTE.coral }}>{w}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.tips && (
                <p className="font-body text-xs mb-4 leading-relaxed" style={{ color: PALETTE.muted }}>
                  💡 {result.tips}
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setResult(null); setPreviewImg(null); }}
                  className="smooth-tap flex-1 py-3 rounded-2xl font-display font-medium text-sm"
                  style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
                >
                  ยกเลิก
                </button>
                <button onClick={save}
                  className="smooth-tap flex-2 py-3 rounded-2xl font-display font-medium text-sm text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: PALETTE.sageDark }}
                >
                  <Check size={16} /> บันทึกมื้อนี้
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today summary */}
      {!result && !busy && (
        <div className="px-5 mt-2">
          <div className="rounded-2xl p-4 mb-4 organic-shadow flex items-center justify-between"
            style={{ backgroundColor: PALETTE.paper }}
          >
            <div>
              <div className="font-body text-xs" style={{ color: PALETTE.muted }}>วันนี้กินไป</div>
              <div className="font-display text-2xl font-bold" style={{ color: PALETTE.sageDeep }}>
                {consumed} <span className="text-sm font-normal" style={{ color: PALETTE.muted }}>kcal</span>
              </div>
            </div>
            <div className="font-body text-xs px-3 py-1.5 rounded-full"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
            >
              {todayLog.length} มื้อ
            </div>
          </div>

          {foodLog.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: PALETTE.paper }}>
              <UtensilsCrossed size={32} className="mx-auto mb-2" color={PALETTE.mist} />
              <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
                ยังไม่มีประวัติ ลองถ่ายมื้อแรกกันเลย
              </div>
            </div>
          ) : (
            <>
              <div className="font-display font-semibold text-sm mb-2" style={{ color: PALETTE.sageDeep }}>
                ประวัติการกิน
              </div>
              <div className="space-y-2">
                {foodLog.slice().reverse().map((f) => (
                  <div key={f.id}
                    className="rounded-2xl overflow-hidden organic-shadow anim-fadeIn"
                    style={{ backgroundColor: PALETTE.paper }}
                  >
                    {editingId === f.id ? (
                      <div className="p-3 anim-fadeIn">
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          placeholder="ชื่ออาหาร"
                          className="font-body w-full px-3 py-2 rounded-xl text-sm mb-2"
                          style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                          autoFocus
                        />
                        <input value={editCal} onChange={e => setEditCal(e.target.value.replace(/\D/g, ''))}
                          placeholder="แคลอรี่"
                          inputMode="numeric"
                          className="font-body w-full px-3 py-2 rounded-xl text-sm mb-2"
                          style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)}
                            className="smooth-tap flex-1 py-2 rounded-xl font-display text-xs"
                            style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
                          >ยกเลิก</button>
                          <button onClick={() => {
                              const newName = editName.trim() || f.name;
                              const newCal = +editCal || f.calories;
                              // Record correction if name or cal actually changed
                              if (addCorrection && (newName !== f.name || Math.abs(newCal - (f.calories || 0)) > 10)) {
                                addCorrection({
                                  id: 'c' + Date.now(),
                                  ts: Date.now(),
                                  aiName: f.name,
                                  aiCal: f.calories,
                                  realName: newName,
                                  realCal: newCal,
                                });
                              }
                              editFood(f.id, { name: newName, calories: newCal });
                              setEditingId(null);
                            }}
                            className="smooth-tap flex-[2] py-2 rounded-xl font-display font-semibold text-xs text-white"
                            style={{ backgroundColor: PALETTE.sageDark }}
                          >บันทึก</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3">
                        {f.image ? (
                          <img src={f.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: PALETTE.shell }}>
                            <UtensilsCrossed size={20} color={PALETTE.sage} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-body font-medium text-sm truncate" style={{ color: PALETTE.forest }}>
                            {f.name}
                          </div>
                          <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                            {f.day} · {f.time}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-display text-sm font-semibold" style={{ color: PALETTE.sageDark }}>
                              {f.calories} kcal
                            </span>
                            {f.healthScore && (
                              <span className="font-accent text-tiny px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: PALETTE.shell, color: PALETTE.gold }}
                              >
                                สุขภาพ {f.healthScore}/10
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => {
                            setEditingId(f.id);
                            setEditName(f.name);
                            setEditCal(String(f.calories || ''));
                          }}
                          className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ color: PALETTE.sageDark }}
                          title="แก้ไข"
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => removeFood(f.id)}
                          className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ color: PALETTE.muted }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HealthScoreBadge({ score }) {
  let tone = PALETTE.coral;
  let label = 'ไม่ค่อยดี';
  if (score >= 8) { tone = PALETTE.sage; label = 'ดีมาก'; }
  else if (score >= 6) { tone = PALETTE.sageDark; label = 'พอใช้'; }
  else if (score >= 4) { tone = PALETTE.gold; label = 'ระวัง'; }
  return (
    <div className="text-right">
      <div className="font-display text-2xl font-bold" style={{ color: tone }}>
        {score}<span className="text-sm" style={{ color: PALETTE.muted }}>/10</span>
      </div>
      <div className="font-body text-xs" style={{ color: tone }}>{label}</div>
    </div>
  );
}

function Macro({ icon, label, value, tone }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: PALETTE.shell }}>
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: tone }}>
        {icon}<span className="font-accent text-tiny">{label}</span>
      </div>
      <div className="font-display text-base font-bold" style={{ color: PALETTE.forest }}>
        {value}<span className="text-tiny font-normal" style={{ color: PALETTE.muted }}>g</span>
      </div>
    </div>
  );
}

/* ============================================================
   Medicine Cabinet
   ============================================================ */

function MedicineCabinet({ medicines, addMedicine, removeMedicine, onModalChange }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const scanFileRef = useRef(null);

  useEffect(() => {
    onModalChange?.(adding);
    return () => onModalChange?.(false);
  }, [adding]);

  const scanLabel = async (file) => {
    setScanning(true);
    setScanError(null);
    try {
      const b64 = await fileToBase64(file);
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
              { type: 'text', text: `ดูฉลากยาในรูปนี้ และสกัดข้อมูลออกมา

**กฎสำคัญ:**
- ดูได้เฉพาะ "ฉลากยา" เท่านั้น (ฉลากบนซอง/กล่อง/ขวดยา ที่มีตัวอักษรชัดเจน)
- ห้ามเดาจากรูปร่าง สี หรือเม็ดยาเปล่าๆ — ถ้าไม่เห็นฉลากชัด ให้ตอบ {"error": "ไม่เห็นฉลากยาที่ชัดเจน กรุณาถ่ายฉลากให้ชัดอีกครั้ง"}
- ถ้ารูปไม่ใช่ยา ให้ตอบ {"error": "รูปนี้ไม่ใช่ฉลากยา"}

ตอบเป็น JSON เท่านั้น ห้ามมี markdown:
{
  "name": "ชื่อยา/ตัวยาสำคัญที่อ่านจากฉลากได้",
  "dosage": "ขนาดยา/strength เช่น '500mg'",
  "category": "ประเภทยาสั้นๆ เช่น แก้ปวด/ลดไข้",
  "usage": "ใช้รักษาอะไร 1-2 ประโยค",
  "dosageTip": "วิธีกินที่อ่านจากฉลาก หรือทั่วไปถ้าไม่มี",
  "warnings": ["คำเตือนสำคัญ 2-4 ข้อ"]
}` }
            ]
          }]
        })
      });
      const data = await response.json();
      const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
      const info = JSON.parse(text);
      if (info.error) {
        setScanError(info.error);
        return;
      }
      addMedicine({ id: 'm' + Date.now(), ...info });
      setAdding(false);
    } catch (e) {
      setScanError('สแกนไม่สำเร็จ ลองถ่ายใหม่นะคะ');
    } finally {
      setScanning(false);
    }
  };

  const onScanFile = (e) => {
    const f = e.target.files?.[0];
    if (f) scanLabel(f);
    e.target.value = '';
  };

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `ผู้ใช้กำลังเพิ่ม "${name}" เข้าตู้ยา ให้ข้อมูลยาตัวนี้เป็น JSON เท่านั้น ห้ามมี markdown:
{
  "category": "ประเภทยาสั้นๆ เช่น แก้ปวด/ลดไข้",
  "usage": "ใช้รักษาอะไร เขียนเข้าใจง่าย 1-2 ประโยค",
  "dosageTip": "วิธีกินทั่วไป",
  "warnings": ["คำเตือนสั้นๆ ที่สำคัญที่สุด 2-4 ข้อ"],
  "color": "ชื่อสีหลักของยา เช่น ขาว, ฟ้า"
}
ถ้าไม่ใช่ชื่อยาที่รู้จัก ใส่ category เป็น "ไม่ทราบ" และให้ข้อมูลเท่าที่เดาได้`
          }]
        })
      });
      const data = await response.json();
      const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
      const info = JSON.parse(text);
      addMedicine({
        id: 'm' + Date.now(),
        name: name.trim(),
        dosage: dosage.trim(),
        ...info,
      });
      setName(''); setDosage(''); setAdding(false);
    } catch (e) {
      addMedicine({
        id: 'm' + Date.now(),
        name: name.trim(),
        dosage: dosage.trim(),
        category: 'ไม่ทราบ',
        usage: 'ยังไม่มีข้อมูล',
        warnings: ['ปรึกษาเภสัชกรก่อนใช้'],
      });
      setName(''); setDosage(''); setAdding(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6 flex items-start justify-between mb-5">
        <div>
          <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>MEDICINE CABINET</div>
          <h1 className="font-display text-3xl font-bold" style={{ color: PALETTE.sageDeep }}>
            ตู้ยา
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: PALETTE.muted }}>
            ยาแต่ละตัวคืออะไร ใช้ยังไง
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="smooth-tap w-11 h-11 rounded-2xl flex items-center justify-center deep-shadow"
          style={{ backgroundColor: PALETTE.sageDark, color: 'white' }}
        >
          <Plus size={20} />
        </button>
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(39,54,31,0.4)' }}
          onClick={() => !busy && setAdding(false)}
        >
          <div className="w-full rounded-t-3xl p-6 pb-28 anim-slideUp" style={{ backgroundColor: PALETTE.cream }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: PALETTE.mist }} />
            <h3 className="font-display text-xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
              เพิ่มยาเข้าตู้
            </h3>
            <p className="font-body text-sm mb-4" style={{ color: PALETTE.muted }}>
              ถ่ายฉลากยา หรือพิมพ์ชื่อก็ได้
            </p>

            {/* Scan button */}
            <input ref={scanFileRef} type="file" accept="image/*" capture="environment"
              onChange={onScanFile} className="hidden"
            />
            <button onClick={() => scanFileRef.current?.click()} disabled={scanning || busy}
              className="smooth-tap w-full p-4 rounded-2xl mb-3 flex items-center gap-3 relative overflow-hidden disabled:opacity-50"
              style={{ backgroundColor: PALETTE.sageDeep }}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
                style={{ backgroundColor: PALETTE.gold }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                {scanning ? <Loader2 size={18} color="white" className="anim-spin-slow" /> : <ScanLine size={18} color={PALETTE.gold} />}
              </div>
              <div className="text-left relative flex-1">
                <div className="font-display font-semibold text-white text-sm">
                  {scanning ? 'กำลังอ่านฉลาก...' : 'ถ่ายฉลากยา'}
                </div>
                <div className="font-body text-tiny text-white/70 mt-0.5">
                  AI จะอ่านชื่อยาและข้อมูลให้
                </div>
              </div>
            </button>

            {scanError && (
              <div className="rounded-xl p-3 mb-3 flex items-start gap-2"
                style={{ backgroundColor: PALETTE.coralSoft }}
              >
                <AlertCircle size={16} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                <div className="font-body text-xs flex-1" style={{ color: PALETTE.coral }}>{scanError}</div>
                <button onClick={() => setScanError(null)} style={{ color: PALETTE.coral }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ backgroundColor: PALETTE.mist }} />
              <div className="font-accent text-tiny" style={{ color: PALETTE.muted }}>หรือพิมพ์เอง</div>
              <div className="flex-1 h-px" style={{ backgroundColor: PALETTE.mist }} />
            </div>

            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="ชื่อยา เช่น พาราเซตามอล 500mg"
              className="font-body w-full px-5 py-4 rounded-2xl text-base mb-3"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            />
            <input value={dosage} onChange={e => setDosage(e.target.value)}
              placeholder="ขนาดยา / โดส (ถ้ามี)"
              className="font-body w-full px-5 py-4 rounded-2xl text-base mb-5"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            />
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} disabled={busy || scanning}
                className="smooth-tap flex-1 py-4 rounded-2xl font-display font-medium disabled:opacity-50"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest }}
              >
                ยกเลิก
              </button>
              <button onClick={submit} disabled={busy || scanning || !name.trim()}
                className="smooth-tap flex-2 py-4 rounded-2xl font-display font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: PALETTE.sageDark }}
              >
                {busy ? <><Loader2 className="anim-spin-slow" size={18} /> กำลังหาข้อมูล...</> : <><Sparkles size={16} /> เพิ่ม</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5">
        {medicines.length === 0 ? (
          <div className="rounded-3xl p-10 text-center anim-fadeIn"
            style={{ backgroundColor: PALETTE.paper }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: PALETTE.shell }}
            >
              <Pill size={28} color={PALETTE.sage} />
            </div>
            <div className="font-display font-semibold mb-1" style={{ color: PALETTE.sageDeep }}>
              ตู้ยายังว่างอยู่
            </div>
            <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
              กดปุ่ม + ด้านบนเพื่อเพิ่มยา
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map((m) => (
              <div key={m.id}
                className="rounded-2xl overflow-hidden organic-shadow anim-slideUp"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <button onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: PALETTE.shell }}
                  >
                    <Pill size={20} color={PALETTE.sage} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold" style={{ color: PALETTE.forest }}>
                      {m.name}
                    </div>
                    <div className="font-body text-xs mt-0.5" style={{ color: PALETTE.muted }}>
                      {m.category}{m.dosage && ` · ${m.dosage}`}
                    </div>
                  </div>
                  <ChevronRight size={18} color={PALETTE.muted}
                    style={{
                      transform: expanded === m.id ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.25s ease'
                    }}
                  />
                </button>
                {expanded === m.id && (
                  <div className="px-4 pb-4 anim-fadeIn">
                    <div className="border-t pt-3" style={{ borderColor: PALETTE.mist }}>
                      <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>ใช้รักษา</div>
                      <div className="font-body text-sm mb-3 leading-relaxed" style={{ color: PALETTE.forest }}>
                        {m.usage}
                      </div>
                      {m.dosageTip && (
                        <>
                          <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>วิธีกิน</div>
                          <div className="font-body text-sm mb-3 leading-relaxed" style={{ color: PALETTE.forest }}>
                            {m.dosageTip}
                          </div>
                        </>
                      )}
                      {m.warnings && m.warnings.length > 0 && (
                        <>
                          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.coral }}>ข้อควรระวัง</div>
                          <div className="space-y-1.5 mb-3">
                            {m.warnings.map((w, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <AlertCircle size={14} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                                <div className="font-body text-xs" style={{ color: PALETTE.forest }}>{w}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <button onClick={() => removeMedicine(m.id)}
                        className="smooth-tap font-body text-xs flex items-center gap-1.5 mt-2"
                        style={{ color: PALETTE.coral }}
                      >
                        <Trash2 size={12} /> ลบยานี้
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-2xl p-3 flex items-start gap-2"
          style={{ backgroundColor: PALETTE.coralSoft }}
        >
          <AlertTriangle size={16} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
          <div className="font-body text-xs leading-relaxed" style={{ color: PALETTE.coral }}>
            ข้อมูลยาเป็นคำแนะนำเบื้องต้นเท่านั้น ก่อนใช้ยาควรปรึกษาเภสัชกรหรือแพทย์ทุกครั้ง
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Chat — น้องไกด์
   ============================================================ */

function ChatScreen({ profile, messages, addMessage, clearMessages, personality }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => load('gyn_voice', false));
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const scrollRef = useRef(null);

  const persona = resolvePersonality(personality, profile.age);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = (text, idx) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    if (speakingIdx === idx) { setSpeakingIdx(null); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/[🌿✨💛🌟⭐🎉🙏🚑👋😊💪🧸🤝🌷👔]/g, ''));
    u.lang = 'th-TH';
    u.rate = 1.0;
    u.pitch = 1.05;
    // Try to pick a Thai voice
    const voices = window.speechSynthesis.getVoices();
    const thai = voices.find(v => v.lang === 'th-TH' || v.lang.startsWith('th'));
    if (thai) u.voice = thai;
    u.onend = () => setSpeakingIdx(null);
    u.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(u);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    save('gyn_voice', next);
    if (!next) { window.speechSynthesis?.cancel(); setSpeakingIdx(null); }
  };

  // Auto-speak the latest assistant message when voice is on
  useEffect(() => {
    if (!voiceOn || !ttsSupported) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && !last._spoken) {
      last._spoken = true;
      speak(last.content, messages.length - 1);
    }
  }, [messages.length]);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const startNewChat = () => {
    if (messages.length === 0) return;
    setConfirmClear(true);
  };
  const doClear = () => {
    clearMessages?.();
    setConfirmClear(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    addMessage(userMsg);
    setBusy(true);

    try {
      const bmi = calcBMI(profile.weight, profile.height);
      const system = `${persona.prompt}

(ในแอป GINYARAIDEE — แอปสุขภาพที่ให้คำแนะนำเบื้องต้น)

หน้าที่หลัก:
1. ให้คำแนะนำสุขภาพเบื้องต้น (ไม่วินิจฉัย ไม่จ่ายยา)
2. ถ้ามีอาการรุนแรง เช่น เจ็บหน้าอกหนัก หายใจไม่ออก ปวดหัวรุนแรงเฉียบพลัน อาเจียนเป็นเลือด อ่อนแรงครึ่งซีก ชัก หมดสติ หรือคิดทำร้ายตัวเอง → ต้องเตือนให้ไปพบแพทย์/โทร 1669 ทันทีอย่างจริงจัง
3. ถ้าอาการเล็กน้อย → ให้คำแนะนำดูแลเบื้องต้นพร้อมบอก "ถ้าไม่ดีขึ้นใน 2-3 วัน ไปหาหมอนะ"
4. คำนึงถึงข้อมูลผู้ใช้และสิ่งที่แพ้เสมอ — ถ้าถามเรื่องยา ให้เช็คก่อนว่ามีในรายการแพ้ไหม
5. ห้ามใช้ markdown หรือ ** ตอบสั้นๆ กระชับ 2-4 ประโยค

ข้อมูลผู้ใช้:
- ชื่อ: ${profile.name}
- เพศ: ${profile.gender === 'female' ? 'หญิง' : 'ชาย'}, อายุ ${profile.age} ปี
- BMI: ${bmi}
- แพ้อาหาร: ${profile.foodAllergy.join(', ') || 'ไม่มี'}
- แพ้ยา: ${profile.drugAllergy.join(', ') || 'ไม่มี'}`;

      const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system,
          messages: [...history, { role: 'user', content: text }],
        })
      });
      const data = await response.json();
      const reply = data.content.map(b => b.text || '').join('').trim();
      addMessage({ role: 'assistant', content: reply, ts: Date.now() });
    } catch (e) {
      addMessage({
        role: 'assistant',
        content: 'ขอโทษค่ะพี่ หนูตอบไม่ได้ตอนนี้ ลองอีกครั้งนะคะ 🙏',
        ts: Date.now()
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col chat-screen-h anim-fadeIn relative">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3"
        style={{ backgroundColor: PALETTE.cream, borderBottom: `1px solid ${PALETTE.mist}` }}
      >
        <div className="anim-float flex-shrink-0">
          <LogoMark size={44} />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold" style={{ color: PALETTE.sageDeep }}>{persona.label}</div>
          <div className="font-body text-xs flex items-center gap-1.5" style={{ color: PALETTE.sage }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PALETTE.sage }} />
            {persona.sub} · พร้อมคุย
          </div>
        </div>
        {ttsSupported && (
          <button className="smooth-tap w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: voiceOn ? PALETTE.sage : PALETTE.shell,
              color: voiceOn ? 'white' : PALETTE.sageDark,
            }}
            title={voiceOn ? 'ปิดเสียงพูด' : 'เปิดเสียงพูด'}
            onClick={toggleVoice}
          >
            {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        )}
        <button className="smooth-tap w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40"
          style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
          title="เริ่มแชทใหม่"
          disabled={messages.length === 0}
          onClick={startNewChat}
        >
          <RotateCcw size={15} />
        </button>
        <button className="smooth-tap w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
          title="ฉุกเฉิน"
          onClick={() => addMessage({
            role: 'assistant',
            content: 'ถ้าเจ็บป่วยฉุกเฉิน โทร 1669 (สถาบันการแพทย์ฉุกเฉิน) ได้ตลอด 24 ชม.นะคะพี่ 🚑',
            ts: Date.now()
          })}
        >
          <Phone size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-12 anim-fadeIn">
            <div className="anim-float inline-block mb-4">
              <LogoMark size={72} />
            </div>
            <div className="text-3xl mb-2">{persona.icon}</div>
            <div className="font-display text-xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
              สวัสดี {profile.name}
            </div>
            <p className="font-body text-sm leading-relaxed mb-6 max-w-xs mx-auto" style={{ color: PALETTE.muted }}>
              ฉันคือ <strong style={{ color: PALETTE.sageDark }}>{persona.label}</strong><br />
              {persona.desc}
            </p>
            <div className="space-y-2 max-w-xs mx-auto">
              {['ปวดหัวมา 2 วัน ทำยังไงดี', 'อาหารแบบไหนช่วยให้นอนหลับ', 'ออกกำลังกายแบบไหนเหมาะกับมือใหม่'].map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  className="smooth-tap w-full text-left px-4 py-2.5 rounded-2xl text-sm font-body"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i}
            className={`flex mb-3 anim-slideUp ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 flex items-center justify-center"
                style={{ backgroundColor: PALETTE.sageDeep }}
              >
                <Heart size={12} color={PALETTE.gold} />
              </div>
            )}
            <div className={`max-w-80 rounded-2xl px-4 py-2.5`}
              style={{
                backgroundColor: m.role === 'user' ? PALETTE.sageDark : PALETTE.paper,
                color: m.role === 'user' ? 'white' : PALETTE.forest,
                borderTopLeftRadius: m.role === 'assistant' ? 4 : undefined,
                borderTopRightRadius: m.role === 'user' ? 4 : undefined,
                boxShadow: m.role === 'assistant' ? '0 1px 2px rgba(46,68,41,0.05)' : 'none',
              }}
            >
              <div className="font-body text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              {m.role === 'assistant' && ttsSupported && (
                <button onClick={() => speak(m.content, i)}
                  className="smooth-tap mt-1.5 flex items-center gap-1 font-body text-tiny"
                  style={{ color: speakingIdx === i ? PALETTE.sage : PALETTE.muted }}
                >
                  {speakingIdx === i ? <Volume2 size={12} /> : <Volume2 size={12} />}
                  {speakingIdx === i ? 'กำลังพูด...' : 'ฟังเสียง'}
                </button>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex mb-3 anim-fadeIn">
            <div className="w-7 h-7 rounded-full mr-2 flex items-center justify-center"
              style={{ backgroundColor: PALETTE.sageDeep }}
            >
              <Heart size={12} color={PALETTE.gold} />
            </div>
            <div className="rounded-2xl px-4 py-3 flex gap-1"
              style={{ backgroundColor: PALETTE.paper, borderTopLeftRadius: 4 }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: PALETTE.sage,
                    animation: `pulseGlow 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2" style={{ backgroundColor: PALETTE.cream }}>
        <div className="flex items-center gap-2 rounded-2xl px-2 py-1.5 chip-input"
          style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
        >
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="ถามน้องไกด์ได้เลย..."
            className="font-body flex-1 px-3 py-2.5 text-sm bg-transparent"
            style={{ color: PALETTE.forest }}
          />
          <button onClick={send} disabled={!input.trim() || busy}
            className="smooth-tap w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{ backgroundColor: PALETTE.sageDark, color: 'white' }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="font-body text-tiny text-center mt-2" style={{ color: PALETTE.muted }}>
          คำแนะนำเบื้องต้นเท่านั้น · หากอาการรุนแรงควรพบแพทย์
        </div>
      </div>

      {confirmClear && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6 anim-fadeIn"
          style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
          onClick={() => setConfirmClear(false)}
        >
          <div className="w-full rounded-3xl p-6 deep-shadow anim-slideUp"
            style={{ backgroundColor: PALETTE.paper }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
            >
              <RotateCcw size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-center mb-1" style={{ color: PALETTE.sageDeep }}>
              เริ่มแชทใหม่?
            </h3>
            <p className="font-body text-sm text-center mb-5 leading-relaxed" style={{ color: PALETTE.muted }}>
              ประวัติที่คุยกับน้องไกด์<br />จะหายไปทั้งหมดนะคะ
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmClear(false)}
                className="smooth-tap flex-1 py-3 rounded-2xl font-display font-medium"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
              >
                ยกเลิก
              </button>
              <button onClick={doClear}
                className="smooth-tap flex-1 py-3 rounded-2xl font-display font-semibold text-white"
                style={{ backgroundColor: PALETTE.coral }}
              >
                เริ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Mental Health Check
   ============================================================ */

const MENTAL_QUESTIONS = [
  { q: 'ใน 2 สัปดาห์ที่ผ่านมา พี่รู้สึกหดหู่ ซึมเศร้า หรือสิ้นหวังบ่อยแค่ไหน?' },
  { q: 'พี่หมดความสนใจหรือไม่สนุกกับสิ่งที่เคยชอบหรือเปล่า?' },
  { q: 'พี่นอนหลับยาก ตื่นกลางดึก หรือนอนมากเกินไปไหม?' },
  { q: 'พี่รู้สึกเหนื่อยหรือไม่มีแรงไหม?' },
  { q: 'พี่กังวลหรือกระวนกระวายควบคุมไม่ได้บ่อยแค่ไหน?' },
  { q: 'พี่รู้สึกว่าตัวเองไม่มีค่า หรือผิดที่ผ่านมาไหม?' },
];

const OPTIONS = [
  { v: 0, label: 'ไม่เลย', tone: PALETTE.sage },
  { v: 1, label: 'บางวัน', tone: PALETTE.gold },
  { v: 2, label: 'เกินครึ่ง', tone: PALETTE.coral },
  { v: 3, label: 'แทบทุกวัน', tone: '#B8453A' },
];

function MentalHealth({ profile }) {
  const [step, setStep] = useState(0); // 0 intro, 1..N questions, N+1 result
  const [answers, setAnswers] = useState({});
  const [aiText, setAiText] = useState('');
  const [busy, setBusy] = useState(false);

  const totalQ = MENTAL_QUESTIONS.length;
  const isQ = step >= 1 && step <= totalQ;
  const isResult = step === totalQ + 1;

  const score = Object.values(answers).reduce((s, v) => s + v, 0);
  const maxScore = totalQ * 3;

  let level = { label: 'ดีมาก', tone: PALETTE.sage, msg: 'จิตใจของพี่ดูดีอยู่ ดูแลตัวเองต่อไปนะคะ' };
  if (score >= maxScore * 0.66) level = { label: 'ควรพบผู้เชี่ยวชาญ', tone: '#B8453A', msg: 'หนูแนะนำให้พี่ปรึกษาผู้เชี่ยวชาญ เพื่อดูแลตัวเองอย่างเหมาะสม' };
  else if (score >= maxScore * 0.4) level = { label: 'ควรดูแลเพิ่ม', tone: PALETTE.coral, msg: 'พี่อาจกำลังเครียดอยู่ ลองหาเวลาพักผ่อน และหาคนคุยด้วยนะคะ' };
  else if (score >= maxScore * 0.2) level = { label: 'มีบางอย่างกวนใจ', tone: PALETTE.gold, msg: 'อาจมีอะไรที่กังวลอยู่บ้าง ลองสังเกตและดูแลตัวเองนะคะ' };

  const generate = async () => {
    setBusy(true);
    try {
      const answersText = MENTAL_QUESTIONS.map((q, i) => `${q.q} → ${OPTIONS[answers[i] ?? 0].label}`).join('\n');
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `คุณคือน้องไกด์ น้องสาวใจดี ในแอป GINYARAIDEE
ผู้ใช้พี่ "${profile.name}" เพิ่งทำแบบคัดกรองสุขภาพจิตเบื้องต้น คำตอบคือ:
${answersText}

ระดับสรุป: ${level.label} (คะแนน ${score}/${maxScore})

ให้คำแนะนำอบอุ่น 3-4 ประโยค:
1. ยอมรับความรู้สึกของพี่ก่อน
2. แนะนำการดูแลตัวเองเล็กๆ ที่ทำได้
3. ถ้าระดับสูง (ควรพบผู้เชี่ยวชาญ) → แนะนำสายด่วนสุขภาพจิต 1323 และให้กำลังใจในการขอความช่วยเหลือ
ห้ามใช้ markdown ห้ามใช้ ** ตอบเป็นข้อความธรรมดา`
          }]
        })
      });
      const data = await response.json();
      setAiText(data.content.map(b => b.text || '').join('').trim());
    } catch (e) {
      setAiText(level.msg);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isResult && !aiText) generate();
  }, [isResult]);

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>MENTAL CHECK</div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
          เช็คใจกัน
        </h1>
        <p className="font-body text-sm mb-6" style={{ color: PALETTE.muted }}>
          คัดกรองสุขภาพจิตเบื้องต้น
        </p>

        {step === 0 && (
          <div className="anim-slideUp">
            <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden"
              style={{ backgroundColor: PALETTE.sageDeep }}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20"
                style={{ backgroundColor: PALETTE.coral }} />
              <Brain size={36} color={PALETTE.gold} className="mb-3 relative" />
              <div className="font-display text-xl font-bold text-white mb-1 relative">หนูจะถาม {totalQ} ข้อ</div>
              <p className="font-body text-sm text-white/70 leading-relaxed relative">
                เกี่ยวกับความรู้สึกในช่วง 2 สัปดาห์ที่ผ่านมา ตอบตามจริงนะคะ ไม่มีถูกผิด<br />
                <span className="text-xs">ใช้เวลาประมาณ 1-2 นาที</span>
              </p>
            </div>

            <div className="rounded-2xl p-4 mb-4 flex items-start gap-2"
              style={{ backgroundColor: PALETTE.shell }}
            >
              <Shield size={16} color={PALETTE.sageDark} className="flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs leading-relaxed" style={{ color: PALETTE.sageDark }}>
                แบบคัดกรองนี้เป็นเครื่องมือเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์<br />
                หากต้องการความช่วยเหลือเร่งด่วน โทรสายด่วนสุขภาพจิต <strong>1323</strong>
              </p>
            </div>

            <button onClick={() => setStep(1)}
              className="smooth-tap w-full py-4 rounded-2xl font-display font-semibold text-white deep-shadow"
              style={{ backgroundColor: PALETTE.sageDark }}
            >
              เริ่มเช็คใจ
            </button>
          </div>
        )}

        {isQ && (
          <div className="anim-slideUp" key={step}>
            <div className="flex items-center gap-2 mb-5">
              <div className="font-accent text-xs" style={{ color: PALETTE.gold }}>
                ข้อ {step} / {totalQ}
              </div>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: PALETTE.mist }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(step / totalQ) * 100}%`, backgroundColor: PALETTE.sage }} />
              </div>
            </div>

            <div className="rounded-3xl p-6 mb-5 deep-shadow" style={{ backgroundColor: PALETTE.paper }}>
              <div className="font-display text-xl font-semibold leading-relaxed" style={{ color: PALETTE.sageDeep }}>
                {MENTAL_QUESTIONS[step - 1].q}
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {OPTIONS.map((o) => (
                <button key={o.v}
                  onClick={() => {
                    setAnswers({ ...answers, [step - 1]: o.v });
                    setTimeout(() => setStep(step + 1), 220);
                  }}
                  className="smooth-tap w-full p-4 rounded-2xl flex items-center justify-between text-left"
                  style={{
                    backgroundColor: answers[step - 1] === o.v ? o.tone : PALETTE.paper,
                    color: answers[step - 1] === o.v ? 'white' : PALETTE.forest,
                    border: `1px solid ${answers[step - 1] === o.v ? o.tone : PALETTE.mist}`,
                  }}
                >
                  <span className="font-body font-medium">{o.label}</span>
                  <div className="w-6 h-6 rounded-full border-2"
                    style={{
                      borderColor: answers[step - 1] === o.v ? 'white' : PALETTE.mist,
                      backgroundColor: answers[step - 1] === o.v ? 'white' : 'transparent',
                    }}
                  >
                    {answers[step - 1] === o.v && <Check size={14} color={o.tone} className="m-0.5" />}
                  </div>
                </button>
              ))}
            </div>

            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                className="smooth-tap font-body text-sm flex items-center gap-1.5"
                style={{ color: PALETTE.muted }}
              >
                <ChevronLeft size={14} /> ข้อก่อนหน้า
              </button>
            )}
          </div>
        )}

        {isResult && (
          <div className="anim-slideUp">
            <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden"
              style={{ backgroundColor: PALETTE.paper }}
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10"
                style={{ backgroundColor: level.tone }} />
              <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>ผลคัดกรอง</div>
              <div className="font-display text-3xl font-bold mb-2" style={{ color: level.tone }}>
                {level.label}
              </div>
              <div className="font-display text-sm font-medium mb-4" style={{ color: PALETTE.muted }}>
                คะแนน {score} / {maxScore}
              </div>

              <div className="h-3 rounded-full mb-5 overflow-hidden" style={{ backgroundColor: PALETTE.mist }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(score / maxScore) * 100}%`, backgroundColor: level.tone }} />
              </div>

              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: PALETTE.shell }}>
                <div className="font-accent text-xs mb-2 flex items-center gap-1.5" style={{ color: PALETTE.gold }}>
                  <Heart size={12} /> น้องไกด์ว่า
                </div>
                {busy ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded-full shimmer-bg" />
                    <div className="h-3 rounded-full shimmer-bg w-4/5" />
                    <div className="h-3 rounded-full shimmer-bg w-3/5" />
                  </div>
                ) : (
                  <div className="font-body text-sm leading-relaxed whitespace-pre-wrap" style={{ color: PALETTE.forest }}>
                    {aiText}
                  </div>
                )}
              </div>
            </div>

            {score >= maxScore * 0.4 && (
              <div className="rounded-2xl p-4 mb-3 flex items-start gap-3"
                style={{ backgroundColor: PALETTE.coralSoft }}
              >
                <Phone size={20} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-semibold text-sm mb-1" style={{ color: PALETTE.coral }}>
                    สายด่วนสุขภาพจิต
                  </div>
                  <div className="font-display text-2xl font-bold" style={{ color: PALETTE.coral }}>1323</div>
                  <div className="font-body text-xs" style={{ color: PALETTE.coral }}>
                    กรมสุขภาพจิต · ฟรี ตลอด 24 ชม.
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => { setStep(0); setAnswers({}); setAiText(''); }}
              className="smooth-tap w-full py-4 rounded-2xl font-display font-medium"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            >
              ทำใหม่อีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Profile / Privacy
   ============================================================ */

function Profile({ profile, privacy, setPrivacy, setProfile, reset, onModalChange, personality, setPersonality, corrections, clearCorrections, addCorrection }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [importMsg, setImportMsg] = useState(null);
  const bmi = calcBMI(profile.weight, profile.height);
  const importMemoryRef = useRef(null);

  useEffect(() => {
    onModalChange?.(editing);
    return () => onModalChange?.(false);
  }, [editing]);

  const save = () => {
    setProfile({
      ...draft,
      weight: +draft.weight || profile.weight,
      height: +draft.height || profile.height,
      age: +draft.age || profile.age,
    });
    setEditing(false);
  };

  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange}
      className="smooth-tap w-12 h-7 rounded-full relative"
      style={{ backgroundColor: on ? PALETTE.sage : PALETTE.mist }}
    >
      <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
        style={{ left: on ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
      />
    </button>
  );

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>PROFILE</div>
        <h1 className="font-display text-3xl font-bold mb-5" style={{ color: PALETTE.sageDeep }}>
          ข้อมูลของพี่
        </h1>

        {/* Profile card */}
        <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden anim-slideUp"
          style={{ backgroundColor: PALETTE.sageDeep }}
        >
          <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full opacity-15"
            style={{ backgroundColor: PALETTE.gold }} />
          <div className="relative flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold"
              style={{ backgroundColor: PALETTE.gold, color: PALETTE.sageDeep }}
            >
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white">{profile.name}</div>
              <div className="font-body text-sm text-white/70">
                {profile.gender === 'female' ? 'หญิง' : 'ชาย'} · อายุ {profile.age}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 relative">
            <ProfileStat
              label="สูง" value={privacy.showHeight ? profile.height : '•••'}
              unit={privacy.showHeight ? 'ซม.' : ''} hidden={!privacy.showHeight}
            />
            <ProfileStat
              label="หนัก" value={privacy.showWeight ? profile.weight : '•••'}
              unit={privacy.showWeight ? 'กก.' : ''} hidden={!privacy.showWeight}
            />
            <ProfileStat
              label="BMI" value={privacy.showHeight && privacy.showWeight ? bmi : '•••'}
              unit={privacy.showHeight && privacy.showWeight ? bmiCategory(bmi).label : ''}
              hidden={!privacy.showHeight || !privacy.showWeight}
            />
          </div>
        </div>

        {/* Allergies */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-1"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-semibold flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
              <AlertCircle size={16} color={PALETTE.coral} /> สิ่งที่แพ้
            </div>
          </div>
          {privacy.showAllergies ? (
            <>
              <div className="mb-3">
                <div className="font-accent text-xs mb-1.5" style={{ color: PALETTE.muted }}>อาหาร</div>
                {profile.foodAllergy.length === 0 ? (
                  <div className="font-body text-sm" style={{ color: PALETTE.muted }}>ไม่มี</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.foodAllergy.map((a, i) => (
                      <span key={i} className="font-body text-xs px-3 py-1 rounded-lg"
                        style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="font-accent text-xs mb-1.5" style={{ color: PALETTE.muted }}>ยา</div>
                {profile.drugAllergy.length === 0 ? (
                  <div className="font-body text-sm" style={{ color: PALETTE.muted }}>ไม่มี</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.drugAllergy.map((a, i) => (
                      <span key={i} className="font-body text-xs px-3 py-1 rounded-lg"
                        style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 py-3 px-1" style={{ color: PALETTE.muted }}>
              <EyeOff size={16} />
              <div className="font-body text-sm">ซ่อนอยู่ — เปิดในการตั้งค่าด้านล่าง</div>
            </div>
          )}
        </div>

        {/* Privacy toggles */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-2"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="font-display font-semibold mb-1 flex items-center gap-2"
            style={{ color: PALETTE.sageDeep }}
          >
            <Shield size={16} color={PALETTE.sage} /> ความเป็นส่วนตัว
          </div>
          <p className="font-body text-xs mb-4" style={{ color: PALETTE.muted }}>
            เลือกสิ่งที่ต้องการให้แสดงในโปรไฟล์
          </p>

          {[
            { key: 'showHeight', label: 'แสดงส่วนสูง', icon: <Activity size={16} /> },
            { key: 'showWeight', label: 'แสดงน้ำหนัก', icon: <Activity size={16} /> },
            { key: 'showAge', label: 'แสดงอายุ', icon: <User size={16} /> },
            { key: 'showAllergies', label: 'แสดงสิ่งที่แพ้', icon: <AlertCircle size={16} /> },
          ].map((row, i) => (
            <div key={row.key}
              className={`flex items-center justify-between py-3 ${i < 3 ? 'border-b' : ''}`}
              style={{ borderColor: PALETTE.mist }}
            >
              <div className="flex items-center gap-3" style={{ color: PALETTE.forest }}>
                <span style={{ color: PALETTE.sage }}>{row.icon}</span>
                <span className="font-body text-sm">{row.label}</span>
              </div>
              <Toggle on={privacy[row.key]}
                onChange={() => setPrivacy({ ...privacy, [row.key]: !privacy[row.key] })} />
            </div>
          ))}
        </div>

        {/* AI Personality picker */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-2"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="font-display font-semibold mb-1 flex items-center gap-2"
            style={{ color: PALETTE.sageDeep }}
          >
            <Sparkles size={16} color={PALETTE.gold} /> บุคลิก AI
          </div>
          <p className="font-body text-xs mb-3" style={{ color: PALETTE.muted }}>
            เลือกบุคลิกที่ถนัด — โหมดอัตโนมัติจะเลือกให้ตามอายุของคุณ
          </p>
          <div className="space-y-2">
            {Object.values(PERSONALITIES).map((p) => {
              const isSelected = (personality || 'auto') === p.id;
              const showResolved = p.id === 'auto' && isSelected;
              const resolved = showResolved ? resolvePersonality('auto', profile.age) : null;
              return (
                <button key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className="smooth-tap w-full text-left rounded-xl p-3 flex items-center gap-3"
                  style={{
                    backgroundColor: isSelected ? PALETTE.sageDeep : PALETTE.shell,
                    color: isSelected ? 'white' : PALETTE.forest,
                  }}
                >
                  <div className="text-2xl flex-shrink-0">{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm flex items-center gap-1.5">
                      {p.label}
                      {showResolved && resolved && (
                        <span className="font-body text-tiny px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: PALETTE.gold, color: PALETTE.sageDeep }}
                        >
                          → {resolved.label}
                        </span>
                      )}
                    </div>
                    <div className="font-body text-xs opacity-80 mt-0.5">{p.sub} · {p.desc}</div>
                  </div>
                  {isSelected && <Check size={18} className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Memory card */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-2"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-display font-semibold flex items-center gap-2"
              style={{ color: PALETTE.sageDeep }}
            >
              <Sparkles size={16} color={PALETTE.gold} /> AI กำลังเรียนรู้
            </div>
            {corrections && corrections.length > 0 && (
              <span className="font-display text-tiny font-semibold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: PALETTE.sage + '22', color: PALETTE.sageDark }}
              >
                {corrections.length} ครั้ง
              </span>
            )}
          </div>
          <p className="font-body text-xs leading-relaxed mb-3" style={{ color: PALETTE.muted }}>
            ทุกครั้งที่คุณแก้ชื่อหรือแคลอาหารที่ AI ทาย AI จะจำและใช้ในการวิเคราะห์ครั้งถัดไป
            ให้แม่นยำขึ้นตามสไตล์การกินของคุณ
          </p>
          {corrections && corrections.length > 0 ? (
            <>
              <div className="space-y-1.5 mb-3">
                {corrections.slice(-3).reverse().map((c) => (
                  <div key={c.id} className="rounded-lg p-2 flex items-center gap-2"
                    style={{ backgroundColor: PALETTE.shell }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-xs truncate" style={{ color: PALETTE.muted }}>
                        {c.aiName} <span style={{ color: PALETTE.muted }}>({c.aiCal} kcal)</span>
                      </div>
                      <div className="font-body text-xs font-medium truncate" style={{ color: PALETTE.sageDark }}>
                        → {c.realName} <span style={{ color: PALETTE.sage }}>({c.realCal} kcal)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => exportMemory(corrections)}
                  className="smooth-tap font-body text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: PALETTE.sage + '22', color: PALETTE.sageDark }}
                >
                  <ExternalLink size={12} /> Export ความจำ
                </button>
                <button onClick={() => importMemoryRef.current?.click()}
                  className="smooth-tap font-body text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: PALETTE.gold + '22', color: PALETTE.gold }}
                >
                  <Plus size={12} /> Import
                </button>
                <button onClick={() => {
                    if (confirm('ลบประวัติการแก้ไขทั้งหมด? AI จะลืมสิ่งที่เรียนรู้มา')) clearCorrections?.();
                  }}
                  className="smooth-tap font-body text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
                >
                  <Trash2 size={12} /> ลบ
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg p-3 text-center mb-3" style={{ backgroundColor: PALETTE.shell }}>
                <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                  ยังไม่มีการแก้ไข แก้ชื่อ/แคลตอนวิเคราะห์อาหารเพื่อสอน AI ได้เลย
                </div>
              </div>
              <button onClick={() => importMemoryRef.current?.click()}
                className="smooth-tap w-full font-body text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
              >
                <Plus size={12} /> Import ความจำจากเพื่อน
              </button>
            </>
          )}
          <input ref={importMemoryRef} type="file" accept=".json,application/json"
            onChange={(e) => handleImportMemory(e, addCorrection, corrections)}
            className="hidden"
          />
        </div>

        {/* Edit profile */}
        <button onClick={() => { setDraft(profile); setEditing(true); }}
          className="smooth-tap w-full py-4 rounded-2xl font-display font-medium mb-3 anim-slideUp delay-3"
          style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
        >
          แก้ไขข้อมูลส่วนตัว
        </button>

        <button onClick={() => { if (confirm('รีเซ็ตข้อมูลทั้งหมด?')) reset(); }}
          className="smooth-tap w-full py-3 rounded-2xl font-body text-sm anim-slideUp delay-4"
          style={{ color: PALETTE.coral }}
        >
          ล้างข้อมูลและเริ่มใหม่
        </button>

        <div className="text-center mt-6 anim-fadeIn">
          <LogoMark size={32} />
          <div className="font-display text-xs mt-2" style={{ color: PALETTE.muted }}>
            GINYARAIDEE · v1.0
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(39,54,31,0.4)' }}
          onClick={() => setEditing(false)}
        >
          <div className="w-full rounded-t-3xl p-6 pb-28 anim-slideUp"
            style={{ backgroundColor: PALETTE.cream, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: PALETTE.mist }} />
            <h3 className="font-display text-xl font-bold mb-4" style={{ color: PALETTE.sageDeep }}>
              แก้ไขข้อมูล
            </h3>

            <div className="space-y-3 mb-5">
              <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                placeholder="ชื่อ"
                className="font-body w-full px-5 py-4 rounded-2xl text-base"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDraft({ ...draft, gender: 'female' })}
                  className="smooth-tap font-display font-medium py-3 rounded-2xl border-2"
                  style={{
                    backgroundColor: draft.gender === 'female' ? PALETTE.sageDark : PALETTE.paper,
                    color: draft.gender === 'female' ? 'white' : PALETTE.forest,
                    borderColor: draft.gender === 'female' ? PALETTE.sageDark : PALETTE.mist,
                  }}>หญิง</button>
                <button onClick={() => setDraft({ ...draft, gender: 'male' })}
                  className="smooth-tap font-display font-medium py-3 rounded-2xl border-2"
                  style={{
                    backgroundColor: draft.gender === 'male' ? PALETTE.sageDark : PALETTE.paper,
                    color: draft.gender === 'male' ? 'white' : PALETTE.forest,
                    borderColor: draft.gender === 'male' ? PALETTE.sageDark : PALETTE.mist,
                  }}>ชาย</button>
              </div>
              <input value={draft.age} onChange={e => setDraft({ ...draft, age: e.target.value })}
                placeholder="อายุ" inputMode="numeric"
                className="font-body w-full px-5 py-4 rounded-2xl text-base"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input value={draft.height} onChange={e => setDraft({ ...draft, height: e.target.value })}
                  placeholder="สูง (ซม.)" inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
                <input value={draft.weight} onChange={e => setDraft({ ...draft, weight: e.target.value })}
                  placeholder="หนัก (กก.)" inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="smooth-tap flex-1 py-4 rounded-2xl font-display font-medium"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest }}>ยกเลิก</button>
              <button onClick={save}
                className="smooth-tap flex-2 py-4 rounded-2xl font-display font-semibold text-white"
                style={{ backgroundColor: PALETTE.sageDark }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileStat({ label, value, unit, hidden }) {
  return (
    <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
      <div className="font-accent text-tiny mb-1 flex items-center gap-1" style={{ color: PALETTE.gold }}>
        {hidden && <EyeOff size={10} />}{label}
      </div>
      <div className="font-display text-xl font-bold text-white leading-none">{value}</div>
      <div className="font-body text-tiny text-white/60 mt-0.5">{unit}</div>
    </div>
  );
}

/* ============================================================
   Health Hub — น้ำ / นอน / ออกกำลังกาย / ความดัน
   ============================================================ */

/* ============================================================
   Mini Line Chart (SVG) — reusable
   ============================================================ */

function MiniLineChart({ points, color, unit = '', height = 140, target = null, targetLabel = '' }) {
  // points: [{ label, value }]
  if (!points || points.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: PALETTE.shell }}>
        <BarChart3 size={28} className="mx-auto mb-2" color={PALETTE.mist} />
        <div className="font-body text-sm" style={{ color: PALETTE.muted }}>ยังไม่มีข้อมูล</div>
      </div>
    );
  }

  const W = 320, H = height, padL = 36, padR = 12, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const vals = points.map(p => p.value);
  let min = Math.min(...vals, target != null ? target : Infinity);
  let max = Math.max(...vals, target != null ? target : -Infinity);
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  min = min - range * 0.1;
  max = max + range * 0.1;

  const x = (i) => padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${x(points.length - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`;

  // Y axis labels (3 ticks)
  const ticks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid + Y labels */}
      {ticks.map((t, i) => {
        const yy = y(t);
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke={PALETTE.mist} strokeWidth="1" strokeDasharray="2 3" />
            <text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="9" fill={PALETTE.muted} fontFamily="monospace">
              {Math.round(t)}
            </text>
          </g>
        );
      })}

      {/* Target line */}
      {target != null && (
        <g>
          <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)}
            stroke={PALETTE.coral} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
        </g>
      )}

      {/* Area + line */}
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + last value */}
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4 : 2.5}
          fill={i === points.length - 1 ? color : PALETTE.paper} stroke={color} strokeWidth="2" />
      ))}

      {/* X labels (first, middle, last) */}
      {points.length > 0 && [0, Math.floor((points.length - 1) / 2), points.length - 1]
        .filter((v, idx, arr) => arr.indexOf(v) === idx)
        .map((idx) => (
          <text key={idx} x={x(idx)} y={H - 8} textAnchor="middle" fontSize="9" fill={PALETTE.muted}>
            {points[idx].label}
          </text>
        ))}
    </svg>
  );
}

/* ============================================================
   Health Hub — น้ำ / นอน / ออกกำลังกาย / ความดัน / แนวโน้ม
   ============================================================ */

function HealthHub({ profile, water, addWater, removeWater, sleep, addSleep, removeSleep,
  exercises, addExercise, removeExercise, vitals, addVital, removeVital,
  weights, addWeight, removeWeight }) {
  const today = todayKey();
  const target = waterTargetMl(profile.weight);
  const todayWater = water.filter(w => w.day === today).reduce((s, w) => s + (w.ml || 0), 0);
  const waterPct = Math.min(1, todayWater / target);

  const todayExercise = exercises.filter(e => e.day === today);
  const burned = todayExercise.reduce((s, e) => s + (e.calories || 0), 0);

  const lastSleep = sleep[sleep.length - 1];
  const lastVital = vitals[vitals.length - 1];

  const [tab, setTab] = useState('water');

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>HEALTH HUB</div>
        <h1 className="font-display text-3xl font-bold mb-5" style={{ color: PALETTE.sageDeep }}>
          สุขภาพประจำวัน
        </h1>

        {/* Top summary grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button onClick={() => setTab('water')}
            className="smooth-tap text-left rounded-2xl p-4 organic-shadow anim-slideUp"
            style={{ backgroundColor: tab === 'water' ? PALETTE.sageDeep : PALETTE.paper, color: tab === 'water' ? 'white' : PALETTE.forest }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: tab === 'water' ? PALETTE.gold : PALETTE.sage }}>
              <GlassWater size={16} /><span className="font-accent text-xs">น้ำดื่ม</span>
            </div>
            <div className="font-display text-xl font-bold leading-none">
              {todayWater}<span className="text-xs font-normal opacity-60"> / {target} ml</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: tab === 'water' ? 'rgba(255,255,255,0.15)' : PALETTE.mist }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${waterPct * 100}%`, backgroundColor: tab === 'water' ? PALETTE.gold : '#6BA4D9' }} />
            </div>
          </button>

          <button onClick={() => setTab('exercise')}
            className="smooth-tap text-left rounded-2xl p-4 organic-shadow anim-slideUp delay-1"
            style={{ backgroundColor: tab === 'exercise' ? PALETTE.sageDeep : PALETTE.paper, color: tab === 'exercise' ? 'white' : PALETTE.forest }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: tab === 'exercise' ? PALETTE.gold : PALETTE.coral }}>
              <Dumbbell size={16} /><span className="font-accent text-xs">ออกกำลัง</span>
            </div>
            <div className="font-display text-xl font-bold leading-none">
              {burned}<span className="text-xs font-normal opacity-60"> kcal</span>
            </div>
            <div className="font-body text-xs opacity-70 mt-2">{todayExercise.length} ครั้งวันนี้</div>
          </button>

          <button onClick={() => setTab('sleep')}
            className="smooth-tap text-left rounded-2xl p-4 organic-shadow anim-slideUp delay-2"
            style={{ backgroundColor: tab === 'sleep' ? PALETTE.sageDeep : PALETTE.paper, color: tab === 'sleep' ? 'white' : PALETTE.forest }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: tab === 'sleep' ? PALETTE.gold : '#6F58B8' }}>
              <Moon size={16} /><span className="font-accent text-xs">การนอน</span>
            </div>
            <div className="font-display text-xl font-bold leading-none">
              {lastSleep ? `${lastSleep.hours}` : '-'}<span className="text-xs font-normal opacity-60"> ชม.</span>
            </div>
            <div className="font-body text-xs opacity-70 mt-2">
              {lastSleep ? '★'.repeat(lastSleep.quality || 0) : 'ยังไม่บันทึก'}
            </div>
          </button>

          <button onClick={() => setTab('vitals')}
            className="smooth-tap text-left rounded-2xl p-4 organic-shadow anim-slideUp delay-3"
            style={{ backgroundColor: tab === 'vitals' ? PALETTE.sageDeep : PALETTE.paper, color: tab === 'vitals' ? 'white' : PALETTE.forest }}
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color: tab === 'vitals' ? PALETTE.gold : PALETTE.coral }}>
              <Stethoscope size={16} /><span className="font-accent text-xs">สัญญาณชีพ</span>
            </div>
            <div className="font-display text-xl font-bold leading-none">
              {lastVital ? (lastVital.kind === 'bp' ? `${lastVital.sbp}/${lastVital.dbp}` : `${lastVital.sugar}`) : '-'}
            </div>
            <div className="font-body text-xs opacity-70 mt-2">
              {lastVital ? (lastVital.kind === 'bp' ? 'ความดัน' : 'น้ำตาล mg/dL') : 'ยังไม่บันทึก'}
            </div>
          </button>
        </div>

        {/* Trends button */}
        <button onClick={() => setTab('trends')}
          className="smooth-tap w-full rounded-2xl p-3 mb-5 flex items-center gap-3 organic-shadow"
          style={{ backgroundColor: tab === 'trends' ? PALETTE.sageDeep : PALETTE.paper, color: tab === 'trends' ? 'white' : PALETTE.forest }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: tab === 'trends' ? 'rgba(255,255,255,0.15)' : PALETTE.shell, color: tab === 'trends' ? PALETTE.gold : PALETTE.sageDark }}
          >
            <TrendingUp size={18} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-display font-semibold text-sm">กราฟแนวโน้ม</div>
            <div className="font-body text-xs opacity-70">น้ำหนัก · น้ำ · ออกกำลัง · นอน · ความดัน</div>
          </div>
          <ChevronRight size={18} style={{ opacity: 0.6 }} />
        </button>

        {/* Tab content */}
        <div className="anim-fadeIn" key={tab}>
          {tab === 'water' && <WaterTab profile={profile} water={water} addWater={addWater} removeWater={removeWater} target={target} todayWater={todayWater} />}
          {tab === 'exercise' && <ExerciseTab profile={profile} exercises={exercises} addExercise={addExercise} removeExercise={removeExercise} />}
          {tab === 'sleep' && <SleepTab sleep={sleep} addSleep={addSleep} removeSleep={removeSleep} />}
          {tab === 'vitals' && <VitalsTab vitals={vitals} addVital={addVital} removeVital={removeVital} />}
          {tab === 'trends' && <TrendsTab profile={profile} water={water} exercises={exercises} sleep={sleep} vitals={vitals} weights={weights} addWeight={addWeight} removeWeight={removeWeight} />}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ profile, water, exercises, sleep, vitals, weights, addWeight, removeWeight }) {
  const [newWeight, setNewWeight] = useState('');

  // Weight chart
  const weightPoints = (weights || []).slice(-14).map(w => ({
    label: w.day.slice(5),
    value: w.kg,
  }));

  // Water — last 14 days totals
  const waterDays = lastNDaysKeys(14);
  const waterByDay = {};
  water.forEach(w => { waterByDay[w.day] = (waterByDay[w.day] || 0) + (w.ml || 0); });
  const waterPoints = waterDays.map(d => ({ label: d.slice(5), value: waterByDay[d] || 0 }));
  const hasWater = waterPoints.some(p => p.value > 0);

  // Exercise — last 14 days kcal burned
  const exDays = lastNDaysKeys(14);
  const exByDay = {};
  exercises.forEach(e => { exByDay[e.day] = (exByDay[e.day] || 0) + (e.calories || 0); });
  const exPoints = exDays.map(d => ({ label: d.slice(5), value: exByDay[d] || 0 }));
  const hasEx = exPoints.some(p => p.value > 0);

  // Sleep — last 14 entries
  const sleepPoints = (sleep || []).slice(-14).map(s => ({ label: s.day.slice(5), value: s.hours }));

  // BP — last 14 entries (SBP)
  const bpEntries = (vitals || []).filter(v => v.kind === 'bp').slice(-14);
  const sbpPoints = bpEntries.map(v => ({ label: v.day.slice(5), value: v.sbp }));
  const dbpPoints = bpEntries.map(v => ({ label: v.day.slice(5), value: v.dbp }));

  // Sugar — last 14 entries
  const sugarPoints = (vitals || []).filter(v => v.kind === 'sugar').slice(-14).map(v => ({ label: v.day.slice(5), value: v.sugar }));

  const saveWeight = () => {
    const kg = parseFloat(newWeight);
    if (!kg || kg <= 0) return;
    addWeight({ id: 'wt' + Date.now(), day: todayKey(), kg });
    setNewWeight('');
  };

  const Card = ({ title, icon, color, children }) => (
    <div className="rounded-2xl p-4 mb-4 organic-shadow" style={{ backgroundColor: PALETTE.paper }}>
      <div className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
        <span style={{ color }}>{icon}</span> {title}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      {/* Weight tracking with input */}
      <Card title="น้ำหนัก (กก.)" icon={<Activity size={16} />} color={PALETTE.sage}>
        <div className="flex gap-2 mb-3">
          <input value={newWeight} onChange={e => setNewWeight(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={`บันทึกน้ำหนักวันนี้ (${profile.weight} กก.)`}
            inputMode="decimal"
            className="font-body flex-1 px-4 py-2.5 rounded-xl text-sm"
            style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: 'none' }}
          />
          <button onClick={saveWeight}
            className="smooth-tap px-4 rounded-xl font-display font-semibold text-white text-sm"
            style={{ backgroundColor: PALETTE.sageDark }}
          >บันทึก</button>
        </div>
        <MiniLineChart points={weightPoints} color={PALETTE.sage} unit="กก." />
        {weightPoints.length >= 2 && (
          <div className="font-body text-xs mt-2 text-center" style={{ color: PALETTE.muted }}>
            {(() => {
              const diff = weightPoints[weightPoints.length - 1].value - weightPoints[0].value;
              return diff === 0 ? 'น้ำหนักคงที่'
                : diff < 0 ? `ลดลง ${Math.abs(diff).toFixed(1)} กก. 🎉`
                : `เพิ่มขึ้น ${diff.toFixed(1)} กก.`;
            })()}
          </div>
        )}
      </Card>

      <Card title="น้ำดื่ม 14 วัน (ml)" icon={<GlassWater size={16} />} color="#6BA4D9">
        {hasWater ? <MiniLineChart points={waterPoints} color="#6BA4D9" target={waterTargetMl(profile.weight)} /> :
          <div className="font-body text-xs text-center py-4" style={{ color: PALETTE.muted }}>ยังไม่มีข้อมูลน้ำดื่ม</div>}
      </Card>

      <Card title="แคลที่เผาผลาญ 14 วัน" icon={<Dumbbell size={16} />} color={PALETTE.coral}>
        {hasEx ? <MiniLineChart points={exPoints} color={PALETTE.coral} unit="kcal" /> :
          <div className="font-body text-xs text-center py-4" style={{ color: PALETTE.muted }}>ยังไม่มีข้อมูลออกกำลังกาย</div>}
      </Card>

      <Card title="ชั่วโมงการนอน" icon={<Moon size={16} />} color="#6F58B8">
        {sleepPoints.length > 0 ? <MiniLineChart points={sleepPoints} color="#6F58B8" unit="ชม." target={8} /> :
          <div className="font-body text-xs text-center py-4" style={{ color: PALETTE.muted }}>ยังไม่มีข้อมูลการนอน</div>}
      </Card>

      {sbpPoints.length > 0 && (
        <Card title="ความดัน (SBP / DBP)" icon={<Stethoscope size={16} />} color={PALETTE.coral}>
          <div className="font-accent text-tiny mb-1" style={{ color: PALETTE.coral }}>ตัวบน (SBP)</div>
          <MiniLineChart points={sbpPoints} color={PALETTE.coral} target={120} />
          <div className="font-accent text-tiny mb-1 mt-3" style={{ color: '#6BA4D9' }}>ตัวล่าง (DBP)</div>
          <MiniLineChart points={dbpPoints} color="#6BA4D9" target={80} />
        </Card>
      )}

      {sugarPoints.length > 0 && (
        <Card title="น้ำตาลในเลือด (mg/dL)" icon={<Droplet size={16} />} color={PALETTE.gold}>
          <MiniLineChart points={sugarPoints} color={PALETTE.gold} target={100} />
        </Card>
      )}

      <div className="rounded-2xl p-3 flex items-start gap-2" style={{ backgroundColor: PALETTE.shell }}>
        <AlertCircle size={14} color={PALETTE.sageDark} className="flex-shrink-0 mt-0.5" />
        <p className="font-body text-tiny leading-relaxed" style={{ color: PALETTE.sageDark }}>
          เส้นประสีส้ม = ค่าเป้าหมาย/มาตรฐาน · กราฟแสดงข้อมูล 14 ครั้งล่าสุด
        </p>
      </div>
    </div>
  );
}

function WaterTab({ profile, water, addWater, removeWater, target, todayWater }) {
  const today = todayKey();
  const todayEntries = water.filter(w => w.day === today);
  const pct = Math.min(1, todayWater / target);

  const quickAdd = (ml) => addWater({ id: 'w' + Date.now(), day: today, time: timeNow(), ml });

  return (
    <div>
      <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden"
        style={{ backgroundColor: PALETTE.paper }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: '#6BA4D9' }} />

        <div className="relative flex items-center gap-4 mb-5">
          <div className="relative w-24 h-32">
            {/* Glass shape */}
            <svg width="96" height="128" viewBox="0 0 96 128">
              <defs>
                <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8BC4E8" />
                  <stop offset="100%" stopColor="#5B9BD9" />
                </linearGradient>
                <clipPath id="glass">
                  <path d="M14 8 L82 8 L75 118 Q75 122 70 122 L26 122 Q21 122 21 118 Z" />
                </clipPath>
              </defs>
              <path d="M14 8 L82 8 L75 118 Q75 122 70 122 L26 122 Q21 122 21 118 Z"
                fill={PALETTE.shell} stroke={PALETTE.mist} strokeWidth="2" />
              <rect x="0" y={128 - (pct * 110)} width="96" height={pct * 110}
                fill="url(#water)" clipPath="url(#glass)"
                style={{ transition: 'y 0.7s cubic-bezier(0.22, 1, 0.36, 1), height 0.7s cubic-bezier(0.22, 1, 0.36, 1)' }}
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-display text-3xl font-bold leading-none" style={{ color: PALETTE.sageDeep }}>
              {todayWater}<span className="text-base font-normal" style={{ color: PALETTE.muted }}> ml</span>
            </div>
            <div className="font-body text-sm" style={{ color: PALETTE.muted }}>เป้าหมาย {target} ml</div>
            <div className="font-accent text-xs mt-2 px-2 py-1 inline-block rounded-md"
              style={{ backgroundColor: pct >= 1 ? PALETTE.sage + '22' : PALETTE.shell, color: pct >= 1 ? PALETTE.sageDark : PALETTE.muted }}
            >
              {pct >= 1 ? '✨ ครบเป้าแล้ว!' : `เหลือ ${target - todayWater} ml`}
            </div>
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { ml: 100, label: '100' },
            { ml: 250, label: 'แก้ว' },
            { ml: 500, label: 'ขวด' },
            { ml: 750, label: '750' },
          ].map((b) => (
            <button key={b.ml} onClick={() => quickAdd(b.ml)}
              className="smooth-tap rounded-xl py-3 flex flex-col items-center"
              style={{ backgroundColor: '#6BA4D9', color: 'white' }}
            >
              <GlassWater size={16} />
              <span className="font-accent text-xs mt-1">+{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {todayEntries.length > 0 && (
        <>
          <div className="font-display font-semibold text-sm mb-2" style={{ color: PALETTE.sageDeep }}>
            วันนี้ดื่มไปแล้ว
          </div>
          <div className="space-y-2">
            {todayEntries.slice().reverse().map(w => (
              <div key={w.id} className="rounded-xl p-3 flex items-center gap-3 organic-shadow"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <GlassWater size={18} color="#6BA4D9" />
                <div className="flex-1">
                  <div className="font-body text-sm font-medium" style={{ color: PALETTE.forest }}>{w.ml} ml</div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>{w.time}</div>
                </div>
                <button onClick={() => removeWater(w.id)} style={{ color: PALETTE.muted }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ExerciseTab({ profile, exercises, addExercise, removeExercise }) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState(EXERCISE_TYPES[0]);
  const [minutes, setMinutes] = useState('30');
  const today = todayKey();
  const todayEx = exercises.filter(e => e.day === today);

  const save = () => {
    const mins = parseInt(minutes) || 0;
    if (mins <= 0) return;
    const cal = exerciseCal({ met: type.met, weight: profile.weight, minutes: mins });
    addExercise({
      id: 'e' + Date.now(), day: today, time: timeNow(),
      type: type.id, label: type.label, icon: type.icon,
      minutes: mins, calories: cal,
    });
    setMinutes('30'); setAdding(false);
  };

  return (
    <div>
      {!adding ? (
        <button onClick={() => setAdding(true)}
          className="smooth-tap w-full rounded-2xl p-4 mb-3 flex items-center gap-3 deep-shadow"
          style={{ backgroundColor: PALETTE.coral, color: 'white' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Plus size={20} />
          </div>
          <div className="text-left flex-1">
            <div className="font-display font-semibold">บันทึกออกกำลังกาย</div>
            <div className="font-body text-xs opacity-80">เลือกประเภทและเวลา</div>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl p-4 mb-3 anim-slideUp"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="font-display font-semibold mb-3" style={{ color: PALETTE.sageDeep }}>
            ออกกำลังกายอะไร?
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {EXERCISE_TYPES.map((t) => (
              <button key={t.id} onClick={() => setType(t)}
                className="smooth-tap rounded-xl py-2.5 flex flex-col items-center gap-0.5"
                style={{
                  backgroundColor: type.id === t.id ? PALETTE.sageDeep : PALETTE.shell,
                  color: type.id === t.id ? 'white' : PALETTE.forest,
                }}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="font-accent text-tiny">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="font-body text-sm mb-2" style={{ color: PALETTE.muted }}>กี่นาที?</div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setMinutes(String(Math.max(5, (parseInt(minutes) || 0) - 5)))}
              className="smooth-tap w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
            >
              <Minus size={16} />
            </button>
            <input value={minutes} onChange={e => setMinutes(e.target.value.replace(/\D/g, ''))}
              className="flex-1 text-center font-display text-2xl font-bold py-2 rounded-xl"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
              inputMode="numeric"
            />
            <button onClick={() => setMinutes(String((parseInt(minutes) || 0) + 5))}
              className="smooth-tap w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="rounded-xl p-3 mb-4 text-center" style={{ backgroundColor: PALETTE.shell }}>
            <div className="font-body text-xs" style={{ color: PALETTE.muted }}>เผาผลาญประมาณ</div>
            <div className="font-display text-2xl font-bold" style={{ color: PALETTE.coral }}>
              {exerciseCal({ met: type.met, weight: profile.weight, minutes: parseInt(minutes) || 0 })} kcal
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setAdding(false)}
              className="smooth-tap flex-1 py-3 rounded-xl font-display font-medium"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
            >ยกเลิก</button>
            <button onClick={save}
              className="smooth-tap flex-2 py-3 rounded-xl font-display font-semibold text-white"
              style={{ backgroundColor: PALETTE.coral }}
            >บันทึก</button>
          </div>
        </div>
      )}

      {todayEx.length > 0 ? (
        <>
          <div className="font-display font-semibold text-sm mb-2" style={{ color: PALETTE.sageDeep }}>
            วันนี้ทำไปแล้ว
          </div>
          <div className="space-y-2">
            {todayEx.slice().reverse().map(e => (
              <div key={e.id} className="rounded-xl p-3 flex items-center gap-3 organic-shadow"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <div className="text-2xl">{e.icon}</div>
                <div className="flex-1">
                  <div className="font-body font-medium text-sm" style={{ color: PALETTE.forest }}>{e.label}</div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                    {e.minutes} นาที · {e.time}
                  </div>
                </div>
                <div className="font-display text-sm font-semibold" style={{ color: PALETTE.coral }}>
                  -{e.calories} kcal
                </div>
                <button onClick={() => removeExercise(e.id)} style={{ color: PALETTE.muted }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        !adding && (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: PALETTE.paper }}>
            <Dumbbell size={28} className="mx-auto mb-2" color={PALETTE.mist} />
            <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
              ยังไม่ได้ออกกำลังกายวันนี้
            </div>
          </div>
        )
      )}
    </div>
  );
}

function SleepTab({ sleep, addSleep, removeSleep }) {
  const [adding, setAdding] = useState(false);
  const [bedtime, setBedtime] = useState('23:00');
  const [waketime, setWaketime] = useState('07:00');
  const [quality, setQuality] = useState(3);

  const calcHours = () => {
    const [bh, bm] = bedtime.split(':').map(Number);
    const [wh, wm] = waketime.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return +(mins / 60).toFixed(1);
  };

  const save = () => {
    addSleep({
      id: 's' + Date.now(),
      day: todayKey(),
      bedtime, waketime,
      hours: calcHours(),
      quality,
    });
    setAdding(false);
  };

  return (
    <div>
      {!adding ? (
        <button onClick={() => setAdding(true)}
          className="smooth-tap w-full rounded-2xl p-4 mb-3 flex items-center gap-3 deep-shadow"
          style={{ backgroundColor: '#6F58B8', color: 'white' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Plus size={20} />
          </div>
          <div className="text-left flex-1">
            <div className="font-display font-semibold">บันทึกการนอน</div>
            <div className="font-body text-xs opacity-80">เวลานอน/ตื่น และคุณภาพ</div>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl p-5 mb-3 anim-slideUp" style={{ backgroundColor: PALETTE.paper }}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="font-accent text-xs mb-1" style={{ color: PALETTE.muted }}>เข้านอน</div>
              <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                className="font-display text-lg font-bold w-full px-3 py-2 rounded-xl"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
              />
            </div>
            <div>
              <div className="font-accent text-xs mb-1" style={{ color: PALETTE.muted }}>ตื่นนอน</div>
              <input type="time" value={waketime} onChange={e => setWaketime(e.target.value)}
                className="font-display text-lg font-bold w-full px-3 py-2 rounded-xl"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
              />
            </div>
          </div>

          <div className="rounded-xl p-3 mb-4 text-center" style={{ backgroundColor: PALETTE.shell }}>
            <div className="font-body text-xs" style={{ color: PALETTE.muted }}>นอนไป</div>
            <div className="font-display text-2xl font-bold" style={{ color: '#6F58B8' }}>
              {calcHours()} ชั่วโมง
            </div>
          </div>

          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.muted }}>คุณภาพการนอน</div>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setQuality(n)}
                className="smooth-tap text-3xl"
                style={{ filter: n <= quality ? 'none' : 'grayscale(1) opacity(0.3)' }}
              >⭐</button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setAdding(false)}
              className="smooth-tap flex-1 py-3 rounded-xl font-display font-medium"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
            >ยกเลิก</button>
            <button onClick={save}
              className="smooth-tap flex-2 py-3 rounded-xl font-display font-semibold text-white"
              style={{ backgroundColor: '#6F58B8' }}
            >บันทึก</button>
          </div>
        </div>
      )}

      {sleep.length > 0 ? (
        <>
          <div className="font-display font-semibold text-sm mb-2" style={{ color: PALETTE.sageDeep }}>
            ประวัติการนอน
          </div>
          <div className="space-y-2">
            {sleep.slice().reverse().slice(0, 7).map(s => (
              <div key={s.id} className="rounded-xl p-3 flex items-center gap-3 organic-shadow"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <Moon size={20} color="#6F58B8" />
                <div className="flex-1">
                  <div className="font-body font-medium text-sm" style={{ color: PALETTE.forest }}>
                    {s.hours} ชม. · {'⭐'.repeat(s.quality || 0)}
                  </div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                    {s.day} · {s.bedtime} → {s.waketime}
                  </div>
                </div>
                <button onClick={() => removeSleep(s.id)} style={{ color: PALETTE.muted }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        !adding && (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: PALETTE.paper }}>
            <Moon size={28} className="mx-auto mb-2" color={PALETTE.mist} />
            <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
              ยังไม่มีประวัติการนอน
            </div>
          </div>
        )
      )}
    </div>
  );
}

function VitalsTab({ vitals, addVital, removeVital }) {
  const [kind, setKind] = useState('bp');
  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');
  const [sugar, setSugar] = useState('');
  const [pulse, setPulse] = useState('');

  const save = () => {
    if (kind === 'bp') {
      if (!sbp || !dbp) return;
      addVital({ id: 'v' + Date.now(), day: todayKey(), time: timeNow(), kind, sbp: +sbp, dbp: +dbp, pulse: +pulse || null });
      setSbp(''); setDbp(''); setPulse('');
    } else {
      if (!sugar) return;
      addVital({ id: 'v' + Date.now(), day: todayKey(), time: timeNow(), kind, sugar: +sugar });
      setSugar('');
    }
  };

  return (
    <div>
      <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: PALETTE.paper }}>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setKind('bp')}
            className="smooth-tap flex-1 py-2 rounded-xl font-display font-medium text-sm"
            style={{
              backgroundColor: kind === 'bp' ? PALETTE.sageDeep : PALETTE.shell,
              color: kind === 'bp' ? 'white' : PALETTE.forest,
            }}
          >ความดัน</button>
          <button onClick={() => setKind('sugar')}
            className="smooth-tap flex-1 py-2 rounded-xl font-display font-medium text-sm"
            style={{
              backgroundColor: kind === 'sugar' ? PALETTE.sageDeep : PALETTE.shell,
              color: kind === 'sugar' ? 'white' : PALETTE.forest,
            }}
          >น้ำตาลในเลือด</button>
        </div>

        {kind === 'bp' ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input value={sbp} onChange={e => setSbp(e.target.value.replace(/\D/g, ''))}
                placeholder="SBP" inputMode="numeric"
                className="font-display text-lg font-bold w-full px-3 py-3 rounded-xl text-center"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
              />
              <input value={dbp} onChange={e => setDbp(e.target.value.replace(/\D/g, ''))}
                placeholder="DBP" inputMode="numeric"
                className="font-display text-lg font-bold w-full px-3 py-3 rounded-xl text-center"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
              />
            </div>
            <input value={pulse} onChange={e => setPulse(e.target.value.replace(/\D/g, ''))}
              placeholder="ชีพจร (ไม่บังคับ)" inputMode="numeric"
              className="font-body w-full px-4 py-3 rounded-xl mb-3 text-center"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: 'none' }}
            />
          </>
        ) : (
          <input value={sugar} onChange={e => setSugar(e.target.value.replace(/\D/g, ''))}
            placeholder="mg/dL" inputMode="numeric"
            className="font-display text-2xl font-bold w-full px-3 py-4 rounded-xl mb-3 text-center"
            style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
          />
        )}

        <button onClick={save}
          className="smooth-tap w-full py-3 rounded-xl font-display font-semibold text-white"
          style={{ backgroundColor: PALETTE.coral }}
        >
          บันทึก
        </button>
      </div>

      {vitals.length > 0 ? (
        <>
          <div className="font-display font-semibold text-sm mb-2" style={{ color: PALETTE.sageDeep }}>
            ประวัติย้อนหลัง
          </div>
          <div className="space-y-2">
            {vitals.slice().reverse().slice(0, 10).map(v => (
              <div key={v.id} className="rounded-xl p-3 flex items-center gap-3 organic-shadow"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <Stethoscope size={18} color={PALETTE.coral} />
                <div className="flex-1">
                  <div className="font-body font-medium text-sm" style={{ color: PALETTE.forest }}>
                    {v.kind === 'bp' ? `${v.sbp}/${v.dbp} mmHg${v.pulse ? ` · ชีพจร ${v.pulse}` : ''}` : `น้ำตาล ${v.sugar} mg/dL`}
                  </div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                    {v.day} · {v.time}
                  </div>
                </div>
                <button onClick={() => removeVital(v.id)} style={{ color: PALETTE.muted }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: PALETTE.paper }}>
          <Stethoscope size={28} className="mx-auto mb-2" color={PALETTE.mist} />
          <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
            ยังไม่มีประวัติสัญญาณชีพ
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Health News
   ============================================================ */

function HealthNewsCard({ profile }) {
  const [news, setNews] = useState(() => load('gyn_news', null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setBusy(true);
    setError(null);
    try {
      const persona = resolvePersonality(load('gyn_persona', 'auto'), profile.age);
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: persona.prompt,
          messages: [{
            role: 'user',
            content: `สรุปข่าวสารและเทคนิคสุขภาพที่น่าสนใจสำหรับวันนี้ ${new Date().toLocaleDateString('th-TH')} 3 หัวข้อ
ให้เป็นทิปสุขภาพ ความรู้ใหม่ๆ หรือเทรนด์สุขภาพที่น่าสนใจ (ไม่ต้องเป็นข่าวจริงเฉพาะวันนั้น เน้นข้อมูลที่เป็นประโยชน์)

ตอบเป็น JSON เท่านั้น ห้ามมี markdown:
{
  "items": [
    {
      "emoji": "🥗",
      "category": "โภชนาการ/ออกกำลังกาย/นอน/จิตใจ/โรคเรื้อรัง",
      "title": "หัวข้อสั้นๆ น่าสนใจ ไม่เกิน 50 ตัวอักษร",
      "summary": "เนื้อหา 2-3 ประโยค ใช้บุคลิกที่กำหนด เข้าใจง่าย",
      "tip": "ทำได้วันนี้เลย 1 ประโยค"
    }
  ]
}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      const result = { items: parsed.items, fetchedAt: Date.now() };
      setNews(result);
      save('gyn_news', result);
    } catch (e) {
      setError('โหลดไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // Auto-fetch if no news or older than 12 hours
    if (!news || Date.now() - (news.fetchedAt || 0) > 12 * 60 * 60 * 1000) {
      fetchNews();
    }
  }, []);

  return (
    <div className="anim-slideUp mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display font-semibold text-sm flex items-center gap-2"
          style={{ color: PALETTE.sageDeep }}
        >
          <Newspaper size={16} color={PALETTE.gold} /> ทิปสุขภาพวันนี้
        </div>
        <button onClick={fetchNews} disabled={busy}
          className="smooth-tap p-1.5 rounded-lg disabled:opacity-50"
          style={{ color: PALETTE.sageDark }}
        >
          <RotateCcw size={14} className={busy ? 'anim-spin-slow' : ''} />
        </button>
      </div>

      {busy && !news && (
        <div className="rounded-2xl p-5 deep-shadow" style={{ backgroundColor: PALETTE.paper }}>
          <div className="space-y-2">
            <div className="h-3 rounded-full shimmer-bg" />
            <div className="h-3 rounded-full shimmer-bg w-4/5" />
            <div className="h-3 rounded-full shimmer-bg w-3/5" />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ backgroundColor: PALETTE.coralSoft }}>
          <AlertCircle size={14} color={PALETTE.coral} />
          <div className="font-body text-xs" style={{ color: PALETTE.coral }}>{error}</div>
        </div>
      )}

      {news?.items && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
          {news.items.map((item, i) => (
            <div key={i}
              className="rounded-2xl p-4 deep-shadow flex-shrink-0 anim-fadeIn"
              style={{ width: 'calc(100vw - 80px)', maxWidth: 280, backgroundColor: PALETTE.paper, animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="text-3xl flex-shrink-0">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-accent text-tiny" style={{ color: PALETTE.gold }}>
                    {item.category}
                  </div>
                  <div className="font-display font-bold text-sm leading-snug mt-0.5"
                    style={{ color: PALETTE.sageDeep }}
                  >
                    {item.title}
                  </div>
                </div>
              </div>
              <p className="font-body text-xs leading-relaxed mb-3"
                style={{ color: PALETTE.muted }}
              >
                {item.summary}
              </p>
              {item.tip && (
                <div className="rounded-xl p-2.5 flex items-start gap-2"
                  style={{ backgroundColor: PALETTE.shell }}
                >
                  <Zap size={12} color={PALETTE.gold} className="flex-shrink-0 mt-0.5" />
                  <div className="font-body text-tiny font-medium" style={{ color: PALETTE.sageDark }}>
                    {item.tip}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Quick Record Sheet (center + button)
   ============================================================ */

function QuickRecordSheet({ open, onClose, onChoose }) {
  if (!open) return null;
  const items = [
    { id: 'food', icon: UtensilsCrossed, label: 'อาหาร', desc: 'ถ่ายและบันทึกแคล', tone: PALETTE.sage },
    { id: 'water', icon: GlassWater, label: 'น้ำดื่ม', desc: '+1 แก้ว', tone: '#6BA4D9' },
    { id: 'exercise', icon: Dumbbell, label: 'ออกกำลังกาย', desc: 'บันทึกการเผาผลาญ', tone: PALETTE.coral },
    { id: 'sleep', icon: Moon, label: 'การนอน', desc: 'เข้านอน/ตื่น', tone: '#6F58B8' },
    { id: 'vitals', icon: Stethoscope, label: 'ความดัน/น้ำตาล', desc: 'สัญญาณชีพ', tone: PALETTE.gold },
    { id: 'medicine', icon: Pill, label: 'เพิ่มยา', desc: 'ถ่ายฉลากหรือพิมพ์', tone: PALETTE.sageDark },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end anim-fadeIn"
      style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full rounded-t-3xl p-6 pb-8 deep-shadow anim-slideUp"
        style={{ backgroundColor: PALETTE.cream }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: PALETTE.mist }} />
        <div className="font-display text-lg font-bold mb-1 text-center" style={{ color: PALETTE.sageDeep }}>
          วันนี้อยากบันทึกอะไร?
        </div>
        <p className="font-body text-xs text-center mb-5" style={{ color: PALETTE.muted }}>
          เลือกสิ่งที่อยากบันทึก
        </p>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it) => {
            const I = it.icon;
            return (
              <button key={it.id} onClick={() => { onClose(); onChoose(it.id); }}
                className="smooth-tap rounded-2xl p-3 flex flex-col items-center text-center"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: it.tone + '22', color: it.tone }}
                >
                  <I size={20} />
                </div>
                <div className="font-display font-semibold text-tiny" style={{ color: PALETTE.forest }}>
                  {it.label}
                </div>
                <div className="font-body text-tiny mt-0.5 leading-tight" style={{ color: PALETTE.muted }}>
                  {it.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   More menu — รวมเมนูที่ไม่ได้ใช้บ่อย
   ============================================================ */

function MoreMenu({ goto, openPrintModal }) {
  const items = [
    { id: 'medicine', icon: Pill, label: 'ตู้ยา', desc: 'จัดการยาและฉลาก', tone: PALETTE.gold },
    { id: 'mental', icon: Brain, label: 'เช็คใจ', desc: 'คัดกรองสุขภาพจิต', tone: PALETTE.sageDark },
    { id: 'print', icon: Printer, label: 'พิมพ์รายงาน', desc: 'ส่งให้แพทย์ หรือบันทึก PDF', tone: PALETTE.sage, isPrint: true },
    { id: 'profile', icon: User, label: 'โปรไฟล์', desc: 'ข้อมูลส่วนตัว · ความเป็นส่วนตัว · บุคลิก AI', tone: PALETTE.coral },
  ];
  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>MORE</div>
        <h1 className="font-display text-3xl font-bold mb-5" style={{ color: PALETTE.sageDeep }}>
          เพิ่มเติม
        </h1>

        <div className="space-y-3">
          {items.map((it) => {
            const I = it.icon;
            return (
              <button key={it.id}
                onClick={() => it.isPrint ? openPrintModal() : goto(it.id)}
                className="smooth-tap w-full rounded-2xl p-4 flex items-center gap-4 organic-shadow text-left"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: it.tone + '22', color: it.tone }}
                >
                  <I size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold" style={{ color: PALETTE.forest }}>
                    {it.label}
                  </div>
                  <div className="font-body text-xs mt-0.5" style={{ color: PALETTE.muted }}>
                    {it.desc}
                  </div>
                </div>
                <ChevronRight size={18} color={PALETTE.muted} />
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl p-3 flex items-start gap-2"
          style={{ backgroundColor: PALETTE.shell }}
        >
          <Shield size={14} color={PALETTE.sageDark} className="flex-shrink-0 mt-0.5" />
          <p className="font-body text-tiny leading-relaxed" style={{ color: PALETTE.sageDark }}>
            ข้อมูลของคุณเก็บไว้ในอุปกรณ์เท่านั้น ไม่ได้ส่งไปไหน คำแนะนำจาก AI เป็นเพียงข้อมูลเบื้องต้น
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Print Report Modal
   ============================================================ */

function PrintModal({ open, onClose, profile, foodLog, medicines, water, exercises, sleep, vitals, chatMessages }) {
  const [sections, setSections] = useState({
    summary: true, food: true, medicine: true, water: false, exercise: false, sleep: false, vitals: false,
  });
  const [period, setPeriod] = useState('7'); // 7 / 30 / all days
  const [printing, setPrinting] = useState(false);

  if (!open) return null;

  const toggleSection = (k) => setSections(s => ({ ...s, [k]: !s[k] }));

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      generatePrintReport({ profile, foodLog, medicines, water, exercises, sleep, vitals, sections, period });
      setPrinting(false);
    }, 100);
  };

  const SECTIONS = [
    { id: 'summary', icon: User, label: 'ข้อมูลส่วนตัวและ BMI', desc: 'ชื่อ อายุ ส่วนสูง น้ำหนัก แพ้อาหาร แพ้ยา' },
    { id: 'food', icon: UtensilsCrossed, label: 'ประวัติการกิน', desc: 'รายการอาหารและแคลอรี่' },
    { id: 'medicine', icon: Pill, label: 'รายการยา', desc: 'ยาในตู้ทั้งหมด' },
    { id: 'water', icon: GlassWater, label: 'การดื่มน้ำ', desc: 'ปริมาณน้ำต่อวัน' },
    { id: 'exercise', icon: Dumbbell, label: 'การออกกำลังกาย', desc: 'ประเภทและแคลที่เผาผลาญ' },
    { id: 'sleep', icon: Moon, label: 'การนอน', desc: 'ชั่วโมงและคุณภาพ' },
    { id: 'vitals', icon: Stethoscope, label: 'ความดัน / น้ำตาล', desc: 'สัญญาณชีพ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end anim-fadeIn"
      style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full rounded-t-3xl deep-shadow anim-slideUp"
        style={{ backgroundColor: PALETTE.cream, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full mx-auto my-3 flex-shrink-0" style={{ backgroundColor: PALETTE.mist }} />

        <div className="px-6 pb-2 flex-shrink-0">
          <h3 className="font-display text-xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
            พิมพ์รายงานสุขภาพ
          </h3>
          <p className="font-body text-sm mb-4" style={{ color: PALETTE.muted }}>
            เลือกข้อมูลที่ต้องการพิมพ์ — ใช้ส่งให้แพทย์หรือเก็บไว้ดูเองได้
          </p>

          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>ช่วงเวลา</div>
          <div className="flex gap-2 mb-4">
            {[
              { v: '7', l: '7 วัน' },
              { v: '30', l: '30 วัน' },
              { v: 'all', l: 'ทั้งหมด' },
            ].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)}
                className="smooth-tap flex-1 py-2 rounded-xl font-display font-medium text-sm"
                style={{
                  backgroundColor: period === p.v ? PALETTE.sageDeep : PALETTE.paper,
                  color: period === p.v ? 'white' : PALETTE.forest,
                  border: `1px solid ${period === p.v ? PALETTE.sageDeep : PALETTE.mist}`,
                }}
              >{p.l}</button>
            ))}
          </div>

          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>ข้อมูลที่จะใส่</div>
        </div>

        <div className="px-6 pb-3 overflow-y-auto flex-1 no-scrollbar">
          <div className="space-y-2 mb-4">
            {SECTIONS.map(s => {
              const I = s.icon;
              const active = sections[s.id];
              return (
                <button key={s.id} onClick={() => toggleSection(s.id)}
                  className="smooth-tap w-full rounded-xl p-3 flex items-center gap-3 text-left"
                  style={{
                    backgroundColor: active ? PALETTE.paper : 'transparent',
                    border: `1.5px solid ${active ? PALETTE.sage : PALETTE.mist}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: active ? PALETTE.sage + '22' : PALETTE.shell, color: active ? PALETTE.sageDark : PALETTE.muted }}
                  >
                    <I size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-medium text-sm" style={{ color: active ? PALETTE.forest : PALETTE.muted }}>
                      {s.label}
                    </div>
                    <div className="font-body text-tiny" style={{ color: PALETTE.muted }}>
                      {s.desc}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: active ? PALETTE.sage : 'transparent',
                      border: `1.5px solid ${active ? PALETTE.sage : PALETTE.mist}`,
                    }}
                  >
                    {active && <Check size={14} color="white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pt-3 pb-6 flex-shrink-0" style={{ borderTop: `1px solid ${PALETTE.mist}` }}>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="smooth-tap flex-1 py-3.5 rounded-2xl font-display font-medium"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            >ยกเลิก</button>
            <button onClick={handlePrint} disabled={printing}
              className="smooth-tap flex-2 py-3.5 rounded-2xl font-display font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: PALETTE.sageDark }}
            >
              {printing ? <Loader2 size={16} className="anim-spin-slow" /> : <Printer size={16} />}
              พิมพ์ / บันทึก PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePrintReport({ profile, foodLog, medicines, water, exercises, sleep, vitals, sections, period }) {
  // Filter by period
  const days = period === 'all' ? null : lastNDaysKeys(period === '7' ? 7 : 30);
  const inRange = (d) => !days || days.includes(d);

  const fFood = foodLog.filter(f => inRange(f.day));
  const fWater = water.filter(w => inRange(w.day));
  const fEx = exercises.filter(e => inRange(e.day));
  const fSleep = sleep.filter(s => inRange(s.day));
  const fVitals = vitals.filter(v => inRange(v.day));

  const bmi = calcBMI(profile.weight, profile.height);
  const bmr = calcBMR(profile);
  const tdee = calcTDEE(bmr);
  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build HTML
  const css = `
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Sarabun', 'Prompt', -apple-system, sans-serif; color: #27361F; line-height: 1.6; margin: 0; padding: 0; font-size: 11pt; }
    .header { border-bottom: 3px solid #4F6D45; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-name { font-size: 18pt; font-weight: 700; color: #4F6D45; letter-spacing: -0.02em; }
    .brand-sub { font-size: 9pt; color: #8A8676; }
    .doc-date { font-size: 9pt; color: #8A8676; text-align: right; }
    h2 { font-size: 14pt; color: #2E4429; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #E8DFC9; display: flex; align-items: center; gap: 8px; }
    h2 .ico { width: 24px; height: 24px; background: #E8DFC9; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 12pt; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 24px; margin-bottom: 8px; }
    .field { padding: 8px 0; border-bottom: 1px dotted #E8DFC9; }
    .field-label { font-size: 9pt; color: #8A8676; text-transform: uppercase; letter-spacing: 0.05em; }
    .field-value { font-size: 12pt; font-weight: 600; color: #27361F; margin-top: 2px; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9pt; font-weight: 500; margin-right: 4px; margin-top: 4px; background: #F2C9B8; color: #D9684A; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 8px; }
    th { text-align: left; padding: 8px; background: #F0E7D2; color: #4F6D45; font-weight: 600; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.03em; }
    td { padding: 8px; border-bottom: 1px solid #E8DFC9; }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .stats-row { display: flex; gap: 16px; margin-top: 8px; }
    .stat-card { flex: 1; padding: 10px 12px; background: #F0E7D2; border-radius: 8px; }
    .stat-label { font-size: 8pt; color: #8A8676; text-transform: uppercase; }
    .stat-value { font-size: 14pt; font-weight: 700; color: #4F6D45; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E8DFC9; font-size: 8pt; color: #8A8676; text-align: center; }
    .disclaimer { background: #F2C9B8; color: #B8453A; padding: 10px 14px; border-radius: 8px; font-size: 9pt; margin: 16px 0; }
    .empty { color: #8A8676; font-style: italic; font-size: 10pt; padding: 8px 0; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  `;

  // Group foods by day for the table
  const foodByDay = {};
  fFood.forEach(f => { (foodByDay[f.day] = foodByDay[f.day] || []).push(f); });
  const sortedDays = Object.keys(foodByDay).sort().reverse();

  const avgDailyCal = sortedDays.length ? Math.round(sortedDays.reduce((s, d) => s + foodByDay[d].reduce((a, b) => a + (b.calories || 0), 0), 0) / sortedDays.length) : 0;

  // Section builders
  const summarySection = sections.summary ? `
    <h2><span class="ico">👤</span> ข้อมูลส่วนตัว</h2>
    <div class="grid">
      <div class="field"><div class="field-label">ชื่อ</div><div class="field-value">${profile.name}</div></div>
      <div class="field"><div class="field-label">เพศ · อายุ</div><div class="field-value">${profile.gender === 'female' ? 'หญิง' : 'ชาย'} · ${profile.age} ปี</div></div>
      <div class="field"><div class="field-label">ส่วนสูง</div><div class="field-value">${profile.height} ซม.</div></div>
      <div class="field"><div class="field-label">น้ำหนัก</div><div class="field-value">${profile.weight} กก.</div></div>
      <div class="field"><div class="field-label">BMI</div><div class="field-value">${bmi || '-'} <span style="font-size:9pt;color:#8A8676">(${bmiCategory(bmi).label})</span></div></div>
      <div class="field"><div class="field-label">BMR / TDEE</div><div class="field-value">${bmr || '-'} / ${tdee || '-'} kcal</div></div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">แพ้อาหาร</div>
      <div style="margin-top:4px">${profile.foodAllergy.length ? profile.foodAllergy.map(a => `<span class="pill">${a}</span>`).join('') : '<span class="empty">ไม่มี</span>'}</div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">แพ้ยา</div>
      <div style="margin-top:4px">${profile.drugAllergy.length ? profile.drugAllergy.map(a => `<span class="pill">${a}</span>`).join('') : '<span class="empty">ไม่มี</span>'}</div>
    </div>
  ` : '';

  const foodSection = sections.food ? `
    <h2><span class="ico">🍽</span> ประวัติการกิน</h2>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-label">จำนวนมื้อ</div><div class="stat-value">${fFood.length}</div></div>
      <div class="stat-card"><div class="stat-label">เฉลี่ย kcal/วัน</div><div class="stat-value">${avgDailyCal}</div></div>
      <div class="stat-card"><div class="stat-label">วันที่บันทึก</div><div class="stat-value">${sortedDays.length} วัน</div></div>
    </div>
    ${fFood.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>เวลา</th><th>รายการ</th><th class="num">แคล (kcal)</th></tr></thead>
      <tbody>
        ${sortedDays.flatMap(d => foodByDay[d].map(f => `
          <tr><td>${d}</td><td>${f.time}</td><td>${f.name || '-'}</td><td class="num">${f.calories || 0}</td></tr>
        `)).join('')}
      </tbody>
    </table>`}
  ` : '';

  const medicineSection = sections.medicine ? `
    <h2><span class="ico">💊</span> รายการยาในตู้ยา</h2>
    ${medicines.length === 0 ? '<div class="empty">ยังไม่มียาในตู้</div>' : medicines.map(m => `
      <div style="padding: 10px 0; border-bottom: 1px solid #E8DFC9;">
        <div style="font-weight: 600; font-size: 11pt; color: #27361F;">${m.name} ${m.dosage ? `<span style="font-weight:400;color:#8A8676">· ${m.dosage}</span>` : ''}</div>
        <div style="font-size: 9pt; color: #4F6D45; margin-top: 2px;">${m.category || ''}</div>
        ${m.usage ? `<div style="font-size: 10pt; margin-top: 4px;">${m.usage}</div>` : ''}
        ${m.dosageTip ? `<div style="font-size: 9pt; color: #8A8676; margin-top: 2px;"><b>วิธีใช้:</b> ${m.dosageTip}</div>` : ''}
        ${m.warnings?.length ? `<div style="font-size: 9pt; color: #B8453A; margin-top: 4px;"><b>ข้อควรระวัง:</b> ${m.warnings.join(' · ')}</div>` : ''}
      </div>
    `).join('')}
  ` : '';

  const waterSection = sections.water ? `
    <h2><span class="ico">💧</span> การดื่มน้ำ</h2>
    ${(() => {
      const byDay = {};
      fWater.forEach(w => { byDay[w.day] = (byDay[w.day] || 0) + (w.ml || 0); });
      const dList = Object.keys(byDay).sort().reverse();
      if (dList.length === 0) return '<div class="empty">ไม่มีบันทึก</div>';
      return `<table>
        <thead><tr><th>วันที่</th><th class="num">ปริมาณ (ml)</th></tr></thead>
        <tbody>${dList.map(d => `<tr><td>${d}</td><td class="num">${byDay[d]}</td></tr>`).join('')}</tbody>
      </table>`;
    })()}
  ` : '';

  const exerciseSection = sections.exercise ? `
    <h2><span class="ico">💪</span> การออกกำลังกาย</h2>
    ${fEx.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>ประเภท</th><th class="num">นาที</th><th class="num">เผาผลาญ (kcal)</th></tr></thead>
      <tbody>${fEx.slice().reverse().map(e => `
        <tr><td>${e.day}</td><td>${e.label}</td><td class="num">${e.minutes}</td><td class="num">${e.calories}</td></tr>
      `).join('')}</tbody>
    </table>`}
  ` : '';

  const sleepSection = sections.sleep ? `
    <h2><span class="ico">🌙</span> การนอน</h2>
    ${fSleep.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>เข้านอน → ตื่น</th><th class="num">ชั่วโมง</th><th>คุณภาพ</th></tr></thead>
      <tbody>${fSleep.slice().reverse().map(s => `
        <tr><td>${s.day}</td><td>${s.bedtime} → ${s.waketime}</td><td class="num">${s.hours}</td><td>${'★'.repeat(s.quality || 0)}</td></tr>
      `).join('')}</tbody>
    </table>`}
  ` : '';

  const vitalsSection = sections.vitals ? `
    <h2><span class="ico">🩺</span> สัญญาณชีพ</h2>
    ${fVitals.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>เวลา</th><th>ประเภท</th><th class="num">ค่า</th></tr></thead>
      <tbody>${fVitals.slice().reverse().map(v => `
        <tr><td>${v.day}</td><td>${v.time}</td><td>${v.kind === 'bp' ? 'ความดัน' : 'น้ำตาล'}</td><td class="num">${v.kind === 'bp' ? `${v.sbp}/${v.dbp} mmHg${v.pulse ? ` · ${v.pulse} bpm` : ''}` : `${v.sugar} mg/dL`}</td></tr>
      `).join('')}</tbody>
    </table>`}
  ` : '';

  const periodLabel = period === '7' ? '7 วันล่าสุด' : period === '30' ? '30 วันล่าสุด' : 'ข้อมูลทั้งหมด';

  const html = `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><title>รายงานสุขภาพ — ${profile.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=Prompt:wght@500;600;700&display=swap" rel="stylesheet">
<style>${css}</style></head>
<body>
  <div class="header">
    <div class="brand">
      <div style="width:40px;height:40px;background:#4F6D45;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18pt;">G</div>
      <div>
        <div class="brand-name">GINYARAIDEE</div>
        <div class="brand-sub">รายงานสุขภาพส่วนบุคคล</div>
      </div>
    </div>
    <div class="doc-date">
      <div>วันที่พิมพ์: ${today}</div>
      <div>ช่วงข้อมูล: ${periodLabel}</div>
    </div>
  </div>

  ${summarySection}
  ${foodSection}
  ${medicineSection}
  ${waterSection}
  ${exerciseSection}
  ${sleepSection}
  ${vitalsSection}

  <div class="disclaimer">
    <b>หมายเหตุ:</b> ข้อมูลในรายงานนี้บันทึกโดยผู้ใช้และวิเคราะห์ด้วย AI เป็นข้อมูลเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
    หากมีข้อสงสัยหรืออาการผิดปกติ โปรดปรึกษาแพทย์หรือเภสัชกร
  </div>

  <div class="footer">
    Generated by GINYARAIDEE · ${today}<br>
    ข้อมูลนี้เป็นความลับและจัดทำสำหรับ ${profile.name} เท่านั้น
  </div>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    alert('Browser ปิดป็อปอัพไว้ — กรุณาเปิดให้ป็อปอัพแสดงเพื่อพิมพ์รายงาน');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}

/* ============================================================
   Bottom Nav with center + button
   ============================================================ */

function BottomNav({ current, onNav, onCenterTap }) {
  const left = [
    { key: 'home', icon: Home, label: 'หน้าหลัก' },
    { key: 'health', icon: Activity, label: 'สุขภาพ' },
  ];
  const right = [
    { key: 'chat', icon: MessageCircle, label: 'น้องไกด์' },
    { key: 'more', icon: MoreHorizontal, label: 'เพิ่มเติม' },
  ];

  const Tab = ({ k, I, label }) => {
    const active = current === k;
    return (
      <button onClick={() => onNav(k)}
        className="smooth-tap flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl relative"
        style={{ color: active ? PALETTE.sageDeep : PALETTE.muted }}
      >
        {active && (
          <div className="absolute inset-x-2 inset-y-0 rounded-2xl anim-fadeIn"
            style={{ backgroundColor: PALETTE.shell }} />
        )}
        <I size={20} className="relative" />
        <span className="font-accent text-tiny relative">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: `linear-gradient(180deg, transparent 0%, ${PALETTE.cream} 30%)` }}
    >
      <div className="max-w-md mx-auto px-4 pb-4 pt-3 relative">
        <div className="rounded-3xl deep-shadow flex items-center px-2 py-2 relative"
          style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
        >
          {left.map(({ key, icon, label }) => <Tab key={key} k={key} I={icon} label={label} />)}

          {/* Spacer for the floating + button */}
          <div style={{ width: 64 }} />

          {right.map(({ key, icon, label }) => <Tab key={key} k={key} I={icon} label={label} />)}
        </div>

        {/* Floating center + button */}
        <button onClick={onCenterTap}
          className="smooth-tap absolute left-1/2 -translate-x-1/2 -top-2 w-16 h-16 rounded-full flex items-center justify-center deep-shadow anim-pulseGlow"
          style={{
            backgroundColor: PALETTE.sageDeep,
            color: 'white',
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(201,163,107,0.4), transparent 60%)',
          }}
          aria-label="บันทึก"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Update Notification
   ============================================================ */

function UpdateBanner({ info, onUpdate, onDismiss }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-3 pointer-events-none"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <div className="max-w-md mx-auto rounded-2xl p-4 deep-shadow anim-slideUp pointer-events-auto relative overflow-hidden"
        style={{ backgroundColor: PALETTE.sageDeep }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: PALETTE.gold }}
        />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Sparkles size={20} color={PALETTE.gold} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-accent text-tiny mb-0.5" style={{ color: PALETTE.gold }}>
              v{info.version} · อัปเดตใหม่
            </div>
            <div className="font-display font-bold text-white text-sm mb-1.5">
              {info.title}
            </div>
            {info.notes && info.notes.length > 0 && (
              <ul className="space-y-0.5 mb-3">
                {info.notes.slice(0, 4).map((n, i) => (
                  <li key={i} className="font-body text-xs text-white/80">{n}</li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <button onClick={onDismiss}
                className="smooth-tap font-display text-xs px-3 py-1.5 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }}
              >
                ภายหลัง
              </button>
              <button onClick={onUpdate}
                className="smooth-tap font-display font-semibold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1"
                style={{ backgroundColor: PALETTE.gold, color: PALETTE.sageDeep }}
              >
                <RotateCcw size={12} /> อัปเดตเลย
              </button>
            </div>
          </div>
          <button onClick={onDismiss}
            className="smooth-tap w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Root App
   ============================================================ */

// Helper: read from localStorage safely
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
// Helper: write to localStorage
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function App() {
  const [profile, _setProfile] = useState(() => load('gyn_profile', null));
  const [screen, setScreen] = useState('home');
  const [foodLog, _setFoodLog] = useState(() => load('gyn_foodlog', []));
  const [chatMessages, _setChat] = useState(() => load('gyn_chat', []));
  const [medicines, _setMeds] = useState(() => load('gyn_meds', []));
  const [personality, _setPersonality] = useState(() => load('gyn_persona', 'auto'));
  const [water, _setWater] = useState(() => load('gyn_water', []));
  const [exercises, _setExercises] = useState(() => load('gyn_exercises', []));
  const [sleep, _setSleep] = useState(() => load('gyn_sleep', []));
  const [vitals, _setVitals] = useState(() => load('gyn_vitals', []));
  const [corrections, _setCorrections] = useState(() => load('gyn_corrections', []));
  const [weights, _setWeights] = useState(() => load('gyn_weights', []));
  const [modalOpen, setModalOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [privacy, _setPrivacy] = useState(() => load('gyn_privacy', {
    showHeight: true, showWeight: true, showAge: true, showAllergies: false,
  }));
  const [updateInfo, setUpdateInfo] = useState(null);

  // Check for new version on load and every 5 minutes
  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        // Cache-bust so we always get fresh version.json
        const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const info = await res.json();
        if (cancelled || !info?.version) return;

        const seen = localStorage.getItem('gyn_seen_version');
        if (seen !== info.version) {
          setUpdateInfo(info);
        }
      } catch {}
    };

    checkVersion();
    const id = setInterval(checkVersion, 5 * 60 * 1000); // every 5 min
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const acceptUpdate = () => {
    if (updateInfo) localStorage.setItem('gyn_seen_version', updateInfo.version);
    // Clear caches + reload to get fresh app
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .finally(() => window.location.reload());
    } else {
      window.location.reload();
    }
  };
  const dismissUpdate = () => {
    if (updateInfo) localStorage.setItem('gyn_seen_version', updateInfo.version);
    setUpdateInfo(null);
  };

  // Persist helpers
  const setProfile = (v) => { _setProfile(v); save('gyn_profile', v); };
  const setFoodLog = (v) => { _setFoodLog(v); save('gyn_foodlog', v); };
  const setChatMessages = (fn) => {
    _setChat((prev) => { const next = typeof fn === 'function' ? fn(prev) : fn; save('gyn_chat', next); return next; });
  };
  const setMedicines = (v) => { _setMeds(v); save('gyn_meds', v); };
  const setPrivacy = (v) => { _setPrivacy(v); save('gyn_privacy', v); };
  const setPersonality = (v) => { _setPersonality(v); save('gyn_persona', v); };
  const setWater = (v) => { _setWater(v); save('gyn_water', v); };
  const setExercises = (v) => { _setExercises(v); save('gyn_exercises', v); };
  const setSleep = (v) => { _setSleep(v); save('gyn_sleep', v); };
  const setVitals = (v) => { _setVitals(v); save('gyn_vitals', v); };
  const setCorrections = (v) => {
    // Keep max 50 most recent corrections so it doesn't bloat
    const trimmed = v.slice(-50);
    _setCorrections(trimmed);
    save('gyn_corrections', trimmed);
  };
  const setWeights = (v) => { _setWeights(v); save('gyn_weights', v); };

  useEffect(() => {
    document.body.style.backgroundColor = PALETTE.cream;
    document.body.style.fontFamily = "'IBM Plex Sans Thai Looped', sans-serif";
  }, []);

  if (!profile) {
    return (
      <>
        <style>{FONT_CSS}</style>
        <div className="font-body" style={{ color: PALETTE.forest }}>
          <Onboarding onDone={setProfile} />
        </div>
      </>
    );
  }

  const reset = () => {
    ['gyn_profile','gyn_foodlog','gyn_chat','gyn_meds','gyn_privacy','gyn_persona',
     'gyn_water','gyn_exercises','gyn_sleep','gyn_vitals','gyn_news','gyn_corrections','gyn_weights'].forEach(k => localStorage.removeItem(k));
    _setProfile(null); _setFoodLog([]); _setChat([]); _setMeds([]);
    _setWater([]); _setExercises([]); _setSleep([]); _setVitals([]); _setCorrections([]); _setWeights([]);
    _setPrivacy({ showHeight: true, showWeight: true, showAge: true, showAllergies: false });
    _setPersonality('auto');
    setScreen('home');
  };

  // Handle quick record choice
  const handleQuickChoose = (id) => {
    if (id === 'food') setScreen('food');
    else if (id === 'medicine') setScreen('medicine');
    else if (id === 'water' || id === 'exercise' || id === 'sleep' || id === 'vitals') {
      setScreen('health');
      // store the target tab so HealthHub can read it (best effort: just go to hub)
    }
  };

  return (
    <>
      <style>{FONT_CSS}</style>
      <div className="font-body min-h-screen relative grain-bg"
        style={{ backgroundColor: PALETTE.cream, color: PALETTE.forest }}
      >
        <div className="max-w-md mx-auto relative">
          {screen === 'home' && <Dashboard profile={profile} foodLog={foodLog} goto={setScreen} />}
          {screen === 'health' && (
            <HealthHub profile={profile}
              water={water}
              addWater={(w) => setWater([...water, w])}
              removeWater={(id) => setWater(water.filter(x => x.id !== id))}
              sleep={sleep}
              addSleep={(s) => setSleep([...sleep, s])}
              removeSleep={(id) => setSleep(sleep.filter(x => x.id !== id))}
              exercises={exercises}
              addExercise={(e) => setExercises([...exercises, e])}
              removeExercise={(id) => setExercises(exercises.filter(x => x.id !== id))}
              vitals={vitals}
              addVital={(v) => setVitals([...vitals, v])}
              removeVital={(id) => setVitals(vitals.filter(x => x.id !== id))}
              weights={weights}
              addWeight={(w) => setWeights([...weights, w])}
              removeWeight={(id) => setWeights(weights.filter(x => x.id !== id))}
            />
          )}
          {screen === 'food' && (
            <FoodLog profile={profile} foodLog={foodLog}
              addFood={(f) => setFoodLog([...foodLog, f])}
              removeFood={(id) => setFoodLog(foodLog.filter(x => x.id !== id))}
              editFood={(id, patch) => setFoodLog(foodLog.map(x => x.id === id ? { ...x, ...patch } : x))}
              corrections={corrections}
              addCorrection={(c) => setCorrections([...corrections, c])}
            />
          )}
          {screen === 'chat' && (
            <ChatScreen profile={profile} messages={chatMessages}
              addMessage={(m) => setChatMessages(p => [...p, m])}
              clearMessages={() => setChatMessages([])}
              personality={personality}
            />
          )}
          {screen === 'more' && <MoreMenu goto={setScreen} openPrintModal={() => setPrintOpen(true)} />}
          {screen === 'medicine' && (
            <MedicineCabinet medicines={medicines}
              onModalChange={setModalOpen}
              addMedicine={(m) => setMedicines([...medicines, m])}
              removeMedicine={(id) => setMedicines(medicines.filter(x => x.id !== id))}
            />
          )}
          {screen === 'mental' && <MentalHealth profile={profile} />}
          {screen === 'profile' && (
            <Profile profile={profile} privacy={privacy} setPrivacy={setPrivacy}
              setProfile={setProfile} reset={reset} onModalChange={setModalOpen}
              personality={personality} setPersonality={setPersonality}
              corrections={corrections}
              clearCorrections={() => setCorrections([])}
              addCorrection={(c) => setCorrections([...corrections, c])}
            />
          )}
        </div>

        {!modalOpen && (
          <BottomNav
            current={screen}
            onNav={setScreen}
            onCenterTap={() => setQuickOpen(true)}
          />
        )}

        <QuickRecordSheet
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
          onChoose={handleQuickChoose}
        />

        <PrintModal
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          profile={profile}
          foodLog={foodLog}
          medicines={medicines}
          water={water}
          exercises={exercises}
          sleep={sleep}
          vitals={vitals}
          chatMessages={chatMessages}
        />

        {updateInfo && (
          <UpdateBanner info={updateInfo} onUpdate={acceptUpdate} onDismiss={dismissUpdate} />
        )}
      </div>
    </>
  );
}
