import React, { useState, useEffect } from 'react';
import { Brain, Shield, Check, ChevronLeft, Heart, Phone } from 'lucide-react';
import { PALETTE } from '../theme';
import { callClaude } from '../api';

const MENTAL_QUESTIONS = [
  { q: 'ใน 2 สัปดาห์ที่ผ่านมา พี่รู้สึกหดหู่ ซึมเศร้า หรือสิ้นหวังบ่อยแค่ไหน?' },
  { q: 'พี่หมดความสนใจหรือไม่สนุกกับสิ่งที่เคยชอบหรือเปล่า?' },
  { q: 'พี่นอนหลับยาก ตื่นกลางดึก หรือนอนมากเกินไปไหม?' },
  { q: 'พี่รู้สึกเหนื่อยหรือไม่มีแรงไหม?' },
  { q: 'พี่กังวลหรือกระวนกระวายควบคุมไม่ได้บ่อยแค่ไหน?' },
  { q: 'พี่รู้สึกว่าตัวเองไม่มีค่า หรือผิดที่ผ่านมาไหม?' },
];

const OPTIONS = [
  { v: 0, label: 'ไม่เลย', tone: PALETTE.sage },
  { v: 1, label: 'บางวัน', tone: PALETTE.gold },
  { v: 2, label: 'เกินครึ่ง', tone: PALETTE.coral },
  { v: 3, label: 'แทบทุกวัน', tone: '#B8453A' },
];

export default function MentalHealth({ profile }) {
  const [step, setStep] = useState(0); // 0 intro, 1..N questions, N+1 result
  const [answers, setAnswers] = useState({});
  const [aiText, setAiText] = useState('');
  const [busy, setBusy] = useState(false);

  const totalQ = MENTAL_QUESTIONS.length;
  const isQ = step >= 1 && step <= totalQ;
  const isResult = step === totalQ + 1;

  const score = Object.values(answers).reduce((s, v) => s + v, 0);
  const maxScore = totalQ * 3;

  let level = { label: 'ดีมาก', tone: PALETTE.sage, msg: 'จิตใจของพี่ดูดีอยู่ ดูแลตัวเองต่อไปนะคะ' };
  if (score >= maxScore * 0.66) level = { label: 'ควรพบผู้เชี่ยวชาญ', tone: '#B8453A', msg: 'หนูแนะนำให้พี่ปรึกษาผู้เชี่ยวชาญ เพื่อดูแลตัวเองอย่างเหมาะสม' };
  else if (score >= maxScore * 0.4) level = { label: 'ควรดูแลเพิ่ม', tone: PALETTE.coral, msg: 'พี่อาจกำลังเครียดอยู่ ลองหาเวลาพักผ่อน และหาคนคุยด้วยนะคะ' };
  else if (score >= maxScore * 0.2) level = { label: 'มีบางอย่างกวนใจ', tone: PALETTE.gold, msg: 'อาจมีอะไรที่กังวลอยู่บ้าง ลองสังเกตและดูแลตัวเองนะคะ' };

  const generate = async () => {
    setBusy(true);
    try {
      const answersText = MENTAL_QUESTIONS.map((q, i) => `${q.q} → ${OPTIONS[answers[i] ?? 0].label}`).join('\n');
      const reply = await callClaude({
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `คุณคือน้องไกด์ น้องสาวใจดี ในแอป GINYARAIDEE
ผู้ใช้พี่ "${profile.name}" เพิ่งทำแบบคัดกรองสุขภาพจิตเบื้องต้น คำตอบคือ:
${answersText}

ระดับสรุป: ${level.label} (คะแนน ${score}/${maxScore})

ให้คำแนะนำอบอุ่น 3-4 ประโยค:
1. ยอมรับความรู้สึกของพี่ก่อน
2. แนะนำการดูแลตัวเองเล็กๆ ที่ทำได้
3. ถ้าระดับสูง (ควรพบผู้เชี่ยวชาญ) → แนะนำสายด่วนสุขภาพจิต 1323 และให้กำลังใจในการขอความช่วยเหลือ
ห้ามใช้ markdown ห้ามใช้ ** ตอบเป็นข้อความธรรมดา`
        }]
      });
      setAiText(reply);
    } catch (e) {
      setAiText(level.msg);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isResult && !aiText) generate();
  }, [isResult]);

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>MENTAL CHECK</div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: PALETTE.sageDeep }}>
          เช็คใจกัน
        </h1>
        <p className="font-body text-sm mb-6" style={{ color: PALETTE.muted }}>
          คัดกรองสุขภาพจิตเบื้องต้น
        </p>

        {step === 0 && (
          <div className="anim-slideUp">
            <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden"
              style={{ backgroundColor: PALETTE.sageDeep }}
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20"
                style={{ backgroundColor: PALETTE.coral }} />
              <Brain size={36} color={PALETTE.gold} className="mb-3 relative" />
              <div className="font-display text-xl font-bold text-white mb-1 relative">หนูจะถาม {totalQ} ข้อ</div>
              <p className="font-body text-sm text-white/70 leading-relaxed relative">
                เกี่ยวกับความรู้สึกในช่วง 2 สัปดาห์ที่ผ่านมา ตอบตามจริงนะคะ ไม่มีถูกผิด<br />
                <span className="text-xs">ใช้เวลาประมาณ 1-2 นาที</span>
              </p>
            </div>

            <div className="rounded-2xl p-4 mb-4 flex items-start gap-2"
              style={{ backgroundColor: PALETTE.shell }}
            >
              <Shield size={16} color={PALETTE.sageDark} className="flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs leading-relaxed" style={{ color: PALETTE.sageDark }}>
                แบบคัดกรองนี้เป็นเครื่องมือเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์<br />
                หากต้องการความช่วยเหลือเร่งด่วน โทรสายด่วนสุขภาพจิต <strong>1323</strong>
              </p>
            </div>

            <button onClick={() => setStep(1)}
              className="smooth-tap w-full py-4 rounded-2xl font-display font-semibold text-white deep-shadow"
              style={{ backgroundColor: PALETTE.sageDark }}
            >
              เริ่มเช็คใจ
            </button>
          </div>
        )}

        {isQ && (
          <div className="anim-slideUp" key={step}>
            <div className="flex items-center gap-2 mb-5">
              <div className="font-accent text-xs" style={{ color: PALETTE.gold }}>
                ข้อ {step} / {totalQ}
              </div>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: PALETTE.mist }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(step / totalQ) * 100}%`, backgroundColor: PALETTE.sage }} />
              </div>
            </div>

            <div className="rounded-3xl p-6 mb-5 deep-shadow" style={{ backgroundColor: PALETTE.paper }}>
              <div className="font-display text-xl font-semibold leading-relaxed" style={{ color: PALETTE.sageDeep }}>
                {MENTAL_QUESTIONS[step - 1].q}
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {OPTIONS.map((o) => (
                <button key={o.v}
                  onClick={() => {
                    setAnswers({ ...answers, [step - 1]: o.v });
                    setTimeout(() => setStep(step + 1), 220);
                  }}
                  className="smooth-tap w-full p-4 rounded-2xl flex items-center justify-between text-left"
                  style={{
                    backgroundColor: answers[step - 1] === o.v ? o.tone : PALETTE.paper,
                    color: answers[step - 1] === o.v ? 'white' : PALETTE.forest,
                    border: `1px solid ${answers[step - 1] === o.v ? o.tone : PALETTE.mist}`,
                  }}
                >
                  <span className="font-body font-medium">{o.label}</span>
                  <div className="w-6 h-6 rounded-full border-2"
                    style={{
                      borderColor: answers[step - 1] === o.v ? 'white' : PALETTE.mist,
                      backgroundColor: answers[step - 1] === o.v ? 'white' : 'transparent',
                    }}
                  >
                    {answers[step - 1] === o.v && <Check size={14} color={o.tone} className="m-0.5" />}
                  </div>
                </button>
              ))}
            </div>

            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                className="smooth-tap font-body text-sm flex items-center gap-1.5"
                style={{ color: PALETTE.muted }}
              >
                <ChevronLeft size={14} /> ข้อก่อนหน้า
              </button>
            )}
          </div>
        )}

        {isResult && (
          <div className="anim-slideUp">
            <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden"
              style={{ backgroundColor: PALETTE.paper }}
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10"
                style={{ backgroundColor: level.tone }} />
              <div className="font-accent text-xs mb-1" style={{ color: PALETTE.gold }}>ผลคัดกรอง</div>
              <div className="font-display text-3xl font-bold mb-2" style={{ color: level.tone }}>
                {level.label}
              </div>
              <div className="font-display text-sm font-medium mb-4" style={{ color: PALETTE.muted }}>
                คะแนน {score} / {maxScore}
              </div>

              <div className="h-3 rounded-full mb-5 overflow-hidden" style={{ backgroundColor: PALETTE.mist }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(score / maxScore) * 100}%`, backgroundColor: level.tone }} />
              </div>

              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: PALETTE.shell }}>
                <div className="font-accent text-xs mb-2 flex items-center gap-1.5" style={{ color: PALETTE.gold }}>
                  <Heart size={12} /> น้องไกด์ว่า
                </div>
                {busy ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded-full shimmer-bg" />
                    <div className="h-3 rounded-full shimmer-bg w-4/5" />
                    <div className="h-3 rounded-full shimmer-bg w-3/5" />
                  </div>
                ) : (
                  <div className="font-body text-sm leading-relaxed whitespace-pre-wrap" style={{ color: PALETTE.forest }}>
                    {aiText}
                  </div>
                )}
              </div>
            </div>

            {score >= maxScore * 0.4 && (
              <div className="rounded-2xl p-4 mb-3 flex items-start gap-3"
                style={{ backgroundColor: PALETTE.coralSoft }}
              >
                <Phone size={20} color={PALETTE.coral} className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-semibold text-sm mb-1" style={{ color: PALETTE.coral }}>
                    สายด่วนสุขภาพจิต
                  </div>
                  <div className="font-display text-2xl font-bold" style={{ color: PALETTE.coral }}>1323</div>
                  <div className="font-body text-xs" style={{ color: PALETTE.coral }}>
                    กรมสุขภาพจิต · ฟรี ตลอด 24 ชม.
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => { setStep(0); setAnswers({}); setAiText(''); }}
              className="smooth-tap w-full py-4 rounded-2xl font-display font-medium"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            >
              ทำใหม่อีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
