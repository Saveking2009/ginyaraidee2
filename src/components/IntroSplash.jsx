import React, { useEffect, useRef, useState } from 'react';
import { PALETTE } from '../theme';

/* ============================================================
   Intro Splash — วิดีโอเปิดตัวตอนเข้าแอป
   - เล่นอัตโนมัติ (mute ตามกติกา browser) จบแล้ว fade เข้าแอป
   - มีปุ่ม "ข้าม" เสมอ + กันค้าง: ถ้าวิดีโอโหลด/เล่นไม่ได้ ข้ามให้เอง
   ============================================================ */

export default function IntroSplash({ onDone }) {
  const videoRef = useRef(null);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: '#0B1F33',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.45s ease',
        pointerEvents: fading ? 'none' : 'auto',
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
