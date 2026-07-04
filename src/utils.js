import { PALETTE } from './theme';

/* ============================================================
   Helpers — คำนวณสุขภาพ / วันเวลา / localStorage
   ============================================================ */

export function calcBMI(w, h) {
  if (!w || !h) return null;
  const m = h / 100;
  return +(w / (m * m)).toFixed(1);
}

export function bmiCategory(bmi) {
  if (!bmi) return { label: '-', tone: PALETTE.muted };
  if (bmi < 18.5) return { label: 'ผอม', tone: '#6BA4D9' };
  if (bmi < 23) return { label: 'สมส่วน', tone: PALETTE.sage };
  if (bmi < 25) return { label: 'ท้วม', tone: PALETTE.gold };
  if (bmi < 30) return { label: 'น้ำหนักเกิน', tone: PALETTE.coral };
  return { label: 'อ้วน', tone: '#B8453A' };
}

export function calcBMR({ gender, weight, height, age }) {
  if (!weight || !height || !age) return null;
  if (gender === 'female') return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

export function calcTDEE(bmr, activity = 1.4) {
  if (!bmr) return null;
  return Math.round(bmr * activity);
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ย่อรูปก่อนเก็บลง localStorage — กันพื้นที่เต็ม (โควตา ~5MB)
export function compressImage(file, maxDim = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export function dayKeyOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayKey() {
  return dayKeyOf(new Date());
}

export function timeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function waterTargetMl(weight) {
  if (!weight) return 2000;
  return Math.round(weight * 33);
}

export const EXERCISE_TYPES = [
  { id: 'walk', label: 'เดิน', met: 3.5, icon: '🚶' },
  { id: 'run', label: 'วิ่ง', met: 8, icon: '🏃' },
  { id: 'bike', label: 'ปั่นจักรยาน', met: 6, icon: '🚴' },
  { id: 'swim', label: 'ว่ายน้ำ', met: 7, icon: '🏊' },
  { id: 'gym', label: 'ยิม / weight', met: 5, icon: '💪' },
  { id: 'yoga', label: 'โยคะ', met: 3, icon: '🧘' },
  { id: 'sport', label: 'กีฬาทั่วไป', met: 5.5, icon: '⚽' },
  { id: 'house', label: 'งานบ้าน', met: 3, icon: '🏠' },
];

export function exerciseCal({ met, weight, minutes }) {
  return Math.round(met * (weight || 60) * (minutes / 60));
}

export function lastNDaysKeys(n) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(dayKeyOf(d));
  }
  return keys;
}

// นับวันที่บันทึกติดต่อกัน (streak) จาก log หลายชุด — ถ้าวันนี้ยังไม่บันทึกให้นับถึงเมื่อวาน
export function calcStreak(...logs) {
  const days = new Set();
  logs.forEach(list => (list || []).forEach(it => it?.day && days.add(it.day)));
  if (days.size === 0) return 0;
  const d = new Date();
  if (!days.has(dayKeyOf(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(dayKeyOf(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ============================================================
   localStorage — อ่าน/เขียนแบบปลอดภัย
   ============================================================ */

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // พื้นที่เต็ม — ถ้าเป็น array ลองตัดรูปเก่าออกแล้วเก็บใหม่ (เก็บรูป 10 รายการล่าสุดไว้)
    if (Array.isArray(value)) {
      try {
        const stripped = value.map((it, i) =>
          it && it.image && i < value.length - 10 ? { ...it, image: null } : it
        );
        localStorage.setItem(key, JSON.stringify(stripped));
      } catch {
        // ยังเต็มอยู่ — ปล่อยผ่าน อย่าให้แอปพัง
      }
    }
  }
}

/* ============================================================
   AI Memory — export / import เป็นไฟล์ JSON
   ============================================================ */

export function exportMemory(corrections) {
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

export async function handleImportMemory(e, addCorrection, existing) {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = '';
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.app !== 'GINYARAIDEE' || data.type !== 'ai-memory') {
      alert('ไฟล์ไม่ถูกต้อง — ต้องเป็นไฟล์ความจำจากแอป GINYARAIDEE เท่านั้น');
      return;
    }
    const incoming = data.corrections || [];
    if (incoming.length === 0) {
      alert('ไฟล์ว่าง — ไม่มีข้อมูลให้นำเข้า');
      return;
    }
    // กันซ้ำด้วย (aiName + realName)
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
