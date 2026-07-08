import { load, save, todayKey } from './utils';
import { playSound, DEFAULT_SOUND } from './sound';

// เล่นเสียง + สั่น ตามที่ตั้งไว้ในแต่ละรายการ (ระดับเสียงรวมมาจาก gyn_sound)
export function playReminderSound(reminder) {
  const g = load('gyn_sound', DEFAULT_SOUND);
  const volume = g.volume ?? 0.7;
  const melody = reminder?.sound ?? 'chime';
  if (melody && melody !== 'off') playSound(melody, volume);
  if (reminder?.vibrate && typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([200, 100, 200, 100, 300]); } catch {}
  }
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
    if (reminder.vibrate) opts.vibrate = [200, 100, 200, 100, 300];
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
  // ห่อ try/catch ทั้งก้อน — อะไรพังในนี้ต้องไม่ทำให้แอปแครช
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!Array.isArray(reminders) || reminders.length === 0) return;

    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = todayKey();
    const fired = load('gyn_reminder_fired', {});
    let changed = false;

    for (const r of reminders) {
      if (!r || !r.enabled || r.time !== hhmm) continue;
      const key = `${today} ${r.time}`;
      if (fired[r.id] === key) continue; // ยิงไปแล้วนาทีนี้ของวันนี้
      fired[r.id] = key;
      changed = true;
      showReminderNotification(r);
      playReminderSound(r); // ส่ง r เพื่อใช้เสียง/สั่นของรายการนั้นจริงๆ
    }

    if (changed) {
      // เก็บกวาด id ที่ถูกลบไปแล้ว
      const ids = new Set(reminders.map(r => r.id));
      Object.keys(fired).forEach(k => { if (!ids.has(k)) delete fired[k]; });
      save('gyn_reminder_fired', fired);
    }
  } catch (e) {
    console.warn('checkDueReminders failed:', e);
  }
}
