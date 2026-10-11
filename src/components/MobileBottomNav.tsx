'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Flame,
  Compass,
  Star,
  Moon,
  Film,
  Gift,
  BarChart3,
  Scale,
  X,
  ChevronRight,
  Smartphone,
  Monitor,
} from 'lucide-react';

export type ActiveMainTab = 'solo' | 'couple';

interface MobileBottomNavProps {
  activeTab: ActiveMainTab;
  onSelectTab: (tab: ActiveMainTab) => void;
  starsBalance: number;
  streakDays: number;
  remainingToday: number;
  onOpenDailyStreak: () => void;
  onOpenWallet: () => void;
  onOpenWrapped: () => void;
  onOpenTikTokStudio: () => void;
  onOpenReferral: () => void;
  onOpenFunnel: () => void;
  onOpenLegal: () => void;
  isPhoneSimulator?: boolean;
  onTogglePhoneSimulator?: () => void;
}

export default function MobileBottomNav({
  activeTab,
  onSelectTab,
  starsBalance,
  streakDays,
  remainingToday,
  onOpenDailyStreak,
  onOpenWallet,
  onOpenWrapped,
  onOpenTikTokStudio,
  onOpenReferral,
  onOpenFunnel,
  onOpenLegal,
  isPhoneSimulator = false,
  onTogglePhoneSimulator,
}: MobileBottomNavProps) {
  const [isExploreSheetOpen, setIsExploreSheetOpen] = useState(false);

  const handleActionAndClose = (fn: () => void) => {
    setIsExploreSheetOpen(false);
    fn();
  };

  return (
    <>
      {/* iOS / Android Style Bottom Sheet for "Khám Phá / Tiện Ích" */}
      {isExploreSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={() => setIsExploreSheetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border-t border-[#D4AF37]/35 bg-[#12101B] p-5 pb-8 shadow-[0_-16px_50px_rgba(0,0,0,0.85)] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D4AF37]/30" />

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
                  Trung Tâm Vũ Trụ • TarotCouple
                </p>
                <h3 className="font-display text-xl font-bold text-[#F8F5F0]">
                  Khám Phá & Tiện Ích Gen Z
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExploreSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#A39BB5] hover:text-white"
                aria-label="Đóng menu khám phá"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Status Row */}
            <div className="mb-4 grid grid-cols-3 gap-2.5 rounded-2xl border border-[#D4AF37]/20 bg-[#09080D]/80 p-3">
              <div className="text-center">
                <p className="text-[11px] text-[#A39BB5]">Lượt miễn phí</p>
                <p className="mt-0.5 text-sm font-bold text-[#F3E5AB]">
                  🔮 {remainingToday} lượt
                </p>
              </div>
              <div className="border-x border-white/10 text-center">
                <p className="text-[11px] text-[#A39BB5]">Chuỗi điểm danh</p>
                <p className="mt-0.5 text-sm font-bold text-amber-400">
                  🔥 {streakDays} ngày
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-[#A39BB5]">Số dư Ví Sao</p>
                <p className="mt-0.5 text-sm font-bold text-emerald-400">
                  ⭐ {starsBalance} Sao
                </p>
              </div>
            </div>

            {/* Action List */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleActionAndClose(onOpenWrapped)}
                className="flex w-full items-center justify-between rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/15 via-[#171424] to-[#171424] p-3.5 text-left transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F3E5AB]">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F8F5F0]">
                        Hồ Sơ Tâm Linh Tháng 10
                      </span>
                      <span className="rounded-full bg-[#D4AF37]/25 px-2 py-0.5 text-[10px] font-bold text-[#F3E5AB]">
                        Wrapped 9:16
                      </span>
                    </div>
                    <p className="text-xs text-[#A39BB5]">
                      Tổng kết số đêm đã suy, lá bài bản mệnh & xuất Poster 9:16
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
              </button>

              <button
                type="button"
                onClick={() => handleActionAndClose(onOpenTikTokStudio)}
                className="flex w-full items-center justify-between rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-[#171424] to-[#171424] p-3.5 text-left transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300">
                    <Film className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F8F5F0]">
                        Xưởng Seeding TikTok & Reels
                      </span>
                      <span className="rounded-full bg-rose-500/25 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                        3-Slide Kit
                      </span>
                    </div>
                    <p className="text-xs text-[#A39BB5]">
                      Tạo kịch bản 3 Slide Photo Mode, Caption SEO & Voiceover CapCut
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-rose-300" />
              </button>

              <button
                type="button"
                onClick={() => handleActionAndClose(onOpenReferral)}
                className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-[#171424] to-[#171424] p-3.5 text-left transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F8F5F0]">
                        Mời Bạn Bè & Xem Ads Nhận Sao
                      </span>
                      <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                        +5 ⭐ Free
                      </span>
                    </div>
                    <p className="text-xs text-[#A39BB5]">
                      Nhận thêm Sao và lượt bốc miễn phí không cần nạp tiền
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-emerald-300" />
              </button>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleActionAndClose(onOpenFunnel)}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#171424] p-3 text-left transition active:scale-[0.98]"
                >
                  <BarChart3 className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                  <div>
                    <p className="text-xs font-bold text-[#F8F5F0]">Số liệu Funnel</p>
                    <p className="text-[10px] text-[#A39BB5]">Chi phí AI & ARPU</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleActionAndClose(onOpenLegal)}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#171424] p-3 text-left transition active:scale-[0.98]"
                >
                  <Scale className="h-4 w-4 shrink-0 text-[#A39BB5]" />
                  <div>
                    <p className="text-xs font-bold text-[#F8F5F0]">Quyền riêng tư</p>
                    <p className="text-[10px] text-[#A39BB5]">Bảo vệ 10+ & Xóa dữ liệu</p>
                  </div>
                </button>
              </div>

              {onTogglePhoneSimulator && (
                <button
                  type="button"
                  onClick={() => {
                    onTogglePhoneSimulator();
                    setIsExploreSheetOpen(false);
                  }}
                  className="hidden sm:flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/25 bg-[#09080D] py-2.5 text-xs font-semibold text-[#F3E5AB] hover:bg-[#D4AF37]/10"
                >
                  {isPhoneSimulator ? (
                    <>
                      <Monitor className="h-4 w-4" />
                      Chuyển về Chế độ Toàn Màn Hình Máy Tính
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4" />
                      Bật Khung Giả Lập Điện Thoại (iPhone View)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Thumb-Zone Bottom Tab Bar (5 Tabs) */}
      <nav
        aria-label="Thanh điều hướng di động"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#D4AF37]/25 bg-[#09080D]/95 backdrop-blur-xl pb-safe"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-1.5 pt-1.5 pb-1">
          {/* Tab 1: Bốc Bài Cá Nhân */}
          <button
            type="button"
            onClick={() => onSelectTab('solo')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition active:scale-95 ${
              activeTab === 'solo'
                ? 'text-[#F3E5AB]'
                : 'text-[#A39BB5] hover:text-white'
            }`}
          >
            <div
              className={`flex h-7 w-11 items-center justify-center rounded-full transition ${
                activeTab === 'solo'
                  ? 'bg-[#D4AF37]/25 border border-[#D4AF37]/50 shadow-[0_0_14px_rgba(212,175,55,0.3)]'
                  : ''
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              Bốc Bài
            </span>
          </button>

          {/* Tab 2: Bói Đôi TarotCouple */}
          <button
            type="button"
            onClick={() => onSelectTab('couple')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition active:scale-95 ${
              activeTab === 'couple'
                ? 'text-rose-300'
                : 'text-[#A39BB5] hover:text-white'
            }`}
          >
            <div
              className={`relative flex h-7 w-11 items-center justify-center rounded-full transition ${
                activeTab === 'couple'
                  ? 'bg-rose-500/25 border border-rose-400/50 shadow-[0_0_14px_rgba(244,63,94,0.3)]'
                  : ''
              }`}
            >
              <Heart className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                ĐÔI
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              Bói Đôi
            </span>
          </button>

          {/* Tab 3: Ngày Mới & Streak (Center Highlight) */}
          <button
            type="button"
            onClick={onOpenDailyStreak}
            className="flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 text-[#A39BB5] hover:text-amber-300 transition active:scale-95"
          >
            <div className="relative flex h-8 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-gradient-to-b from-amber-500/25 to-amber-600/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Flame className="h-4 w-4" />
              <span className="ml-0.5 text-[10px] font-extrabold">
                {streakDays}
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-tight text-amber-200/90">
              Ngày Mới
            </span>
          </button>

          {/* Tab 4: Ví Sao & VietQR */}
          <button
            type="button"
            onClick={onOpenWallet}
            className="flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[#A39BB5] hover:text-emerald-300 transition active:scale-95"
          >
            <div className="relative flex h-7 w-11 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
              <Star className="h-3.5 w-3.5 fill-emerald-400/30" />
              <span className="ml-0.5 text-[10px] font-bold">{starsBalance}</span>
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              Ví Sao
            </span>
          </button>

          {/* Tab 5: Khám Phá Hub (Wrapped, TikTok, Referral, Funnel) */}
          <button
            type="button"
            onClick={() => setIsExploreSheetOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition active:scale-95 ${
              isExploreSheetOpen
                ? 'text-[#F3E5AB]'
                : 'text-[#A39BB5] hover:text-white'
            }`}
          >
            <div className="relative flex h-7 w-11 items-center justify-center rounded-full">
              <Compass className="h-4 w-4" />
              <span className="absolute top-0.5 right-1.5 h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              Khám Phá
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
