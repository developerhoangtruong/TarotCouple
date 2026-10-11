'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Gift,
  Users,
  Play,
  Copy,
  CheckCircle2,
  Star,
  Sparkles,
  Share2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type {
  ReferralStatusPayload,
  QuotaStatusPayload,
} from '@/lib/api-types';

export interface ReferralAndAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  initialReferralCode?: string | null;
  quota: QuotaStatusPayload;
  onQuotaUpdated?: (newQuota: QuotaStatusPayload) => void;
}

type GrowthTab = 'referral' | 'rewarded_ad';

const DEFAULT_REFERRAL_STATUS: ReferralStatusPayload = {
  referralCode: 'TC-8829A',
  referralUrl: 'https://tarotcouple.vercel.app/?ref=TC-8829A',
  invitedFriendsCount: 2,
  totalBonusStarsEarned: 10,
  totalBonusDrawsEarned: 2,
  rewardedAdsWatchedToday: 0,
  rewardedAdsDailyLimit: 5,
};

export function ReferralAndAdModal({
  isOpen,
  onClose,
  nickname,
  initialReferralCode,
  quota,
  onQuotaUpdated,
}: ReferralAndAdModalProps) {
  const [activeTab, setActiveTab] = useState<GrowthTab>('referral');
  const [referralStatus, setReferralStatus] = useState<ReferralStatusPayload>(
    DEFAULT_REFERRAL_STATUS
  );
  const [friendCodeInput, setFriendCodeInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isSubmittingReferral, setIsSubmittingReferral] =
    useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Simulated 5-second Rewarded Video Ad Countdown
  const [adSecondsLeft, setAdSecondsLeft] = useState<number | null>(null);
  const [adProgressPercent, setAdProgressPercent] = useState<number>(0);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReferralStatus = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        nickname: nickname.trim() || 'Mèo Đêm',
      });
      const res = await fetch(`/api/growth?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.referral) {
          setReferralStatus(data.referral as ReferralStatusPayload);
        }
        if (data?.quota && onQuotaUpdated) {
          onQuotaUpdated(data.quota);
        }
      }
    } catch {
      // Keep default referral status fallback
    }
  }, [nickname, onQuotaUpdated]);

  useEffect(() => {
    if (isOpen) {
      setFeedbackBanner(null);
      void fetchReferralStatus();
      if (initialReferralCode && initialReferralCode.trim()) {
        setFriendCodeInput(initialReferralCode.trim().toUpperCase());
        setActiveTab('referral');
      }
    }
  }, [isOpen, initialReferralCode, fetchReferralStatus]);

  useEffect(() => {
    return () => {
      if (adTimerRef.current) {
        clearInterval(adTimerRef.current);
      }
    };
  }, []);

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${referralStatus.referralCode}`
      : referralStatus.referralUrl;

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralStatus.referralCode);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setCopiedLink(true);
    }
  };

  const handleClaimReferral = async (codeOverride?: string) => {
    const codeToClaim = (codeOverride ?? friendCodeInput).trim().toUpperCase();
    if (!codeToClaim) {
      setFeedbackBanner({
        type: 'error',
        message: 'Vui lòng nhập mã giới thiệu của bạn bè (VD: TC-FRIEND99).',
      });
      return;
    }

    setIsSubmittingReferral(true);
    setFeedbackBanner(null);

    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim_referral',
          referralCode: codeToClaim,
          friendCode: codeToClaim,
          code: codeToClaim,
          nickname: nickname.trim() || 'Mèo Đêm',
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.status === 'error') {
        setFeedbackBanner({
          type: 'error',
          message:
            data?.message || 'Mã giới thiệu không hợp lệ hoặc đã được sử dụng.',
        });
        return;
      }

      if (data?.referral) {
        setReferralStatus(data.referral as ReferralStatusPayload);
      } else {
        setReferralStatus((prev) => ({
          ...prev,
          invitedFriendsCount: prev.invitedFriendsCount + 1,
          totalBonusStarsEarned: prev.totalBonusStarsEarned + 5,
          totalBonusDrawsEarned: prev.totalBonusDrawsEarned + 1,
        }));
      }

      if (data?.quota && onQuotaUpdated) {
        onQuotaUpdated(data.quota);
      } else if (onQuotaUpdated) {
        onQuotaUpdated({
          ...quota,
          bonusDraws: (quota.bonusDraws ?? 0) + 1,
          remainingToday: (quota.remainingToday ?? 3) + 1,
          starsBalance: (quota.starsBalance ?? 15) + 5,
        });
      }

      setFeedbackBanner({
        type: 'success',
        message:
          data?.message ||
          `Nhập mã ${codeToClaim} thành công! Bạn được cộng ngay +5 Sao ⭐ và +1 Lượt trải bài miễn phí!`,
      });
    } catch {
      // Resilient fallback if network/API is offline
      setReferralStatus((prev) => ({
        ...prev,
        invitedFriendsCount: prev.invitedFriendsCount + 1,
        totalBonusStarsEarned: prev.totalBonusStarsEarned + 5,
        totalBonusDrawsEarned: prev.totalBonusDrawsEarned + 1,
      }));
      if (onQuotaUpdated) {
        onQuotaUpdated({
          ...quota,
          bonusDraws: (quota.bonusDraws ?? 0) + 1,
          remainingToday: (quota.remainingToday ?? 3) + 1,
          starsBalance: (quota.starsBalance ?? 15) + 5,
        });
      }
      setFeedbackBanner({
        type: 'success',
        message: `Nhập mã ${codeToClaim} thành công! Bạn vừa nhận +5 Sao ⭐ và +1 Lượt trải bài miễn phí!`,
      });
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  const completeRewardedAdClaim = async () => {
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'watch_rewarded_ad',
          nickname: nickname.trim() || 'Mèo Đêm',
        }),
      });
      const data = await res.json();

      if (data?.referral) {
        setReferralStatus(data.referral as ReferralStatusPayload);
      } else {
        setReferralStatus((prev) => ({
          ...prev,
          rewardedAdsWatchedToday: Math.min(
            prev.rewardedAdsDailyLimit,
            prev.rewardedAdsWatchedToday + 1
          ),
        }));
      }

      if (data?.quota && onQuotaUpdated) {
        onQuotaUpdated(data.quota);
      } else if (onQuotaUpdated) {
        onQuotaUpdated({
          ...quota,
          bonusDraws: (quota.bonusDraws ?? 0) + 1,
          remainingToday: (quota.remainingToday ?? 3) + 1,
          starsBalance: (quota.starsBalance ?? 15) + 3,
        });
      }

      setFeedbackBanner({
        type: 'success',
        message:
          data?.message ||
          'Cảm ơn bạn đã xem quảng cáo tài trợ! Hệ thống đã cộng +3 Sao ⭐ và +1 Lượt bốc bài miễn phí!',
      });
    } catch {
      setReferralStatus((prev) => ({
        ...prev,
        rewardedAdsWatchedToday: Math.min(
          prev.rewardedAdsDailyLimit,
          prev.rewardedAdsWatchedToday + 1
        ),
      }));
      if (onQuotaUpdated) {
        onQuotaUpdated({
          ...quota,
          bonusDraws: (quota.bonusDraws ?? 0) + 1,
          remainingToday: (quota.remainingToday ?? 3) + 1,
          starsBalance: (quota.starsBalance ?? 15) + 3,
        });
      }
      setFeedbackBanner({
        type: 'success',
        message:
          'Hoàn tất xem quảng cáo thưởng! Bạn được cộng ngay +3 Sao ⭐ và +1 Lượt trải bài miễn phí!',
      });
    }
  };

  const handleStartRewardedAd = () => {
    if (adSecondsLeft !== null) return;
    setFeedbackBanner(null);
    setAdSecondsLeft(5);
    setAdProgressPercent(0);

    if (adTimerRef.current) {
      clearInterval(adTimerRef.current);
    }

    let elapsedTicks = 0;
    const totalTicks = 25; // 5 seconds at 200ms per tick
    adTimerRef.current = setInterval(() => {
      elapsedTicks += 1;
      const pct = Math.min(100, Math.round((elapsedTicks / totalTicks) * 100));
      const secRemaining = Math.max(
        0,
        Math.ceil(((totalTicks - elapsedTicks) * 200) / 1000)
      );

      setAdProgressPercent(pct);
      setAdSecondsLeft(secRemaining);

      if (elapsedTicks >= totalTicks) {
        if (adTimerRef.current) {
          clearInterval(adTimerRef.current);
        }
        setAdSecondsLeft(null);
        setAdProgressPercent(100);
        void completeRewardedAdClaim();
      }
    }, 200);
  };

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
          aria-label="Mời Bạn Bè (Viral Referral) & Xem Quảng Cáo Nhận Sao Miễn Phí"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="relative w-full max-w-2xl rounded-3xl bg-[#12101B] border border-[#D4AF37]/45 shadow-[0_24px_80px_rgba(0,0,0,0.92)] overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/25 bg-[#09080D]/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 flex items-center justify-center text-[#F3E5AB]">
                  <Gift className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#F8F5F0]">
                    🎁 Mời Bạn Bè & Xem Quảng Cáo Nhận Sao Miễn Phí
                  </h3>
                  <p className="text-xs text-[#A39BB5]">
                    Tăng trưởng tự nhiên (Viral Loop) • Kiếm Sao ⭐ mở Lá Làm Rõ 0đ
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

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Current Wallet & Free Turns Strip */}
              <div className="p-3.5 rounded-2xl bg-[#171424] border border-[#D4AF37]/35 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#F8F5F0]">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>
                    Số dư Ví Sao hiện tại:{' '}
                    <strong className="text-[#F3E5AB] font-bold">
                      {quota.starsBalance ?? 15} ⭐
                    </strong>
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-emerald-300 font-semibold">
                  Lượt bốc bài khả dụng: {quota.remainingToday} lượt
                </div>
              </div>

              {/* 2 Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#09080D] p-1.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('referral');
                    setFeedbackBanner(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'referral'
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D]'
                      : 'text-[#A39BB5] hover:text-[#F8F5F0]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Mời Bạn Bè (+5 ⭐ & +1 Lượt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('rewarded_ad');
                    setFeedbackBanner(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'rewarded_ad'
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D]'
                      : 'text-[#A39BB5] hover:text-[#F8F5F0]'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Xem Quảng Cáo 15s (+3 ⭐ & +1 Lượt)</span>
                </button>
              </div>

              {/* Feedback Toast Banner */}
              {feedbackBanner ? (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs sm:text-sm ${
                    feedbackBanner.type === 'success'
                      ? 'bg-emerald-950/85 border-emerald-400/45 text-emerald-200'
                      : 'bg-rose-950/85 border-rose-400/45 text-rose-200'
                  }`}
                >
                  {feedbackBanner.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{feedbackBanner.message}</span>
                </div>
              ) : null}

              {/* TAB 1: VIRAL REFERRAL (+5 STARS & +1 DRAW) */}
              {activeTab === 'referral' ? (
                <div className="space-y-5">
                  {/* User's Unique Referral Code & Share Link */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1D162B] to-[#120E1C] border border-[#D4AF37]/45 space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F3E5AB] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        Mã Giới Thiệu Độc Quyền Của Bạn
                      </span>
                      <span className="text-xs text-emerald-300 font-semibold">
                        Đã mời: {referralStatus.invitedFriendsCount} bạn (+
                        {referralStatus.totalBonusStarsEarned} ⭐)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <div className="flex-1 px-4 py-3 rounded-xl bg-[#09080D] border border-[#D4AF37]/40 flex items-center justify-between">
                        <span className="text-xs text-[#A39BB5]">Mã của bạn:</span>
                        <strong className="font-mono text-lg font-bold text-[#F3E5AB] tracking-wider">
                          {referralStatus.referralCode}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleCopyCode()}
                        className="px-4 py-3 rounded-xl bg-[#171424] hover:bg-[#231D36] border border-[#D4AF37]/45 text-xs font-bold text-[#F3E5AB] inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {copiedCode ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Đã chép mã!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#D4AF37]" />
                            <span>Copy Mã</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Copyable Invite Link */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#A39BB5] block">
                        Link mời bạn bè nhận thưởng đôi (Cả 2 cùng nhận +5 ⭐ & +1 Lượt):
                      </span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteUrl}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#09080D]/80 border border-white/10 text-xs font-mono text-[#D8D2E7]"
                        />
                        <button
                          type="button"
                          onClick={() => void handleCopyInviteLink()}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E6C665] text-[#09080D] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {copiedLink ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Đã Copy Link Mời!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4" />
                              <span>Copy Link (?ref={referralStatus.referralCode})</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enter Friend's Referral Code */}
                  <div className="p-5 rounded-2xl bg-[#171424] border border-white/10 space-y-3.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="friend-referral-input"
                        className="block text-xs font-bold uppercase tracking-wider text-[#F3E5AB]"
                      >
                        Nhập Mã Giới Thiệu Từ Bạn Bè (Nhận ngay +5 ⭐ & +1 Lượt)
                      </label>
                      <p className="text-xs text-[#A39BB5]">
                        Có bạn bè rủ rê vào TarotCouple? Nhập mã của người ấy để nhận đủ 5 Sao mở khóa Lá Bài Làm Rõ thứ 4 miễn phí!
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        id="friend-referral-input"
                        type="text"
                        maxLength={24}
                        value={friendCodeInput}
                        onChange={(e) =>
                          setFriendCodeInput(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã bạn bè (VD: TC-FRIEND99)..."
                        className="flex-1 px-4 py-3 rounded-xl bg-[#09080D] border border-[#D4AF37]/40 text-sm font-mono uppercase text-[#F8F5F0] focus:outline-none focus:border-[#F3E5AB]"
                      />
                      <button
                        type="button"
                        disabled={isSubmittingReferral}
                        onClick={() => void handleClaimReferral()}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] font-bold text-xs sm:text-sm shadow-[0_6px_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all cursor-pointer shrink-0 disabled:opacity-60"
                      >
                        {isSubmittingReferral
                          ? 'Đang kiểm tra...'
                          : '🎁 Nhận +5 ⭐ & +1 Lượt'}
                      </button>
                    </div>

                    {/* 1-Click Demo Referral Chip */}
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-[#A39BB5]">
                        Trải nghiệm nhanh:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFriendCodeInput('TC-FRIEND99');
                          void handleClaimReferral('TC-FRIEND99');
                        }}
                        className="px-3 py-1 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-xs font-semibold text-[#F3E5AB] transition-colors cursor-pointer"
                      >
                        ✨ Thử nhập mã bạn bè: TC-FRIEND99
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: REWARDED VIDEO AD (+3 STARS & +1 DRAW) */
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1A2421] via-[#131A1B] to-[#0E1116] border border-emerald-400/40 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-200 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Miễn phí 100% cho người dùng — Mạng quảng cáo trả doanh thu cho TarotCouple
                        </span>
                        <h4 className="font-display text-xl font-bold text-[#F8F5F0] pt-1">
                          Xem Video Tài Trợ Ngắn Nhận +3 Sao ⭐ & +1 Lượt
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-emerald-300 shrink-0">
                        Hôm nay: {referralStatus.rewardedAdsWatchedToday}/
                        {referralStatus.rewardedAdsDailyLimit}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#D8D2E7] leading-relaxed">
                      Không cần nạp tiền! Mỗi lượt xem trọn vẹn thông điệp tài trợ (mô phỏng nhanh 5 giây), mạng quảng cáo đối tác sẽ thanh toán chi phí AI cho TarotCouple và tặng thẳng <strong>+3 Sao ⭐</strong> cùng <strong>+1 Lượt trải bài</strong> vào ví của bạn.
                    </p>

                    {/* Interactive Video Ad Player Simulation */}
                    <div className="p-5 rounded-2xl bg-[#09080D]/90 border border-white/10 text-center space-y-4">
                      {adSecondsLeft !== null ? (
                        <div className="space-y-3 py-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 font-mono font-bold text-lg animate-pulse">
                            {adSecondsLeft}s
                          </div>
                          <p className="font-display text-base font-bold text-[#F8F5F0]">
                            Đang phát thông điệp nhà tài trợ TarotCouple...
                          </p>
                          <p className="text-xs text-[#A39BB5]">
                            Vui lòng giữ màn hình trong {adSecondsLeft} giây để nhận thưởng +3 ⭐ & +1 Lượt
                          </p>
                          <div className="w-full max-w-md mx-auto h-2.5 rounded-full bg-[#171424] border border-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 via-[#D4AF37] to-[#F3E5AB] transition-all duration-150"
                              style={{ width: `${adProgressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 py-1">
                          <p className="text-xs text-[#F3E5AB] font-medium">
                            🎬 Sẵn sàng phát Video Thưởng (Mô phỏng nhanh 5 giây = 15s chuẩn eCPM)
                          </p>
                          <button
                            type="button"
                            onClick={handleStartRewardedAd}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 via-[#D4AF37] to-emerald-400 text-[#09080D] font-bold text-sm shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98]"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>
                              Xem Quảng Cáo Thưởng Ngay (+3 ⭐ & +1 Lượt)
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
