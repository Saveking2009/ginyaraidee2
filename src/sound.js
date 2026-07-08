/* ============================================================
   เสียงแจ้งเตือน — เมโลดี้สั้นๆ สังเคราะห์ด้วย Web Audio API
   (ไม่ต้องมีไฟล์เสียง เบาและปรับแต่งได้)
   แต่ละเพลง = ลิสต์โน้ต [ความถี่ Hz, เริ่มวินาที, ยาววินาที]
   ============================================================ */

// ความถี่โน้ต (Hz)
const N = {
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.7, E6: 1318.5, G6: 1568.0, A6: 1760.0, C7: 2093.0,
};

export const MELODIES = {
  chime:   { label: 'กระดิ่งใส', emoji: '🔔', wave: 'sine',     notes: [[N.C6,0,.16],[N.E6,.12,.16],[N.G6,.24,.34]] },
  happy:   { label: 'สดใส',      emoji: '🎵', wave: 'triangle', notes: [[N.G5,0,.12],[N.C6,.12,.12],[N.E6,.24,.12],[N.G6,.36,.28]] },
  bell:    { label: 'ระฆังนุ่ม', emoji: '🎐', wave: 'sine',     notes: [[N.A5,0,.7],[N.E5,.04,.9]] },
  marimba: { label: 'มาริมบา',   emoji: '🪵', wave: 'triangle', notes: [[N.C6,0,.1],[N.G5,.1,.1],[N.C6,.2,.1],[N.E6,.3,.28]] },
  bird:    { label: 'นกร้อง',    emoji: '🐤', wave: 'sine',     notes: [[N.B5,0,.06],[N.E6,.07,.06],[N.B5,.15,.06],[N.G6,.24,.12]] },
  digital: { label: 'ดิจิทัล',   emoji: '📳', wave: 'square',   notes: [[N.A5,0,.07],[N.A5,.12,.07],[N.C6,.24,.14]] },
  fanfare: { label: 'สำเร็จ!',   emoji: '🎉', wave: 'triangle', notes: [[N.C6,0,.1],[N.C6,.1,.1],[N.C6,.2,.1],[N.E6,.3,.14],[N.G6,.46,.3]] },
  zen:     { label: 'ผ่อนคลาย',  emoji: '🧘', wave: 'sine',     notes: [[N.C5,0,.9],[N.G5,.12,.9]] },
  off:     { label: 'เงียบ',     emoji: '🔇', wave: 'sine',     notes: [] },
};

export const DEFAULT_SOUND = { melody: 'chime', volume: 0.7, enabled: true };

let _ctx = null;
function getCtx() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!_ctx) _ctx = new AC();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

// ปลุก AudioContext ตอนผู้ใช้แตะจอ — ให้เสียงเล่นได้ตอนแจ้งเตือนเด้งเองทีหลัง
export function primeAudio() {
  const ac = getCtx();
  if (ac && ac.state === 'suspended') ac.resume();
}

export function playMelody(id, volume = 0.7) {
  const mel = MELODIES[id];
  if (!mel || id === 'off' || !mel.notes.length) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    const master = ac.createGain();
    master.gain.value = Math.max(0, Math.min(1, volume));
    master.connect(ac.destination);
    const t0 = ac.currentTime + 0.03;
    mel.notes.forEach(([freq, start, dur]) => {
      const osc = ac.createOscillator();
      osc.type = mel.wave || 'sine';
      osc.frequency.value = freq;
      const g = ac.createGain();
      const s = t0 + start;
      const e = s + dur;
      // envelope นุ่มๆ กันเสียงป๊อก
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(1, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, e);
      osc.connect(g);
      g.connect(master);
      osc.start(s);
      osc.stop(e + 0.03);
    });
  } catch {}
}

/* ============================================================
   เสียงที่ผู้ใช้อัปโหลดเอง — เก็บไฟล์ลง IndexedDB
   (ไฟล์เสียงใหญ่เกินกว่าจะเก็บใน localStorage)
   id ของเสียงกำหนดเอง = "custom:xxxx"
   ============================================================ */

const DB_NAME = 'gyn_sounds';
const STORE = 'sounds';
export const CUSTOM_MAX_BYTES = 5 * 1024 * 1024; // 5MB

function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomSound(name, file) {
  const buf = await file.arrayBuffer();
  const id = 'custom:' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const db = await idb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ id, name, buf, type: file.type });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  return { id, name };
}

export async function listCustomSounds() {
  try {
    const db = await idb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result || []).map(s => ({ id: s.id, name: s.name })));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteCustomSound(id) {
  try {
    const db = await idb();
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
    delete _bufCache[id];
  } catch {}
}

async function getCustomBuf(id) {
  const db = await idb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result?.buf || null);
    req.onerror = () => reject(req.error);
  });
}

// เล่นเสียงตาม id — เป็นเมโลดี้ในตัว หรือไฟล์ที่ผู้ใช้อัปโหลด (custom:)
const _bufCache = {};
export async function playSound(id, volume = 0.7) {
  if (!id || id === 'off') return;
  if (!String(id).startsWith('custom:')) {
    playMelody(id, volume);
    return;
  }
  const ac = getCtx();
  if (!ac) return;
  try {
    let buffer = _bufCache[id];
    if (!buffer) {
      const raw = await getCustomBuf(id);
      if (!raw) return;
      buffer = await ac.decodeAudioData(raw.slice(0)); // slice: decode ทำให้ buffer เดิมใช้ไม่ได้
      _bufCache[id] = buffer;
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const g = ac.createGain();
    g.gain.value = Math.max(0, Math.min(1, volume));
    src.connect(g);
    g.connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + Math.min(buffer.duration, 8)); // จำกัด ~8 วิ กันไฟล์ยาว
  } catch {}
}
