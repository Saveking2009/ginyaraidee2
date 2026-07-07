import React, { useState, useEffect } from 'react';
import { PALETTE, FONT_CSS } from './theme';
import { load, save, calcStreak } from './utils';
import { pushCommunityCorrections } from './api';
import { checkDueReminders } from './notifications';
import IntroSplash from './components/IntroSplash';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import FoodLog from './components/FoodLog';
import MedicineCabinet from './components/MedicineCabinet';
import ChatScreen from './components/ChatScreen';
import MentalHealth from './components/MentalHealth';
import Profile from './components/Profile';
import HealthHub from './components/HealthHub';
import Reminders from './components/Reminders';
import DailyTasks from './components/DailyTasks';
import PrintModal from './components/PrintModal';
import { BottomNav, QuickRecordSheet, MoreMenu, UpdateBanner } from './components/Nav';

/* ============================================================
   GINYARAIDEE — Root App
   หน้าที่: เก็บ state กลาง + persist ลง localStorage + สลับหน้า
   (โค้ดแต่ละหน้าอยู่ใน src/components/)
   ============================================================ */

const STORAGE_KEYS = [
  'gyn_profile', 'gyn_foodlog', 'gyn_chat', 'gyn_meds', 'gyn_privacy', 'gyn_persona',
  'gyn_water', 'gyn_exercises', 'gyn_sleep', 'gyn_vitals', 'gyn_news', 'gyn_corrections',
  'gyn_weights', 'gyn_voice', 'gyn_points', 'gyn_tasks', 'gyn_mascot', 'gyn_theme',
  'gyn_share', 'gyn_community', 'gyn_reminders', 'gyn_reminder_fired', 'gyn_tts_notice_off',
  'gyn_game_best', 'gyn_game_plays', // เผื่อค้างจากเวอร์ชันเก่า
];

const DEFAULT_REMINDERS = [
  { id: 'r-breakfast', time: '08:00', label: 'อย่าลืมถ่ายรูปมื้อเช้านะ 📸', enabled: true },
  { id: 'r-lunch', time: '12:30', label: 'มื้อเที่ยงแล้ว ถ่ายรูปก่อนกิน! 🍽️', enabled: true },
  { id: 'r-dinner', time: '18:30', label: 'มื้อเย็นวันนี้กินอะไร ถ่ายให้น้องไกด์ดูหน่อย 🌙', enabled: true },
];

// พื้นหลังเคลื่อนไหว — ก้อนสีเบลอลอยช้าๆ อยู่หลังเนื้อหาทั้งหมด
function AmbientBackground() {
  const blobs = [
    { size: 340, left: '-90px', top: '-60px', color: '135, 168, 120', anim: 'drift1 18s ease-in-out infinite alternate' },
    { size: 300, right: '-110px', top: '30%', color: '201, 163, 107', anim: 'drift2 24s ease-in-out infinite alternate' },
    { size: 280, left: '-70px', bottom: '-80px', color: '217, 104, 74', anim: 'drift3 21s ease-in-out infinite alternate' },
  ];
  return (
    <div aria-hidden="true">
      {blobs.map((b, i) => (
        <div key={i} className="ambient-blob"
          style={{
            width: b.size, height: b.size,
            left: b.left, right: b.right, top: b.top, bottom: b.bottom,
            background: `radial-gradient(circle, rgba(${b.color}, calc(var(--blob-a) * 0.5)), transparent 70%)`,
            animation: b.anim,
          }}
        />
      ))}
    </div>
  );
}

const DEFAULT_PRIVACY = { showHeight: true, showWeight: true, showAge: true, showAllergies: false };

export default function App() {
  const [profile, _setProfile] = useState(() => load('gyn_profile', null));
  const [screen, setScreen] = useState('home');
  const [healthTab, setHealthTab] = useState(null); // แท็บที่เลือกจากปุ่ม + ตรงกลาง
  const [foodLog, _setFoodLog] = useState(() => load('gyn_foodlog', []));
  const [chatMessages, _setChat] = useState(() => load('gyn_chat', []));
  const [medicines, _setMeds] = useState(() => load('gyn_meds', []));
  const [personality, _setPersonality] = useState(() => load('gyn_persona', 'auto'));
  const [water, _setWater] = useState(() => load('gyn_water', []));
  const [exercises, _setExercises] = useState(() => load('gyn_exercises', []));
  const [sleep, _setSleep] = useState(() => load('gyn_sleep', []));
  const [vitals, _setVitals] = useState(() => load('gyn_vitals', []));
  const [corrections, _setCorrections] = useState(() => load('gyn_corrections', []));
  const [weights, _setWeights] = useState(() => load('gyn_weights', []));
  const [modalOpen, setModalOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [privacy, _setPrivacy] = useState(() => load('gyn_privacy', DEFAULT_PRIVACY));
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showIntro, setShowIntro] = useState(true); // วิดีโอเปิดตัว
  const [themeMode, _setThemeMode] = useState(() => load('gyn_theme', 'auto')); // light | dark | auto
  const [shareCommunity, _setShare] = useState(() => load('gyn_share', true)); // แชร์การแก้แคลเข้าคลังกลาง
  const [reminders, _setReminders] = useState(() => load('gyn_reminders', DEFAULT_REMINDERS));

  // Persist helper — รองรับทั้งค่าใหม่ตรงๆ และ function(prev) เพื่อกัน state ค้าง
  // (เช่นตอน import ความจำหลายรายการติดกัน)
  const makeSetter = (key, _set, transform) => (v) => {
    _set(prev => {
      let next = typeof v === 'function' ? v(prev) : v;
      if (transform) next = transform(next);
      save(key, next);
      return next;
    });
  };

  const setProfile = makeSetter('gyn_profile', _setProfile);
  const setFoodLog = makeSetter('gyn_foodlog', _setFoodLog);
  const setChatMessages = makeSetter('gyn_chat', _setChat);
  const setMedicines = makeSetter('gyn_meds', _setMeds);
  const setPrivacy = makeSetter('gyn_privacy', _setPrivacy);
  const setPersonality = makeSetter('gyn_persona', _setPersonality);
  const setWater = makeSetter('gyn_water', _setWater);
  const setExercises = makeSetter('gyn_exercises', _setExercises);
  const setSleep = makeSetter('gyn_sleep', _setSleep);
  const setVitals = makeSetter('gyn_vitals', _setVitals);
  // เก็บการแก้ไขล่าสุด 50 รายการพอ — กัน localStorage บวม
  const setCorrections = makeSetter('gyn_corrections', _setCorrections, (v) => v.slice(-50));
  const setWeights = makeSetter('gyn_weights', _setWeights);
  const setThemeMode = (v) => { _setThemeMode(v); save('gyn_theme', v); };
  const setShareCommunity = (v) => { _setShare(v); save('gyn_share', v); };
  const setReminders = makeSetter('gyn_reminders', _setReminders);

  // ตัวจับเวลาแจ้งเตือน — เช็คทุก 20 วิ ว่าถึงเวลาเตือนรายการไหน
  useEffect(() => {
    checkDueReminders(reminders);
    const id = setInterval(() => checkDueReminders(reminders), 20000);
    return () => clearInterval(id);
  }, [reminders]);

  // บันทึกการแก้ไขของผู้ใช้ + ส่งเข้าคลังกลางแบบไม่ระบุตัวตน (เฉพาะชื่อเมนู+แคล)
  const addCorrection = (c) => {
    setCorrections(prev => [...prev, c]);
    if (shareCommunity && !c.imported && c.realName && c.realCal > 0) {
      pushCommunityCorrections([{ realName: c.realName, realCal: c.realCal }]);
    }
  };

  // สลับธีมสว่าง/มืด — 'auto' ตามการตั้งค่าเครื่อง
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = themeMode === 'dark' || (themeMode === 'auto' && mq.matches);
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    };
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, [themeMode]);

  // streak = จำนวนวันที่บันทึกอะไรก็ได้ติดต่อกัน
  const streak = calcStreak(foodLog, water, exercises, sleep, vitals, weights);

  // Check for new version on load and every 5 minutes
  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        // Cache-bust so we always get fresh version.json
        const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const info = await res.json();
        if (cancelled || !info?.version) return;

        const seen = localStorage.getItem('gyn_seen_version');
        if (seen !== info.version) {
          setUpdateInfo(info);
        }
      } catch {}
    };

    checkVersion();
    const id = setInterval(checkVersion, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const acceptUpdate = () => {
    if (updateInfo) localStorage.setItem('gyn_seen_version', updateInfo.version);
    // Clear caches + reload to get fresh app
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .finally(() => window.location.reload());
    } else {
      window.location.reload();
    }
  };
  const dismissUpdate = () => {
    if (updateInfo) localStorage.setItem('gyn_seen_version', updateInfo.version);
    setUpdateInfo(null);
  };

  useEffect(() => {
    document.body.style.backgroundColor = PALETTE.cream;
    document.body.style.fontFamily = "'IBM Plex Sans Thai Looped', sans-serif";
  }, []);

  // วิดีโอเปิดตัว — เล่นก่อนเข้าแอปทุกครั้ง (ข้ามได้)
  if (showIntro) {
    return (
      <>
        <style>{FONT_CSS}</style>
        <IntroSplash onDone={() => setShowIntro(false)} />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <style>{FONT_CSS}</style>
        <div className="font-body" style={{ color: PALETTE.forest }}>
          <Onboarding onDone={setProfile} />
        </div>
      </>
    );
  }

  const reset = () => {
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    _setProfile(null); _setFoodLog([]); _setChat([]); _setMeds([]);
    _setWater([]); _setExercises([]); _setSleep([]); _setVitals([]); _setCorrections([]); _setWeights([]);
    _setPrivacy(DEFAULT_PRIVACY);
    _setPersonality('auto');
    _setThemeMode('auto');
    setScreen('home');
  };

  // ปุ่ม + ตรงกลาง — พาไปหน้าที่เลือก พร้อมเปิดแท็บให้ถูก
  const handleQuickChoose = (id) => {
    if (id === 'food') setScreen('food');
    else if (id === 'medicine') setScreen('medicine');
    else if (['water', 'exercise', 'sleep', 'vitals'].includes(id)) {
      setHealthTab(id);
      setScreen('health');
    }
  };

  return (
    <>
      <style>{FONT_CSS}</style>
      <div className="font-body min-h-screen relative grain-bg"
        style={{ backgroundColor: PALETTE.cream, color: PALETTE.forest }}
      >
        <AmbientBackground />
        <div className="max-w-md mx-auto relative z-10">
          {screen === 'home' && (
            <Dashboard profile={profile} foodLog={foodLog} goto={setScreen}
              personality={personality} streak={streak} />
          )}
          {screen === 'health' && (
            <HealthHub profile={profile}
              initialTab={healthTab}
              water={water}
              addWater={(w) => setWater(prev => [...prev, w])}
              removeWater={(id) => setWater(prev => prev.filter(x => x.id !== id))}
              sleep={sleep}
              addSleep={(s) => setSleep(prev => [...prev, s])}
              removeSleep={(id) => setSleep(prev => prev.filter(x => x.id !== id))}
              exercises={exercises}
              addExercise={(e) => setExercises(prev => [...prev, e])}
              removeExercise={(id) => setExercises(prev => prev.filter(x => x.id !== id))}
              vitals={vitals}
              addVital={(v) => setVitals(prev => [...prev, v])}
              removeVital={(id) => setVitals(prev => prev.filter(x => x.id !== id))}
              weights={weights}
              addWeight={(w) => setWeights(prev => [...prev, w])}
              removeWeight={(id) => setWeights(prev => prev.filter(x => x.id !== id))}
            />
          )}
          {screen === 'food' && (
            <FoodLog profile={profile} foodLog={foodLog}
              addFood={(f) => setFoodLog(prev => [...prev, f])}
              removeFood={(id) => setFoodLog(prev => prev.filter(x => x.id !== id))}
              editFood={(id, patch) => setFoodLog(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x))}
              corrections={corrections}
              addCorrection={addCorrection}
            />
          )}
          {screen === 'chat' && (
            <ChatScreen profile={profile} messages={chatMessages}
              addMessage={(m) => setChatMessages(prev => [...prev, m])}
              clearMessages={() => setChatMessages([])}
              personality={personality}
            />
          )}
          {screen === 'tasks' && (
            <DailyTasks profile={profile} foodLog={foodLog} water={water}
              exercises={exercises} sleep={sleep} weights={weights}
              streak={streak} goto={setScreen}
              openHealth={(tab) => { setHealthTab(tab); setScreen('health'); }}
            />
          )}
          {screen === 'more' && <MoreMenu goto={setScreen} openPrintModal={() => setPrintOpen(true)} />}
          {screen === 'medicine' && (
            <MedicineCabinet medicines={medicines}
              onModalChange={setModalOpen}
              addMedicine={(m) => setMedicines(prev => [...prev, m])}
              removeMedicine={(id) => setMedicines(prev => prev.filter(x => x.id !== id))}
            />
          )}
          {screen === 'mental' && <MentalHealth profile={profile} />}
          {screen === 'reminders' && <Reminders reminders={reminders} setReminders={setReminders} />}
          {screen === 'profile' && (
            <Profile profile={profile} privacy={privacy} setPrivacy={setPrivacy}
              setProfile={setProfile} reset={reset} onModalChange={setModalOpen}
              personality={personality} setPersonality={setPersonality}
              corrections={corrections}
              clearCorrections={() => setCorrections([])}
              addCorrection={addCorrection}
              theme={themeMode} setTheme={setThemeMode}
              shareCommunity={shareCommunity} setShareCommunity={setShareCommunity}
            />
          )}
        </div>

        {!modalOpen && (
          <BottomNav
            current={screen}
            onNav={(k) => { setHealthTab(null); setScreen(k); }}
            onCenterTap={() => setQuickOpen(true)}
          />
        )}

        <QuickRecordSheet
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
          onChoose={handleQuickChoose}
        />

        <PrintModal
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          profile={profile}
          foodLog={foodLog}
          medicines={medicines}
          water={water}
          exercises={exercises}
          sleep={sleep}
          vitals={vitals}
        />

        {updateInfo && (
          <UpdateBanner info={updateInfo} onUpdate={acceptUpdate} onDismiss={dismissUpdate} />
        )}
      </div>
    </>
  );
}
