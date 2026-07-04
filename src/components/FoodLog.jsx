import React, { useState, useRef } from 'react';
import {
  Camera, Loader2, AlertCircle, AlertTriangle, Check, Pencil, Trash2,
  UtensilsCrossed, Sparkles, Leaf, Wheat, Droplet,
} from 'lucide-react';
import { PALETTE } from '../theme';
import { fileToBase64, compressImage, fileToDataURL, todayKey, timeNow } from '../utils';
import { buildDictHint } from '../data/foodDict';
import { callClaude, parseAIJson } from '../api';

export default function FoodLog({ profile, foodLog, addFood, removeFood, editFood, corrections, addCorrection }) {
  const [busy, setBusy] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [result, setResult] = useState(null);
  const [originalResult, setOriginalResult] = useState(null); // before user edits — for learning
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCal, setEditCal] = useState('');
  const [manualName, setManualName] = useState('');
  const fileRef = useRef(null);

  const today = todayKey();
  const todayLog = foodLog.filter(f => f.day === today);
  const consumed = todayLog.reduce((s, f) => s + (f.calories || 0), 0);

  const analyze = async (file) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      // ส่งรูปเต็มให้ AI วิเคราะห์ แต่เก็บรูปย่อ (กัน localStorage เต็ม)
      const [b64, thumb] = await Promise.all([
        fileToBase64(file),
        compressImage(file).catch(() => fileToDataURL(file).catch(() => null)),
      ]);
      setPreviewImg(thumb);

      const allergyContext = profile.foodAllergy.length
        ? `ผู้ใช้แพ้อาหารต่อไปนี้: ${profile.foodAllergy.join(', ')} ถ้าเจอในรูป ให้ใส่ในช่อง warnings ทันที`
        : '';

      // Build learning context from recent corrections
      const recentCorrections = (corrections || []).slice(-15);
      const learningContext = recentCorrections.length > 0
        ? `\n\n**สิ่งที่ผู้ใช้คนนี้แก้ไขล่าสุด (เรียนรู้จากนี้ — สไตล์อาหาร/ขนาดจาน/รสนิยม):**
${recentCorrections.map((c, i) => `${i+1}. AI ทาย "${c.aiName}" ${c.aiCal} kcal → ผู้ใช้แก้เป็น "${c.realName}" ${c.realCal} kcal`).join('\n')}

ใช้ pattern นี้ปรับการทาย ถ้ารูปนี้คล้ายกับที่ผู้ใช้เคยแก้ ให้ใช้ชื่อ/แคลที่ใกล้เคียงกับที่ผู้ใช้ระบุ
`
        : '';

      const prompt = `คุณคือนักโภชนาการมืออาชีพระดับสูง วิเคราะห์รูปอาหารแบบ "แม่นยำที่สุดเท่าที่เป็นไปได้" — ตรงไปตรงมา ไม่เกรงใจ แต่ยังเป็นมิตร
${allergyContext}${learningContext}

**ฐานข้อมูลอาหารไทย (ใช้เป็นค่าอ้างอิงหลัก ถ้าตรงกับรายการในรูป ให้ใช้ค่านี้):**
${buildDictHint()}

**ขั้นตอนแรก — ตรวจสอบรูปก่อน:**
- ถ้าในรูปไม่มีอาหารชัดเจน (รูปขยะ, รูปคน, รูปสัตว์, รูปวิว, รูปเบลอมาก, รูปมืดดูไม่ออก, รูปสุ่ม)
- หรือเป็นภาพล้อเล่น ภาพการ์ตูน ภาพ meme
- → ตอบ JSON: {"rejected": true, "reason": "บอกสั้นๆ ว่าทำไมไม่วิเคราะห์ เช่น 'รูปนี้ไม่ใช่อาหารนะคะ', 'รูปเบลอมาก ถ่ายใหม่อีกครั้งได้ไหมคะ'"} แล้วหยุด

**ถ้าเป็นอาหารจริง ทำตามขั้นตอน:**
1. ระบุอาหารทุกอย่างที่เห็นในจาน (รวมเครื่องปรุง ผัก น้ำจิ้ม)
2. ประมาณ "ปริมาณจริง" จากรูป — ดูขนาดจาน/ช้อน เป็นตัวอ้างอิง:
   - จานข้าวมาตรฐาน Ø 22-25cm, ชามก๋วยเตี๋ยว 18-22cm, จานเล็ก 18cm
   - ข้าวสวย 1 ทัพพี ≈ 80g ≈ 100 kcal
   - เนื้อสัตว์ขนาดเท่าฝ่ามือ ≈ 100g
3. คำนวณแคลของแต่ละส่วนแยกกัน แล้วบวกรวม (อย่ามั่ว ให้ลองคิดทีละชิ้น)
4. ถ้าเห็นน้ำมัน/ทอด/ผัด ให้บวกแคลน้ำมันเพิ่ม (1 ช้อนโต๊ะ ≈ 120 kcal)
5. ระบุอาหารไทยให้ถูกต้อง (ผัดกะเพรา ≠ ผัดพริกหวาน, ต้มยำน้ำใส ≠ น้ำข้น)
6. ${recentCorrections.length > 0 ? 'ใช้ข้อมูลการแก้ไขข้างบนช่วยตัดสินใจ' : 'ถ้าไม่แน่ใจมาก ตั้งค่า "confidence": "ต่ำ"'}

"ตอบเป็น JSON เท่านั้น" ห้ามมี markdown ห้าม backtick ห้ามข้อความอื่น โครงสร้าง:
{
  "foods": ["ชื่ออาหารแต่ละอย่าง พร้อมปริมาณโดยประมาณ เช่น 'ข้าวสวย 1 ทัพพี', 'ไก่ทอด 2 ชิ้น'"],
  "displayName": "ชื่อสรุปจาน เช่น 'ข้าวมันไก่ + น้ำจิ้ม'",
  "totalCalories": ตัวเลขรวมที่แม่นที่สุด (integer),
  "protein": กรัม (integer),
  "carbs": กรัม (integer),
  "fat": กรัม (integer),
  "sodium": "ต่ำ/ปานกลาง/สูง/สูงมาก",
  "healthScore": 1-10 (10=ดีมาก),
  "confidence": "สูง/ปานกลาง/ต่ำ" (ความมั่นใจในการประมาณ),
  "uncertain": true/false,
  "usedMemory": ${recentCorrections.length > 0 ? 'true ถ้าใช้ข้อมูลการแก้ไขช่วย' : 'false'},
  "verdict": "คำวิจารณ์ตรงๆ 1-2 ประโยค จริงใจไม่เกรงใจ",
  "tips": "คำแนะนำสั้น ทำให้สุขภาพดีขึ้น",
  "warnings": ["คำเตือนถ้ามี เช่น 'เกลือสูง', 'น้ำตาลเยอะ', 'มีกุ้ง (พี่แพ้)'"]
}`;

      const text = await callClaude({
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
            { type: 'text', text: prompt }
          ]
        }]
      }, { timeoutMs: 90000 });
      const parsed = parseAIJson(text);

      // If AI rejected the image (not food, blurry, etc.)
      if (parsed.rejected) {
        setError(parsed.reason || 'รูปนี้ไม่ใช่อาหาร ลองถ่ายใหม่นะคะ');
        setPreviewImg(null);
        return;
      }

      const withImg = { ...parsed, image: thumb };
      setResult(withImg);
      setOriginalResult({
        displayName: parsed.displayName,
        totalCalories: parsed.totalCalories,
      });
    } catch (e) {
      setError('วิเคราะห์ไม่สำเร็จ ลองใหม่อีกครั้งนะคะ');
      setPreviewImg(null);
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) analyze(f);
    e.target.value = '';
  };

  // ประมาณแคลจาก "ชื่ออาหาร" — ใช้ตอนพิมพ์เอง หรือตอนแก้ชื่อแล้วให้คำนวณใหม่
  // existing = ผลเดิม (เก็บรูปไว้ อัปเดตเฉพาะตัวเลข)
  const estimateFromName = async (name, existing = null) => {
    const q = (name || '').trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    if (!existing) { setResult(null); setPreviewImg(null); }
    try {
      const allergyContext = profile.foodAllergy.length
        ? `ผู้ใช้แพ้อาหาร: ${profile.foodAllergy.join(', ')} ถ้าเมนูนี้มักมีส่วนผสมที่แพ้ ให้ใส่ใน warnings`
        : '';
      const text = await callClaude({
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `คุณคือนักโภชนาการมืออาชีพ ผู้ใช้พิมพ์ชื่ออาหารว่า "${q}"
ประเมินจากปริมาณมาตรฐาน 1 จาน/ชาม/แก้ว (ถ้าผู้ใช้ระบุปริมาณมาด้วย ให้ใช้ตามนั้น)
${allergyContext}

**ฐานข้อมูลอาหารไทย (ใช้เป็นค่าอ้างอิงหลัก ถ้าตรงกับเมนู):**
${buildDictHint()}

ตอบเป็น JSON เท่านั้น ห้ามมี markdown ห้าม backtick:
{
  "foods": ["ส่วนประกอบหลักโดยประมาณ"],
  "displayName": "ชื่อเมนูที่สะกดถูกต้อง",
  "totalCalories": ตัวเลข (integer),
  "protein": กรัม (integer),
  "carbs": กรัม (integer),
  "fat": กรัม (integer),
  "sodium": "ต่ำ/ปานกลาง/สูง/สูงมาก",
  "healthScore": 1-10,
  "confidence": "สูง/ปานกลาง/ต่ำ",
  "verdict": "คำวิจารณ์ตรงๆ 1-2 ประโยค",
  "tips": "คำแนะนำสั้น",
  "warnings": ["คำเตือนถ้ามี"]
}`
        }]
      });
      const parsed = parseAIJson(text);
      if (existing) {
        // แก้ชื่อแล้วคำนวณใหม่ — เก็บรูปเดิม, originalResult เดิมไว้เพื่อให้น้องไกด์เรียนรู้
        setResult({ ...existing, ...parsed, displayName: q, image: existing.image });
      } else {
        setResult({ ...parsed, displayName: parsed.displayName || q, image: null });
        setOriginalResult({
          displayName: parsed.displayName || q,
          totalCalories: parsed.totalCalories,
        });
        setManualName('');
      }
    } catch (e) {
      setError('คำนวณไม่สำเร็จ ลองอีกครั้งนะคะ');
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!result) return;

    // If user edited name or calories, record the correction for learning
    if (originalResult && addCorrection) {
      const nameChanged = originalResult.displayName !== result.displayName;
      const calChanged = Math.abs((originalResult.totalCalories || 0) - (result.totalCalories || 0)) > 10;
      if (nameChanged || calChanged) {
        addCorrection({
          id: 'c' + Date.now(),
          ts: Date.now(),
          aiName: originalResult.displayName,
          aiCal: originalResult.totalCalories,
          realName: result.displayName,
          realCal: result.totalCalories,
        });
      }
    }

    addFood({
      id: 'f' + Date.now(),
      day: today,
      time: timeNow(),
      name: result.displayName || result.foods?.[0] || 'อาหาร',
      calories: result.totalCalories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      image: result.image,
      verdict: result.verdict,
      healthScore: result.healthScore,
    });
    setResult(null);
    setOriginalResult(null);
    setPreviewImg(null);
  };

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>FOOD LOG</div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
          ถ่ายปุ๊บ รู้แคลปั๊บ
        </h1>
        <p className="font-body text-sm mb-5" style={{ color: PALETTE.muted }}>
          ถ่ายรูปหรือพิมพ์ชื่อก็ได้ · ชื่อกับแคลแก้เองได้เสมอ
        </p>
      </div>

      {/* Capture card */}
      <div className="px-5 mb-4">
        {!result && !busy && (
          <button onClick={() => fileRef.current?.click()}
            className="smooth-tap w-full rounded-3xl p-8 flex flex-col items-center gap-3 anim-pulseGlow"
            style={{
              backgroundColor: PALETTE.sageDeep,
              backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(201,163,107,0.25), transparent 50%)'
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Camera size={28} color="white" />
            </div>
            <div className="font-display font-semibold text-white text-lg">ถ่ายรูป / เลือกรูปอาหาร</div>
            <div className="font-body text-xs text-white/60">น้องไกด์จะวิเคราะห์แคลและสารอาหารให้ทันที</div>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" capture="environment" />

        {/* พิมพ์ชื่ออาหารเอง — ไม่ต้องถ่ายรูปก็ได้ */}
        {!result && !busy && (
          <div className="rounded-2xl p-3.5 mt-3 organic-shadow" style={{ backgroundColor: PALETTE.paper }}>
            <div className="font-body text-xs mb-2 flex items-center gap-1.5" style={{ color: PALETTE.muted }}>
              <Pencil size={12} color={PALETTE.gold} /> หรือพิมพ์ชื่ออาหารเอง เดี๋ยวน้องไกด์ประมาณแคลให้
            </div>
            <div className="flex gap-2">
              <input value={manualName}
                onChange={e => setManualName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) estimateFromName(manualName); }}
                placeholder="เช่น ข้าวมันไก่, ชาเย็นหวานน้อย"
                className="font-body flex-1 min-w-0 px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: 'none' }}
              />
              <button onClick={() => estimateFromName(manualName)} disabled={!manualName.trim()}
                className="smooth-tap px-4 rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                style={{ backgroundColor: PALETTE.sageDark, color: 'white' }}
              >
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {busy && !result && (
          <div className="rounded-3xl p-6 anim-fadeIn" style={{ backgroundColor: PALETTE.paper }}>
            {previewImg && <img src={previewImg} className="w-full h-40 object-cover rounded-2xl mb-4" alt="" />}
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="anim-spin-slow" size={20} color={PALETTE.sage} />
              <div className="font-body text-sm" style={{ color: PALETTE.sageDark }}>
                {previewImg ? 'น้องไกด์กำลังดูรูปอยู่...' : 'น้องไกด์กำลังคำนวณแคล...'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-full shimmer-bg" />
              <div className="h-3 rounded-full shimmer-bg w-3/4" />
              <div className="h-3 rounded-full shimmer-bg w-1/2" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-4 mt-3 anim-fadeIn flex items-start gap-2"
            style={{ backgroundColor: PALETTE.coralSoft }}
          >
            <AlertCircle size={18} color={PALETTE.coral} />
            <div className="font-body text-sm" style={{ color: PALETTE.coral }}>{error}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-3xl overflow-hidden anim-slideUp deep-shadow"
            style={{ backgroundColor: PALETTE.paper }}
          >
            {result.image && (
              <div className="relative">
                <img src={result.image} className="w-full h-48 object-cover" alt="" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }}
                />
                <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2 pointer-events-none">
                  {result.usedMemory ? (
                    <div className="px-2.5 py-1 rounded-full font-accent text-tiny flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(201,163,107,0.95)', color: 'white' }}
                    >
                      <Sparkles size={10} /> เรียนรู้จากที่พี่แก้
                    </div>
                  ) : <div />}
                  {result.confidence && (
                    <div className="px-2.5 py-1 rounded-full font-accent text-tiny"
                      style={{
                        backgroundColor: result.confidence === 'สูง' ? 'rgba(135,168,120,0.95)'
                          : result.confidence === 'ปานกลาง' ? 'rgba(201,163,107,0.95)'
                          : 'rgba(217,104,74,0.95)',
                        color: 'white',
                      }}
                    >
                      ความมั่นใจ: {result.confidence}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <input
                    value={result.displayName || ''}
                    onChange={e => setResult({ ...result, displayName: e.target.value })}
                    className="font-display text-xl font-bold bg-transparent w-full focus:outline-none border-b border-dashed border-white/40 pb-0.5"
                    style={{ color: 'white' }}
                  />
                  <div className="font-body text-xs opacity-80 mt-1">{result.foods?.join(' · ')}</div>
                </div>
              </div>
            )}

            <div className="p-5">
              {/* ไม่มีรูป (พิมพ์ชื่อเอง) — แก้ชื่อได้ตรงนี้ */}
              {!result.image && (
                <div className="mb-4">
                  <input
                    value={result.displayName || ''}
                    onChange={e => setResult({ ...result, displayName: e.target.value })}
                    className="font-display text-xl font-bold w-full bg-transparent border-b border-dashed pb-1 focus:outline-none"
                    style={{ color: PALETTE.sageDeep, borderColor: PALETTE.mist }}
                  />
                  <div className="font-body text-xs mt-1" style={{ color: PALETTE.muted }}>
                    {result.foods?.join(' · ')}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={result.totalCalories || ''}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '');
                        setResult({ ...result, totalCalories: v ? parseInt(v) : 0 });
                      }}
                      className="font-display text-4xl font-bold bg-transparent border-b border-dashed w-24 focus:outline-none"
                      style={{ color: PALETTE.sageDeep, borderColor: PALETTE.mist }}
                    />
                    <Pencil size={12} color={PALETTE.muted} />
                  </div>
                  <div className="font-body text-xs" style={{ color: PALETTE.muted }}>kcal · แก้ไขได้</div>
                </div>
                <HealthScoreBadge score={result.healthScore} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Macro icon={<Leaf size={14} />} label="โปรตีน" value={result.protein} tone={PALETTE.sage} />
                <Macro icon={<Wheat size={14} />} label="คาร์บ" value={result.carbs} tone={PALETTE.gold} />
                <Macro icon={<Droplet size={14} />} label="ไขมัน" value={result.fat} tone={PALETTE.coral} />
              </div>

              {/* แก้ชื่อแล้ว → ให้น้องไกด์คำนวณแคลใหม่จากชื่อ */}
              {originalResult && result.displayName?.trim() &&
                result.displayName.trim() !== originalResult.displayName && (
                <button onClick={() => estimateFromName(result.displayName, result)} disabled={busy}
                  className="smooth-tap w-full py-2.5 px-3 rounded-xl mb-4 font-display text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: PALETTE.gold + '22', color: PALETTE.sageDark, border: `1.5px dashed ${PALETTE.gold}` }}
                >
                  {busy ? (
                    <><Loader2 size={13} className="anim-spin-slow" /> กำลังคำนวณใหม่...</>
                  ) : (
                    <><Sparkles size={13} color={PALETTE.gold} /> คำนวณแคลใหม่จากชื่อ "{result.displayName.trim()}"</>
                  )}
                </button>
              )}

              {result.verdict && (
                <div className="rounded-2xl p-3 mb-3"
                  style={{ backgroundColor: PALETTE.shell }}
                >
                  <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>
                    น้องไกด์ว่า
                  </div>
                  <div className="font-body text-sm leading-relaxed" style={{ color: PALETTE.forest }}>
                    "{result.verdict}"
                  </div>
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="space-y-2 mb-3">
                  {result.warnings.map((w, i) => (
                    <div key={i}
                      className="rounded-xl p-2.5 flex items-start gap-2"
                      style={{ backgroundColor: PALETTE.coralSoft }}
                    >
                      <AlertTriangle size={16} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                      <div className="font-body text-xs" style={{ color: PALETTE.coral }}>{w}</div>
                    </div>
                  ))}
                </div>
              )}

              {result.tips && (
                <p className="font-body text-xs mb-4 leading-relaxed" style={{ color: PALETTE.muted }}>
                  💡 {result.tips}
                </p>
              )}

              <div className="flex gap-2">
                <button onClick={() => { setResult(null); setPreviewImg(null); }}
                  className="smooth-tap flex-1 py-3 rounded-2xl font-display font-medium text-sm"
                  style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
                >
                  ยกเลิก
                </button>
                <button onClick={save}
                  className="smooth-tap flex-2 py-3 rounded-2xl font-display font-medium text-sm text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: PALETTE.sageDark }}
                >
                  <Check size={16} /> บันทึกมื้อนี้
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today summary */}
      {!result && !busy && (
        <div className="px-5 mt-2">
          <div className="rounded-2xl p-4 mb-4 organic-shadow flex items-center justify-between"
            style={{ backgroundColor: PALETTE.paper }}
          >
            <div>
              <div className="font-body text-xs" style={{ color: PALETTE.muted }}>วันนี้กินไป</div>
              <div className="font-display text-2xl font-bold" style={{ color: PALETTE.sageDeep }}>
                {consumed} <span className="text-sm font-normal" style={{ color: PALETTE.muted }}>kcal</span>
              </div>
            </div>
            <div className="font-body text-xs px-3 py-1.5 rounded-full"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
            >
              {todayLog.length} มื้อ
            </div>
          </div>

          {foodLog.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: PALETTE.paper }}>
              <UtensilsCrossed size={32} className="mx-auto mb-2" color={PALETTE.mist} />
              <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
                ยังไม่มีประวัติ ลองถ่ายมื้อแรกกันเลย
              </div>
            </div>
          ) : (
            <>
              <div className="font-display font-semibold text-sm mb-2" style={{ color: PALETTE.sageDeep }}>
                ประวัติการกิน
              </div>
              <div className="space-y-2">
                {foodLog.slice().reverse().map((f) => (
                  <div key={f.id}
                    className="rounded-2xl overflow-hidden organic-shadow anim-fadeIn"
                    style={{ backgroundColor: PALETTE.paper }}
                  >
                    {editingId === f.id ? (
                      <div className="p-3 anim-fadeIn">
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          placeholder="ชื่ออาหาร"
                          className="font-body w-full px-3 py-2 rounded-xl text-sm mb-2"
                          style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                          autoFocus
                        />
                        <input value={editCal} onChange={e => setEditCal(e.target.value.replace(/\D/g, ''))}
                          placeholder="แคลอรี่"
                          inputMode="numeric"
                          className="font-body w-full px-3 py-2 rounded-xl text-sm mb-2"
                          style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)}
                            className="smooth-tap flex-1 py-2 rounded-xl font-display text-xs"
                            style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
                          >ยกเลิก</button>
                          <button onClick={() => {
                              const newName = editName.trim() || f.name;
                              const newCal = +editCal || f.calories;
                              // Record correction if name or cal actually changed
                              if (addCorrection && (newName !== f.name || Math.abs(newCal - (f.calories || 0)) > 10)) {
                                addCorrection({
                                  id: 'c' + Date.now(),
                                  ts: Date.now(),
                                  aiName: f.name,
                                  aiCal: f.calories,
                                  realName: newName,
                                  realCal: newCal,
                                });
                              }
                              editFood(f.id, { name: newName, calories: newCal });
                              setEditingId(null);
                            }}
                            className="smooth-tap flex-[2] py-2 rounded-xl font-display font-semibold text-xs text-white"
                            style={{ backgroundColor: PALETTE.sageDark }}
                          >บันทึก</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3">
                        {f.image ? (
                          <img src={f.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: PALETTE.shell }}>
                            <UtensilsCrossed size={20} color={PALETTE.sage} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-body font-medium text-sm truncate" style={{ color: PALETTE.forest }}>
                            {f.name}
                          </div>
                          <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                            {f.day} · {f.time}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-display text-sm font-semibold" style={{ color: PALETTE.sageDark }}>
                              {f.calories} kcal
                            </span>
                            {f.healthScore && (
                              <span className="font-accent text-tiny px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: PALETTE.shell, color: PALETTE.gold }}
                              >
                                สุขภาพ {f.healthScore}/10
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => {
                            setEditingId(f.id);
                            setEditName(f.name);
                            setEditCal(String(f.calories || ''));
                          }}
                          className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ color: PALETTE.sageDark }}
                          title="แก้ไข"
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => removeFood(f.id)}
                          className="smooth-tap w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ color: PALETTE.muted }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function HealthScoreBadge({ score }) {
  let tone = PALETTE.coral;
  let label = 'ไม่ค่อยดี';
  if (score >= 8) { tone = PALETTE.sage; label = 'ดีมาก'; }
  else if (score >= 6) { tone = PALETTE.sageDark; label = 'พอใช้'; }
  else if (score >= 4) { tone = PALETTE.gold; label = 'ระวัง'; }
  return (
    <div className="text-right">
      <div className="font-display text-2xl font-bold" style={{ color: tone }}>
        {score}<span className="text-sm" style={{ color: PALETTE.muted }}>/10</span>
      </div>
      <div className="font-body text-xs" style={{ color: tone }}>{label}</div>
    </div>
  );
}

function Macro({ icon, label, value, tone }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: PALETTE.shell }}>
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: tone }}>
        {icon}<span className="font-accent text-tiny">{label}</span>
      </div>
      <div className="font-display text-base font-bold" style={{ color: PALETTE.forest }}>
        {value}<span className="text-tiny font-normal" style={{ color: PALETTE.muted }}>g</span>
      </div>
    </div>
  );
}
