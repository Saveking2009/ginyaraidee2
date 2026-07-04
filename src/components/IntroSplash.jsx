import React, { useEffect, useRef, useState } from 'react';

/* ============================================================
   Intro Splash — วิดีโอเปิดตัวตอนเข้าแอป
   - วิดีโอหลักแสดงเต็มใบตรงกลาง (ไม่ซูมครอป) มุมโค้งสวยๆ
   - พื้นหลังเป็นวิดีโอเดียวกันแบบเบลอ ถมเต็มจอ ไม่มีแถบดำ
   - เล่นอัตโนมัติ จบแล้ว fade เข้าแอป + มีปุ่ม "ข้าม" เสมอ
   - กันค้าง: เล่นไม่ได้/โหลดช้าเกิน 9 วิ → เข้าแอปเอง
   ============================================================ */

export default function IntroSplash({ onDone }) {
  const videoRef = useRef(null);
  const bgRef = useRef(null);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    setTimeout(onDone, 450);
  };

  useEffect(() => {
    const v = videoRef.current;
    // พื้นหลังเบลอ — เล่นได้ก็ดี เล่นไม่ได้ก็ช่าง
    bgRef.current?.play?.()?.catch?.(() => {});

    let retried = false;
    const tryPlay = () => {
      const p = v?.play();
      if (p?.catch) p.catch(() => {
        // เล่นไม่ได้ครั้งแรก (โหลดยังไม่เสร็จ) → ลองอีกครั้ง ก่อนยอมข้าม
        if (!retried) {
          retried = true;
          setTimeout(tryPlay, 500);
        } else {
          finish();
        }
      });
    };
    tryPlay();
    // กันค้าง: เกิน 9 วิ (โหลดช้า/ไฟล์เสีย/autoplay ถูกบล็อก) เข้าแอปเลย
    const t = setTimeout(finish, 9000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#0B1F33',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.45s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {/* พื้นหลัง: วิดีโอเดียวกัน เบลอ+ขยาย ถมเต็มจอ */}
      <video
        ref={bgRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(32px) brightness(0.55)', transform: 'scale(1.2)' }}
      />

      {/* วิดีโอหลัก: การ์ดสี่เหลี่ยมมุมโค้ง เห็นเต็มใบ ไม่โดนครอป */}
      <div className="relative overflow-hidden"
        style={{
          width: 'min(88vw, 72vh)',
          aspectRatio: '1 / 1',
          borderRadius: 28,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}
      >
        <video
          ref={videoRef}
          src="/intro.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={finish}
          onError={finish}
          className="w-full h-full object-cover"
        />
      </div>

      <button onClick={finish}
        className="smooth-tap absolute font-display text-sm font-medium px-5 py-2.5 rounded-full"
        style={{
          bottom: 'max(env(safe-area-inset-bottom), 20px)',
          right: 20,
          backgroundColor: 'rgba(255,255,255,0.15)',
          color: 'white',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
        }}
      >
        ข้าม
      </button>
    </div>
  );
}
