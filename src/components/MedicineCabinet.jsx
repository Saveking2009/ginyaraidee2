import React, { useState, useRef, useEffect } from 'react';
import {
  Pill, Plus, X, ChevronRight, Trash2, AlertCircle, AlertTriangle,
  Loader2, ScanLine, Sparkles,
} from 'lucide-react';
import { PALETTE } from '../theme';
import { fileToBase64 } from '../utils';
import { callClaude, parseAIJson } from '../api';

export default function MedicineCabinet({ medicines, addMedicine, removeMedicine, onModalChange }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const scanFileRef = useRef(null);

  useEffect(() => {
    onModalChange?.(adding);
    return () => onModalChange?.(false);
  }, [adding]);

  const scanLabel = async (file) => {
    setScanning(true);
    setScanError(null);
    try {
      const b64 = await fileToBase64(file);
      const text = await callClaude({
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: file.type, data: b64 } },
            { type: 'text', text: `ดูฉลากยาในรูปนี้ และสกัดข้อมูลออกมา

**กฎสำคัญ:**
- ดูได้เฉพาะ "ฉลากยา" เท่านั้น (ฉลากบนซอง/กล่อง/ขวดยา ที่มีตัวอักษรชัดเจน)
- ห้ามเดาจากรูปร่าง สี หรือเม็ดยาเปล่าๆ — ถ้าไม่เห็นฉลากชัด ให้ตอบ {"error": "ไม่เห็นฉลากยาที่ชัดเจน กรุณาถ่ายฉลากให้ชัดอีกครั้ง"}
- ถ้ารูปไม่ใช่ยา ให้ตอบ {"error": "รูปนี้ไม่ใช่ฉลากยา"}

ตอบเป็น JSON เท่านั้น ห้ามมี markdown:
{
  "name": "ชื่อยา/ตัวยาสำคัญที่อ่านจากฉลากได้",
  "dosage": "ขนาดยา/strength เช่น '500mg'",
  "category": "ประเภทยาสั้นๆ เช่น แก้ปวด/ลดไข้",
  "usage": "ใช้รักษาอะไร 1-2 ประโยค",
  "dosageTip": "วิธีกินที่อ่านจากฉลาก หรือทั่วไปถ้าไม่มี",
  "warnings": ["คำเตือนสำคัญ 2-4 ข้อ"]
}` }
          ]
        }]
      }, { timeoutMs: 90000 });
      const info = parseAIJson(text);
      if (info.error) {
        setScanError(info.error);
        return;
      }
      addMedicine({ id: 'm' + Date.now(), ...info });
      setAdding(false);
    } catch (e) {
      setScanError('สแกนไม่สำเร็จ ลองถ่ายใหม่นะคะ');
    } finally {
      setScanning(false);
    }
  };

  const onScanFile = (e) => {
    const f = e.target.files?.[0];
    if (f) scanLabel(f);
    e.target.value = '';
  };

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const text = await callClaude({
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `ผู้ใช้กำลังเพิ่ม "${name}" เข้าตู้ยา ให้ข้อมูลยาตัวนี้เป็น JSON เท่านั้น ห้ามมี markdown:
{
  "category": "ประเภทยาสั้นๆ เช่น แก้ปวด/ลดไข้",
  "usage": "ใช้รักษาอะไร เขียนเข้าใจง่าย 1-2 ประโยค",
  "dosageTip": "วิธีกินทั่วไป",
  "warnings": ["คำเตือนสั้นๆ ที่สำคัญที่สุด 2-4 ข้อ"],
  "color": "ชื่อสีหลักของยา เช่น ขาว, ฟ้า"
}
ถ้าไม่ใช่ชื่อยาที่รู้จัก ใส่ category เป็น "ไม่ทราบ" และให้ข้อมูลเท่าที่เดาได้`
        }]
      });
      const info = parseAIJson(text);
      addMedicine({
        id: 'm' + Date.now(),
        name: name.trim(),
        dosage: dosage.trim(),
        ...info,
      });
      setName(''); setDosage(''); setAdding(false);
    } catch (e) {
      addMedicine({
        id: 'm' + Date.now(),
        name: name.trim(),
        dosage: dosage.trim(),
        category: 'ไม่ทราบ',
        usage: 'ยังไม่มีข้อมูล',
        warnings: ['ปรึกษาเภสัชกรก่อนใช้'],
      });
      setName(''); setDosage(''); setAdding(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6 flex items-start justify-between mb-5">
        <div>
          <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>MEDICINE CABINET</div>
          <h1 className="font-display text-3xl font-bold" style={{ color: PALETTE.sageDeep }}>
            ตู้ยา
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: PALETTE.muted }}>
            ยาแต่ละตัวคืออะไร ใช้ยังไง
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="smooth-tap w-11 h-11 rounded-2xl flex items-center justify-center deep-shadow"
          style={{ backgroundColor: PALETTE.sageDark, color: 'white' }}
        >
          <Plus size={20} />
        </button>
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(39,54,31,0.4)' }}
          onClick={() => !busy && setAdding(false)}
        >
          <div className="w-full rounded-t-3xl p-6 pb-28 anim-slideUp" style={{ backgroundColor: PALETTE.cream }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: PALETTE.mist }} />
            <h3 className="font-display text-xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
              เพิ่มยาเข้าตู้
            </h3>
            <p className="font-body text-sm mb-4" style={{ color: PALETTE.muted }}>
              ถ่ายฉลากยา หรือพิมพ์ชื่อก็ได้
            </p>

            {/* Scan button */}
            <input ref={scanFileRef} type="file" accept="image/*" capture="environment"
              onChange={onScanFile} className="hidden"
            />
            <button onClick={() => scanFileRef.current?.click()} disabled={scanning || busy}
              className="smooth-tap w-full p-4 rounded-2xl mb-3 flex items-center gap-3 relative overflow-hidden disabled:opacity-50"
              style={{ backgroundColor: PALETTE.deep }}
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20"
                style={{ backgroundColor: PALETTE.gold }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                {scanning ? <Loader2 size={18} color="white" className="anim-spin-slow" /> : <ScanLine size={18} color={PALETTE.gold} />}
              </div>
              <div className="text-left relative flex-1">
                <div className="font-display font-semibold text-white text-sm">
                  {scanning ? 'กำลังอ่านฉลาก...' : 'ถ่ายฉลากยา'}
                </div>
                <div className="font-body text-tiny text-white/70 mt-0.5">
                  น้องไกด์จะอ่านชื่อยาและข้อมูลให้
                </div>
              </div>
            </button>

            {scanError && (
              <div className="rounded-xl p-3 mb-3 flex items-start gap-2"
                style={{ backgroundColor: PALETTE.coralSoft }}
              >
                <AlertCircle size={16} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                <div className="font-body text-xs flex-1" style={{ color: PALETTE.coral }}>{scanError}</div>
                <button onClick={() => setScanError(null)} style={{ color: PALETTE.coral }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ backgroundColor: PALETTE.mist }} />
              <div className="font-accent text-tiny" style={{ color: PALETTE.muted }}>หรือพิมพ์เอง</div>
              <div className="flex-1 h-px" style={{ backgroundColor: PALETTE.mist }} />
            </div>

            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="ชื่อยา เช่น พาราเซตามอล 500mg"
              className="font-body w-full px-5 py-4 rounded-2xl text-base mb-3"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            />
            <input value={dosage} onChange={e => setDosage(e.target.value)}
              placeholder="ขนาดยา / โดส (ถ้ามี)"
              className="font-body w-full px-5 py-4 rounded-2xl text-base mb-5"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            />
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} disabled={busy || scanning}
                className="smooth-tap flex-1 py-4 rounded-2xl font-display font-medium disabled:opacity-50"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest }}
              >
                ยกเลิก
              </button>
              <button onClick={submit} disabled={busy || scanning || !name.trim()}
                className="smooth-tap flex-2 py-4 rounded-2xl font-display font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: PALETTE.sageDark }}
              >
                {busy ? <><Loader2 className="anim-spin-slow" size={18} /> กำลังหาข้อมูล...</> : <><Sparkles size={16} /> เพิ่ม</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5">
        {medicines.length === 0 ? (
          <div className="rounded-3xl p-10 text-center anim-fadeIn"
            style={{ backgroundColor: PALETTE.paper }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: PALETTE.shell }}
            >
              <Pill size={28} color={PALETTE.sage} />
            </div>
            <div className="font-display font-semibold mb-1" style={{ color: PALETTE.sageDeep }}>
              ตู้ยายังว่างอยู่
            </div>
            <div className="font-body text-sm" style={{ color: PALETTE.muted }}>
              กดปุ่ม + ด้านบนเพื่อเพิ่มยา
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map((m) => (
              <div key={m.id}
                className="rounded-2xl overflow-hidden organic-shadow anim-slideUp"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <button onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: PALETTE.shell }}
                  >
                    <Pill size={20} color={PALETTE.sage} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold" style={{ color: PALETTE.forest }}>
                      {m.name}
                    </div>
                    <div className="font-body text-xs mt-0.5" style={{ color: PALETTE.muted }}>
                      {m.category}{m.dosage && ` · ${m.dosage}`}
                    </div>
                  </div>
                  <ChevronRight size={18} color={PALETTE.muted}
                    style={{
                      transform: expanded === m.id ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.25s ease'
                    }}
                  />
                </button>
                {expanded === m.id && (
                  <div className="px-4 pb-4 anim-fadeIn">
                    <div className="border-t pt-3" style={{ borderColor: PALETTE.mist }}>
                      <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>ใช้รักษา</div>
                      <div className="font-body text-sm mb-3 leading-relaxed" style={{ color: PALETTE.forest }}>
                        {m.usage}
                      </div>
                      {m.dosageTip && (
                        <>
                          <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>วิธีกิน</div>
                          <div className="font-body text-sm mb-3 leading-relaxed" style={{ color: PALETTE.forest }}>
                            {m.dosageTip}
                          </div>
                        </>
                      )}
                      {m.warnings && m.warnings.length > 0 && (
                        <>
                          <div className="font-accent text-xs mb-2" style={{ color: PALETTE.coral }}>ข้อควรระวัง</div>
                          <div className="space-y-1.5 mb-3">
                            {m.warnings.map((w, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <AlertCircle size={14} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                                <div className="font-body text-xs" style={{ color: PALETTE.forest }}>{w}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <button onClick={() => removeMedicine(m.id)}
                        className="smooth-tap font-body text-xs flex items-center gap-1.5 mt-2"
                        style={{ color: PALETTE.coral }}
                      >
                        <Trash2 size={12} /> ลบยานี้
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-2xl p-3 flex items-start gap-2"
          style={{ backgroundColor: PALETTE.coralSoft }}
        >
          <AlertTriangle size={16} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
          <div className="font-body text-xs leading-relaxed" style={{ color: PALETTE.coral }}>
            ข้อมูลยาเป็นคำแนะนำเบื้องต้นเท่านั้น ก่อนใช้ยาควรปรึกษาเภสัชกรหรือแพทย์ทุกครั้ง
          </div>
        </div>
      </div>
    </div>
  );
}
