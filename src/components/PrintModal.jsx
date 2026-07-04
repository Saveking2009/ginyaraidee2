import React, { useState } from 'react';
import {
  User, UtensilsCrossed, Pill, GlassWater, Dumbbell, Moon, Stethoscope,
  Check, Printer, Loader2,
} from 'lucide-react';
import { PALETTE } from '../theme';
import { calcBMI, bmiCategory, calcBMR, calcTDEE, lastNDaysKeys } from '../utils';

export default function PrintModal({ open, onClose, profile, foodLog, medicines, water, exercises, sleep, vitals }) {
  const [sections, setSections] = useState({
    summary: true, food: true, medicine: true, water: false, exercise: false, sleep: false, vitals: false,
  });
  const [period, setPeriod] = useState('7'); // 7 / 30 / all days
  const [printing, setPrinting] = useState(false);

  if (!open) return null;

  const toggleSection = (k) => setSections(s => ({ ...s, [k]: !s[k] }));

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      generatePrintReport({ profile, foodLog, medicines, water, exercises, sleep, vitals, sections, period });
      setPrinting(false);
    }, 100);
  };

  const SECTIONS = [
    { id: 'summary', icon: User, label: 'ข้อมูลส่วนตัวและ BMI', desc: 'ชื่อ อายุ ส่วนสูง น้ำหนัก แพ้อาหาร แพ้ยา' },
    { id: 'food', icon: UtensilsCrossed, label: 'ประวัติการกิน', desc: 'รายการอาหารและแคลอรี่' },
    { id: 'medicine', icon: Pill, label: 'รายการยา', desc: 'ยาในตู้ทั้งหมด' },
    { id: 'water', icon: GlassWater, label: 'การดื่มน้ำ', desc: 'ปริมาณน้ำต่อวัน' },
    { id: 'exercise', icon: Dumbbell, label: 'การออกกำลังกาย', desc: 'ประเภทและแคลที่เผาผลาญ' },
    { id: 'sleep', icon: Moon, label: 'การนอน', desc: 'ชั่วโมงและคุณภาพ' },
    { id: 'vitals', icon: Stethoscope, label: 'ความดัน / น้ำตาล', desc: 'สัญญาณชีพ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end anim-fadeIn"
      style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full rounded-t-3xl deep-shadow anim-slideUp"
        style={{ backgroundColor: PALETTE.cream, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full mx-auto my-3 flex-shrink-0" style={{ backgroundColor: PALETTE.mist }} />

        <div className="px-6 pb-2 flex-shrink-0">
          <h3 className="font-display text-xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
            พิมพ์รายงานสุขภาพ
          </h3>
          <p className="font-body text-sm mb-4" style={{ color: PALETTE.muted }}>
            เลือกข้อมูลที่ต้องการพิมพ์ — ใช้ส่งให้แพทย์หรือเก็บไว้ดูเองได้
          </p>

          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>ช่วงเวลา</div>
          <div className="flex gap-2 mb-4">
            {[
              { v: '7', l: '7 วัน' },
              { v: '30', l: '30 วัน' },
              { v: 'all', l: 'ทั้งหมด' },
            ].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)}
                className="smooth-tap flex-1 py-2 rounded-xl font-display font-medium text-sm"
                style={{
                  backgroundColor: period === p.v ? PALETTE.sageDeep : PALETTE.paper,
                  color: period === p.v ? 'white' : PALETTE.forest,
                  border: `1px solid ${period === p.v ? PALETTE.sageDeep : PALETTE.mist}`,
                }}
              >{p.l}</button>
            ))}
          </div>

          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.gold }}>ข้อมูลที่จะใส่</div>
        </div>

        <div className="px-6 pb-3 overflow-y-auto flex-1 no-scrollbar">
          <div className="space-y-2 mb-4">
            {SECTIONS.map(s => {
              const I = s.icon;
              const active = sections[s.id];
              return (
                <button key={s.id} onClick={() => toggleSection(s.id)}
                  className="smooth-tap w-full rounded-xl p-3 flex items-center gap-3 text-left"
                  style={{
                    backgroundColor: active ? PALETTE.paper : 'transparent',
                    border: `1.5px solid ${active ? PALETTE.sage : PALETTE.mist}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: active ? PALETTE.sage + '22' : PALETTE.shell, color: active ? PALETTE.sageDark : PALETTE.muted }}
                  >
                    <I size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-medium text-sm" style={{ color: active ? PALETTE.forest : PALETTE.muted }}>
                      {s.label}
                    </div>
                    <div className="font-body text-tiny" style={{ color: PALETTE.muted }}>
                      {s.desc}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: active ? PALETTE.sage : 'transparent',
                      border: `1.5px solid ${active ? PALETTE.sage : PALETTE.mist}`,
                    }}
                  >
                    {active && <Check size={14} color="white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pt-3 pb-6 flex-shrink-0" style={{ borderTop: `1px solid ${PALETTE.mist}` }}>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="smooth-tap flex-1 py-3.5 rounded-2xl font-display font-medium"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            >ยกเลิก</button>
            <button onClick={handlePrint} disabled={printing}
              className="smooth-tap flex-2 py-3.5 rounded-2xl font-display font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: PALETTE.sageDark }}
            >
              {printing ? <Loader2 size={16} className="anim-spin-slow" /> : <Printer size={16} />}
              พิมพ์ / บันทึก PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePrintReport({ profile, foodLog, medicines, water, exercises, sleep, vitals, sections, period }) {
  // Filter by period
  const days = period === 'all' ? null : lastNDaysKeys(period === '7' ? 7 : 30);
  const inRange = (d) => !days || days.includes(d);

  const fFood = foodLog.filter(f => inRange(f.day));
  const fWater = water.filter(w => inRange(w.day));
  const fEx = exercises.filter(e => inRange(e.day));
  const fSleep = sleep.filter(s => inRange(s.day));
  const fVitals = vitals.filter(v => inRange(v.day));

  const bmi = calcBMI(profile.weight, profile.height);
  const bmr = calcBMR(profile);
  const tdee = calcTDEE(bmr);
  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build HTML
  const css = `
    @page { margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Sarabun', 'Prompt', -apple-system, sans-serif; color: #27361F; line-height: 1.6; margin: 0; padding: 0; font-size: 11pt; }
    .header { border-bottom: 3px solid #4F6D45; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-name { font-size: 18pt; font-weight: 700; color: #4F6D45; letter-spacing: -0.02em; }
    .brand-sub { font-size: 9pt; color: #8A8676; }
    .doc-date { font-size: 9pt; color: #8A8676; text-align: right; }
    h2 { font-size: 14pt; color: #2E4429; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #E8DFC9; display: flex; align-items: center; gap: 8px; }
    h2 .ico { width: 24px; height: 24px; background: #E8DFC9; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 12pt; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 24px; margin-bottom: 8px; }
    .field { padding: 8px 0; border-bottom: 1px dotted #E8DFC9; }
    .field-label { font-size: 9pt; color: #8A8676; text-transform: uppercase; letter-spacing: 0.05em; }
    .field-value { font-size: 12pt; font-weight: 600; color: #27361F; margin-top: 2px; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9pt; font-weight: 500; margin-right: 4px; margin-top: 4px; background: #F2C9B8; color: #D9684A; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 8px; }
    th { text-align: left; padding: 8px; background: #F0E7D2; color: #4F6D45; font-weight: 600; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.03em; }
    td { padding: 8px; border-bottom: 1px solid #E8DFC9; }
    tr:last-child td { border-bottom: none; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .stats-row { display: flex; gap: 16px; margin-top: 8px; }
    .stat-card { flex: 1; padding: 10px 12px; background: #F0E7D2; border-radius: 8px; }
    .stat-label { font-size: 8pt; color: #8A8676; text-transform: uppercase; }
    .stat-value { font-size: 14pt; font-weight: 700; color: #4F6D45; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E8DFC9; font-size: 8pt; color: #8A8676; text-align: center; }
    .disclaimer { background: #F2C9B8; color: #B8453A; padding: 10px 14px; border-radius: 8px; font-size: 9pt; margin: 16px 0; }
    .empty { color: #8A8676; font-style: italic; font-size: 10pt; padding: 8px 0; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  `;

  // Group foods by day for the table
  const foodByDay = {};
  fFood.forEach(f => { (foodByDay[f.day] = foodByDay[f.day] || []).push(f); });
  const sortedDays = Object.keys(foodByDay).sort().reverse();

  const avgDailyCal = sortedDays.length ? Math.round(sortedDays.reduce((s, d) => s + foodByDay[d].reduce((a, b) => a + (b.calories || 0), 0), 0) / sortedDays.length) : 0;

  // Section builders
  const summarySection = sections.summary ? `
    <h2><span class="ico">👤</span> ข้อมูลส่วนตัว</h2>
    <div class="grid">
      <div class="field"><div class="field-label">ชื่อ</div><div class="field-value">${profile.name}</div></div>
      <div class="field"><div class="field-label">เพศ · อายุ</div><div class="field-value">${profile.gender === 'female' ? 'หญิง' : 'ชาย'} · ${profile.age} ปี</div></div>
      <div class="field"><div class="field-label">ส่วนสูง</div><div class="field-value">${profile.height} ซม.</div></div>
      <div class="field"><div class="field-label">น้ำหนัก</div><div class="field-value">${profile.weight} กก.</div></div>
      <div class="field"><div class="field-label">BMI</div><div class="field-value">${bmi || '-'} <span style="font-size:9pt;color:#8A8676">(${bmiCategory(bmi).label})</span></div></div>
      <div class="field"><div class="field-label">BMR / TDEE</div><div class="field-value">${bmr || '-'} / ${tdee || '-'} kcal</div></div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">แพ้อาหาร</div>
      <div style="margin-top:4px">${profile.foodAllergy.length ? profile.foodAllergy.map(a => `<span class="pill">${a}</span>`).join('') : '<span class="empty">ไม่มี</span>'}</div>
    </div>
    <div style="margin-top:12px">
      <div class="field-label">แพ้ยา</div>
      <div style="margin-top:4px">${profile.drugAllergy.length ? profile.drugAllergy.map(a => `<span class="pill">${a}</span>`).join('') : '<span class="empty">ไม่มี</span>'}</div>
    </div>
  ` : '';

  const foodSection = sections.food ? `
    <h2><span class="ico">🍽</span> ประวัติการกิน</h2>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-label">จำนวนมื้อ</div><div class="stat-value">${fFood.length}</div></div>
      <div class="stat-card"><div class="stat-label">เฉลี่ย kcal/วัน</div><div class="stat-value">${avgDailyCal}</div></div>
      <div class="stat-card"><div class="stat-label">วันที่บันทึก</div><div class="stat-value">${sortedDays.length} วัน</div></div>
    </div>
    ${fFood.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>เวลา</th><th>รายการ</th><th class="num">แคล (kcal)</th></tr></thead>
      <tbody>
        ${sortedDays.flatMap(d => foodByDay[d].map(f => `
          <tr><td>${d}</td><td>${f.time}</td><td>${f.name || '-'}</td><td class="num">${f.calories || 0}</td></tr>
        `)).join('')}
      </tbody>
    </table>`}
  ` : '';

  const medicineSection = sections.medicine ? `
    <h2><span class="ico">💊</span> รายการยาในตู้ยา</h2>
    ${medicines.length === 0 ? '<div class="empty">ยังไม่มียาในตู้</div>' : medicines.map(m => `
      <div style="padding: 10px 0; border-bottom: 1px solid #E8DFC9;">
        <div style="font-weight: 600; font-size: 11pt; color: #27361F;">${m.name} ${m.dosage ? `<span style="font-weight:400;color:#8A8676">· ${m.dosage}</span>` : ''}</div>
        <div style="font-size: 9pt; color: #4F6D45; margin-top: 2px;">${m.category || ''}</div>
        ${m.usage ? `<div style="font-size: 10pt; margin-top: 4px;">${m.usage}</div>` : ''}
        ${m.dosageTip ? `<div style="font-size: 9pt; color: #8A8676; margin-top: 2px;"><b>วิธีใช้:</b> ${m.dosageTip}</div>` : ''}
        ${m.warnings?.length ? `<div style="font-size: 9pt; color: #B8453A; margin-top: 4px;"><b>ข้อควรระวัง:</b> ${m.warnings.join(' · ')}</div>` : ''}
      </div>
    `).join('')}
  ` : '';

  const waterSection = sections.water ? `
    <h2><span class="ico">💧</span> การดื่มน้ำ</h2>
    ${(() => {
      const byDay = {};
      fWater.forEach(w => { byDay[w.day] = (byDay[w.day] || 0) + (w.ml || 0); });
      const dList = Object.keys(byDay).sort().reverse();
      if (dList.length === 0) return '<div class="empty">ไม่มีบันทึก</div>';
      return `<table>
        <thead><tr><th>วันที่</th><th class="num">ปริมาณ (ml)</th></tr></thead>
        <tbody>${dList.map(d => `<tr><td>${d}</td><td class="num">${byDay[d]}</td></tr>`).join('')}</tbody>
      </table>`;
    })()}
  ` : '';

  const exerciseSection = sections.exercise ? `
    <h2><span class="ico">💪</span> การออกกำลังกาย</h2>
    ${fEx.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>ประเภท</th><th class="num">นาที</th><th class="num">เผาผลาญ (kcal)</th></tr></thead>
      <tbody>${fEx.slice().reverse().map(e => `
        <tr><td>${e.day}</td><td>${e.label}</td><td class="num">${e.minutes}</td><td class="num">${e.calories}</td></tr>
      `).join('')}</tbody>
    </table>`}
  ` : '';

  const sleepSection = sections.sleep ? `
    <h2><span class="ico">🌙</span> การนอน</h2>
    ${fSleep.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>เข้านอน → ตื่น</th><th class="num">ชั่วโมง</th><th>คุณภาพ</th></tr></thead>
      <tbody>${fSleep.slice().reverse().map(s => `
        <tr><td>${s.day}</td><td>${s.bedtime} → ${s.waketime}</td><td class="num">${s.hours}</td><td>${'★'.repeat(s.quality || 0)}</td></tr>
      `).join('')}</tbody>
    </table>`}
  ` : '';

  const vitalsSection = sections.vitals ? `
    <h2><span class="ico">🩺</span> สัญญาณชีพ</h2>
    ${fVitals.length === 0 ? '<div class="empty">ไม่มีบันทึก</div>' : `
    <table>
      <thead><tr><th>วันที่</th><th>เวลา</th><th>ประเภท</th><th class="num">ค่า</th></tr></thead>
      <tbody>${fVitals.slice().reverse().map(v => `
        <tr><td>${v.day}</td><td>${v.time}</td><td>${v.kind === 'bp' ? 'ความดัน' : 'น้ำตาล'}</td><td class="num">${v.kind === 'bp' ? `${v.sbp}/${v.dbp} mmHg${v.pulse ? ` · ${v.pulse} bpm` : ''}` : `${v.sugar} mg/dL`}</td></tr>
      `).join('')}</tbody>
    </table>`}
  ` : '';

  const periodLabel = period === '7' ? '7 วันล่าสุด' : period === '30' ? '30 วันล่าสุด' : 'ข้อมูลทั้งหมด';

  const html = `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"><title>รายงานสุขภาพ — ${profile.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&family=Prompt:wght@500;600;700&display=swap" rel="stylesheet">
<style>${css}</style></head>
<body>
  <div class="header">
    <div class="brand">
      <div style="width:40px;height:40px;background:#4F6D45;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18pt;">G</div>
      <div>
        <div class="brand-name">GINYARAIDEE</div>
        <div class="brand-sub">รายงานสุขภาพส่วนบุคคล</div>
      </div>
    </div>
    <div class="doc-date">
      <div>วันที่พิมพ์: ${today}</div>
      <div>ช่วงข้อมูล: ${periodLabel}</div>
    </div>
  </div>

  ${summarySection}
  ${foodSection}
  ${medicineSection}
  ${waterSection}
  ${exerciseSection}
  ${sleepSection}
  ${vitalsSection}

  <div class="disclaimer">
    <b>หมายเหตุ:</b> ข้อมูลในรายงานนี้บันทึกโดยผู้ใช้ผ่านแอป GINYARAIDEE เป็นข้อมูลเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
    หากมีข้อสงสัยหรืออาการผิดปกติ โปรดปรึกษาแพทย์หรือเภสัชกร
  </div>

  <div class="footer">
    Generated by GINYARAIDEE · ${today}<br>
    ข้อมูลนี้เป็นความลับและจัดทำสำหรับ ${profile.name} เท่านั้น
  </div>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    alert('Browser ปิดป็อปอัพไว้ — กรุณาเปิดให้ป็อปอัพแสดงเพื่อพิมพ์รายงาน');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}
