import React, { useState, useRef, useEffect } from 'react';
import {
  Heart, Send, Phone, RotateCcw, Volume2, VolumeX, X,
} from 'lucide-react';
import { PALETTE } from '../theme';
import { calcBMI, load, save } from '../utils';
import { resolvePersonality } from '../data/personalities';
import { callClaude } from '../api';
import LogoMark from './LogoMark';

export default function ChatScreen({ profile, messages, addMessage, clearMessages, personality, halal }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => load('gyn_voice', false));
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [noThaiVoice, setNoThaiVoice] = useState(false);
  const scrollRef = useRef(null);
  const voicesRef = useRef([]);
  // จำ ts ของข้อความล่าสุดตอนเปิดหน้า — จะได้ไม่อ่านข้อความเก่าซ้ำ
  const lastSpokenTs = useRef(messages[messages.length - 1]?.ts ?? 0);

  const persona = resolvePersonality(personality, profile.age);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // รายชื่อเสียงโหลดแบบ async — ต้องรอ event 'voiceschanged' ไม่งั้นได้ลิสต์ว่าง
  // (สาเหตุที่เสียงเพี้ยนเป็นอังกฤษ: หาเสียงไทยไม่เจอเพราะลิสต์ยังไม่มา)
  useEffect(() => {
    if (!ttsSupported) return;
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
  }, []);

  const findThaiVoice = () => {
    let voices = voicesRef.current;
    if (!voices.length) {
      voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;
    }
    return {
      voices,
      thai: voices.find(v => (v.lang || '').toLowerCase().replace('_', '-').startsWith('th'))
        || voices.find(v => /thai|ไทย/i.test(v.name || '')),
    };
  };

  const speak = (text, idx) => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    if (speakingIdx === idx) { setSpeakingIdx(null); return; }

    const { voices, thai } = findThaiVoice();
    // มีรายชื่อเสียงแต่ไม่มีภาษาไทยเลย = เครื่องนี้ต้องติดตั้งเสียงไทยเพิ่ม
    if (!thai && voices.length > 0 && !load('gyn_tts_notice_off', false)) {
      setNoThaiVoice(true);
    }

    // ตัด emoji ออกทั้งหมด + แบ่งข้อความยาวเป็นท่อนสั้นๆ (เครื่องบางรุ่นตัดเสียงกลางคันถ้ายาวเกิน)
    const clean = text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').trim();
    const chunks = [];
    let rest = clean;
    while (rest.length > 0) {
      if (rest.length <= 160) { chunks.push(rest); break; }
      let cut = rest.lastIndexOf(' ', 160);
      if (cut < 60) cut = 160;
      chunks.push(rest.slice(0, cut));
      rest = rest.slice(cut).trim();
    }
    if (chunks.length === 0) return;

    setSpeakingIdx(idx);
    // หน่วงนิดเดียวหลัง cancel() — Chrome บางเวอร์ชันจะเงียบถ้า speak ทันที
    setTimeout(() => {
      chunks.forEach((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk);
        u.lang = 'th-TH';
        u.rate = 1.0;
        u.pitch = 1.05;
        if (thai) u.voice = thai;
        // เคลียร์สถานะเฉพาะตอนที่ยังเป็นข้อความเดิม — กัน race เวลาเปลี่ยนไปพูดข้อความใหม่
        if (i === chunks.length - 1) {
          u.onend = () => setSpeakingIdx(cur => (cur === idx ? null : cur));
        }
        u.onerror = () => setSpeakingIdx(cur => (cur === idx ? null : cur));
        window.speechSynthesis.speak(u);
      });
    }, 60);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    save('gyn_voice', next);
    if (!next) { window.speechSynthesis?.cancel(); setSpeakingIdx(null); }
  };

  // Auto-speak the latest assistant message when voice is on
  useEffect(() => {
    if (!voiceOn || !ttsSupported) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && last.ts !== lastSpokenTs.current) {
      lastSpokenTs.current = last.ts;
      speak(last.content, messages.length - 1);
    }
  }, [messages.length]);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const startNewChat = () => {
    if (messages.length === 0) return;
    setConfirmClear(true);
  };
  const doClear = () => {
    clearMessages?.();
    setConfirmClear(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const userMsg = { role: 'user', content: text, ts: Date.now() };
    addMessage(userMsg);
    setBusy(true);

    try {
      const bmi = calcBMI(profile.weight, profile.height);
      const system = `${persona.prompt}

(ในแอป GINYARAIDEE — แอปสุขภาพที่ให้คำแนะนำเบื้องต้น)

หน้าที่หลัก:
1. ให้คำแนะนำสุขภาพเบื้องต้น (ไม่วินิจฉัย ไม่จ่ายยา)
2. ถ้ามีอาการรุนแรง เช่น เจ็บหน้าอกหนัก หายใจไม่ออก ปวดหัวรุนแรงเฉียบพลัน อาเจียนเป็นเลือด อ่อนแรงครึ่งซีก ชัก หมดสติ หรือคิดทำร้ายตัวเอง → ต้องเตือนให้ไปพบแพทย์/โทร 1669 ทันทีอย่างจริงจัง
3. ถ้าอาการเล็กน้อย → ให้คำแนะนำดูแลเบื้องต้นพร้อมบอก "ถ้าไม่ดีขึ้นใน 2-3 วัน ไปหาหมอนะ"
4. คำนึงถึงข้อมูลผู้ใช้และสิ่งที่แพ้เสมอ — ถ้าถามเรื่องยา ให้เช็คก่อนว่ามีในรายการแพ้ไหม
5. ห้ามใช้ markdown หรือ ** ตอบสั้นๆ กระชับ 2-4 ประโยค

ข้อมูลผู้ใช้:
- ชื่อ: ${profile.name}
- เพศ: ${profile.gender === 'female' ? 'หญิง' : 'ชาย'}, อายุ ${profile.age} ปี
- BMI: ${bmi}
- แพ้อาหาร: ${profile.foodAllergy.join(', ') || 'ไม่มี'}
- แพ้ยา: ${profile.drugAllergy.join(', ') || 'ไม่มี'}${halal ? `
- ผู้ใช้ทานอาหารฮาลาล (มุสลิม): เวลาแนะนำอาหาร/เมนู ให้เป็นฮาลาลเท่านั้น เลี่ยงหมู แอลกอฮอล์ และส่วนผสมที่ไม่ฮาลาล ถ้าเมนูไหนน่าสงสัยให้บอกให้ตรวจสอบก่อน` : ''}`;

      const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaude({
        max_tokens: 600,
        system,
        messages: [...history, { role: 'user', content: text }],
      });
      addMessage({ role: 'assistant', content: reply, ts: Date.now() });
    } catch (e) {
      addMessage({
        role: 'assistant',
        content: 'ขอโทษค่ะพี่ หนูตอบไม่ได้ตอนนี้ ลองอีกครั้งนะคะ 🙏',
        ts: Date.now()
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col chat-screen-h anim-fadeIn relative">
      <div className="px-5 pt-6 pb-3 flex items-center gap-3"
        style={{ backgroundColor: PALETTE.cream, borderBottom: `1px solid ${PALETTE.mist}` }}
      >
        <div className="anim-float flex-shrink-0">
          <LogoMark size={44} />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold" style={{ color: PALETTE.sageDeep }}>{persona.label}</div>
          <div className="font-body text-xs flex items-center gap-1.5" style={{ color: PALETTE.sage }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PALETTE.sage }} />
            {persona.sub} · พร้อมคุย
          </div>
        </div>
        {ttsSupported && (
          <button className="smooth-tap w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: voiceOn ? PALETTE.sage : PALETTE.shell,
              color: voiceOn ? 'white' : PALETTE.sageDark,
            }}
            title={voiceOn ? 'ปิดเสียงพูด' : 'เปิดเสียงพูด'}
            onClick={toggleVoice}
          >
            {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        )}
        <button className="smooth-tap w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40"
          style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
          title="เริ่มแชทใหม่"
          disabled={messages.length === 0}
          onClick={startNewChat}
        >
          <RotateCcw size={15} />
        </button>
        <button className="smooth-tap w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
          title="ฉุกเฉิน"
          onClick={() => addMessage({
            role: 'assistant',
            content: 'ถ้าเจ็บป่วยฉุกเฉิน โทร 1669 (สถาบันการแพทย์ฉุกเฉิน) ได้ตลอด 24 ชม.นะคะพี่ 🚑',
            ts: Date.now()
          })}
        >
          <Phone size={16} />
        </button>
      </div>

      {/* เครื่องไม่มีเสียงภาษาไทย — บอกวิธีติดตั้ง */}
      {noThaiVoice && (
        <div className="px-4 py-2.5 flex items-start gap-2 anim-fadeIn"
          style={{ backgroundColor: PALETTE.coralSoft }}
        >
          <div className="font-body text-xs flex-1 leading-relaxed" style={{ color: PALETTE.coral }}>
            🔇 เครื่องนี้ยังไม่มี "เสียงภาษาไทย" ติดตั้งไว้ เสียงเลยเพี้ยนเป็นสำเนียงอังกฤษ —
            Android: ติดตั้งแอป Google Text-to-Speech แล้วเพิ่มภาษาไทย ·
            iPhone: ตั้งค่า → การช่วยการเข้าถึง → เนื้อหาที่พูด → เสียง ·
            Windows: Settings → Time & Language → Language เพิ่ม "ไทย" พร้อม Speech
          </div>
          <button onClick={() => { setNoThaiVoice(false); save('gyn_tts_notice_off', true); }}
            className="flex-shrink-0" style={{ color: PALETTE.coral }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-12 anim-fadeIn">
            <div className="anim-float inline-block mb-4">
              <LogoMark size={72} />
            </div>
            <div className="text-3xl mb-2">{persona.icon}</div>
            <div className="font-display text-xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
              สวัสดี {profile.name}
            </div>
            <p className="font-body text-sm leading-relaxed mb-6 max-w-xs mx-auto" style={{ color: PALETTE.muted }}>
              ฉันคือ <strong style={{ color: PALETTE.sageDark }}>{persona.label}</strong><br />
              {persona.desc}
            </p>
            <div className="space-y-2 max-w-xs mx-auto">
              {['ปวดหัวมา 2 วัน ทำยังไงดี', 'อาหารแบบไหนช่วยให้นอนหลับ', 'ออกกำลังกายแบบไหนเหมาะกับมือใหม่'].map((s, i) => (
                <button key={i} onClick={() => setInput(s)}
                  className="smooth-tap w-full text-left px-4 py-2.5 rounded-2xl text-sm font-body"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i}
            className={`flex mb-3 anim-slideUp ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 flex items-center justify-center"
                style={{ backgroundColor: PALETTE.deep }}
              >
                <Heart size={12} color={PALETTE.gold} />
              </div>
            )}
            <div className="max-w-80 rounded-2xl px-4 py-2.5"
              style={{
                backgroundColor: m.role === 'user' ? PALETTE.sageDark : PALETTE.paper,
                color: m.role === 'user' ? 'white' : PALETTE.forest,
                borderTopLeftRadius: m.role === 'assistant' ? 4 : undefined,
                borderTopRightRadius: m.role === 'user' ? 4 : undefined,
                boxShadow: m.role === 'assistant' ? '0 1px 2px rgba(46,68,41,0.05)' : 'none',
              }}
            >
              <div className="font-body text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              {m.role === 'assistant' && ttsSupported && (
                <button onClick={() => speak(m.content, i)}
                  className="smooth-tap mt-1.5 flex items-center gap-1 font-body text-tiny"
                  style={{ color: speakingIdx === i ? PALETTE.sage : PALETTE.muted }}
                >
                  <Volume2 size={12} />
                  {speakingIdx === i ? 'กำลังพูด...' : 'ฟังเสียง'}
                </button>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex mb-3 anim-fadeIn">
            <div className="w-7 h-7 rounded-full mr-2 flex items-center justify-center"
              style={{ backgroundColor: PALETTE.deep }}
            >
              <Heart size={12} color={PALETTE.gold} />
            </div>
            <div className="rounded-2xl px-4 py-3 flex gap-1"
              style={{ backgroundColor: PALETTE.paper, borderTopLeftRadius: 4 }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: PALETTE.sage,
                    animation: `pulseGlow 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2" style={{ backgroundColor: PALETTE.cream }}>
        <div className="flex items-center gap-2 rounded-2xl px-2 py-1.5 chip-input"
          style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
        >
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              // กันส่งข้อความกลางคันตอนพิมพ์ไทยด้วย IME
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) send();
            }}
            placeholder="ถามน้องไกด์ได้เลย..."
            className="font-body flex-1 px-3 py-2.5 text-sm bg-transparent"
            style={{ color: PALETTE.forest }}
          />
          <button onClick={send} disabled={!input.trim() || busy}
            className="smooth-tap w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{ backgroundColor: PALETTE.sageDark, color: 'white' }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="font-body text-tiny text-center mt-2" style={{ color: PALETTE.muted }}>
          คำแนะนำเบื้องต้นเท่านั้น · หากอาการรุนแรงควรพบแพทย์
        </div>
      </div>

      {confirmClear && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6 anim-fadeIn"
          style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
          onClick={() => setConfirmClear(false)}
        >
          <div className="w-full rounded-3xl p-6 deep-shadow anim-slideUp"
            style={{ backgroundColor: PALETTE.paper }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
              style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
            >
              <RotateCcw size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-center mb-1" style={{ color: PALETTE.sageDeep }}>
              เริ่มแชทใหม่?
            </h3>
            <p className="font-body text-sm text-center mb-5 leading-relaxed" style={{ color: PALETTE.muted }}>
              ประวัติที่คุยกับน้องไกด์<br />จะหายไปทั้งหมดนะคะ
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmClear(false)}
                className="smooth-tap flex-1 py-3 rounded-2xl font-display font-medium"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.forest }}
              >
                ยกเลิก
              </button>
              <button onClick={doClear}
                className="smooth-tap flex-1 py-3 rounded-2xl font-display font-semibold text-white"
                style={{ backgroundColor: PALETTE.coral }}
              >
                เริ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
