import React, { useState, useEffect } from 'react';
import {
  User, UtensilsCrossed, Shield, BarChart3,
  TrendingUp, TrendingDown, Check, Loader2, ChevronRight, Sparkles,
  Newspaper, RotateCcw, AlertCircle, Zap, ListChecks,
} from 'lucide-react';
import { PALETTE } from '../theme';
import { calcBMI, bmiCategory, calcBMR, calcTDEE, todayKey, load, save } from '../utils';
import { levelOf } from './DailyTasks';
import { Sheep, loadMascot, woolColorOf } from './Mascot';
import { resolvePersonality } from '../data/personalities';
import { callClaude, parseAIJson } from '../api';

export default function Dashboard({ profile, foodLog, goto, personality, streak }) {
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
          <h1 className="font-display text-2xl font-bold flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
            พี่{profile.name} 👋
            {streak > 0 && (
              <span className="font-accent text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
              >
                🔥 {streak} วันติด
              </span>
            )}
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

        {/* BMI / BMR / มื้อ — รวมไว้ในการ์ดเดียว ไม่ต้องแยกการ์ดให้รก */}
        <div className="relative grid grid-cols-3 gap-2 mt-5 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div>
            <div className="font-accent text-tiny" style={{ color: PALETTE.gold }}>BMI</div>
            <div className="font-display text-lg font-bold text-white leading-tight">{bmi || '-'}</div>
            <div className="font-body text-tiny text-white/60">{bmiCat.label}</div>
          </div>
          <div>
            <div className="font-accent text-tiny" style={{ color: PALETTE.gold }}>BMR</div>
            <div className="font-display text-lg font-bold text-white leading-tight">{bmr || '-'}</div>
            <div className="font-body text-tiny text-white/60">kcal/วัน</div>
          </div>
          <div>
            <div className="font-accent text-tiny" style={{ color: PALETTE.gold }}>มื้อวันนี้</div>
            <div className="font-display text-lg font-bold text-white leading-tight">{todayLog.length}</div>
            <div className="font-body text-tiny text-white/60">มื้อ</div>
          </div>
        </div>
      </div>

      {/* daily tasks card */}
      <TasksCard goto={goto} streak={streak} />

      {/* today's food */}
      {todayLog.length > 0 && (
        <div className="anim-slideUp delay-6">
          <div className="font-display font-semibold text-sm mb-3" style={{ color: PALETTE.sageDeep }}>
            มื้อวันนี้
          </div>
          <div className="space-y-2 mb-4">
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
      <HealthNewsCard profile={profile} personality={personality} />

      {/* Weekly summary card */}
      {foodLog.length > 0 && (
        <WeeklySummaryCard foodLog={foodLog} tdee={tdee} profile={profile} personality={personality} />
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

function TasksCard({ goto, streak }) {
  const points = load('gyn_points', 0);
  const claimedToday = (load('gyn_tasks', {})[todayKey()] || []).filter(id => id !== 'bonus');
  const lv = levelOf(points);
  const mascot = loadMascot();
  const mood = claimedToday.length >= 5 ? 'party' : claimedToday.length > 0 ? 'happy' : 'normal';
  return (
    <button onClick={() => goto('tasks')}
      className="smooth-tap w-full rounded-2xl p-3.5 mb-4 flex items-center gap-3 deep-shadow anim-slideUp delay-2 relative overflow-hidden text-left"
      style={{ backgroundColor: PALETTE.gold }}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
        style={{ backgroundColor: 'white' }} />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      >
        <Sheep wool={woolColorOf(mascot)} accessory={mascot.acc} mood={mood} size={50} />
      </div>
      <div className="flex-1 relative min-w-0">
        <div className="font-display font-bold text-sm flex items-center gap-1.5" style={{ color: PALETTE.sageDeep }}>
          <ListChecks size={14} /> ภารกิจวันนี้ {claimedToday.length}/5
        </div>
        <div className="font-body text-xs mt-0.5 flex items-center gap-2 truncate" style={{ color: PALETTE.sageDeep, opacity: 0.85 }}>
          <span>{mascot.name} · Lv.{lv.index + 1} · {points} แต้ม</span>
          {streak > 0 && <span>🔥 {streak} วันติด</span>}
        </div>
      </div>
      <ChevronRight size={18} color={PALETTE.sageDeep} className="relative flex-shrink-0" />
    </button>
  );
}

function WeeklySummaryCard({ foodLog, tdee, profile, personality }) {
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
      const persona = resolvePersonality(personality, profile.age);

      const reply = await callClaude({
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
      });
      setAiInsight(reply);
    } catch (e) {
      setAiInsight('ขอโทษค่ะ ดึงข้อมูลไม่สำเร็จ ลองใหม่อีกครั้งนะคะ');
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
            <><Loader2 size={14} className="anim-spin-slow" /> น้องไกด์กำลังคิด...</>
          ) : aiInsight ? (
            <>{expanded ? 'ซ่อน' : 'ดู'}คำแนะนำจากน้องไกด์ <ChevronRight size={14}
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.25s' }} /></>
          ) : (
            <><Sparkles size={14} color={PALETTE.gold} /> ขอคำแนะนำจากน้องไกด์</>
          )}
        </button>

        {expanded && aiInsight && (
          <div className="mt-3 rounded-2xl p-4 anim-fadeIn"
            style={{ backgroundColor: PALETTE.sageDeep }}
          >
            <div className="font-accent text-tiny mb-2 flex items-center gap-1.5" style={{ color: PALETTE.gold }}>
              <Sparkles size={12} /> น้องไกด์ว่ายังไง
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

function HealthNewsCard({ profile, personality }) {
  const [news, setNews] = useState(() => load('gyn_news', null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setBusy(true);
    setError(null);
    try {
      const persona = resolvePersonality(personality, profile.age);
      const text = await callClaude({
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
      });
      const parsed = parseAIJson(text);
      if (!Array.isArray(parsed.items)) throw new Error('bad format');
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
