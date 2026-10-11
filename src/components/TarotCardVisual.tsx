'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '@/data/tarot-cards';

export interface TarotCardVisualProps {
  card?: TarotCard;
  reversed?: boolean;
  isFlipped: boolean;
  onFlip?: () => void;
  positionLabel?: string;
  positionIndex?: number;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  disabled?: boolean;
  fanBadgeNumber?: number;
  className?: string;
}

export function TarotCardVisual({
  card,
  reversed = false,
  isFlipped,
  onFlip,
  positionLabel,
  positionIndex,
  size = 'md',
  selected = false,
  disabled = false,
  fanBadgeNumber,
  className = '',
}: TarotCardVisualProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-40 sm:w-28 sm:h-44',
    md: 'w-44 h-72 sm:w-48 sm:h-80',
    lg: 'w-56 h-[22rem] sm:w-64 sm:h-[25rem]',
  }[size];

  const primaryAccent = card?.palette.primary || '#D4AF37';
  const secondaryAccent = card?.palette.secondary || '#F3E5AB';

  return (
    <div
      className={`perspective-1000 select-none ${sizeClasses} ${className}`}
      onClick={() => {
        if (!disabled && onFlip) {
          onFlip();
        }
      }}
    >
      <motion.div
        className={`relative w-full h-full preserve-3d transition-shadow duration-300 rounded-2xl ${
          onFlip && !disabled ? 'cursor-pointer' : ''
        }`}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: selected ? 1.04 : 1,
        }}
        whileHover={
          !disabled && onFlip
            ? { y: -6, scale: selected ? 1.06 : 1.03 }
            : undefined
        }
        whileTap={!disabled && onFlip ? { scale: 0.97 } : undefined}
        transition={{
          duration: 0.65,
          type: 'spring',
          stiffness: 120,
          damping: 18,
        }}
      >
        {/* ================= CARD BACK ================= */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden p-2 transition-all duration-300 ${
            selected
              ? 'bg-gradient-to-b from-[#2A1B2E] via-[#171124] to-[#0D0A14] border-2 border-[#F3E5AB] shadow-[0_0_32px_rgba(212,175,55,0.55)]'
              : 'bg-gradient-to-b from-[#1B1326] via-[#120E1C] to-[#0A0810] border border-[#D4AF37]/45 shadow-[0_12px_30px_rgba(0,0,0,0.75)] hover:border-[#F3E5AB]/80'
          }`}
        >
          {/* Inner Filigree Frame */}
          <div className="relative w-full h-full rounded-xl border border-[#D4AF37]/35 flex flex-col items-center justify-between p-2.5 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.14)_0%,transparent_72%)]">
            {/* Corner Celestial Ornaments */}
            <div className="w-full flex items-center justify-between text-[#D4AF37]/70 text-[10px] leading-none">
              <span>✦</span>
              <span className="tracking-[0.2em] uppercase text-[8px] font-medium text-[#F3E5AB]/60">
                {positionIndex !== undefined ? `VỊ TRÍ 0${positionIndex + 1}` : 'ARCANA'}
              </span>
              <span>✦</span>
            </div>

            {/* Sacred Geometry SVG Centerpiece */}
            <div className="relative flex items-center justify-center w-full my-auto">
              <svg
                viewBox="0 0 120 120"
                className={`w-4/5 h-4/5 max-w-[116px] max-h-[116px] ${
                  selected ? 'text-[#F3E5AB]' : 'text-[#D4AF37]/75'
                }`}
                fill="none"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.55"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  opacity="0.8"
                />
                {/* 8-point Star / Octagram */}
                <rect
                  x="30"
                  y="30"
                  width="60"
                  height="60"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <rect
                  x="30"
                  y="30"
                  width="60"
                  height="60"
                  transform="rotate(45 60 60)"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="rgba(212, 175, 55, 0.08)"
                />
                <path
                  d="M60 36 L65 55 L84 60 L65 65 L60 84 L55 65 L36 60 L55 55 Z"
                  fill="currentColor"
                  fillOpacity="0.28"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <circle cx="60" cy="60" r="3.5" fill="currentColor" />
              </svg>

              {fanBadgeNumber !== undefined && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-2.5 py-1 rounded-full bg-[#09080D]/90 border border-[#F3E5AB] text-[#F3E5AB] text-xs font-bold shadow-lg">
                    #{fanBadgeNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Label or Call to Flip */}
            <div className="w-full flex items-center justify-between text-[#D4AF37]/70 text-[10px] leading-none">
              <span>✦</span>
              <span className="text-[9px] text-[#F3E5AB]/80 font-medium truncate max-w-[80%] text-center">
                {positionLabel ? positionLabel : 'Chạm để mở'}
              </span>
              <span>✦</span>
            </div>
          </div>
        </div>

        {/* ================= CARD FRONT (180deg) ================= */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden p-2 bg-gradient-to-b from-[#1B162A] via-[#120F1D] to-[#09080D] border-2 border-[#D4AF37] shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
          style={{
            boxShadow: `0 12px 36px -6px ${card?.palette.glow || 'rgba(212, 175, 55, 0.3)'}`,
          }}
        >
          {card ? (
            <div className="relative w-full h-full rounded-xl border border-[#F3E5AB]/35 flex flex-col justify-between overflow-hidden bg-[#0E0B16]">
              {/* Top Roman Numeral & Orientation Header */}
              <div className="relative z-20 flex items-center justify-between px-2.5 py-1.5 bg-[#09080D]/90 border-b border-[#D4AF37]/30">
                <span className="font-display text-xs sm:text-sm font-bold tracking-widest text-[#F3E5AB]">
                  {card.roman}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide border ${
                    reversed
                      ? 'bg-rose-950/85 text-amber-200 border-amber-400/50'
                      : 'bg-emerald-950/75 text-emerald-200 border-emerald-400/40'
                  }`}
                >
                  {reversed ? 'LÁ BÀI NGƯỢC ↺' : 'CHIỀU XUÔI ↑'}
                </span>
              </div>

              {/* Artwork Viewport (Rotates 180deg when reversed) */}
              <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[#141020]">
                {/* Ornate SVG/Glyph Fallback Layer (always rendered underneath or when offline) */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center p-3 text-center transition-opacity duration-500 ${
                    imgLoaded && !imgError ? 'opacity-20' : 'opacity-100'
                  }`}
                  style={{
                    background: `radial-gradient(circle at 50% 45%, ${card.palette.glow} 0%, rgba(14,11,22,0.96) 78%)`,
                    transform: reversed ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border flex items-center justify-center mb-2 shadow-inner"
                    style={{
                      borderColor: primaryAccent,
                      backgroundColor: 'rgba(9, 8, 13, 0.65)',
                    }}
                  >
                    <span
                      className="text-3xl sm:text-4xl"
                      style={{ color: secondaryAccent }}
                    >
                      {card.symbol_glyph}
                    </span>
                  </div>
                  <span className="font-display text-xs tracking-[0.2em] uppercase text-[#F3E5AB]/80">
                    Major Arcana • {card.roman}
                  </span>
                </div>

                {/* 1909 Rider-Waite-Smith Public Domain Image */}
                {!imgError && (
                  <img
                    src={card.rws_image_url}
                    alt={`${card.name_vi} (${card.name_en})`}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    className={`relative z-10 w-full h-full object-cover transition-all duration-500 ${
                      imgLoaded ? 'opacity-95' : 'opacity-0'
                    }`}
                    style={{
                      transform: reversed ? 'rotate(180deg)' : 'none',
                    }}
                  />
                )}

                {/* Subtle Antique Gold Vignette Overlay */}
                <div className="pointer-events-none absolute inset-0 z-15 shadow-[inset_0_0_24px_rgba(9,8,13,0.75)]" />
              </div>

              {/* Bottom Title Banner */}
              <div className="relative z-20 px-2.5 py-2 bg-gradient-to-t from-[#09080D] via-[#09080D]/95 to-[#12101B]/90 border-t border-[#D4AF37]/35 text-center">
                {positionLabel && (
                  <p className="text-[9px] uppercase tracking-wider text-[#D4AF37] truncate mb-0.5">
                    {positionLabel}
                  </p>
                )}
                <h4 className="font-display text-sm sm:text-base font-bold text-[#F8F5F0] leading-tight truncate">
                  {card.name_vi}
                </h4>
                <p className="text-[10px] text-[#A39BB5] truncate">
                  {card.name_en}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#A39BB5]">
              Đang kết nối lá bài...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
