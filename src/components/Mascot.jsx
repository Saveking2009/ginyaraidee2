import React from 'react';
import { load } from '../utils';

/* ============================================================
   น้องแกะ 🐑 — มาสคอตประจำแอป (SVG วาดเอง ปรับแต่งได้)
   - เปลี่ยนสีขน / ของประดับ / ตั้งชื่อได้
   - ของบางชิ้นต้องสะสมแต้มภารกิจเพื่อปลดล็อก
   - อารมณ์เปลี่ยนตามความคืบหน้าภารกิจ (sleepy/normal/happy/party)
   ============================================================ */

export const WOOL_COLORS = [
  { id: 'cream', label: 'ครีม', c: '#F7F0DE', unlock: 0 },
  { id: 'pink', label: 'ชมพู', c: '#F6D5DC', unlock: 0 },
  { id: 'sky', label: 'ฟ้า', c: '#CFE3F2', unlock: 100 },
  { id: 'mint', label: 'มินต์', c: '#D3E8CE', unlock: 250 },
  { id: 'lavender', label: 'ม่วง', c: '#E0D4F0', unlock: 450 },
  { id: 'gold', label: 'ทอง', c: '#F0DFA6', unlock: 700 },
  { id: 'night', label: 'ดำ', c: '#6B6B76', unlock: 1000 },
];

export const ACCESSORIES = [
  { id: 'none', label: 'ไม่ใส่', icon: '✨', unlock: 0 },
  { id: 'bow', label: 'โบว์', icon: '🎀', unlock: 0 },
  { id: 'scarf', label: 'ผ้าพันคอ', icon: '🧣', unlock: 100 },
  { id: 'glasses', label: 'แว่นตา', icon: '👓', unlock: 250 },
  { id: 'flower', label: 'ดอกไม้', icon: '🌸', unlock: 450 },
  { id: 'crown', label: 'มงกุฎ', icon: '👑', unlock: 1000 },
];

export const DEFAULT_MASCOT = { wool: 'cream', acc: 'bow', name: 'ปุยฝ้าย' };

export function loadMascot() {
  return { ...DEFAULT_MASCOT, ...load('gyn_mascot', {}) };
}

export function woolColorOf(mascot) {
  return (WOOL_COLORS.find(w => w.id === mascot.wool) || WOOL_COLORS[0]).c;
}

export function Sheep({ wool = '#F7F0DE', accessory = 'none', mood = 'normal', size = 96 }) {
  const face = '#5A5049';
  const woolStroke = 'rgba(46,68,41,0.10)';

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }}>
      {/* ขา */}
      <rect x="42" y="90" width="9" height="20" rx="4.5" fill={face} />
      <rect x="69" y="90" width="9" height="20" rx="4.5" fill={face} />
      <ellipse cx="46.5" cy="110" rx="6" ry="3.5" fill="#3E3833" />
      <ellipse cx="73.5" cy="110" rx="6" ry="3.5" fill="#3E3833" />

      {/* ตัวขนปุย (ก้อนเมฆ) */}
      <g fill={wool} stroke={woolStroke} strokeWidth="1.5">
        <circle cx="34" cy="68" r="17" />
        <circle cx="86" cy="68" r="17" />
        <circle cx="44" cy="54" r="16" />
        <circle cx="76" cy="54" r="16" />
        <circle cx="60" cy="50" r="17" />
        <circle cx="60" cy="72" r="28" />
      </g>

      {/* หู */}
      <ellipse cx="36" cy="36" rx="10" ry="5.5" fill={face} transform="rotate(-28 36 36)" />
      <ellipse cx="84" cy="36" rx="10" ry="5.5" fill={face} transform="rotate(28 84 36)" />
      <ellipse cx="35" cy="36" rx="6" ry="3" fill="#EFB7B7" opacity="0.55" transform="rotate(-28 35 36)" />
      <ellipse cx="85" cy="36" rx="6" ry="3" fill="#EFB7B7" opacity="0.55" transform="rotate(28 85 36)" />

      {/* ปอยขนบนหัว */}
      <g fill={wool} stroke={woolStroke} strokeWidth="1.2">
        <circle cx="52" cy="23" r="8.5" />
        <circle cx="68" cy="23" r="8.5" />
        <circle cx="60" cy="19" r="9" />
      </g>

      {/* หน้า */}
      <ellipse cx="60" cy="40" rx="17" ry="15" fill={face} />

      {/* ตา ตามอารมณ์ */}
      {mood === 'sleepy' ? (
        <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <line x1="49" y1="38" x2="56" y2="38" />
          <line x1="64" y1="38" x2="71" y2="38" />
        </g>
      ) : mood === 'happy' || mood === 'party' ? (
        <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M 49 39 Q 52.5 34.5 56 39" />
          <path d="M 64 39 Q 67.5 34.5 71 39" />
        </g>
      ) : (
        <g>
          <circle cx="52.5" cy="38" r="3.4" fill="#fff" />
          <circle cx="67.5" cy="38" r="3.4" fill="#fff" />
          <circle cx="53.4" cy="38.8" r="1.6" fill="#2B2622" />
          <circle cx="68.4" cy="38.8" r="1.6" fill="#2B2622" />
        </g>
      )}

      {/* แก้ม */}
      <circle cx="47" cy="45" r="3.4" fill="#EFA9A9" opacity="0.75" />
      <circle cx="73" cy="45" r="3.4" fill="#EFA9A9" opacity="0.75" />

      {/* ปาก */}
      {mood === 'party' ? (
        <path d="M 55 47 Q 60 53 65 47 Z" fill="#fff" opacity="0.95" />
      ) : mood === 'happy' ? (
        <path d="M 55.5 47 Q 60 51 64.5 47" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : mood === 'sleepy' ? (
        <ellipse cx="60" cy="48" rx="2.4" ry="1.6" fill="#fff" opacity="0.85" />
      ) : (
        <path d="M 57 47.5 Q 60 49.5 63 47.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}

      {/* zZ ตอนง่วง */}
      {mood === 'sleepy' && (
        <g fill="#8A8676" fontFamily="sans-serif" fontWeight="700">
          <text x="88" y="26" fontSize="11">z</text>
          <text x="96" y="18" fontSize="14">Z</text>
        </g>
      )}

      {/* คอนเฟตติตอนฉลอง */}
      {mood === 'party' && (
        <g>
          <circle cx="20" cy="26" r="2.5" fill="#D9684A" />
          <circle cx="100" cy="22" r="2.5" fill="#87A878" />
          <circle cx="14" cy="52" r="2" fill="#C9A36B" />
          <circle cx="106" cy="50" r="2" fill="#6BA4D9" />
          <rect x="26" y="12" width="4" height="4" rx="1" fill="#C9A36B" transform="rotate(25 28 14)" />
          <rect x="92" y="38" width="4" height="4" rx="1" fill="#D9684A" transform="rotate(-20 94 40)" />
        </g>
      )}

      {/* ===== ของประดับ ===== */}
      {accessory === 'bow' && (
        <g transform="translate(74 16) rotate(18)">
          <path d="M 0 0 L -10 -6 Q -13 0 -10 6 Z" fill="#D9684A" />
          <path d="M 0 0 L 10 -6 Q 13 0 10 6 Z" fill="#D9684A" />
          <circle cx="0" cy="0" r="3.2" fill="#B8453A" />
        </g>
      )}
      {accessory === 'scarf' && (
        <g>
          <path d="M 44 52 Q 60 60 76 52 L 74 59 Q 60 66 46 59 Z" fill="#D9684A" />
          <rect x="66" y="56" width="7" height="16" rx="3" fill="#D9684A" />
          <line x1="67.5" y1="68" x2="67.5" y2="71" stroke="#B8453A" strokeWidth="1.6" />
          <line x1="71" y1="68" x2="71" y2="71" stroke="#B8453A" strokeWidth="1.6" />
        </g>
      )}
      {accessory === 'glasses' && (
        <g stroke="#3E3833" strokeWidth="2" fill="rgba(255,255,255,0.16)">
          <circle cx="52.5" cy="38" r="6.5" />
          <circle cx="67.5" cy="38" r="6.5" />
          <line x1="59" y1="38" x2="61" y2="38" />
        </g>
      )}
      {accessory === 'flower' && (
        <g transform="translate(45 18)">
          {[0, 72, 144, 216, 288].map(a => (
            <ellipse key={a} cx="0" cy="-5" rx="3" ry="4.6" fill="#F2A9BC" transform={`rotate(${a})`} />
          ))}
          <circle cx="0" cy="0" r="2.6" fill="#C9A36B" />
        </g>
      )}
      {accessory === 'crown' && (
        <g transform="translate(60 12)">
          <path d="M -11 4 L -11 -5 L -5.5 0 L 0 -7 L 5.5 0 L 11 -5 L 11 4 Z" fill="#E8C25A" stroke="#C9A36B" strokeWidth="1" />
          <circle cx="-6" cy="2" r="1.3" fill="#D9684A" />
          <circle cx="0" cy="2" r="1.3" fill="#6BA4D9" />
          <circle cx="6" cy="2" r="1.3" fill="#87A878" />
        </g>
      )}
    </svg>
  );
}
