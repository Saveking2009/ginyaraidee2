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
