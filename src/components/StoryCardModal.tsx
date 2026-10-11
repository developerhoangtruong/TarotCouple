'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  EyeOff,
  Eye,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import type { ReadingSuccessResponse, QuotaStatusPayload } from '@/lib/api-types';

export interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  readingData: ReadingSuccessResponse;
  initialQuoteIndex?: 0 | 1 | 2;
  onQuotaUpdated?: (newQuota: QuotaStatusPayload) => void;
}

export function StoryCardModal({
  isOpen,
  onClose,
  readingData,
  initialQuoteIndex = 0,
  onQuotaUpdated,
}: StoryCardModalProps) {
  // Privacy-by-default: enabled (true) per PLAN.md Section 5
  const [hideQuestion, setHideQuestion] = useState<boolean>(true);
  const [quoteIndex, setQuoteIndex] = useState<0 | 1 | 2>(initialQuoteIndex);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [bonusClaimed, setBonusClaimed] = useState(false);

  const quotes = readingData.result.shareable_card.savage_quotes;
  const activeQuote = quotes[quoteIndex] || readingData.result.shareable_card.savage_quote;

  const cardsParam = useMemo(() => {
    return readingData.drawnCards
      .map((slot) => `${slot.card.id}:${slot.reversed ? 1 : 0}`)
      .join(',');
  }, [readingData.drawnCards]);

  const storyImageUrl = useMemo(() => {
    const params = new URLSearchParams({
      readingId: readingData.readingId,
      quoteIndex: String(quoteIndex),
      hideQuestion: hideQuestion ? '1' : '0',
      persona: readingData.effectivePersona,
      nickname: readingData.nickname,
      topicLabel: readingData.topicLabel,
      question: readingData.questionText,
      badge: readingData.result.shareable_card.headline_badge,
      quote: activeQuote,
      subAdvice: readingData.result.shareable_card.sub_advice,
      luckyItem: readingData.result.shareable_card.lucky_item,
      cards: cardsParam,
    });
    const metrics = readingData.result.metrics;
    if (metrics) {
      if (metrics.compatibility_score !== undefined) {
        params.set('compatScore', String(metrics.compatibility_score));
      }
      if (metrics.red_flag_level !== undefined) {
        params.set('redFlagLevel', String(metrics.red_flag_level));
      }
      if (metrics.vibe_tag) {
        params.set('vibeTag', metrics.vibe_tag);
      }
    }
    return `/api/story-card?${params.toString()}`;
  }, [readingData, quoteIndex, hideQuestion, activeQuote, cardsParam]);

  const claimShareBonus = async () => {
    if (bonusClaimed) return;
    try {
      const res = await fetch('/api/reading', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share_bonus',
          meta: { readingId: readingData.readingId, quoteIndex },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quota && onQuotaUpdated) {
          onQuotaUpdated(data.quota);
        }
        setBonusClaimed(true);
      }
    } catch {
      // Non-blocking bonus call
    }
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    setStatusToast(null);
    try {
      const res = await fetch(`${storyImageUrl}&download=1`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `tarot-couple-story-${readingData.readingId}-q${quoteIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      await claimShareBonus();
      setStatusToast('Đã tải ảnh 9:16 (1080x1920) & cộng +1 lượt bốc bài miễn phí!');
    } catch {
      setStatusToast('Không thể tải ảnh lúc này, vui lòng thử lại.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    setStatusToast(null);
    try {
      const res = await fetch(`${storyImageUrl}&download=1`);
      const blob = await res.blob();
      const file = new File(
        [blob],
        `tarot-couple-${readingData.readingId}.png`,
        { type: 'image/png' }
      );

      const shareCaption = `“${activeQuote}” — Trải bài từ ${readingData.readerDisplayName} tại Tarot Couple ✦`;

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `Thông điệp Tarot từ ${readingData.readerDisplayName}`,
          text: shareCaption,
          files: [file],
        });
        await claimShareBonus();
        setStatusToast('Chia sẻ thành công! Bạn được tặng +1 lượt bốc bài miễn phí.');
      } else {
        // Fallback: download image + copy caption to clipboard
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `tarot-couple-story-${readingData.readingId}-q${quoteIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareCaption).catch(() => {});
        }
        await claimShareBonus();
        setStatusToast(
          'Thiết bị đã tải ảnh 9:16 & sao chép sẵn câu Quote để bạn đăng Story / TikTok!'
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatusToast('Đã hủy thao tác chia sẻ.');
      } else {
        await handleDownloadImage();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Xưởng xuất ảnh Story 9:16"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="relative w-full max-w-4xl rounded-3xl bg-[#12101B] border border-[#D4AF37]/40 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/20 bg-[#09080D]/80">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#F8F5F0]">
                    Xưởng Ảnh Story 9:16 Chuẩn Viral
                  </h3>
                  <p className="text-xs text-[#A39BB5]">
                    Độ phân giải 1080×1920 • Căn sẵn vùng an toàn Instagram & TikTok
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#F8F5F0] transition-colors cursor-pointer"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-6 items-center">
              {/* Left Column: 9:16 Phone Story Preview Frame */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[270px] aspect-[9/16] rounded-[28px] overflow-hidden border-2 border-[#D4AF37]/60 bg-[#09080D] shadow-[0_16px_50px_rgba(212,175,55,0.22)]">
                  <img
                    key={storyImageUrl}
                    src={storyImageUrl}
                    alt="Xem trước ảnh Story 9:16 Tarot Couple"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-[#D4AF37]/40 text-[10px] font-semibold text-[#F3E5AB]">
                    1080 × 1920 PNG
                  </div>
                </div>
              </div>

              {/* Right Column: Controls (Privacy Toggle + 0đ Quote Switcher + Share CTAs) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-5">
                {/* 1. Privacy Toggle (Default ON per PLAN.md Section 5) */}
                <div className="p-4 rounded-2xl bg-[#171424] border border-[#D4AF37]/25 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {hideQuestion ? (
                      <EyeOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Eye className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#F8F5F0]">
                        Ẩn câu hỏi của tôi trên ảnh
                      </p>
                      <p className="text-xs text-[#A39BB5] mt-0.5">
                        {hideQuestion
                          ? 'Đang bật (Mặc định an toàn): Chỉ hiện 3 lá bài & câu Quote, giữ kín chuyện riêng tư.'
                          : 'Đang tắt: Câu hỏi của bạn sẽ hiển thị công khai trên đầu ảnh Story.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={hideQuestion}
                    onClick={() => setHideQuestion((prev) => !prev)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      hideQuestion ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        hideQuestion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Zero-Cost Quote Switcher (3 Options) */}
                <div className="p-4 rounded-2xl bg-[#171424] border border-[#D4AF37]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Đổi câu Quote khách/khịa khác (Miễn phí 0đ)
                    </span>
                    <span className="text-[11px] text-[#A39BB5]">
                      Phương án {quoteIndex + 1}/3
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {([0, 1, 2] as const).map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuoteIndex(idx)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          quoteIndex === idx
                            ? 'bg-[#D4AF37]/20 border-[#F3E5AB] text-[#F3E5AB] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                            : 'bg-[#09080D]/60 border-white/10 text-[#A39BB5] hover:text-[#F8F5F0]'
                        }`}
                      >
                        Phương án {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#09080D]/90 border border-[#D4AF37]/20">
                    <p className="font-display text-base sm:text-lg italic text-[#F8F5F0] leading-snug">
                      “{activeQuote}”
                    </p>
                  </div>
                </div>

                {/* Bonus Notice */}
                <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center gap-2.5 text-xs text-amber-200">
                  <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    {bonusClaimed
                      ? 'Bạn đã nhận +1 lượt bốc bài miễn phí từ chia sẻ hôm nay!'
                      : 'Chia sẻ hoặc tải ảnh Story để nhận ngay +1 lượt bốc bài miễn phí hôm nay!'}
                  </span>
                </div>

                {/* Toast Feedback */}
                {statusToast && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/40 flex items-center gap-2 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{statusToast}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isSharing || isDownloading}
                    onClick={handleNativeShare}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] text-[#09080D] font-bold text-sm shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>
                      {isSharing ? 'Đang mở chia sẻ...' : 'Chia sẻ lên Story / TikTok'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isDownloading || isSharing}
                    onClick={handleDownloadImage}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#171424] hover:bg-[#211C33] border border-[#D4AF37]/45 text-[#F3E5AB] font-semibold text-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isDownloading ? 'Đang kết xuất PNG...' : 'Tải ảnh 9:16 (1080×1920)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
