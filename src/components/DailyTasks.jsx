import React, { useState } from 'react';
import { Check, ChevronRight, Gift, Palette, Lock, X } from 'lucide-react';
import { PALETTE, alpha } from '../theme';
import { load, save, todayKey, waterTargetMl } from '../utils';
import { Sheep, WOOL_COLORS, ACCESSORIES, loadMascot, woolColorOf } from './Mascot';

/* ============================================================
   ภารกิจประจำวัน 🐑
   - น้องแกะมาสคอตคอยเชียร์ (อารมณ์เปลี่ยนตามความคืบหน้า)
   - ภารกิจเช็คจากข้อมูลที่บันทึกจริง → กดรับแต้ม
   - แต้มใช้ปลดล็อกสีขนและของประดับให้น้องแกะ
   ============================================================ */

const LEVELS = [
  { min: 0, label: 'แกะน้อยหัดเดิน' },
  { min: 100, label: 'แกะขยัน' },
  { min: 250, label: 'แกะสุขภาพดี' },
  { min: 450, label: 'แกะนักวินัย' },
  { min: 700, label: 'แกะโปร' },
  { min: 1000, label: 'แกะระดับตำนาน' },
  { min: 1500, label: 'ราชาแห่งแกะ' },
];

const ALL_DONE_BONUS = 30;

export function levelOf(points) {
  let lv = LEVELS[0];
  let idx = 0;
  LEVELS.forEach((l, i) => { if (points >= l.min) { lv = l; idx = i; } });
  const next = LEVELS[idx + 1] || null;
  return { ...lv, index: idx, next };
}

// สร้างรายการภารกิจของวันนี้จากข้อมูลจริง
function buildTasks({ profile, foodLog, water, exercises, sleep, weights }) {
  const today = todayKey();
  const meals = foodLog.filter(f => f.day === today).length;
  const waterMl = water.filter(w => w.day === today).reduce((s, w) => s + (w.ml || 0), 0);
  const waterGoal = waterTargetMl(profile.weight);
  const exMinutes = exercises.filter(e => e.day === today).reduce((s, e) => s + (e.minutes || 0), 0);
  const sleptToday = sleep.some(s => s.day === today);
  const weighedToday = (weights || []).some(w => w.day === today);

  return [
    { id: 'food3', icon: '🍽️', label: 'บันทึกอาหาร 3 มื้อ', sub: 'ถ่ายรูปหรือพิมพ์ชื่ออาหาร', points: 15, cur: meals, max: 3, unit: 'มื้อ', go: { screen: 'food' } },
    { id: 'water', icon: '💧', label: 'ดื่มน้ำครบเป้า', sub: `เป้าหมายวันนี้ ${waterGoal} ml`, points: 15, cur: waterMl, max: waterGoal, unit: 'ml', go: { screen: 'health', tab: 'water' } },
    { id: 'exercise', icon: '💪', label: 'ขยับตัว 20 นาที', sub: 'เดิน วิ่ง โยคะ อะไรก็ได้', points: 20, cur: exMinutes, max: 20, unit: 'นาที', go: { screen: 'health', tab: 'exercise' } },
    { id: 'sleep', icon: '😴', label: 'บันทึกการนอน', sub: 'เมื่อคืนนอนกี่ชั่วโมง', points: 10, cur: sleptToday ? 1 : 0, max: 1, unit: '', go: { screen: 'health', tab: 'sleep' } },
    { id: 'weight', icon: '⚖️', label: 'ชั่งน้ำหนักวันนี้', sub: 'บันทึกในกราฟแนวโน้ม', points: 10, cur: weighedToday ? 1 : 0, max: 1, unit: '', go: { screen: 'health', tab: 'trends' } },
  ];
}

export default function DailyTasks({ profile, foodLog, water, exercises, sleep, weights, streak, goto, openHealth }) {
  const today = todayKey();
  const [claimedMap, setClaimedMap] = useState(() => load('gyn_tasks', {}));
  const [points, setPoints] = useState(() => load('gyn_points', 0));
  const [mascot, setMascot] = useState(loadMascot);
  const [customizing, setCustomizing] = useState(false);

  const tasks = buildTasks({ profile, foodLog, water, exercises, sleep, weights });
  const claimedToday = claimedMap[today] || [];
  const claimableCount = tasks.filter(t => t.cur >= t.max && !claimedToday.includes(t.id)).length;
  const doneCount = tasks.filter(t => claimedToday.includes(t.id)).length;
  const allDone = tasks.every(t => claimedToday.includes(t.id));
  const bonusClaimed = claimedToday.includes('bonus');

  const lv = levelOf(points);
  const nextProgress = lv.next ? Math.min(1, (points - lv.min) / (lv.next.min - lv.min)) : 1;

  // อารมณ์น้องแกะตามความคืบหน้า
  const mood = allDone ? 'party' : claimableCount > 0 ? 'happy'
    : (doneCount > 0 || tasks.some(t => t.cur > 0)) ? 'normal' : 'sleepy';

  const speech = allDone
    ? `ครบทุกภารกิจแล้ว! ${profile.name}เก่งที่สุดเลย 🎉`
    : claimableCount > 0
    ? `มีแต้มรอรับ ${claimableCount} ภารกิจ กดรับเลย!`
    : doneCount > 0 || tasks.some(t => t.cur > 0)
    ? `ทำแล้ว ${doneCount}/${tasks.length} ภารกิจ สู้ต่ออีกนิดนะ!`
    : 'แบ๊ะ~ วันนี้ยังไม่ได้เริ่มเลย มาบันทึกกันเถอะ';

  const persist = (map, pts) => {
    // เก็บเฉพาะ 30 วันล่าสุด กัน localStorage บวม
    const keys = Object.keys(map).sort();
    const trimmed = {};
    keys.slice(-30).forEach(k => { trimmed[k] = map[k]; });
    setClaimedMap(trimmed);
    setPoints(pts);
    save('gyn_tasks', trimmed);
    save('gyn_points', pts);
  };

  const claim = (task) => {
    if (task.cur < task.max || claimedToday.includes(task.id)) return;
    persist({ ...claimedMap, [today]: [...claimedToday, task.id] }, points + task.points);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const claimBonus = () => {
    if (!allDone || bonusClaimed) return;
    persist({ ...claimedMap, [today]: [...claimedToday, 'bonus'] }, points + ALL_DONE_BONUS);
  };

  const goDo = (task) => {
    if (task.go.tab) openHealth(task.go.tab);
    else goto(task.go.screen);
  };

  const saveMascot = (patch) => {
    const next = { ...mascot, ...patch };
    setMascot(next);
    save('gyn_mascot', next);
  };

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>DAILY MISSION</div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
          ภารกิจวันนี้
        </h1>
        <p className="font-body text-sm mb-5" style={{ color: PALETTE.muted }}>
          ดูแลตัวเองครบ {mascot.name}ก็มีความสุข
        </p>

        {/* น้องแกะ + คำพูด + แต้ม */}
        <div className="rounded-3xl p-5 mb-4 deep-shadow relative overflow-hidden anim-slideUp"
          style={{ backgroundColor: PALETTE.deep }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15"
            style={{ backgroundColor: PALETTE.gold }} />

          {/* speech bubble */}
          <div className="relative rounded-2xl px-4 py-3 mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            <div className="font-body text-sm leading-relaxed" style={{ color: PALETTE.forest }}>
              {speech}
            </div>
            <div className="absolute -bottom-2 left-10 w-4 h-4 rotate-45"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }} />
          </div>

          <div className="relative flex items-center gap-4">
            <div className={mood === 'party' ? 'anim-float' : ''}>
              <Sheep wool={woolColorOf(mascot)} accessory={mascot.acc} mood={mood} size={110} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-white text-lg leading-tight truncate">
                {mascot.name}
              </div>
              <div className="font-accent text-tiny mb-2" style={{ color: PALETTE.gold }}>
                Lv.{lv.index + 1} {lv.label} · {points} แต้ม
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${nextProgress * 100}%`, backgroundColor: PALETTE.gold }} />
              </div>
              <div className="font-body text-tiny text-white/60 mb-2">
                {lv.next ? `อีก ${lv.next.min - points} แต้ม → ${lv.next.label}` : 'ระดับสูงสุดแล้ว!'}
              </div>
              <button onClick={() => setCustomizing(true)}
                className="smooth-tap font-display text-xs font-semibold px-3 py-2 rounded-xl inline-flex items-center gap-1.5"
                style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
              >
                <Palette size={13} /> แต่งตัวน้องแกะ
              </button>
            </div>
          </div>

          {streak > 0 && (
            <div className="relative mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-accent text-xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }}
            >
              🔥 บันทึกสุขภาพติดต่อกัน {streak} วัน
            </div>
          )}
        </div>

        {/* สรุปวันนี้ */}
        <div className="flex items-center justify-between mb-3 anim-slideUp delay-1">
          <div className="font-display font-semibold text-sm" style={{ color: PALETTE.sageDeep }}>
            ทำแล้ว {doneCount}/{tasks.length} ภารกิจ
          </div>
          {claimableCount > 0 && (
            <div className="font-accent text-xs px-2.5 py-1 rounded-full anim-fadeIn"
              style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
            >
              มีแต้มรอรับ {claimableCount} ภารกิจ!
            </div>
          )}
        </div>

        {/* รายการภารกิจ */}
        <div className="space-y-2.5 mb-4">
          {tasks.map((t, i) => {
            const claimed = claimedToday.includes(t.id);
            const complete = t.cur >= t.max;
            const pct = Math.min(1, t.max ? t.cur / t.max : 0);
            return (
              <div key={t.id}
                className={`rounded-2xl p-4 organic-shadow anim-slideUp delay-${Math.min(i + 1, 6)}`}
                style={{
                  backgroundColor: PALETTE.paper,
                  opacity: claimed ? 0.75 : 1,
                  border: complete && !claimed ? `1.5px solid ${PALETTE.gold}` : '1.5px solid transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: PALETTE.shell }}
                  >
                    {claimed ? '✅' : t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm"
                      style={{ color: PALETTE.forest, textDecoration: claimed ? 'line-through' : 'none' }}
                    >
                      {t.label}
                    </div>
                    <div className="font-body text-xs mt-0.5" style={{ color: PALETTE.muted }}>
                      {claimed ? `รับแล้ว +${t.points} แต้ม` : t.sub}
                    </div>
                  </div>
                  {claimed ? (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: alpha(PALETTE.sage, 20), color: PALETTE.sageDark }}
                    >
                      <Check size={16} />
                    </div>
                  ) : complete ? (
                    <button onClick={() => claim(t)}
                      className="smooth-tap font-display font-semibold text-xs px-4 py-2.5 rounded-xl flex-shrink-0 anim-pulseGlow"
                      style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
                    >
                      รับ +{t.points}
                    </button>
                  ) : (
                    <button onClick={() => goDo(t)}
                      className="smooth-tap font-display font-medium text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 flex-shrink-0"
                      style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
                    >
                      ไปทำ <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                {/* progress bar */}
                {!claimed && t.max > 1 && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: PALETTE.mist }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct * 100}%`, backgroundColor: complete ? PALETTE.gold : PALETTE.sage }} />
                    </div>
                    <div className="font-body text-tiny mt-1 text-right" style={{ color: PALETTE.muted }}>
                      {t.cur} / {t.max} {t.unit}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* โบนัสครบทุกภารกิจ */}
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 anim-slideUp"
          style={{
            backgroundColor: allDone && !bonusClaimed ? PALETTE.gold : PALETTE.paper,
            border: `1.5px dashed ${allDone ? PALETTE.gold : PALETTE.mist}`,
          }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: allDone && !bonusClaimed ? 'rgba(255,255,255,0.3)' : PALETTE.shell,
              color: allDone && !bonusClaimed ? PALETTE.deep : PALETTE.sageDeep,
            }}
          >
            <Gift size={20} />
          </div>
          <div className="flex-1">
            <div className="font-display font-semibold text-sm"
              style={{ color: allDone && !bonusClaimed ? PALETTE.deep : PALETTE.sageDeep }}
            >
              {bonusClaimed ? 'รับโบนัสวันนี้แล้ว 🎉' : `ทำครบทุกภารกิจ รับโบนัส +${ALL_DONE_BONUS}`}
            </div>
            <div className="font-body text-xs mt-0.5"
              style={{ color: allDone && !bonusClaimed ? PALETTE.deep : PALETTE.muted }}
            >
              {bonusClaimed ? 'พรุ่งนี้มาทำต่อ อย่าให้ไฟดับนะ 🔥' : allDone ? 'ครบแล้ว! กดรับเลย' : `เหลืออีก ${tasks.length - doneCount} ภารกิจ`}
            </div>
          </div>
          {allDone && !bonusClaimed && (
            <button onClick={claimBonus}
              className="smooth-tap font-display font-bold text-xs px-4 py-2.5 rounded-xl anim-pulseGlow flex-shrink-0"
              style={{ backgroundColor: PALETTE.deep, color: 'white' }}
            >
              รับโบนัส!
            </button>
          )}
        </div>

        <div className="rounded-2xl p-3 flex items-start gap-2" style={{ backgroundColor: PALETTE.shell }}>
          <div className="text-sm">💡</div>
          <p className="font-body text-tiny leading-relaxed" style={{ color: PALETTE.sageDark }}>
            แต้มมาจากการบันทึกสุขภาพจริงเท่านั้น ภารกิจรีเซ็ตทุกเที่ยงคืน — สะสมแต้มเพื่อปลดล็อกชุดใหม่ให้{mascot.name}
          </p>
        </div>
      </div>

      {/* ===== หน้าแต่งตัวน้องแกะ ===== */}
      {customizing && (
        <div className="fixed inset-0 z-50 flex items-end anim-fadeIn"
          style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
          onClick={() => setCustomizing(false)}
        >
          <div className="w-full rounded-t-3xl deep-shadow anim-slideUp"
            style={{ backgroundColor: PALETTE.cream, maxHeight: '88vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto my-3" style={{ backgroundColor: PALETTE.mist }} />
            <div className="px-6 pb-8">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-xl font-bold" style={{ color: PALETTE.sageDeep }}>
                  แต่งตัวน้องแกะ
                </h3>
                <button onClick={() => setCustomizing(false)}
                  className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
                >
                  <X size={16} />
                </button>
              </div>
              <p className="font-body text-xs mb-4" style={{ color: PALETTE.muted }}>
                มี {points} แต้ม — ทำภารกิจเพิ่มเพื่อปลดล็อกของใหม่
              </p>

              {/* พรีวิว */}
              <div className="rounded-3xl p-5 mb-5 flex items-center justify-center"
                style={{ backgroundColor: PALETTE.deep }}
              >
                <Sheep wool={woolColorOf(mascot)} accessory={mascot.acc} mood="happy" size={130} />
              </div>

              {/* ชื่อ */}
              <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>ชื่อน้องแกะ</div>
              <input value={mascot.name}
                onChange={e => saveMascot({ name: e.target.value.slice(0, 12) })}
                placeholder="ตั้งชื่อน้องแกะ"
                className="font-body w-full px-4 py-3 rounded-2xl text-base mb-5"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />

              {/* สีขน */}
              <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>สีขน</div>
              <div className="flex flex-wrap gap-3 mb-5">
                {WOOL_COLORS.map(w => {
                  const locked = points < w.unlock;
                  const active = mascot.wool === w.id;
                  return (
                    <button key={w.id}
                      onClick={() => !locked && saveMascot({ wool: w.id })}
                      className="smooth-tap flex flex-col items-center gap-1"
                      style={{ opacity: locked ? 0.5 : 1 }}
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: w.c,
                          border: active ? `3px solid ${PALETTE.sageDark}` : `2px solid ${PALETTE.mist}`,
                        }}
                      >
                        {locked ? <Lock size={14} color={PALETTE.muted} /> : active ? <Check size={16} color={PALETTE.sageDark} /> : null}
                      </div>
                      <span className="font-body text-tiny" style={{ color: PALETTE.muted }}>
                        {locked ? `${w.unlock} แต้ม` : w.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ของประดับ */}
              <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>ของประดับ</div>
              <div className="grid grid-cols-3 gap-2">
                {ACCESSORIES.map(a => {
                  const locked = points < a.unlock;
                  const active = mascot.acc === a.id;
                  return (
                    <button key={a.id}
                      onClick={() => !locked && saveMascot({ acc: a.id })}
                      className="smooth-tap rounded-xl p-3 flex flex-col items-center gap-1"
                      style={{
                        backgroundColor: active ? PALETTE.deep : PALETTE.paper,
                        color: active ? 'white' : PALETTE.forest,
                        opacity: locked ? 0.55 : 1,
                        border: `1px solid ${active ? PALETTE.deep : PALETTE.mist}`,
                      }}
                    >
                      <span className="text-xl">{locked ? '🔒' : a.icon}</span>
                      <span className="font-body text-tiny">
                        {locked ? `${a.unlock} แต้ม` : a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
