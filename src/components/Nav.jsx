import React from 'react';
import {
  Home, Activity, MessageCircle, MoreHorizontal, Plus, X,
  UtensilsCrossed, GlassWater, Dumbbell, Moon, Stethoscope, Pill,
  Brain, Printer, User, ChevronRight, Shield, Sparkles, RotateCcw, ListChecks, Bell,
} from 'lucide-react';
import { PALETTE, alpha } from '../theme';

/* ============================================================
   Quick Record Sheet (center + button)
   ============================================================ */

export function QuickRecordSheet({ open, onClose, onChoose }) {
  if (!open) return null;
  const items = [
    { id: 'food', icon: UtensilsCrossed, label: 'อาหาร', desc: 'ถ่ายและบันทึกแคล', tone: PALETTE.sage },
    { id: 'water', icon: GlassWater, label: 'น้ำดื่ม', desc: 'บันทึกน้ำวันนี้', tone: '#6BA4D9' },
    { id: 'exercise', icon: Dumbbell, label: 'ออกกำลังกาย', desc: 'บันทึกการเผาผลาญ', tone: PALETTE.coral },
    { id: 'sleep', icon: Moon, label: 'การนอน', desc: 'เข้านอน/ตื่น', tone: '#6F58B8' },
    { id: 'vitals', icon: Stethoscope, label: 'ความดัน/น้ำตาล', desc: 'สัญญาณชีพ', tone: PALETTE.gold },
    { id: 'medicine', icon: Pill, label: 'เพิ่มยา', desc: 'ถ่ายฉลากหรือพิมพ์', tone: PALETTE.sageDark },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end anim-fadeIn"
      style={{ backgroundColor: 'rgba(39,54,31,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full rounded-t-3xl p-6 pb-8 deep-shadow anim-slideUp"
        style={{ backgroundColor: PALETTE.cream }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: PALETTE.mist }} />
        <div className="font-display text-lg font-bold mb-1 text-center" style={{ color: PALETTE.sageDeep }}>
          วันนี้อยากบันทึกอะไร?
        </div>
        <p className="font-body text-xs text-center mb-5" style={{ color: PALETTE.muted }}>
          เลือกสิ่งที่อยากบันทึก
        </p>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it) => {
            const I = it.icon;
            return (
              <button key={it.id} onClick={() => { onClose(); onChoose(it.id); }}
                className="smooth-tap rounded-2xl p-3 flex flex-col items-center text-center"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: alpha(it.tone, 15), color: it.tone }}
                >
                  <I size={20} />
                </div>
                <div className="font-display font-semibold text-tiny" style={{ color: PALETTE.forest }}>
                  {it.label}
                </div>
                <div className="font-body text-tiny mt-0.5 leading-tight" style={{ color: PALETTE.muted }}>
                  {it.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   More menu — รวมเมนูที่ไม่ได้ใช้บ่อย
   ============================================================ */

export function MoreMenu({ goto, openPrintModal }) {
  const items = [
    { id: 'tasks', icon: ListChecks, label: 'ภารกิจประจำวัน', desc: 'ทำภารกิจ สะสมแต้ม แต่งตัวน้องแกะ 🐑', tone: PALETTE.coral },
    { id: 'reminders', icon: Bell, label: 'แจ้งเตือน', desc: 'ตั้งเวลาเตือนถ่ายรูปข้าว ดื่มน้ำ', tone: '#6BA4D9' },
    { id: 'medicine', icon: Pill, label: 'ตู้ยา', desc: 'จัดการยาและฉลาก', tone: PALETTE.gold },
    { id: 'mental', icon: Brain, label: 'เช็คใจ', desc: 'คัดกรองสุขภาพจิต', tone: PALETTE.sageDark },
    { id: 'print', icon: Printer, label: 'พิมพ์รายงาน', desc: 'ส่งให้แพทย์ หรือบันทึก PDF', tone: PALETTE.sage, isPrint: true },
    { id: 'profile', icon: User, label: 'โปรไฟล์', desc: 'ข้อมูลส่วนตัว · ความเป็นส่วนตัว · บุคลิกน้องไกด์', tone: PALETTE.coral },
  ];
  return (
    <div className="pb-32 anim-fadeIn">
      <div className="px-5 pt-6">
        <div className="font-accent text-sm mb-1" style={{ color: PALETTE.gold }}>MORE</div>
        <h1 className="font-display text-3xl font-bold mb-5" style={{ color: PALETTE.sageDeep }}>
          เพิ่มเติม
        </h1>

        <div className="space-y-3">
          {items.map((it) => {
            const I = it.icon;
            return (
              <button key={it.id}
                onClick={() => it.isPrint ? openPrintModal() : goto(it.id)}
                className="smooth-tap w-full rounded-2xl p-4 flex items-center gap-4 organic-shadow text-left"
                style={{ backgroundColor: PALETTE.paper }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: alpha(it.tone, 15), color: it.tone }}
                >
                  <I size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold" style={{ color: PALETTE.forest }}>
                    {it.label}
                  </div>
                  <div className="font-body text-xs mt-0.5" style={{ color: PALETTE.muted }}>
                    {it.desc}
                  </div>
                </div>
                <ChevronRight size={18} color={PALETTE.muted} />
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl p-3 flex items-start gap-2"
          style={{ backgroundColor: PALETTE.shell }}
        >
          <Shield size={14} color={PALETTE.sageDark} className="flex-shrink-0 mt-0.5" />
          <p className="font-body text-tiny leading-relaxed" style={{ color: PALETTE.sageDark }}>
            ข้อมูลของคุณเก็บไว้ในอุปกรณ์เท่านั้น ไม่ได้ส่งไปไหน คำแนะนำในแอปเป็นเพียงข้อมูลเบื้องต้น
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Bottom Nav with center + button
   ============================================================ */

export function BottomNav({ current, onNav, onCenterTap }) {
  const left = [
    { key: 'home', icon: Home, label: 'หน้าหลัก' },
    { key: 'health', icon: Activity, label: 'สุขภาพ' },
  ];
  const right = [
    { key: 'chat', icon: MessageCircle, label: 'น้องไกด์' },
    { key: 'more', icon: MoreHorizontal, label: 'เพิ่มเติม' },
  ];

  const Tab = ({ k, I, label }) => {
    const active = current === k;
    return (
      <button onClick={() => onNav(k)}
        className="smooth-tap flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl relative"
        style={{ color: active ? PALETTE.sageDeep : PALETTE.muted }}
      >
        {active && (
          <div className="absolute inset-x-2 inset-y-0 rounded-2xl anim-fadeIn"
            style={{ backgroundColor: PALETTE.shell }} />
        )}
        <I size={20} className="relative" />
        <span className="font-accent text-tiny relative">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: `linear-gradient(180deg, transparent 0%, ${PALETTE.cream} 30%)` }}
    >
      <div className="max-w-md mx-auto px-4 pb-4 pt-3 relative">
        <div className="rounded-3xl deep-shadow flex items-center px-2 py-2 relative"
          style={{ backgroundColor: PALETTE.paper, border: `1px solid ${PALETTE.mist}` }}
        >
          {left.map(({ key, icon, label }) => <Tab key={key} k={key} I={icon} label={label} />)}

          {/* Spacer for the floating + button */}
          <div style={{ width: 64 }} />

          {right.map(({ key, icon, label }) => <Tab key={key} k={key} I={icon} label={label} />)}
        </div>

        {/* Floating center + button */}
        <button onClick={onCenterTap}
          className="smooth-tap absolute left-1/2 -translate-x-1/2 -top-2 w-16 h-16 rounded-full flex items-center justify-center deep-shadow anim-pulseGlow"
          style={{
            backgroundColor: PALETTE.deep,
            color: 'white',
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(201,163,107,0.4), transparent 60%)',
          }}
          aria-label="บันทึก"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Update Notification
   ============================================================ */

export function UpdateBanner({ info, onUpdate, onDismiss }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 pt-3 pointer-events-none"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
    >
      <div className="max-w-md mx-auto rounded-2xl p-4 deep-shadow anim-slideUp pointer-events-auto relative overflow-hidden"
        style={{ backgroundColor: PALETTE.deep }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: PALETTE.gold }}
        />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Sparkles size={20} color={PALETTE.gold} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-accent text-tiny mb-0.5" style={{ color: PALETTE.gold }}>
              v{info.version} · อัปเดตใหม่
            </div>
            <div className="font-display font-bold text-white text-sm mb-1.5">
              {info.title}
            </div>
            {info.notes && info.notes.length > 0 && (
              <ul className="space-y-0.5 mb-3">
                {info.notes.slice(0, 4).map((n, i) => (
                  <li key={i} className="font-body text-xs text-white/80">{n}</li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <button onClick={onDismiss}
                className="smooth-tap font-display text-xs px-3 py-1.5 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }}
              >
                ภายหลัง
              </button>
              <button onClick={onUpdate}
                className="smooth-tap font-display font-semibold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1"
                style={{ backgroundColor: PALETTE.gold, color: PALETTE.deep }}
              >
                <RotateCcw size={12} /> อัปเดตเลย
              </button>
            </div>
          </div>
          <button onClick={onDismiss}
            className="smooth-tap w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
