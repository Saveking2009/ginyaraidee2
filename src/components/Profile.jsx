import React, { useState, useRef, useEffect } from 'react';
import {
  User, Activity, AlertCircle, Shield, EyeOff, Sparkles, Check,
  ExternalLink, Plus, Trash2, Sun, Moon, MonitorSmartphone,
} from 'lucide-react';
import { PALETTE, alpha } from '../theme';
import { calcBMI, bmiCategory, exportMemory, handleImportMemory } from '../utils';
import { PERSONALITIES, resolvePersonality } from '../data/personalities';
import LogoMark from './LogoMark';

export default function Profile({ profile, privacy, setPrivacy, setProfile, reset, onModalChange, personality, setPersonality, corrections, clearCorrections, addCorrection, theme, setTheme, shareCommunity, setShareCommunity, halalMode, setHalalMode }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const bmi = calcBMI(profile.weight, profile.height);
  const importMemoryRef = useRef(null);

  useEffect(() => {
    onModalChange?.(editing);
    return () => onModalChange?.(false);
  }, [editing]);

  const save = () => {
    setProfile({
      ...draft,
      weight: +draft.weight || profile.weight,
      height: +draft.height || profile.height,
      age: +draft.age || profile.age,
    });
    setEditing(false);
  };

  const Toggle = ({ on, onChange }) => (
    <button onClick={onChange}
      className="smooth-tap w-12 h-7 rounded-full relative"
      style={{ backgroundColor: on ? PALETTE.sage : PALETTE.mist }}
    >
      <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all"
        style={{ left: on ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
      />
    </button>
  );

  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>PROFILE</div>
        <h1 className="font-display text-3xl font-bold mb-5" style={{ color: PALETTE.sageDeep }}>
          ข้อมูลของพี่
        </h1>

        {/* Profile card */}
        <div className="rounded-3xl p-6 mb-4 deep-shadow relative overflow-hidden anim-slideUp"
          style={{ backgroundColor: PALETTE.deep }}
        >
          <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full opacity-15"
            style={{ backgroundColor: PALETTE.gold }} />
          <div className="relative flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold"
              style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
            >
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white">{profile.name}</div>
              <div className="font-body text-sm text-white/70">
                {profile.gender === 'female' ? 'หญิง' : 'ชาย'}{privacy.showAge ? ` · อายุ ${profile.age}` : ''}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 relative">
            <ProfileStat
              label="สูง" value={privacy.showHeight ? profile.height : '•••'}
              unit={privacy.showHeight ? 'ซม.' : ''} hidden={!privacy.showHeight}
            />
            <ProfileStat
              label="หนัก" value={privacy.showWeight ? profile.weight : '•••'}
              unit={privacy.showWeight ? 'กก.' : ''} hidden={!privacy.showWeight}
            />
            <ProfileStat
              label="BMI" value={privacy.showHeight && privacy.showWeight ? bmi : '•••'}
              unit={privacy.showHeight && privacy.showWeight ? bmiCategory(bmi).label : ''}
              hidden={!privacy.showHeight || !privacy.showWeight}
            />
          </div>
        </div>

        {/* Allergies */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-1"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-semibold flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
              <AlertCircle size={16} color={PALETTE.coral} /> สิ่งที่แพ้
            </div>
          </div>
          {privacy.showAllergies ? (
            <>
              <div className="mb-3">
                <div className="font-accent text-xs mb-1.5" style={{ color: PALETTE.muted }}>อาหาร</div>
                {profile.foodAllergy.length === 0 ? (
                  <div className="font-body text-sm" style={{ color: PALETTE.muted }}>ไม่มี</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.foodAllergy.map((a, i) => (
                      <span key={i} className="font-body text-xs px-3 py-1 rounded-lg"
                        style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="font-accent text-xs mb-1.5" style={{ color: PALETTE.muted }}>ยา</div>
                {profile.drugAllergy.length === 0 ? (
                  <div className="font-body text-sm" style={{ color: PALETTE.muted }}>ไม่มี</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.drugAllergy.map((a, i) => (
                      <span key={i} className="font-body text-xs px-3 py-1 rounded-lg"
                        style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 py-3 px-1" style={{ color: PALETTE.muted }}>
              <EyeOff size={16} />
              <div className="font-body text-sm">ซ่อนอยู่ — เปิดในการตั้งค่าด้านล่าง</div>
            </div>
          )}
        </div>

        {/* Theme picker — โหมดสว่าง/มืด */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-1"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="font-display font-semibold mb-1 flex items-center gap-2"
            style={{ color: PALETTE.sageDeep }}
          >
            <Moon size={16} color={PALETTE.gold} /> ธีมหน้าจอ
          </div>
          <p className="font-body text-xs mb-3" style={{ color: PALETTE.muted }}>
            โหมดมืดถนอมสายตาตอนกลางคืน
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'สว่าง', icon: <Sun size={18} /> },
              { id: 'dark', label: 'มืด', icon: <Moon size={18} /> },
              { id: 'auto', label: 'ตามระบบ', icon: <MonitorSmartphone size={18} /> },
            ].map(t => {
              const active = (theme || 'auto') === t.id;
              return (
                <button key={t.id} onClick={() => setTheme?.(t.id)}
                  className="smooth-tap rounded-xl py-3 flex flex-col items-center gap-1.5"
                  style={{
                    backgroundColor: active ? PALETTE.deep : PALETTE.shell,
                    color: active ? 'white' : PALETTE.forest,
                  }}
                >
                  {t.icon}
                  <span className="font-display text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Halal mode */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-1"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="font-display font-semibold flex items-center gap-2" style={{ color: PALETTE.sageDeep }}>
                <span className="text-base">🕌</span> โหมดฮาลาล
              </div>
              <p className="font-body text-xs mt-1 leading-relaxed" style={{ color: PALETTE.muted }}>
                เมื่อเปิด น้องไกด์จะเช็คสถานะฮาลาลของอาหารที่ถ่าย/พิมพ์ชื่อ
                และบอกส่วนผสมที่ต้องระวัง (หมู แอลกอฮอล์ เจลาติน ฯลฯ)
              </p>
            </div>
            <Toggle on={!!halalMode} onChange={() => setHalalMode?.(!halalMode)} />
          </div>
          {halalMode && (
            <div className="mt-3 rounded-xl p-2.5 flex items-start gap-2" style={{ backgroundColor: PALETTE.shell }}>
              <span className="text-xs">ℹ️</span>
              <div className="font-body text-tiny leading-relaxed" style={{ color: PALETTE.sageDark }}>
                เป็นการประเมินเบื้องต้นจากส่วนผสมที่มองเห็นเท่านั้น ไม่ใช่การรับรองฮาลาลอย่างเป็นทางการ —
                หากไม่แน่ใจ ให้ดูตรากลางฮาลาล (กอท.) หรือสอบถามร้านค้า
              </div>
            </div>
          )}
        </div>

        {/* Privacy toggles */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-2"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="font-display font-semibold mb-1 flex items-center gap-2"
            style={{ color: PALETTE.sageDeep }}
          >
            <Shield size={16} color={PALETTE.sage} /> ความเป็นส่วนตัว
          </div>
          <p className="font-body text-xs mb-4" style={{ color: PALETTE.muted }}>
            เลือกสิ่งที่ต้องการให้แสดงในโปรไฟล์
          </p>

          {[
            { key: 'showHeight', label: 'แสดงส่วนสูง', icon: <Activity size={16} /> },
            { key: 'showWeight', label: 'แสดงน้ำหนัก', icon: <Activity size={16} /> },
            { key: 'showAge', label: 'แสดงอายุ', icon: <User size={16} /> },
            { key: 'showAllergies', label: 'แสดงสิ่งที่แพ้', icon: <AlertCircle size={16} /> },
          ].map((row, i) => (
            <div key={row.key}
              className={`flex items-center justify-between py-3 ${i < 3 ? 'border-b' : ''}`}
              style={{ borderColor: PALETTE.mist }}
            >
              <div className="flex items-center gap-3" style={{ color: PALETTE.forest }}>
                <span style={{ color: PALETTE.sage }}>{row.icon}</span>
                <span className="font-body text-sm">{row.label}</span>
              </div>
              <Toggle on={privacy[row.key]}
                onChange={() => setPrivacy({ ...privacy, [row.key]: !privacy[row.key] })} />
            </div>
          ))}
        </div>

        {/* Personality picker */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-2"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="font-display font-semibold mb-1 flex items-center gap-2"
            style={{ color: PALETTE.sageDeep }}
          >
            <Sparkles size={16} color={PALETTE.gold} /> บุคลิกน้องไกด์
          </div>
          <p className="font-body text-xs mb-3" style={{ color: PALETTE.muted }}>
            เลือกบุคลิกที่ถนัด — โหมดอัตโนมัติจะเลือกให้ตามอายุของคุณ
          </p>
          <div className="space-y-2">
            {Object.values(PERSONALITIES).map((p) => {
              const isSelected = (personality || 'auto') === p.id;
              const showResolved = p.id === 'auto' && isSelected;
              const resolved = showResolved ? resolvePersonality('auto', profile.age) : null;
              return (
                <button key={p.id}
                  onClick={() => setPersonality(p.id)}
                  className="smooth-tap w-full text-left rounded-xl p-3 flex items-center gap-3"
                  style={{
                    backgroundColor: isSelected ? PALETTE.deep : PALETTE.shell,
                    color: isSelected ? 'white' : PALETTE.forest,
                  }}
                >
                  <div className="text-2xl flex-shrink-0">{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm flex items-center gap-1.5">
                      {p.label}
                      {showResolved && resolved && (
                        <span className="font-body text-tiny px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
                        >
                          → {resolved.label}
                        </span>
                      )}
                    </div>
                    <div className="font-body text-xs opacity-80 mt-0.5">{p.sub} · {p.desc}</div>
                  </div>
                  {isSelected && <Check size={18} className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory card — น้องไกด์จำสิ่งที่ผู้ใช้แก้ */}
        <div className="rounded-2xl p-4 mb-4 organic-shadow anim-slideUp delay-2"
          style={{ backgroundColor: PALETTE.paper }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-display font-semibold flex items-center gap-2"
              style={{ color: PALETTE.sageDeep }}
            >
              <Sparkles size={16} color={PALETTE.gold} /> น้องไกด์จำที่พี่แก้
            </div>
            {corrections && corrections.length > 0 && (
              <span className="font-display text-tiny font-semibold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: alpha(PALETTE.sage, 15), color: PALETTE.sageDark }}
              >
                {corrections.length} ครั้ง
              </span>
            )}
          </div>
          <p className="font-body text-xs leading-relaxed mb-3" style={{ color: PALETTE.muted }}>
            ทุกครั้งที่คุณแก้ชื่อหรือแคลอาหาร น้องไกด์จะจำไว้และใช้ในครั้งถัดไป
            ให้แม่นยำขึ้นตามสไตล์การกินของคุณ
          </p>
          {corrections && corrections.length > 0 ? (
            <>
              <div className="space-y-1.5 mb-3">
                {corrections.slice(-3).reverse().map((c) => (
                  <div key={c.id} className="rounded-lg p-2 flex items-center gap-2"
                    style={{ backgroundColor: PALETTE.shell }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-xs truncate" style={{ color: PALETTE.muted }}>
                        {c.aiName} <span style={{ color: PALETTE.muted }}>({c.aiCal} kcal)</span>
                      </div>
                      <div className="font-body text-xs font-medium truncate" style={{ color: PALETTE.sageDark }}>
                        → {c.realName} <span style={{ color: PALETTE.sage }}>({c.realCal} kcal)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => exportMemory(corrections)}
                  className="smooth-tap font-body text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: alpha(PALETTE.sage, 15), color: PALETTE.sageDark }}
                >
                  <ExternalLink size={12} /> Export ความจำ
                </button>
                <button onClick={() => importMemoryRef.current?.click()}
                  className="smooth-tap font-body text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: alpha(PALETTE.gold, 15), color: PALETTE.gold }}
                >
                  <Plus size={12} /> Import
                </button>
                <button onClick={() => {
                    if (confirm('ลบประวัติการแก้ไขทั้งหมด? น้องไกด์จะลืมสิ่งที่จำไว้')) clearCorrections?.();
                  }}
                  className="smooth-tap font-body text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: PALETTE.coralSoft, color: PALETTE.coral }}
                >
                  <Trash2 size={12} /> ลบ
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg p-3 text-center mb-3" style={{ backgroundColor: PALETTE.shell }}>
                <div className="font-body text-xs" style={{ color: PALETTE.muted }}>
                  ยังไม่มีการแก้ไข แก้ชื่อ/แคลตอนบันทึกอาหารเพื่อสอนน้องไกด์ได้เลย
                </div>
              </div>
              <button onClick={() => importMemoryRef.current?.click()}
                className="smooth-tap w-full font-body text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
                style={{ backgroundColor: PALETTE.shell, color: PALETTE.sageDark }}
              >
                <Plus size={12} /> Import ความจำจากเพื่อน
              </button>
            </>
          )}
          <input ref={importMemoryRef} type="file" accept=".json,application/json"
            onChange={(e) => handleImportMemory(e, addCorrection, corrections)}
            className="hidden"
          />

          {/* คลังความจำส่วนกลาง — รวมพลังผู้ใช้ทุกคน */}
          <div className="mt-3 pt-3 flex items-center justify-between gap-3"
            style={{ borderTop: `1px solid ${PALETTE.mist}` }}
          >
            <div className="flex-1">
              <div className="font-body text-sm font-medium flex items-center gap-1.5" style={{ color: PALETTE.forest }}>
                🌍 ร่วมคลังความจำส่วนกลาง
              </div>
              <div className="font-body text-tiny mt-0.5 leading-relaxed" style={{ color: PALETTE.muted }}>
                แชร์เฉพาะ "ชื่อเมนู + แคล" ที่คุณแก้ แบบไม่ระบุตัวตน
                เพื่อให้น้องไกด์ของทุกคนทายแม่นขึ้นเรื่อยๆ
              </div>
            </div>
            <Toggle on={shareCommunity !== false}
              onChange={() => setShareCommunity?.(!(shareCommunity !== false))} />
          </div>
        </div>

        {/* Edit profile */}
        <button onClick={() => { setDraft(profile); setEditing(true); }}
          className="smooth-tap w-full py-4 rounded-2xl font-display font-medium mb-3 anim-slideUp delay-3"
          style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
        >
          แก้ไขข้อมูลส่วนตัว
        </button>

        <button onClick={() => { if (confirm('รีเซ็ตข้อมูลทั้งหมด?')) reset(); }}
          className="smooth-tap w-full py-3 rounded-2xl font-body text-sm anim-slideUp delay-4"
          style={{ color: PALETTE.coral }}
        >
          ล้างข้อมูลและเริ่มใหม่
        </button>

        <div className="text-center mt-6 anim-fadeIn">
          <LogoMark size={32} />
          <div className="font-display text-xs mt-2" style={{ color: PALETTE.muted }}>
            GINYARAIDEE · v2.13
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(39,54,31,0.4)' }}
          onClick={() => setEditing(false)}
        >
          <div className="w-full rounded-t-3xl p-6 pb-28 anim-slideUp"
            style={{ backgroundColor: PALETTE.cream, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: PALETTE.mist }} />
            <h3 className="font-display text-xl font-bold mb-4" style={{ color: PALETTE.sageDeep }}>
              แก้ไขข้อมูล
            </h3>

            <div className="space-y-3 mb-5">
              <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                placeholder="ชื่อ"
                className="font-body w-full px-5 py-4 rounded-2xl text-base"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDraft({ ...draft, gender: 'female' })}
                  className="smooth-tap font-display font-medium py-3 rounded-2xl border-2"
                  style={{
                    backgroundColor: draft.gender === 'female' ? PALETTE.sageDark : PALETTE.paper,
                    color: draft.gender === 'female' ? 'white' : PALETTE.forest,
                    borderColor: draft.gender === 'female' ? PALETTE.sageDark : PALETTE.mist,
                  }}>หญิง</button>
                <button onClick={() => setDraft({ ...draft, gender: 'male' })}
                  className="smooth-tap font-display font-medium py-3 rounded-2xl border-2"
                  style={{
                    backgroundColor: draft.gender === 'male' ? PALETTE.sageDark : PALETTE.paper,
                    color: draft.gender === 'male' ? 'white' : PALETTE.forest,
                    borderColor: draft.gender === 'male' ? PALETTE.sageDark : PALETTE.mist,
                  }}>ชาย</button>
              </div>
              <input value={draft.age} onChange={e => setDraft({ ...draft, age: e.target.value })}
                placeholder="อายุ" inputMode="numeric"
                className="font-body w-full px-5 py-4 rounded-2xl text-base"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input value={draft.height} onChange={e => setDraft({ ...draft, height: e.target.value })}
                  placeholder="สูง (ซม.)" inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
                <input value={draft.weight} onChange={e => setDraft({ ...draft, weight: e.target.value })}
                  placeholder="หนัก (กก.)" inputMode="decimal"
                  className="font-body w-full px-5 py-4 rounded-2xl text-base"
                  style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest, border: `1px solid ${PALETTE.mist}` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="smooth-tap flex-1 py-4 rounded-2xl font-display font-medium"
                style={{ backgroundColor: PALETTE.paper, color: PALETTE.forest }}>ยกเลิก</button>
              <button onClick={save}
                className="smooth-tap flex-2 py-4 rounded-2xl font-display font-semibold text-white"
                style={{ backgroundColor: PALETTE.sageDark }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileStat({ label, value, unit, hidden }) {
  return (
    <div className="rounded-2xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
      <div className="font-accent text-tiny mb-1 flex items-center gap-1" style={{ color: PALETTE.gold }}>
        {hidden && <EyeOff size={10} />}{label}
      </div>
      <div className="font-display text-xl font-bold text-white leading-none">{value}</div>
      <div className="font-body text-tiny text-white/60 mt-0.5">{unit}</div>
    </div>
  );
}
