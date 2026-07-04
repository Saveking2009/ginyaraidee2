import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, X, Apple, Pill } from 'lucide-react';
import { PALETTE } from '../theme';
import LogoMark from './LogoMark';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [foodAllergy, setFoodAllergy] = useState([]);
  const [drugAllergy, setDrugAllergy] = useState([]);
  const [fInput, setFInput] = useState('');
  const [dInput, setDInput] = useState('');

  const nextDisabled = () => {
    if (step === 1) return !name.trim();
    if (step === 2) return !age || !height || !weight;
    return false;
  };

  const submit = () => {
    onDone({
      name: name.trim() || 'พี่',
      age: +age,
      gender,
      height: +height,
      weight: +weight,
      foodAllergy,
      drugAllergy,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: PALETTE.cream }}>
      <div className="grain-bg absolute inset-0 pointer-events-none" />

      {/* progress */}
      <div className="px-6 pt-6 flex items-center gap-2 relative z-10">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: s <= step ? PALETTE.sage : PALETTE.mist }}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-md">

          {step === 0 && (
            <div className="text-center anim-slideUp">
              <div className="anim-float inline-block mb-6">
                <LogoMark size={96} />
              </div>
              <h1 className="font-display text-5xl font-bold mb-3" style={{ color: PALETTE.sageDeep }}>
                GINYARAIDEE
              </h1>
              <div className="font-accent text-lg mb-1" style={{ color: PALETTE.gold }}>
                กินยาไรดี
              </div>
              <p className="font-body text-base mb-10" style={{ color: PALETTE.muted }}>
                เพื่อนสุขภาพใจดี<br />ที่อยู่ข้างพี่ทุกวัน
              </p>
              <button
                onClick={() => setStep(1)}
                className="smooth-tap font-display font-semibold w-full py-4 rounded-2xl text-white text-base deep-shadow"
                style={{ backgroundColor: PALETTE.sageDark }}
              >
                เริ่มกันเลย
              </button>
              <p className="font-body text-xs mt-6 leading-relaxed" style={{ color: PALETTE.muted }}>
                * แอปนี้ให้คำแนะนำเบื้องต้นเท่านั้น<br />ไม่ทดแทนการวินิจฉัยโดยแพทย์
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="anim-slideUp">
              <div className="font-accent text-sm mb-2" style={{ color: PALETTE.gold }}>STEP 01</div>
              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
                ขอเรียกพี่ว่าอะไรดี?
              </h2>
              <p className="font-body text-sm mb-8" style={{ color: PALETTE.muted }}>
                หนูอยากเรียกชื่อพี่ให้ถูกต้องเลยค่ะ
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อเล่นก็ได้นะ"
                className="font-body w-full px-5 py-4 rounded-2xl text-lg organic-shadow"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="anim-slideUp">
              <div className="font-accent text-sm mb-2" style={{ color: PALETTE.gold }}>STEP 02</div>
              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
                ขอข้อมูลพื้นฐาน
              </h2>
              <p className="font-body text-sm mb-6" style={{ color: PALETTE.muted }}>
                เพื่อคำนวณแคลและคำแนะนำที่เหมาะกับพี่
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setGender('female')}
                  className="smooth-tap font-display font-medium py-4 rounded-2xl border-2"
                  style={{
                    backgroundColor: gender === 'female' ? PALETTE.sageDark : PALETTE.paper,
                    color: gender === 'female' ? '#fff' : PALETTE.forest,
                    borderColor: gender === 'female' ? PALETTE.sageDark : PALETTE.mist,
                  }}
                >
                  หญิง
                </button>
                <button
                  onClick={() => setGender('male')}
                  className="smooth-tap font-display font-medium py-4 rounded-2xl border-2"
                  style={{
                    backgroundColor: gender === 'male' ? PALETTE.sageDark : PALETTE.paper,
                    color: gender === 'male' ? '#fff' : PALETTE.forest,
                    borderColor: gender === 'male' ? PALETTE.sageDark : PALETTE.mist,
                  }}
                >
                  ชาย
                </button>
              </div>

              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
                placeholder="อายุ (ปี)"
                inputMode="numeric"
                className="font-body w-full px-5 py-4 rounded-2xl text-base mb-3"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={height}
                  onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="สูง (ซม.)"
                  inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="หนัก (กก.)"
                  inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="anim-slideUp">
              <div className="font-accent text-sm mb-2" style={{ color: PALETTE.gold }}>STEP 03</div>
              <h2 className="font-display text-3xl font-bold mb-2" style={{ color: PALETTE.sageDeep }}>
                สิ่งที่พี่แพ้
              </h2>
              <p className="font-body text-sm mb-6" style={{ color: PALETTE.muted }}>
                สำคัญมาก หนูจะได้เตือนพี่ทันที (ถ้าไม่มี ข้ามได้เลย)
              </p>

              <AllergySection
                label="แพ้อาหาร"
                icon={<Apple size={16} />}
                items={foodAllergy}
                setItems={setFoodAllergy}
                input={fInput}
                setInput={setFInput}
                placeholder="เช่น กุ้ง, นม, ถั่ว..."
              />
              <div className="h-4" />
              <AllergySection
                label="แพ้ยา"
                icon={<Pill size={16} />}
                items={drugAllergy}
                setItems={setDrugAllergy}
                input={dInput}
                setInput={setDInput}
                placeholder="เช่น พาราเซตามอล, ยาแก้ปวด..."
              />
            </div>
          )}

        </div>
      </div>

      {/* nav buttons */}
      <div className="px-6 pb-8 relative z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className="smooth-tap font-display font-medium px-5 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {step > 0 && (
            <button
              onClick={() => step === 3 ? submit() : setStep(s => s + 1)}
              disabled={nextDisabled()}
              className="smooth-tap font-display font-semibold flex-1 py-4 rounded-2xl text-white text-base flex items-center justify-center gap-2 deep-shadow disabled:opacity-40"
              style={{ backgroundColor: PALETTE.sageDark }}
            >
              {step === 3 ? 'เริ่มใช้แอป' : 'ต่อไป'}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AllergySection({ label, icon, items, setItems, input, setInput, placeholder }) {
  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) setItems([...items, v]);
    setInput('');
  };
  return (
    <div>
      <div className="font-body font-medium text-sm mb-2 flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
        <span style={{ color: PALETTE.coral }}>{icon}</span>{label}
      </div>
      <div className="chip-input rounded-2xl px-3 py-2 flex flex-wrap gap-1.5 transition-all"
        style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
      >
        {items.map((it, i) => (
          <span key={i}
            className="font-body text-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 anim-fadeIn"
            style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
          >
            {it}
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={items.length ? '' : placeholder}
          className="font-body chip-input-field flex-1 px-2 py-1.5 text-sm bg-transparent"
          style={{ color: PALETTE.forest }}
        />
      </div>
    </div>
  );
}
