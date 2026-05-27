import React, { useState, useRef, useEffect } from 'react';
import {
  Home, UtensilsCrossed, Pill, MessageCircle, Brain, User,
  Camera, Send, Plus, X, Heart, Activity, Shield, ChevronRight,
  Sparkles, AlertCircle, Loader2, Eye, EyeOff, Trash2, ArrowLeft,
  Flame, Apple, Wheat, Droplet, ChevronLeft, Check, Image as ImageIcon,
  Leaf, AlertTriangle, Phone, RotateCcw
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
   Brand Logo (custom SVG mark)
   ============================================================ */

function LogoMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.sage} />
          <stop offset="100%" stopColor={PALETTE.sageDeep} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lg1)" />
      <path d="M22 26 Q32 14 42 26 L42 40 Q32 50 22 40 Z" fill={PALETTE.cream} opacity="0.95" />
      <circle cx="27" cy="32" r="2.2" fill={PALETTE.sageDeep} />
      <circle cx="37" cy="32" r="2.2" fill={PALETTE.sageDeep} />
      <path d="M27 38 Q32 41 37 38" stroke={PALETTE.sageDeep} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="18" r="3" fill={PALETTE.coral} />
    </svg>
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

function AllergySection({ label, icon, items, setItems, input, se@keyframes fadeUp {
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
   Brand Logo (custom SVG mark)
   ============================================================ */

function LogoMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.sage} />
          <stop offset="100%" stopColor={PALETTE.sageDeep} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lg1)" />
      <path d="M22 26 Q32 14 42 26 L42 40 Q32 50 22 40 Z" fill={PALETTE.cream} opacity="0.95" />
      <circle cx="27" cy="32" r="2.2" fill={PALETTE.sageDeep} />
      <circle cx="37" cy="32" r="2.2" fill={PALETTE.sageDeep} />
      <path d="M27 38 Q32 41 37 38" stroke={PALETTE.sageDeep} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="18" r="3" fill={PALETTE.coral} />
    </svg>
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
        เลือกใช้ได้เลย
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ActionCard delay="delay-4" onClick={() => goto('food')}
          icon={<UtensilsCrossed size={22} />} title="ถ่ายอาหาร" subtitle="ให้ AI คำนวณแคล"
          bg={PALETTE.paper} accent={PALETTE.sage} />
        <ActionCard delay="delay-5" onClick={() => goto('chat')}
          icon={<MessageCircle size={22} />} title="คุยกับน้องไกด์" subtitle="ปรึกษาสุขภาพ"
          bg={PALETTE.paper} accent={PALETTE.coral} />
        <ActionCard delay="delay-5" onClick={() => goto('medicine')}
          icon={<Pill size={22} />} title="ตู้ยา" subtitle="ยาแต่ละตัวคืออะไร"
          bg={PALETTE.paper} accent={PALETTE.gold} />
        <ActionCard delay="delay-6" onClick={() => goto('mental')}
          icon={<Brain size={22} />} title="เช็คใจ" subtitle="สุขภาพจิตเบื้องต้น"
          bg={PALETTE.paper} accent={PALETTE.sageDark} />
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

function FoodLog({ profile, foodLog, addFood, removeFood }) {
  const [busy, setBusy] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
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

      const prompt = `คุณคือนักโภชนาการ AI ที่วิเคราะห์รูปอาหารแบบ "โหดและแม่นยำที่สุด" — ตรงไปตรงมา ไม่เกรงใจ แต่ยังเป็นมิตร
${allergyContext}

วิเคราะห์อาหารในรูปและ "ตอบเป็น JSON เท่านั้น" ห้ามมี markdown หรือข้อความอื่น ใช้โครงสร้าง:
{
  "foods": ["ชื่ออาหาร 1", "ชื่ออาหาร 2"],
  "displayName": "ชื่อสรุปสั้นๆ ของจานนี้",
  "totalCalories": ตัวเลขประมาณการที่ดีที่สุด,
  "protein": กรัม,
  "carbs": กรัม,
  "fat": กรัม,
  "sodium": "ต่ำ/ปานกลาง/สูง/สูงมาก",
  "healthScore": 1-10,
  "verdict": "คำวิจารณ์โหดๆ สั้นๆ 1-2 ประโยค ตรงและฮา",
  "tips": "คำแนะนำสั้นๆ ทำให้สุขภาพดีขึ้น",
  "warnings": ["คำเตือนถ้ามี เช่น เกลือสูง น้ำตาลเยอะ หรือมีสิ่งที่ผู้ใช้แพ้"]
}`;

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
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
      setResult({ ...parsed, image: dataUrl });
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
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
                />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="font-display text-xl font-bold">{result.displayName}</div>
                  <div className="font-body text-xs opacity-80">{result.foods?.join(' · ')}</div>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-display text-4xl font-bold" style={{ color: PALETTE.sageDeep }}>
                    {result.totalCalories}
                  </div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>kcal โดยประมาณ</div>
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
                      <button onClick={() => removeFood(f.id)}
                        className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ color: PALETTE.muted }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    onModalChange?.(adding);
    return () => onModalChange?.(false);
  }, [adding]);

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
            <p className="font-body text-sm mb-5" style={{ color: PALETTE.muted }}>
              พิมพ์ชื่อยา น้องไกด์จะหาข้อมูลให้
            </p>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="ชื่อยา เช่น พาราเซตามอล 500mg"
              className="font-body w-full px-5 py-4 rounded-2xl text-base mb-3"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              autoFocus
            />
            <input value={dosage} onChange={e => setDosage(e.target.value)}
              placeholder="ขนาดยา / โดส (ถ้ามี)"
              className="font-body w-full px-5 py-4 rounded-2xl text-base mb-5"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            />
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} disabled={busy}
                className="smooth-tap flex-1 py-4 rounded-2xl font-display font-medium"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest }}
              >
                ยกเลิก
              </button>
              <button onClick={submit} disabled={busy || !name.trim()}
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
  const scrollRef = useRef(null);

  const persona = resolvePersonality(personality, profile.age);

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
        <div className="w-11 h-11 rounded-full flex items-center justify-center anim-float"
          style={{ backgroundColor: PALETTE.sageDeep }}
        >
          <LogoMark size={36} />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold" style={{ color: PALETTE.sageDeep }}>{persona.label}</div>
          <div className="font-body text-xs flex items-center gap-1.5" style={{ color: PALETTE.sage }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PALETTE.sage }} />
            {persona.sub} · พร้อมคุย
          </div>
        </div>
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

function Profile({ profile, privacy, setPrivacy, setProfile, reset, onModalChange, personality, setPersonality }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const bmi = calcBMI(profile.weight, profile.height);

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
   Bottom Nav
   ============================================================ */

function BottomNav({ current, onNav }) {
  const items = [
    { key: 'home', icon: Home, label: 'หน้าหลัก' },
    { key: 'food', icon: UtensilsCrossed, label: 'อาหาร' },
    { key: 'chat', icon: MessageCircle, label: 'น้องไกด์' },
    { key: 'medicine', icon: Pill, label: 'ตู้ยา' },
    { key: 'mental', icon: Brain, label: 'เช็คใจ' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: `linear-gradient(180deg, transparent 0%, ${PALETTE.cream} 30%)` }}
    >
      <div className="max-w-md mx-auto px-4 pb-4 pt-3">
        <div className="rounded-3xl deep-shadow flex items-center justify-between px-2 py-2"
          style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
        >
          {items.map(({ key, icon: I, label }) => {
            const active = current === key;
            return (
              <button key={key} onClick={() => onNav(key)}
                className="smooth-tap flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl relative"
                style={{ color: active ? PALETTE.sageDeep : PALETTE.muted }}
              >
                {active && (
                  <div className="absolute inset-x-3 inset-y-0 rounded-2xl anim-fadeIn"
                    style={{ backgroundColor: PALETTE.shell }} />
                )}
                <I size={20} className="relative" />
                <span className="font-accent text-tiny relative">{label}</span>
              </button>
            );
          })}
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
  const [modalOpen, setModalOpen] = useState(false);
  const [privacy, _setPrivacy] = useState(() => load('gyn_privacy', {
    showHeight: true, showWeight: true, showAge: true, showAllergies: false,
  }));

  // Persist helpers
  const setProfile = (v) => { _setProfile(v); save('gyn_profile', v); };
  const setFoodLog = (v) => { _setFoodLog(v); save('gyn_foodlog', v); };
  const setChatMessages = (fn) => {
    _setChat((prev) => { const next = typeof fn === 'function' ? fn(prev) : fn; save('gyn_chat', next); return next; });
  };
  const setMedicines = (v) => { _setMeds(v); save('gyn_meds', v); };
  const setPrivacy = (v) => { _setPrivacy(v); save('gyn_privacy', v); };
  const setPersonality = (v) => { _setPersonality(v); save('gyn_persona', v); };

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
    ['gyn_profile','gyn_foodlog','gyn_chat','gyn_meds','gyn_privacy','gyn_persona'].forEach(k => localStorage.removeItem(k));
    _setProfile(null); _setFoodLog([]); _setChat([]); _setMeds([]);
    _setPrivacy({ showHeight: true, showWeight: true, showAge: true, showAllergies: false });
    _setPersonality('auto');
    setScreen('home');
  };

  return (
    <>
      <style>{FONT_CSS}</style>
      <div className="font-body min-h-screen relative grain-bg"
        style={{ backgroundColor: PALETTE.cream, color: PALETTE.forest }}
      >
        <div className="max-w-md mx-auto relative">
          {screen === 'home' && <Dashboard profile={profile} foodLog={foodLog} goto={setScreen} />}
          {screen === 'food' && (
            <FoodLog profile={profile} foodLog={foodLog}
              addFood={(f) => setFoodLog([...foodLog, f])}
              removeFood={(id) => setFoodLog(foodLog.filter(x => x.id !== id))}
            />
          )}
          {screen === 'chat' && (
            <ChatScreen profile={profile} messages={chatMessages}
              addMessage={(m) => setChatMessages(p => [...p, m])}
              clearMessages={() => setChatMessages([])}
              personality={personality}
            />
          )}
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
            />
          )}
        </div>

        {!modalOpen && <BottomNav current={screen} onNav={setScreen} />}
      </div>
    </>
  );
}
