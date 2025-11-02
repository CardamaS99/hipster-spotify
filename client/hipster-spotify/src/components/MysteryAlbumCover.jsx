import React from 'react';

export default function MysteryAlbumCover() {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 320 320" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f093fb', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="questionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.95 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.7 }} />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <radialGradient id="shine" cx="30%" cy="30%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Background */}
      <circle cx="160" cy="160" r="160" fill="url(#bgGradient)" />
      
      {/* Shine effect */}
      <circle cx="160" cy="160" r="160" fill="url(#shine)" />
      
      {/* Decorative circles */}
      <circle cx="80" cy="80" r="8" fill="rgba(255,255,255,0.1)" />
      <circle cx="240" cy="90" r="6" fill="rgba(255,255,255,0.15)" />
      <circle cx="70" cy="250" r="10" fill="rgba(255,255,255,0.1)" />
      <circle cx="250" cy="240" r="7" fill="rgba(255,255,255,0.12)" />
      
      {/* Musical notes decoration */}
      <g opacity="0.15" fill="white">
        <path d="M 60 140 Q 65 135, 70 140 L 70 170 Q 70 180, 60 180 Q 50 180, 50 170 L 50 145 Q 50 140, 60 140 Z" />
        <circle cx="70" cy="140" r="3" />
        
        <path d="M 250 180 Q 255 175, 260 180 L 260 210 Q 260 220, 250 220 Q 240 220, 240 210 L 240 185 Q 240 180, 250 180 Z" />
        <circle cx="260" cy="180" r="3" />
      </g>

      {/* Question mark */}
      <g filter="url(#glow)">
        <path
          d="M 160 80
             Q 200 80, 200 110
             Q 200 130, 180 140
             L 170 150
             Q 165 155, 165 165
             L 165 175"
          stroke="url(#questionGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="165" cy="200" r="10" fill="url(#questionGradient)" />
      </g>

      {/* Inner shadow effect */}
      <circle 
        cx="160" 
        cy="160" 
        r="158" 
        fill="none" 
        stroke="rgba(0,0,0,0.1)" 
        strokeWidth="4" 
      />
    </svg>
  );
}
