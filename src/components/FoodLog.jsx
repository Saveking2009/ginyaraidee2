import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Loader2, AlertCircle, AlertTriangle, Check, Pencil, Trash2,
  UtensilsCrossed, Sparkles, Leaf, Wheat, Droplet, X, Plus,
} from 'lucide-react';
import { PALETTE, alpha } from '../theme';
import { fileToBase64, compressImage, fileToDataURL, todayKey, timeNow, load, save } from '../utils';
import { buildDictHint } from '../data/foodDict';
import { callClaude, parseAIJson, fetchCommunityFood } from '../api';

export default function FoodLog({ profile, foodLog, addFood, removeFood, editFood, corrections, addCorrection, halal }) {
  const [busy, setBusy] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [result, setResult] = useState(null);
  const [originalResult, setOriginalResult] = useState(null); // before user edits — for learning
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCal, setEditCal] = useState('');
  const [manualName, setManualName] = useState('');
  const [community, setCommunity] = useState(() => load('gyn_community', null));
  const fileRef = useRef(null);

  const today = todayKey();
  const todayLog = foodLog.filter(f => f.day === today);
  const consumed = todayLog.reduce((s, f) => s + (f.calories || 0), 0);

  // ดึงคลังความจำรวมจากผู้ใช้ทุกคน (refresh ทุก 12 ชม.)
  useEffect(() => {
    if (!community || Date.now() - (community.fetchedAt || 0) > 12 * 60 * 60 * 1000) {
      fetchCommunityFood().then(items => {
        if (items.length > 0) {
          const next = { items, fetchedAt: Date.now() };
          setCommunity(next);
          save('gyn_community', next);
        }
      });
    }
  }, []);

  // คำสั่งเพิ่มสำหรับโหมดฮาลาล — ใส่ใน prompt ทั้งถ่ายรูปและพิมพ์ชื่อ
  const halalHint = () => halal ? `

**โหมดฮาลาล (ผู้ใช้เป็นมุสลิม) — ต้องประเมินสถานะฮาลาลด้วย:**
ตรวจหาส่วนผสมที่ไม่ฮาลาล (หะรอม): หมู/สุกรทุกส่วน (รวมน้ำมันหมู มันหมู หนังหมู เจลาตินหมู), เลือด, แอลกอฮอล์/เหล้า/เบียร์/ไวน์/มิริน/สาเก/เหล้าจีน, เนื้อสัตว์ที่ไม่ได้เชือดตามหลักอิสลาม, สัตว์ต้องห้าม (สุนัข แมว สัตว์เลื้อยคลาน สัตว์กินเนื้อ สัตว์สองสภาพ), สารสกัดที่มีแอลกอฮอล์
เกณฑ์ตัดสิน:
- มีส่วนผสมหะรอมชัดเจน → "haram"
- น่าสงสัย/ไม่รู้แหล่งที่มา (เช่น ไก่/เนื้อทั่วไปที่ไม่รู้ว่าเชือดฮาลาลไหม, เจลาติน/ครีมเทียม/มาการีนที่ไม่ระบุ, ซอสที่อาจมีเหล้า, อาหารร้านทั่วไปที่อาจปนเปื้อน) → "mushbooh"
- เป็นผัก ผลไม้ อาหารทะเล ไข่ นม หรือระบุฮาลาลชัดเจน → "halal"
เพิ่มลงใน JSON:
  "halalStatus": "halal" หรือ "haram" หรือ "mushbooh",
  "halalReason": "อธิบายสั้นๆ เป็นภาษาไทย 1 ประโยค",
  "halalConcerns": ["ส่วนผสม/ประเด็นที่ต้องระวัง ถ้ามี"]` : '';

  // สร้างข้อความอ้างอิงจากคลังกลางสำหรับใส่ใน prompt
  const communityHint = () => {
    const items = (community?.items || []).slice(0, 40);
    if (items.length === 0) return '';
    return `\n\n**ค่าจริงที่ยืนยันโดยผู้ใช้ทุกคนของแอป (น้ำหนักความน่าเชื่อถือตามจำนวนครั้ง — ถ้าเมนูตรงกัน ให้ค่านี้สำคัญกว่าฐานข้อมูลทั่วไป):**
${items.map(it => `- ${it.name}: เฉลี่ย ${it.avgCal} kcal (ยืนยัน ${it.count} ครั้ง)`).join('\n')}`;
  };

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

      const prompt = `คุณคือนักโภชนาการคลินิกอาวุโสที่เชี่ยวชาญอาหารไทยและการประเมินพลังงานจากภาพถ่ายโดยเฉพาะ ภารกิจ: ประเมินแคลอรี่จากรูปนี้ให้ "แม่นที่สุดเท่าที่มนุษย์ผู้เชี่ยวชาญทำได้" — ตรงไปตรงมา ไม่เกรงใจ แต่ยังเป็นมิตร
${allergyContext}${learningContext}${communityHint()}${halalHint()}

**ฐานข้อมูลอาหารไทย (ค่าอ้างอิง — ถ้าเมนูในรูปตรง ให้ยึดเป็นฐานแล้วปรับตามปริมาณจริงในรูป):**
${buildDictHint()}

**ลำดับความน่าเชื่อถือของข้อมูลอ้างอิง:** 1) สิ่งที่ผู้ใช้คนนี้เคยแก้ (สำคัญสุด — คือจานจริงร้านจริงของเขา) → 2) ค่าเฉลี่ยที่ผู้ใช้ทุกคนยืนยัน → 3) ฐานข้อมูลทั่วไป

**ขั้นที่ 0 — ตรวจสอบรูปก่อน:**
- ถ้าในรูปไม่มีอาหารชัดเจน (รูปขยะ, รูปคน, รูปสัตว์, รูปวิว, รูปเบลอมาก, รูปมืดดูไม่ออก, รูปสุ่ม) หรือเป็นภาพการ์ตูน/meme
- → ตอบ JSON เดียว: {"rejected": true, "reason": "บอกสั้นๆ เช่น 'รูปนี้ไม่ใช่อาหารนะคะ', 'รูปเบลอมาก ถ่ายใหม่อีกครั้งได้ไหมคะ'"} แล้วหยุด

**ขั้นที่ 1 — สแกนหาตัวเทียบขนาด (calibration) ก่อนเสมอ:**
ช้อนโต๊ะ 15ml (ยาว ~19cm) · ช้อนกลาง ~13cm · ส้อม ~18cm · ตะเกียบ ~23cm · จานข้าว Ø23-25cm · จานเล็ก Ø18cm · ชามก๋วยเตี๋ยว Ø18-20cm ลึก 7-8cm · กล่องโฟม/กล่องข้าว 15×20cm · ถุงแกง ~300-400ml · แก้วพลาสติกร้านชา 16oz(470ml)/22oz(650ml) · กระป๋อง 325ml · มือถือ ~15cm · มือผู้ใหญ่กว้าง ~9cm
→ ระบุว่าใช้อะไรเทียบ ถ้าไม่มีตัวเทียบเลย ให้สมมติจานมาตรฐาน Ø23cm และลด confidence ลง

**ขั้นที่ 2 — ประเมินปริมาณด้วยเรขาคณิต:**
- ข้าวในจาน: ดูสัดส่วนพื้นที่จานที่ข้าวกิน + ความสูงกอง — เต็มจานแบน ~250g(300kcal), ครึ่งจาน ~150g(190kcal), 1 ทัพพีพูน ~80-100g(100-125kcal), ข้าวราดแกงร้านทั่วไปให้ ~200-250g
- ข้าวเหนียว 1 กำ/กระติ๊บเล็ก ~90-120g (210-280kcal)
- เส้น: ชามปกติเส้นสุก ~150-200g — เส้นเล็ก/ใหญ่/หมี่ขาว ~170-220kcal, บะหมี่ ~200-250, วุ้นเส้น ~120-160, เส้นหมี่กึ่งสำเร็จ 1 ก้อน ~180-220
- เนื้อสัตว์: เทียบฝ่ามือ (~100g) หรือนับชิ้น — หมูปิ้ง 1 ไม้ ~90-130kcal, ไก่ย่าง 1 น่อง ~150, ไก่ทอด 1 ชิ้นใหญ่ ~250-350, ลูกชิ้น 1 ลูก ~25-35, หมูกรอบ 1 ชิ้น ~60-80, กุ้ง 1 ตัวกลาง ~15-20, ไส้กรอก 1 ชิ้น ~130-180
- ไข่: ดาว 110 · ต้ม/ตุ๋น 75 · เจียว 180-250 · ไข่ข้น 150-200 · ไข่เค็มครึ่งลูก ~60

**ขั้นที่ 3 — ค่าพลังงานต่อ 100g ตามวิธีปรุง (เนื้อสุก):**
อกไก่ไม่หนัง 165 · ไก่มีหนัง 230 · น่อง/สะโพกไก่ 210 · หมูสันนอก 240 · หมูสับผัด 300 · หมูสามชั้น 520 · หมูกรอบ 550 · เนื้อวัว 250 · ตับ 170 · ปลานึ่ง/ต้ม 120-150 · ปลาทอด 200-250 · ปลาดุกย่าง 180 · กุ้ง 100 · ปลาหมึก 90 · เต้าหู้ขาว 80 · เต้าหู้ทอด 270 · ผักลวก/สด 20-40 · ผักผัดน้ำมัน 70-100

**ขั้นที่ 4 — แคลแฝงที่คนมักลืม (เช็คทุกข้อ):**
□ น้ำมันผัด: จานผัดทั่วไป +1-1.5 ชต (120-180kcal) — เห็นเงามันวาวบนผัก/เนื้อ = ใส่เต็ม
□ ของทอด: ซึมน้ำมัน +1.5-2 ชต — แป้งชุบทอดซึมมากกว่าทอดเปล่า ~เท่าตัว
□ กะทิ: แกงกะทิ 1 ถ้วย +150-250 · ขนมหวานกะทิ +100-200
□ น้ำจิ้ม/น้ำราด: น้ำจิ้มไก่/บ๊วย 1 ชต +40-60 · น้ำจิ้มซีฟู้ด +10 · น้ำราดข้าวมันไก่ +30 · น้ำปลาหวาน +50
□ น้ำซุป: ใส ~20-50 ต่อชาม · ต้มยำน้ำข้น +100-150 · น้ำตก/เย็นตาโฟ +50-80
□ เครื่องดื่ม: สังเกตสี ชั้นครีม ฟองนม วิปครีม — ชานม/กาแฟเย็นหวานปกติ 200-280 · หวานน้อยลด 30-40% · ไข่มุก +100-150 · วิปครีม +80-120 · น้ำเปล่า/ชาดำไม่หวาน 0-5
□ ข้าวผัด/ข้าวคลุก: ข้าวอมน้ำมัน — บวกเพิ่มจากข้าวเปล่า ~30-40%

**ขั้นที่ 5 — แยกเมนูไทยที่หน้าตาคล้ายกันให้ถูก:**
ผัดกะเพรา(ใบกะเพรา+พริกกระเทียม) ≠ ผัดพริกแกง(เผ็ดแดง มัน) ≠ คั่วกลิ้ง(แห้ง เครื่องแน่น) · ต้มยำน้ำใส(200) ≠ น้ำข้น(350+) · ส้มตำไทย(200) ≠ ปูปลาร้า(220) ≠ ตำถั่ว/ตำแตง · ข้าวมันไก่ต้ม(650) ≠ ไก่ทอด(750) · ก๋วยเตี๋ยวน้ำ ≠ แห้ง(+น้ำมันกระเทียม ~50-80) ≠ ต้มยำ(+พริกป่น น้ำตาล ถั่ว ~80) · ผัดไทย(550) ≠ ผัดซีอิ๊ว(600) ≠ ราดหน้า(500 น้ำแป้ง) · ข้าวขาหมู(700 หนังมัน) ≠ ข้าวหมูแดง(600)

**ขั้นที่ 6 — ข้อผิดพลาดที่พบบ่อย (อย่าทำ):**
- ประเมินข้าวน้อยเกินจริง (ร้านไทยให้ข้าวเยอะ) · ลืมน้ำมันในเมนูผัด/ทอด · ลืมน้ำจิ้มข้างจาน · เดาว่าจานเล็กทั้งที่เป็นจานใหญ่ · นับเครื่องดื่มเป็น 0 · ตีเมนู "ดูเฮลตี้" ต่ำเกินไปทั้งที่มีน้ำสลัด/อะโวคาโด/ถั่ว

**ขั้นที่ 7 — ตรวจทานตัวเองก่อนตอบ (บังคับ):**
1. ผลรวม breakdown ต้องเท่ากับ totalCalories เป๊ะ
2. เทียบกับค่าอ้างอิง (ผู้ใช้เคยแก้ > คลังผู้ใช้ทุกคน > ฐานข้อมูล) — ถ้าห่างเกิน 25% ให้กลับไปทบทวนปริมาณใหม่ 1 รอบ แล้วเลือกค่าที่มีเหตุผลกว่า
3. เช็คช่วงสมเหตุสมผล: จานเดียวทั่วไป 300-800 · กับข้าวอย่างเดียว 150-500 · เครื่องดื่ม 0-400 · ของหวาน 150-450 — ถ้าหลุดช่วงต้องมีเหตุผลชัดเจน
4. protein×4 + carbs×4 + fat×9 ควรใกล้เคียง totalCalories (±15%)
${recentCorrections.length > 0 ? '5. เทียบกับที่ผู้ใช้เคยแก้ — เมนู/ร้าน/ขนาดจานคล้ายกัน ให้เอนไปทางค่าที่ผู้ใช้ระบุ' : '5. ถ้าตัวเทียบขนาดไม่ชัด ตั้ง confidence เป็น "ต่ำ" อย่างตรงไปตรงมา'}

คุณเขียนการคิดทีละขั้นก่อนได้ (แนะนำให้ทำ — ห้ามใช้เครื่องหมายปีกกาในส่วนการคิด) แต่ต้องจบด้วย JSON โครงสร้างนี้เป็นก้อนสุดท้ายเสมอ ห้ามมี markdown ห้าม backtick:
{
  "foods": ["ชื่ออาหารแต่ละอย่าง พร้อมปริมาณโดยประมาณ เช่น 'ข้าวสวย 1 ทัพพี', 'ไก่ทอด 2 ชิ้น'"],
  "breakdown": [{"item": "ข้าวสวย ~160g", "kcal": 200}, {"item": "น้ำมันผัด ~1.5 ชต", "kcal": 160}],
  "displayName": "ชื่อสรุปจาน เช่น 'ข้าวมันไก่ + น้ำจิ้ม'",
  "totalCalories": ตัวเลขรวมที่แม่นที่สุด (integer — ต้องเท่ากับผลรวมของ breakdown),
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
        max_tokens: 3000,
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

  // แก้รายการย่อย — แคลรวมคำนวณใหม่จากผลบวกเสมอ
  const sumBreakdown = (bd) => bd.reduce((s, b) => s + (parseInt(b.kcal) || 0), 0);
  const updateBreakdown = (i, patch) => {
    const bd = result.breakdown.map((b, idx) => (idx === i ? { ...b, ...patch } : b));
    setResult({ ...result, breakdown: bd, totalCalories: sumBreakdown(bd) });
  };
  const removeBreakdownItem = (i) => {
    const bd = result.breakdown.filter((_, idx) => idx !== i);
    setResult({ ...result, breakdown: bd, totalCalories: sumBreakdown(bd) });
  };
  const addBreakdownItem = () => {
    setResult({ ...result, breakdown: [...(result.breakdown || []), { item: '', kcal: '' }] });
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
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `คุณคือนักโภชนาการคลินิกที่เชี่ยวชาญอาหารไทย ผู้ใช้พิมพ์ชื่ออาหารว่า "${q}"
ประเมินจากปริมาณมาตรฐาน 1 จาน/ชาม/แก้ว (ถ้าผู้ใช้ระบุปริมาณ/ขนาด/ระดับหวานมาด้วย ให้ใช้ตามนั้นเคร่งครัด)
${allergyContext}${communityHint()}${halalHint()}

**ฐานข้อมูลอาหารไทย (ใช้เป็นค่าอ้างอิงหลัก ถ้าตรงกับเมนู — แต่ถ้าเมนูมีในคลังผู้ใช้ทุกคนข้างบน ให้ค่านั้นสำคัญกว่า):**
${buildDictHint()}

**วิธีคิด:**
1. แตกเมนูเป็นส่วนประกอบ: แป้ง/ข้าว, โปรตีน, ผัก, น้ำมัน/กะทิ, น้ำจิ้ม/น้ำราด/น้ำตาล
2. ประมาณน้ำหนักกรัมของแต่ละส่วนตามเสิร์ฟมาตรฐานร้านไทย แล้วคิดแคลทีละส่วน
3. อย่าลืมแคลแฝง: น้ำมันผัด 1-1.5 ชต (120-180), ของทอด 1.5-2 ชต, กะทิ 1 ถ้วย +150-250, น้ำจิ้มหวาน 1 ชต +30-60
4. เครื่องดื่ม: หวานปกติ vs หวานน้อย ต่างกัน ~30-40%, ไข่มุก +100-150
5. sanity check กับค่าฐานข้อมูล ถ้าห่างเกิน 25% ให้ทบทวนใหม่

คุณเขียนการคิดสั้นๆ ก่อนได้ (ห้ามใช้เครื่องหมายปีกกาในส่วนการคิด) แต่ต้องจบด้วย JSON โครงสร้างนี้เป็นก้อนสุดท้ายเสมอ ห้ามมี markdown ห้าม backtick:
{
  "foods": ["ส่วนประกอบหลักโดยประมาณ"],
  "breakdown": [{"item": "เส้นเล็ก ~150g", "kcal": 170}],
  "displayName": "ชื่อเมนูที่สะกดถูกต้อง",
  "totalCalories": ตัวเลข (integer — เท่ากับผลรวม breakdown),
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
              backgroundColor: PALETTE.deep,
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
                <Macro icon={<Leaf size={14} />} label="โปรตีน" value={result.protein} tone={PALETTE.sage}
                  onChange={(v) => setResult({ ...result, protein: v === '' ? 0 : parseInt(v) })} />
                <Macro icon={<Wheat size={14} />} label="คาร์บ" value={result.carbs} tone={PALETTE.gold}
                  onChange={(v) => setResult({ ...result, carbs: v === '' ? 0 : parseInt(v) })} />
                <Macro icon={<Droplet size={14} />} label="ไขมัน" value={result.fat} tone={PALETTE.coral}
                  onChange={(v) => setResult({ ...result, fat: v === '' ? 0 : parseInt(v) })} />
              </div>

              {/* รายละเอียดแคลแยกชิ้น — แก้/ลบ/เพิ่มได้ แคลรวมอัปเดตอัตโนมัติ */}
              {Array.isArray(result.breakdown) && (
                <div className="rounded-2xl p-3 mb-3" style={{ backgroundColor: PALETTE.shell }}>
                  <div className="font-accent text-xs mb-2 flex items-center justify-between" style={{ color: PALETTE.gold }}>
                    <span>คิดมาจากอะไรบ้าง · แก้ได้เลย</span>
                    <Pencil size={10} color={PALETTE.muted} />
                  </div>
                  <div className="space-y-1.5">
                    {result.breakdown.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={b.item || ''}
                          onChange={e => updateBreakdown(i, { item: e.target.value })}
                          placeholder="ชื่อรายการ"
                          className="font-body text-xs flex-1 min-w-0 bg-transparent border-b border-dashed pb-0.5"
                          style={{ color: PALETTE.forest, borderColor: PALETTE.mist }}
                        />
                        <input
                          value={b.kcal ?? ''}
                          onChange={e => updateBreakdown(i, { kcal: e.target.value.replace(/\D/g, '') })}
                          inputMode="numeric"
                          className="font-display text-xs font-semibold w-12 text-right bg-transparent border-b border-dashed pb-0.5"
                          style={{ color: PALETTE.sageDark, borderColor: PALETTE.mist }}
                        />
                        <span className="font-body text-tiny" style={{ color: PALETTE.muted }}>kcal</span>
                        <button onClick={() => removeBreakdownItem(i)}
                          className="smooth-tap w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ color: PALETTE.coral }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addBreakdownItem}
                    className="smooth-tap mt-2 font-body text-tiny flex items-center gap-1"
                    style={{ color: PALETTE.sageDark }}
                  >
                    <Plus size={11} /> เพิ่มรายการ (เช่น น้ำจิ้มที่น้องไกด์มองไม่เห็น)
                  </button>
                </div>
              )}

              {/* แก้ชื่อแล้ว → ให้น้องไกด์คำนวณแคลใหม่จากชื่อ */}
              {originalResult && result.displayName?.trim() &&
                result.displayName.trim() !== originalResult.displayName && (
                <button onClick={() => estimateFromName(result.displayName, result)} disabled={busy}
                  className="smooth-tap w-full py-2.5 px-3 rounded-xl mb-4 font-display text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: alpha(PALETTE.gold, 15), color: PALETTE.sageDark, border: `1.5px dashed ${PALETTE.gold}` }}
                >
                  {busy ? (
                    <><Loader2 size={13} className="anim-spin-slow" /> กำลังคำนวณใหม่...</>
                  ) : (
                    <><Sparkles size={13} color={PALETTE.gold} /> คำนวณแคลใหม่จากชื่อ "{result.displayName.trim()}"</>
                  )}
                </button>
              )}

              {halal && result.halalStatus && <HalalCard result={result} />}

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

function HalalCard({ result }) {
  const map = {
    halal:    { label: 'ฮาลาล',            icon: '✅', tone: PALETTE.sage,  bg: alpha(PALETTE.sage, 14) },
    mushbooh: { label: 'มัชบูฮฺ (น่าสงสัย)', icon: '⚠️', tone: PALETTE.gold,  bg: alpha(PALETTE.gold, 16) },
    haram:    { label: 'หะรอม (ไม่ฮาลาล)',   icon: '⛔', tone: PALETTE.coral, bg: PALETTE.coralSoft },
  };
  const s = map[result.halalStatus] || map.mushbooh;
  return (
    <div className="rounded-2xl p-3 mb-3" style={{ backgroundColor: s.bg }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">🕌</span>
        <span className="font-display font-bold text-sm" style={{ color: s.tone }}>
          {s.icon} {s.label}
        </span>
      </div>
      {result.halalReason && (
        <div className="font-body text-xs leading-relaxed" style={{ color: PALETTE.forest }}>
          {result.halalReason}
        </div>
      )}
      {Array.isArray(result.halalConcerns) && result.halalConcerns.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {result.halalConcerns.map((c, i) => (
            <span key={i} className="font-body text-tiny px-2 py-0.5 rounded-md"
              style={{ backgroundColor: PALETTE.paper, color: s.tone }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Macro({ icon, label, value, tone, onChange }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: PALETTE.shell }}>
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: tone }}>
        {icon}<span className="font-accent text-tiny">{label}</span>
      </div>
      <div className="font-display text-base font-bold flex items-baseline justify-center" style={{ color: PALETTE.forest }}>
        {onChange ? (
          <input
            value={value ?? ''}
            onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            className="w-10 text-center bg-transparent border-b border-dashed font-display text-base font-bold"
            style={{ color: PALETTE.forest, borderColor: PALETTE.mist }}
          />
        ) : (
          <span>{value}</span>
        )}
        <span className="text-tiny font-normal" style={{ color: PALETTE.muted }}>g</span>
      </div>
    </div>
  );
}
