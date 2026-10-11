'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, PhoneCall, ShieldCheck, ArrowLeft } from 'lucide-react';
import type { CrisisSupportData } from '@/lib/safety';

export interface CrisisSupportViewProps {
  crisisSupport: CrisisSupportData;
  onReturnHome: () => void;
}

export function CrisisSupportView({
  crisisSupport,
  onReturnHome,
}: CrisisSupportViewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12"
      aria-live="assertive"
    >
      <div className="rounded-3xl bg-gradient-to-b from-[#131D24] via-[#111622] to-[#0B0E17] border border-emerald-400/35 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        {/* Calming Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 text-xs font-medium mb-5">
          <HeartHandshake className="w-4 h-4 text-emerald-300" />
          <span>Không gian An toàn & Lắng nghe • Bảo mật tuyệt đối</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F8F5F0] leading-snug mb-4">
          {crisisSupport.title}
        </h1>

        {/* Empathetic Message */}
        <p className="text-sm sm:text-base text-[#E2E8F0] leading-relaxed mb-4">
          {crisisSupport.empatheticMessage}
        </p>

        <p className="text-sm text-[#A39BB5] leading-relaxed mb-6">
          {crisisSupport.secondaryMessage}
        </p>

        {/* One-tap Hotline Cards */}
        <div className="space-y-3.5 mb-8">
          {crisisSupport.hotlines.map((hotline) => (
            <a
              key={hotline.number}
              href={hotline.telHref}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0D131D]/90 border border-emerald-400/30 hover:border-emerald-300 hover:bg-[#121C2B] transition-all duration-200 active:scale-[0.99]"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-emerald-300 tracking-wide">
                    {hotline.number}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-200 border border-emerald-400/25">
                    {hotline.badge}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#F8F5F0]">
                  {hotline.name}
                </p>
                <p className="text-xs text-[#A39BB5] leading-relaxed">
                  {hotline.description}
                </p>
              </div>

              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-[#06120E] font-semibold text-xs sm:text-sm shrink-0 group-hover:bg-emerald-400 transition-colors">
                <PhoneCall className="w-4 h-4" />
                <span>Gọi ngay ({hotline.number})</span>
              </div>
            </a>
          ))}
        </div>

        {/* Gentle Breathing Exercise Box */}
        <div className="rounded-2xl bg-[#090D14]/80 border border-white/10 p-4 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-xs text-[#CBD5E1] leading-relaxed space-y-1">
            <p className="font-semibold text-[#F8F5F0]">
              Nhịp thở 4 - 4 - 4 cùng bạn lúc này:
            </p>
            <p>
              Hít vào nhẹ nhàng trong 4 giây • Giữ hơi 4 giây • Thở ra thật chậm trong 4 giây. Phiên hỏi này không bị trừ lượt và hoàn toàn không lưu lại nội dung nhạy cảm.
            </p>
          </div>
        </div>

        {/* Return Home Button (No share buttons, no upsells, no tarot cards) */}
        <button
          type="button"
          onClick={onReturnHome}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-medium text-[#F8F5F0] transition-all cursor-pointer active:scale-[0.99]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về trang chủ khi bạn đã bình tâm</span>
        </button>
      </div>
    </motion.section>
  );
}
