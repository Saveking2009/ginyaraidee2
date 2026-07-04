import React, { useState, useEffect } from 'react';
import {
  GlassWater, Dumbbell, Moon, Stethoscope, TrendingUp, ChevronRight,
  Plus, Minus, Trash2, Activity, BarChart3, AlertCircle, Droplet,
} from 'lucide-react';
import { PALETTE, alpha } from '../theme';
import { todayKey, timeNow, waterTargetMl, EXERCISE_TYPES, exerciseCal, lastNDaysKeys } from '../utils';

/* ============================================================
   Mini Line Chart (SVG) — reusable
   ============================================================ */

function MiniLineChart({ points, color, unit = '', height = 140, target = null }) {
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

  // id ต้องไม่มีอักขระพิเศษ — สีอาจเป็น var(--x) ได้
  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
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
      <path d={areaPath} fill={`url(#${gradId})`} />
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

export default function HealthHub({ profile, water, addWater, removeWater, sleep, addSleep, removeSleep,
  exercises, addExercise, removeExercise, vitals, addVital, removeVital,
  weights, addWeight, removeWeight, initialTab }) {
  const today = todayKey();
  const target = waterTargetMl(profile.weight);
  const todayWater = water.filter(w => w.day === today).reduce((s, w) => s + (w.ml || 0), 0);
  const waterPct = Math.min(1, todayWater / target);

  const todayExercise = exercises.filter(e => e.day === today);
  const burned = todayExercise.reduce((s, e) => s + (e.calories || 0), 0);

  const lastSleep = sleep[sleep.length - 1];
  const lastVital = vitals[vitals.length - 1];

  const [tab, setTab] = useState(initialTab || 'water');

  // เปิดแท็บตามที่เลือกจากปุ่ม + ตรงกลาง
  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

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
            style={{ backgroundColor: tab === 'water' ? PALETTE.deep : PALETTE.paper, color: tab === 'water' ? 'white' : PALETTE.forest }}
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
            style={{ backgroundColor: tab === 'exercise' ? PALETTE.deep : PALETTE.paper, color: tab === 'exercise' ? 'white' : PALETTE.forest }}
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
            style={{ backgroundColor: tab === 'sleep' ? PALETTE.deep : PALETTE.paper, color: tab === 'sleep' ? 'white' : PALETTE.forest }}
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
            style={{ backgroundColor: tab === 'vitals' ? PALETTE.deep : PALETTE.paper, color: tab === 'vitals' ? 'white' : PALETTE.forest }}
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
          style={{ backgroundColor: tab === 'trends' ? PALETTE.deep : PALETTE.paper, color: tab === 'trends' ? 'white' : PALETTE.forest }}
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
          {tab === 'water' && <WaterTab water={water} addWater={addWater} removeWater={removeWater} target={target} todayWater={todayWater} />}
          {tab === 'exercise' && <ExerciseTab profile={profile} exercises={exercises} addExercise={addExercise} removeExercise={removeExercise} />}
          {tab === 'sleep' && <SleepTab sleep={sleep} addSleep={addSleep} removeSleep={removeSleep} />}
          {tab === 'vitals' && <VitalsTab vitals={vitals} addVital={addVital} removeVital={removeVital} />}
          {tab === 'trends' && <TrendsTab profile={profile} water={water} exercises={exercises} sleep={sleep} vitals={vitals} weights={weights} addWeight={addWeight} />}
        </div>
      </div>
    </div>
  );
}

function TrendsTab({ profile, water, exercises, sleep, vitals, weights, addWeight }) {
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

function WaterTab({ water, addWater, removeWater, target, todayWater }) {
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
              style={{ backgroundColor: pct >= 1 ? alpha(PALETTE.sage, 15) : PALETTE.shell, color: pct >= 1 ? PALETTE.sageDark : PALETTE.muted }}
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
                  backgroundColor: type.id === t.id ? PALETTE.deep : PALETTE.shell,
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
              backgroundColor: kind === 'bp' ? PALETTE.deep : PALETTE.shell,
              color: kind === 'bp' ? 'white' : PALETTE.forest,
            }}
          >ความดัน</button>
          <button onClick={() => setKind('sugar')}
            className="smooth-tap flex-1 py-2 rounded-xl font-display font-medium text-sm"
            style={{
              backgroundColor: kind === 'sugar' ? PALETTE.deep : PALETTE.shell,
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
