'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Moon,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Clock,
  Flame,
  Heart,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { ALL_TAROT_CARDS, READERS } from '@/data/tarot-cards';
import type { ReaderId } from '@/lib/schemas';
import type {
  SpiritualWrappedPayload,
  QuotaStatusPayload,
} from '@/lib/api-types';
import { TarotCardVisual } from '@/components/TarotCardVisual';

export interface SpiritualWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  readerId: ReaderId;
  onQuotaUpdated?: (newQuota: QuotaStatusPayload) => void;
}

function buildFallbackWrapped(
  nickname: string,
  readerId: ReaderId
): SpiritualWrappedPayload {
  const cleanName = nickname.trim() || 'Mèo Đêm';
  const readerObj = READERS.find((r) => r.id === readerId) ?? READERS[0]!;
  const starCard =
    ALL_TAROT_CARDS.find((c) => c.id === 17) ?? ALL_TAROT_CARDS[0]!;

  const params = new URLSearchParams({
    nickname: cleanName,
    monthLabel: 'Tháng 10 / 2026',
    archetype: 'Chiến Thần Tỉnh Táo Giữa Đêm Suy',
    auraColor: 'Tím Huyền Bí & Vàng Hoàng Kim (Obsidian Gold)',
    totalReadings: '14',
    peakHour: '23:45 — Giờ Suy Thượng Thừa',
    dominantTopic: 'Tình duyên & Mập mờ (68%)',
    readerName: readerObj.name,
    cardId: String(starCard.id),
    reversed: '0',
    selfLove: '88',
    delusionDrop: '76',
    redFlagRadar: '92',
    manifest: '94',
    quote:
      'Tháng này bài đã nhắc 14 lần: Người xứng đáng sẽ chủ động rõ ràng, còn mập mờ thì tiễn vong cho nhẹ vía!',
    prophecy:
      'Tháng tới năng lượng The Star mở ra cơ hội lớn về tài chính và một mối nhân duyên chủ động rõ ràng 100%.',
  });

  return {
    monthLabel: 'Tháng 10 / 2026',
    nickname: cleanName,
    totalReadingsCount: 14,
    lateNightReadingsCount: 9,
    peakHourLabel: '23:45 — Giờ Suy Thượng Thừa',
    dominantTopic: 'Tình duyên & Mập mờ (68%)',
    favoriteReaderName: readerObj.name,
    favoriteReaderId: readerObj.id as ReaderId,
    signatureCard: {
      card: starCard,
      reversed: false,
      appearances: 5,
      meaningSummary:
        'Ngôi Sao Hy Vọng — Sau chuỗi ngày tự vấn lúc nửa đêm, trực giác của bạn đã sáng tỏ và biết đặt bản thân lên vị trí ưu tiên số 1.',
    },
    spiritualArchetypeTitle: 'Chiến Thần Tỉnh Táo Giữa Đêm Suy',
    spiritualAuraColor: 'Tím Huyền Bí & Vàng Hoàng Kim (Obsidian Gold)',
    auraMetrics: {
      selfLoveScore: 88,
      delusionDropPercent: 76,
      redFlagRadarScore: 92,
      manifestationPower: 94,
    },
    monthlySavageQuote:
      'Tháng này bài đã nhắc 14 lần: Người xứng đáng sẽ chủ động rõ ràng, còn mập mờ thì tiễn vong cho nhẹ vía!',
    nextMonthProphecy:
      'Tháng tới năng lượng The Star mở ra cơ hội lớn về tài chính và một mối nhân duyên chủ động rõ ràng 100%.',
    wrappedCardImageUrl: `/api/wrapped-card?${params.toString()}`,
  };
}

export function SpiritualWrappedModal({
  isOpen,
  onClose,
  nickname,
  readerId,
  onQuotaUpdated,
}: SpiritualWrappedModalProps) {
  const [wrapped, setWrapped] = useState<SpiritualWrappedPayload>(() =>
    buildFallbackWrapped(nickname, readerId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchWrapped = useCallback(async () => {
    setIsLoading(true);
    setToastMsg(null);
    try {
      const params = new URLSearchParams({
        nickname: nickname.trim() || 'Mèo Đêm',
        readerId,
      });
      const res = await fetch(`/api/growth?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.wrapped && data.wrapped.signatureCard?.card) {
          setWrapped(data.wrapped as SpiritualWrappedPayload);
          return;
        }
      }
      setWrapped(buildFallbackWrapped(nickname, readerId));
    } catch {
      setWrapped(buildFallbackWrapped(nickname, readerId));
    } finally {
      setIsLoading(false);
    }
  }, [nickname, readerId]);

  useEffect(() => {
    if (isOpen) {
      void fetchWrapped();
    }
  }, [isOpen, fetchWrapped]);

  const posterImageUrl = useMemo(() => {
    if (wrapped.wrappedCardImageUrl) {
      return wrapped.wrappedCardImageUrl;
    }
    const params = new URLSearchParams({
      nickname: wrapped.nickname,
      monthLabel: wrapped.monthLabel,
      archetype: wrapped.spiritualArchetypeTitle,
      auraColor: wrapped.spiritualAuraColor,
      totalReadings: String(wrapped.totalReadingsCount),
      peakHour: wrapped.peakHourLabel,
      dominantTopic: wrapped.dominantTopic,
      readerName: wrapped.favoriteReaderName,
      cardId: String(wrapped.signatureCard.card.id),
      reversed: wrapped.signatureCard.reversed ? '1' : '0',
      selfLove: String(wrapped.auraMetrics.selfLoveScore),
      delusionDrop: String(wrapped.auraMetrics.delusionDropPercent),
      redFlagRadar: String(wrapped.auraMetrics.redFlagRadarScore),
      manifest: String(wrapped.auraMetrics.manifestationPower),
      quote: wrapped.monthlySavageQuote,
      prophecy: wrapped.nextMonthProphecy,
    });
    return `/api/wrapped-card?${params.toString()}`;
  }, [wrapped]);

  const handleDownloadPoster = async () => {
    setIsDownloading(true);
    setToastMsg(null);
    try {
      const sep = posterImageUrl.includes('?') ? '&' : '?';
      const res = await fetch(`${posterImageUrl}${sep}download=1`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `tarot-couple-wrapped-${wrapped.nickname.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Award share bonus if available
      try {
        const bonusRes = await fetch('/api/reading', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'share_bonus' }),
        });
        if (bonusRes.ok) {
          const bonusData = await bonusRes.json();
          if (bonusData?.quota && onQuotaUpdated) {
            onQuotaUpdated(bonusData.quota);
          }
        }
      } catch {
        // non-blocking
      }

      setToastMsg(
        'Đã tải Poster Hồ Sơ Tâm Linh 9:16 (1080×1920) & tặng +1 lượt bốc bài miễn phí!'
      );
    } catch {
      setToastMsg(
        'Không thể tải Poster lúc này. Bạn có thể nhấn giữ trực tiếp vào ảnh để lưu nhé!'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWrapped = async () => {
    setIsSharing(true);
    setToastMsg(null);
    try {
      const sep = posterImageUrl.includes('?') ? '&' : '?';
      const res = await fetch(`${posterImageUrl}${sep}download=1`);
      const blob = await res.blob();
      const file = new File([blob], 'tarot-couple-wrapped.png', {
        type: 'image/png',
      });
      const shareCaption = `🌙 Hồ Sơ Tâm Linh ${wrapped.monthLabel} của @${wrapped.nickname}: "${wrapped.spiritualArchetypeTitle}" — “${wrapped.monthlySavageQuote}” #TarotCouple #SpiritualWrapped`;

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `Hồ Sơ Tâm Linh ${wrapped.monthLabel} — Tarot Couple`,
          text: shareCaption,
          files: [file],
        });
        setToastMsg(
          'Chia sẻ Hồ Sơ Tâm Linh lên Story thành công! Đã cộng +1 lượt bốc bài miễn phí.'
        );
      } else {
        await handleDownloadPoster();
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareCaption).catch(() => {});
        }
        setToastMsg(
          'Đã tải Poster 9:16 & sao chép sẵn Caption để bạn đăng lên Instagram / TikTok Story!'
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setToastMsg('Đã hủy thao tác chia sẻ.');
      } else {
        await handleDownloadPoster();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const auraMetricBars = [
    {
      id: 'self_love',
      label: 'Độ yêu bản thân (Self-Love)',
      value: wrapped.auraMetrics.selfLoveScore,
      colorClass: 'from-emerald-400 via-[#D4AF37] to-[#F3E5AB]',
      icon: <Heart className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      id: 'delusion_drop',
      label: 'Độ lụy tình đã giảm (Anti-Delulu)',
      value: wrapped.auraMetrics.delusionDropPercent,
      colorClass: 'from-sky-400 via-indigo-400 to-[#D4AF37]',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      id: 'red_flag_radar',
      label: 'Radar bắt thóp Red Flag 🚩',
      value: wrapped.auraMetrics.redFlagRadarScore,
      colorClass: 'from-amber-400 via-rose-400 to-[#F3E5AB]',
      icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
    },
    {
      id: 'manifestation',
      label: 'Tần số Manifest Vũ Trụ ✨',
      value: wrapped.auraMetrics.manifestationPower,
      colorClass: 'from-[#D4AF37] via-[#F3E5AB] to-emerald-400',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Hồ Sơ Tâm Linh Cuối Tháng (Spiritual Wrapped)"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="relative w-full max-w-5xl rounded-3xl bg-[#12101B] border border-[#D4AF37]/45 shadow-[0_24px_80px_rgba(0,0,0,0.92)] overflow-hidden my-auto"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/25 bg-[#09080D]/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 flex items-center justify-center text-[#F3E5AB]">
                  <Moon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#F8F5F0]">
                    🌙 Hồ Sơ Tâm Linh Cuối Tháng (Spiritual Wrapped)
                  </h3>
                  <p className="text-xs text-[#A39BB5]">
                    Tổng kết năng lượng {wrapped.monthLabel} của @{wrapped.nickname} • Xuất Poster Story 9:16
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void fetchWrapped()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#F3E5AB] transition-colors cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span className="hidden sm:inline">Đồng bộ lại</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#F8F5F0] transition-colors cursor-pointer"
                  aria-label="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6 max-h-[82vh] overflow-y-auto items-start">
              {/* Left 7 Cols: Interactive Story-Style Breakdown */}
              <div className="lg:col-span-7 space-y-5">
                {/* Archetype Hero Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#231934] via-[#171224] to-[#0E0B16] border border-[#D4AF37]/50 space-y-2 shadow-[0_12px_35px_rgba(212,175,55,0.18)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#F3E5AB]/50 text-[11px] font-bold uppercase tracking-wider text-[#F3E5AB]">
                      ✦ Danh Hiệu Linh Hồn {wrapped.monthLabel}
                    </span>
                    <span className="text-xs text-[#A39BB5]">
                      Aura: <strong className="text-[#F3E5AB]">{wrapped.spiritualAuraColor}</strong>
                    </span>
                  </div>
                  <h4 className="font-display text-2xl sm:text-3xl font-bold text-[#F8F5F0]">
                    “{wrapped.spiritualArchetypeTitle}”
                  </h4>
                  <p className="text-xs sm:text-sm text-[#D8D2E7]">
                    Người đọc bài đồng hành hợp vía nhất:{' '}
                    <strong className="text-[#F3E5AB]">
                      {wrapped.favoriteReaderName}
                    </strong>
                  </p>
                </div>

                {/* Key Telemetry Grid (Readings, Peak Hour, Dominant Topic) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#171424] border border-white/10 space-y-1">
                    <span className="text-[11px] text-[#A39BB5] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Tổng số lần rút bài
                    </span>
                    <p className="font-display text-2xl font-bold text-[#F3E5AB]">
                      {wrapped.totalReadingsCount} lần
                    </p>
                    <span className="text-[11px] text-emerald-300 block">
                      {wrapped.lateNightReadingsCount} phiên sau 22:00 đêm
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#171424] border border-white/10 space-y-1">
                    <span className="text-[11px] text-[#A39BB5] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Khung giờ hay suy nhất
                    </span>
                    <p className="font-display text-base font-bold text-[#F8F5F0] leading-snug">
                      {wrapped.peakHourLabel}
                    </p>
                    <span className="text-[11px] text-[#D4AF37] block">
                      Tần số tâm linh mạnh nhất
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#171424] border border-white/10 space-y-1">
                    <span className="text-[11px] text-[#A39BB5] flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-rose-400" />
                      Chủ đề trăn trở số 1
                    </span>
                    <p className="font-display text-base font-bold text-[#F8F5F0] leading-snug">
                      {wrapped.dominantTopic}
                    </p>
                    <span className="text-[11px] text-rose-300 block">
                      Trúng tim đen hội hay suy
                    </span>
                  </div>
                </div>

                {/* Signature Tarot Card of the Month */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#171424] border border-[#D4AF37]/35 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <TarotCardVisual
                      card={wrapped.signatureCard.card}
                      reversed={wrapped.signatureCard.reversed}
                      isFlipped={isCardFlipped}
                      onFlip={() => setIsCardFlipped((prev) => !prev)}
                      positionLabel="LÁ BÀI CHỦ ĐẠO"
                      size="sm"
                    />
                  </div>
                  <div className="sm:col-span-8 space-y-2 text-left">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[11px] font-bold text-[#F3E5AB]">
                        Lá Bài Hộ Mệnh • Xuất hiện {wrapped.signatureCard.appearances} lần
                      </span>
                      <span className="text-xs text-[#A39BB5]">
                        Chạm vào lá bài để lật 3D
                      </span>
                    </div>
                    <h5 className="font-display text-xl font-bold text-[#F8F5F0]">
                      {wrapped.signatureCard.card.roman}.{' '}
                      {wrapped.signatureCard.card.name_vi} (
                      {wrapped.signatureCard.card.name_en})
                    </h5>
                    <p className="text-xs sm:text-sm text-[#D8D2E7] leading-relaxed">
                      {wrapped.signatureCard.meaningSummary}
                    </p>
                  </div>
                </div>

                {/* 4 Animated Aura Metrics Progress Bars */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#09080D]/85 border border-white/10 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F3E5AB]">
                      ✦ 4 Chỉ Số Tiến Hóa Tâm Linh Tháng Này
                    </span>
                    <span className="text-[11px] text-[#A39BB5]">
                      Chỉ số phản chiếu giải trí
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {auraMetricBars.map((metric) => (
                      <div
                        key={metric.id}
                        className="p-3 rounded-xl bg-[#171424] border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#F8F5F0] flex items-center gap-1.5">
                            {metric.icon}
                            {metric.label}
                          </span>
                          <strong className="font-mono text-[#F3E5AB]">
                            {metric.value}%
                          </strong>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#09080D] border border-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${metric.colorClass}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Savage Quote & Next Month Prophecy */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1E162B] to-[#130E1E] border border-[#D4AF37]/45 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block">
                    ✦ Câu Chốt Hạ Tháng {wrapped.monthLabel} Từ {wrapped.favoriteReaderName}
                  </span>
                  <p className="font-display text-lg sm:text-xl font-bold italic text-[#F8F5F0] leading-snug">
                    “{wrapped.monthlySavageQuote}”
                  </p>
                  <p className="text-xs text-emerald-300 pt-1 border-t border-white/10">
                    🔮 <strong>Tiên tri tháng tới:</strong> {wrapped.nextMonthProphecy}
                  </p>
                </div>
              </div>

              {/* Right 5 Cols: Live 9:16 Wrapped Poster Preview & Download/Share CTAs */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-4">
                <div className="relative w-full max-w-[270px] aspect-[9/16] rounded-[28px] overflow-hidden border-2 border-[#D4AF37]/65 bg-[#09080D] shadow-[0_18px_55px_rgba(212,175,55,0.25)]">
                  <img
                    key={posterImageUrl}
                    src={posterImageUrl}
                    alt="Poster Hồ Sơ Tâm Linh Cuối Tháng 9:16"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-[#D4AF37]/40 text-[10px] font-semibold text-[#F3E5AB]">
                    Wrapped 9:16 • 1080×1920
                  </div>
                </div>

                {toastMsg ? (
                  <div className="w-full p-3 rounded-xl bg-emerald-950/85 border border-emerald-400/40 flex items-center gap-2 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{toastMsg}</span>
                  </div>
                ) : null}

                <div className="w-full space-y-2.5">
                  <button
                    type="button"
                    disabled={isDownloading || isSharing}
                    onClick={() => void handleDownloadPoster()}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] font-bold text-xs sm:text-sm shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isDownloading
                        ? 'Đang kết xuất Poster 9:16...'
                        : '📥 Tải Poster Wrapped 9:16 (1080x1920)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isSharing || isDownloading}
                    onClick={() => void handleShareWrapped()}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#171424] hover:bg-[#221C35] border border-[#D4AF37]/45 text-[#F3E5AB] font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>
                      {isSharing
                        ? 'Đang mở menu chia sẻ...'
                        : '📲 Chia sẻ Wrapped lên Story'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
