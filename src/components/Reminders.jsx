import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Plus, Trash2, Send, Music, Volume2, Upload, Play, Smartphone, X } from 'lucide-react';
import { PALETTE, alpha } from '../theme';
import { showReminderNotification } from '../notifications';
import { load, save } from '../utils';
import {
  MELODIES, DEFAULT_SOUND, playSound, primeAudio,
  listCustomSounds, saveCustomSound, deleteCustomSound, CUSTOM_MAX_BYTES,
} from '../sound';

/* ============================================================
   แจ้งเตือนประจำวัน 🔔
   - ตั้งเวลา + ข้อความ + เสียง + สั่น แยกได้ทีละรายการ
   - อัปโหลดเสียงจากเครื่องมาใช้เองได้ (เก็บใน IndexedDB)
   - ตัวจับเวลาอยู่ใน App.jsx (ทำงานตอนแอปเปิดอยู่)
   ============================================================ */

const PRESETS = [
  { time: '08:00', label: 'อย่าลืมถ่ายรูปมื้อเช้านะ 📸' },
  { time: '12:30', label: 'มื้อเที่ยงแล้ว ถ่ายรูปก่อนกิน! 🍽️' },
  { time: '18:30', label: 'มื้อเย็นวันนี้กินอะไร ถ่ายให้น้องไกด์ดูหน่อย 🌙' },
  { time: '20:00', label: 'วันนี้ดื่มน้ำครบหรือยัง 💧' },
  { time: '21:30', label: 'มาเก็บแต้มภารกิจก่อนหมดวัน ปุยฝ้ายรออยู่ 🐑' },
];

const newId = () => 'r' + Date.now() + Math.random().toString(36).slice(2, 5);

export default function Reminders({ reminders, setReminders }) {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  const canVibrate = typeof navigator !== 'undefined' && !!navigator.vibrate;
  const [perm, setPerm] = useState(supported ? Notification.permission : 'unsupported');
  const [testSent, setTestSent] = useState(false);
  const [volume, setVolume] = useState(() => (load('gyn_sound', DEFAULT_SOUND).volume ?? 0.7));
  const [customs, setCustoms] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { listCustomSounds().then(setCustoms); }, []);

  const saveVolume = (v) => {
    setVolume(v);
    save('gyn_sound', { ...load('gyn_sound', DEFAULT_SOUND), volume: v });
  };

  // รวมเสียงในตัว + เสียงที่อัปโหลด สำหรับ dropdown
  const soundOptions = [
    ...Object.entries(MELODIES).map(([id, m]) => ({ id, label: `${m.emoji} ${m.label}` })),
    ...customs.map(c => ({ id: c.id, label: `🎵 ${c.name}` })),
  ];
  const soundLabel = (id) => soundOptions.find(o => o.id === id)?.label || '🔔 กระดิ่งใส';

  const preview = (id) => { primeAudio(); playSound(id, volume); };

  const requestPermission = async () => {
    try { setPerm(await Notification.requestPermission()); } catch {}
  };

  const update = (id, patch) =>
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id) => setReminders(prev => prev.filter(r => r.id !== id));
  const add = (preset) =>
    setReminders(prev => [...prev, {
      id: newId(),
      time: preset?.time || '12:00',
      label: preset?.label || 'อย่าลืมถ่ายรูปข้าวนะ 📸',
      enabled: true,
      sound: 'chime',
      vibrate: false,
    }]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('audio/')) { alert('กรุณาเลือกไฟล์เสียงเท่านั้น (mp3, wav, m4a ...)'); return; }
    if (file.size > CUSTOM_MAX_BYTES) { alert('ไฟล์ใหญ่เกินไป (จำกัด 5MB) ลองเลือกไฟล์สั้นๆ นะคะ'); return; }
    setUploading(true);
    try {
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 24);
      const saved = await saveCustomSound(name, file);
      setCustoms(await listCustomSounds());
      preview(saved.id); // ฟังทันทีหลังอัปโหลด
    } catch {
      alert('บันทึกเสียงไม่สำเร็จ ลองไฟล์อื่นนะคะ');
    } finally {
      setUploading(false);
    }
  };

  const removeCustom = async (id) => {
    await deleteCustomSound(id);
    setCustoms(await listCustomSounds());
    // รายการที่ใช้เสียงนี้อยู่ ให้กลับไปใช้กระดิ่ง
    setReminders(prev => prev.map(r => (r.sound === id ? { ...r, sound: 'chime' } : r)));
  };

  const sendTest = async () => {
    primeAudio();
    await showReminderNotification({ id: 'test', label: 'แจ้งเตือนทำงานแล้ว! เจอกันตามเวลาที่ตั้งไว้นะคะ 🌿' });
    playSound('chime', volume);
    if (canVibrate) { try { navigator.vibrate([200, 100, 200]); } catch {} }
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange}
      className="smooth-tap w-12 h-7 rounded-full relative flex-shrink-0"
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
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>REMINDERS</div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
          แจ้งเตือน
        </h1>
        <p className="font-body text-sm mb-5" style={{ color: PALETTE.muted }}>
          ตั้งเวลา ข้อความ เสียง และการสั่น แยกได้ทุกรายการ
        </p>

        {/* สถานะการอนุญาต */}
        {!supported ? (
          <div className="rounded-2xl p-4 mb-4 flex items-start gap-3"
            style={{ backgroundColor: PALETTE.coralSoft }}
          >
            <BellOff size={18} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
            <div className="font-body text-xs leading-relaxed" style={{ color: PALETTE.coral }}>
              เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน — ลองติดตั้งแอปลงหน้าจอ (Add to Home Screen) แล้วเปิดจากไอคอนแทน
            </div>
          </div>
        ) : perm !== 'granted' ? (
          <div className="rounded-3xl p-5 mb-4 deep-shadow relative overflow-hidden"
            style={{ backgroundColor: PALETTE.deep }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-15"
              style={{ backgroundColor: PALETTE.gold }} />
            <div className="relative flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <Bell size={20} color={PALETTE.gold} />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-white text-sm mb-1">
                  เปิดการแจ้งเตือนก่อนนะ
                </div>
                <p className="font-body text-xs text-white/70 leading-relaxed mb-3">
                  {perm === 'denied'
                    ? 'การแจ้งเตือนถูกปิดไว้ — กดรูปกุญแจ 🔒 ข้างที่อยู่เว็บ แล้วอนุญาต "การแจ้งเตือน" จากนั้นรีเฟรช'
                    : 'แอปต้องขออนุญาตจากเครื่องก่อน ถึงจะเด้งเตือนได้'}
                </p>
                {perm !== 'denied' && (
                  <button onClick={requestPermission}
                    className="smooth-tap font-display font-semibold text-xs px-4 py-2.5 rounded-xl"
                    style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
                  >
                    อนุญาตการแจ้งเตือน
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <button onClick={sendTest}
            className="smooth-tap w-full rounded-2xl p-3.5 mb-4 flex items-center gap-3 organic-shadow"
            style={{ backgroundColor: PALETTE.paper }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: alpha(PALETTE.sage, 15), color: PALETTE.sageDark }}
            >
              <Send size={16} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-sm" style={{ color: PALETTE.forest }}>
                {testSent ? 'ส่งแล้ว! เช็คการแจ้งเตือนดูเลย ✅' : 'ลองส่งแจ้งเตือนตอนนี้'}
              </div>
              <div className="font-body text-tiny" style={{ color: PALETTE.muted }}>
                ทดสอบว่าเครื่องนี้เด้งเตือนได้จริง
              </div>
            </div>
          </button>
        )}

        {/* ตั้งค่าเสียงรวม + อัปโหลดเสียงเอง */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow" style={{ backgroundColor: PALETTE.paper }}>
          <div className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
            <Music size={16} color={PALETTE.gold} /> เสียงและระดับเสียง
          </div>

          {/* ระดับเสียง */}
          <div className="flex items-center gap-3 mb-4">
            <Volume2 size={16} color={PALETTE.sageDark} className="flex-shrink-0" />
            <input type="range" min="0" max="100"
              value={Math.round(volume * 100)}
              onChange={e => saveVolume(+e.target.value / 100)}
              onMouseUp={() => preview('chime')}
              onTouchEnd={() => preview('chime')}
              className="flex-1"
              style={{ accentColor: PALETTE.sage }}
            />
            <span className="font-body text-xs w-8 text-right" style={{ color: PALETTE.muted }}>
              {Math.round(volume * 100)}
            </span>
          </div>

          {/* เสียงของฉัน (อัปโหลด) */}
          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>เสียงของฉัน (จากเครื่อง)</div>
          {customs.length > 0 && (
            <div className="space-y-2 mb-3">
              {customs.map(c => (
                <div key={c.id} className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ backgroundColor: PALETTE.shell }}
                >
                  <span className="text-sm">🎵</span>
                  <span className="font-body text-xs flex-1 truncate" style={{ color: PALETTE.forest }}>{c.name}</span>
                  <button onClick={() => preview(c.id)}
                    className="smooth-tap w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: alpha(PALETTE.sage, 20), color: PALETTE.sageDark }}
                  >
                    <Play size={12} />
                  </button>
                  <button onClick={() => removeCustom(c.id)}
                    className="smooth-tap w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ color: PALETTE.coral }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="smooth-tap w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-display font-medium text-sm"
            style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
          >
            <Upload size={15} /> {uploading ? 'กำลังบันทึก...' : 'อัปโหลดเสียงจากเครื่อง'}
            <input type="file" accept="audio/*" onChange={onUpload} className="hidden" disabled={uploading} />
          </label>
          <p className="font-body text-tiny mt-2 leading-relaxed" style={{ color: PALETTE.muted }}>
            รองรับ mp3 / wav / m4a (ไม่เกิน 5MB) — เลือกเป็นเสียงเตือนของแต่ละรายการได้ด้านล่าง
          </p>
        </div>

        {/* รายการแจ้งเตือน */}
        <div className="font-display font-semibold text-sm mb-3" style={{ color: PALETTE.sageDeep }}>
          เวลาเตือนของฉัน
        </div>

        {reminders.length === 0 ? (
          <div className="rounded-2xl p-6 mb-3 text-center" style={{ backgroundColor: PALETTE.paper }}>
            <Bell size={26} className="mx-auto mb-2" color={PALETTE.mist} />
            <div className="font-body text-sm mb-4" style={{ color: PALETTE.muted }}>
              ยังไม่มีแจ้งเตือน — เพิ่มจากตัวอย่างด้านล่างได้เลย
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 mb-4">
            {reminders.map(r => (
              <div key={r.id} className="rounded-2xl p-4 organic-shadow"
                style={{ backgroundColor: PALETTE.paper, opacity: r.enabled ? 1 : 0.6 }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <input type="time" value={r.time}
                    onChange={e => update(r.id, { time: e.target.value })}
                    className="font-display text-xl font-bold px-3 py-1.5 rounded-xl"
                    style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDeep, border: 'none' }}
                  />
                  <div className="flex-1" />
                  <Toggle on={r.enabled} onChange={() => update(r.id, { enabled: !r.enabled })} />
                  <button onClick={() => remove(r.id)}
                    className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ color: PALETTE.coral }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <input value={r.label}
                  onChange={e => update(r.id, { label: e.target.value.slice(0, 90) })}
                  placeholder="ข้อความเตือน เช่น อย่าลืมถ่ายรูปข้าว"
                  className="font-body w-full px-3 py-2.5 rounded-xl text-sm mb-2.5"
                  style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: 'none' }}
                />

                {/* เสียง + สั่น ของรายการนี้ */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-1.5 rounded-xl pl-3 pr-1 py-1"
                    style={{ backgroundColor: PALETTE.shell }}
                  >
                    <Music size={13} color={PALETTE.sageDark} className="flex-shrink-0" />
                    <select value={r.sound || 'chime'}
                      onChange={e => { update(r.id, { sound: e.target.value }); preview(e.target.value); }}
                      className="font-body text-xs flex-1 min-w-0 bg-transparent py-1.5"
                      style={{ color: PALETTE.forest, border: 'none' }}
                    >
                      {soundOptions.map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>
                    <button onClick={() => preview(r.sound || 'chime')}
                      className="smooth-tap w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: alpha(PALETTE.sage, 20), color: PALETTE.sageDark }}
                      title="ฟังเสียง"
                    >
                      <Play size={12} />
                    </button>
                  </div>

                  <button onClick={() => {
                      const next = !r.vibrate;
                      update(r.id, { vibrate: next });
                      if (next && canVibrate) { try { navigator.vibrate(150); } catch {} }
                    }}
                    className="smooth-tap px-3 py-2.5 rounded-xl flex items-center gap-1.5 flex-shrink-0"
                    style={{
                      backgroundColor: r.vibrate ? PALETTE.sageDark : PALETTE.shell,
                      color: r.vibrate ? 'white' : PALETTE.muted,
                    }}
                    title={canVibrate ? 'สั่นเมื่อเตือน' : 'เครื่องนี้อาจไม่รองรับการสั่น'}
                  >
                    <Smartphone size={14} />
                    <span className="font-accent text-tiny">สั่น</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* เพิ่มใหม่ */}
        <button onClick={() => add()}
          className="smooth-tap w-full py-3.5 rounded-2xl mb-4 font-display font-semibold text-sm text-white flex items-center justify-center gap-2 deep-shadow"
          style={{ backgroundColor: PALETTE.sageDark }}
        >
          <Plus size={16} /> เพิ่มแจ้งเตือนใหม่
        </button>

        {/* ตัวอย่างสำเร็จรูป */}
        <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>เพิ่มเร็วจากตัวอย่าง</div>
        <div className="space-y-2 mb-4">
          {PRESETS.filter(p => !reminders.some(r => r.time === p.time && r.label === p.label)).map((p, i) => (
            <button key={i} onClick={() => add(p)}
              className="smooth-tap w-full rounded-xl p-3 flex items-center gap-3 text-left"
              style={{ backgroundColor: PALETTE.paper, border: `1px dashed ${PALETTE.mist}` }}
            >
              <div className="font-display font-bold text-sm" style={{ color: PALETTE.sageDark }}>{p.time}</div>
              <div className="font-body text-xs flex-1" style={{ color: PALETTE.forest }}>{p.label}</div>
              <Plus size={14} color={PALETTE.muted} />
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-3 flex items-start gap-2" style={{ backgroundColor: PALETTE.shell }}>
          <div className="text-sm">💡</div>
          <p className="font-body text-tiny leading-relaxed" style={{ color: PALETTE.sageDark }}>
            การแจ้งเตือนทำงานเมื่อแอปเปิดอยู่ (รวมถึงพับหน้าจอ/สลับแท็บในหลายเครื่อง) —
            ให้เตือนแม่นสุด แนะนำติดตั้งเป็นแอป: เปิดเว็บ → เมนูเบราว์เซอร์ → "เพิ่มลงหน้าจอหลัก"
          </p>
        </div>
      </div>
    </div>
  );
}
