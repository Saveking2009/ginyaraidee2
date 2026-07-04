import React from 'react';

export default function LogoMark({ size = 44 }) {
  return (
    <img
      src="/logo.png"
      alt="GINYARAIDEE"
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'block', objectFit: 'contain' }}
      draggable={false}
    />
  );
}
