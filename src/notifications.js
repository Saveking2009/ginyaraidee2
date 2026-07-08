import { load, save, todayKey } from './utils';
import { playMelody, DEFAULT_SOUND } from './sound';

// เล่นเสียงแจ้งเตือนตามที่ผู้ใช้ตั้งไว้
export function playReminderSound() {
  const s = load('gyn_sound', DEFAULT_SOUND);
  if (s && s.enabled !== false) playMelody(s.melody, s.volume ?? 0.7);
}

/* ============================================================
   ระบบแจ้งเตือน — local notification ตามเวลาที่ผู้ใช้ตั้ง
   - ตัวเช็คเวลาถูกเรียกจาก App.jsx ทุก ~20 วินาที
   - กันเด้งซ้ำ: จำว่าแต่ละรายการยิงไปแล้วของวัน+เวลาไหน
   ============================================================ */

export async function showReminderNotification(reminder) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    const opts = {
      body: reminder.label,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'gyn-reminder-' + reminder.id, // แทนที่อันเก่าของ id เดียวกัน
    };
    // ผ่าน service worker ก่อน (จำเป็นบน Android/PWA) — ไม่มีค่อย fallback
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) {
      await reg.showNotification('GINYARAIDEE 🌿', opts);
      return true;
    }
    new Notification('GINYARAIDEE 🌿', opts);
    return true;
  } catch {
    return false;
  }
}

export function checkDueReminders(reminders) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!Array.isArray(reminders) || reminders.length === 0) return;

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = todayKey();
  const fired = load('gyn_reminder_fired', {});
  let changed = false;

  for (const r of reminders) {
    if (!r.enabled || r.time !== hhmm) continue;
    const key = `${today} ${r.time}`;
    if (fired[r.id] === key) continue; // ยิงไปแล้วนาทีนี้ของวันนี้
    fired[r.id] = key;
    changed = true;
    showReminderNotification(r);
    playReminderSound();
  }

  if (changed) {
    // เก็บกวาด id ที่ถูกลบไปแล้ว
    const ids = new Set(reminders.map(r => r.id));
    Object.keys(fired).forEach(k => { if (!ids.has(k)) delete fired[k]; });
    save('gyn_reminder_fired', fired);
  }
}
