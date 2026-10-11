'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Flame,
  Heart,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Share2,
  Gift,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  Compass,
  Wand2,
  Play,
  Star,
  BarChart3,
  Scale,
  Layers,
} from 'lucide-react';
import { ALL_TAROT_CARDS, READERS } from '@/data/tarot-cards';
import {
  classifyAgeTier,
  getSpreadPositionsForTopic,
} from '@/lib/safety';
import {
  CURRENT_REFERENCE_YEAR,
  type DeckMode,
  type ReaderId,
  type TopicId,
} from '@/lib/schemas';
import type {
  ClarifierCardPayload,
  QuotaStatusPayload,
  ReadingApiResponse,
  ReadingCrisisResponse,
  ReadingSuccessResponse,
} from '@/lib/api-types';
import { TarotCardVisual } from '@/components/TarotCardVisual';
import { CrisisSupportView } from '@/components/CrisisSupportView';
import { StoryCardModal } from '@/components/StoryCardModal';
import { LegalPrivacyModal } from '@/components/LegalPrivacyModal';
import { DailyStreakModal } from '@/components/DailyStreakModal';
import { WalletPayOSModal } from '@/components/WalletPayOSModal';
import { FunnelAnalyticsModal } from '@/components/FunnelAnalyticsModal';
import { CoupleModeView } from '@/components/CoupleModeView';
import { SpiritualWrappedModal } from '@/components/SpiritualWrappedModal';
import { TikTokStudioModal } from '@/components/TikTokStudioModal';
import { ReferralAndAdModal } from '@/components/ReferralAndAdModal';

type RitualStep = 1 | 2 | 3 | 4;
type AppMode = 'solo' | 'couple';

const SAMPLE_QUESTIONS_BY_TOPIC: Record<TopicId, string[]> = {
  love: [
    'Người ấy im lặng 3 ngày nay là đang bận thật hay đang âm thầm ghost mình vậy bà?',
    'Mối quan hệ mập mờ hiện tại có cơ hội tiến tới chính thức trong tháng tới không?',
    'Mình nên chủ động nhắn tin trước hay lùi lại giữ giá để xem thái độ người ta?',
  ],
  career: [
    'Mình đang phân vân giữa việc nhảy việc sang môi trường mới hay ở lại chờ cơ hội thăng tiến?',
    'Dự án và kỳ thi sắp tới của mình đang gặp điểm nghẽn gì cần tháo gỡ ngay?',
    'Làm sao để thoát khỏi cảm giác trì hoãn và mất động lực mỗi sáng thức dậy?',
  ],
  finance: [
    'Tình hình tài chính tháng này của mình cần lưu ý lỗ hổng chi tiêu nào nhất?',
    'Sắp tới mình có cơ hội tăng thu nhập hay công việc làm thêm nào khả quan không?',
    'Thói quen nào đang âm thầm cản trở vận may tiền bạc của mình lúc này?',
  ],
  crush_school: [
    'Bạn ngồi bàn bên cạnh dạo này hay nhìn mình cười, không biết bạn ấy nghĩ gì về mình nhỉ?',
    'Làm sao để tụi mình trong nhóm bạn thân hiểu nhau hơn và không còn giận dỗi vu vơ?',
    'Mình muốn bắt chuyện làm quen với crush cùng khối thì nên mở lời thế nào cho tự nhiên?',
  ],
  study: [
    'Kỳ thi học kỳ sắp tới mình nên tập trung ôn luyện thế nào để đạt điểm cao nhất?',
    'Mình hay bị mất tập trung khi ngồi vào bàn học, có bí kíp nào giúp mình bứt phá không?',
    'Môn học mình đang lo lắng nhất sẽ có chuyển biến tích cực nếu mình đổi cách học chứ?',
  ],
  daily_luck: [
    'Tuần mới của mình trên trường sẽ có niềm vui hay điều bất ngờ dễ thương nào đang chờ đón?',
    'Năng lượng may mắn hôm nay nhắn nhủ mình nên làm một việc tốt gì để cả ngày rực rỡ?',
    'Hôm nay mình cần giữ tinh thần thế nào để thu hút toàn chuyện vui vẻ?',
  ],
};

const BIRTH_YEAR_OPTIONS = Array.from(
  { length: 2016 - 1970 + 1 },
  (_, i) => 2016 - i
);

export default function TarotCoupleHomePage() {
  // Super-App Mode Switcher ('solo' vs 'couple') & URL invite param
  const [appMode, setAppMode] = useState<AppMode>('solo');
  const [inviteRoomCode, setInviteRoomCode] = useState<string | null>(null);

  // Navigation & Flow Steps (Solo Mode)
  const [step, setStep] = useState<RitualStep>(1);

  // Step 1: Persona selection (All 4 Readers available!)
  const [selectedReaderId, setSelectedReaderId] =
    useState<ReaderId>('ba_co_mo_hon');

  // Step 2: User context, Age policy & Deck Mode ('major_22' | 'full_78')
  const [nickname, setNickname] = useState<string>('Mèo Đêm');
  const [birthYear, setBirthYear] = useState<number>(2004);
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('love');
  const [deckMode, setDeckMode] = useState<DeckMode>('major_22');
  const [questionText, setQuestionText] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Step 3: Shuffle & Fan Selection
  const [shuffleStage, setShuffleStage] = useState<'charge' | 'fan'>('charge');
  const [chargeProgress, setChargeProgress] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [selectedFanIndices, setSelectedFanIndices] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const chargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Step 4: Reading Result, Crisis Response & Clarifier 4th Card
  const [readingSuccess, setReadingSuccess] =
    useState<ReadingSuccessResponse | null>(null);
  const [storyModalReading, setStoryModalReading] =
    useState<ReadingSuccessResponse | null>(null);
  const [crisisResponse, setCrisisResponse] =
    useState<ReadingCrisisResponse | null>(null);
  const [flippedCards, setFlippedCards] = useState<[boolean, boolean, boolean]>([
    true,
    false,
    false,
  ]);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState<0 | 1 | 2>(0);

  // Step 4 Clarifier Card (Lá Làm Rõ Thứ 4 — 5 ⭐)
  const [followupQuestion, setFollowupQuestion] = useState<string>('');
  const [clarifierCard, setClarifierCard] =
    useState<ClarifierCardPayload | null>(null);
  const [isClarifierFlipped, setIsClarifierFlipped] = useState<boolean>(true);
  const [isDrawingClarifier, setIsDrawingClarifier] = useState<boolean>(false);
  const [clarifierError, setClarifierError] = useState<string | null>(null);

  // Modals & Quota / Wallet / Streak
  const [quota, setQuota] = useState<QuotaStatusPayload>({
    usedToday: 0,
    dailyLimit: 3,
    bonusDraws: 0,
    remainingToday: 3,
    starsBalance: 15,
    streakDays: 1,
    dailyPullCompletedToday: false,
    dailySpendVnd: 0,
    dailySpendCapVnd: 50000,
  });
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isDailyStreakModalOpen, setIsDailyStreakModalOpen] =
    useState<boolean>(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isFunnelModalOpen, setIsFunnelModalOpen] = useState<boolean>(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState<boolean>(false);
  const [isWrappedModalOpen, setIsWrappedModalOpen] = useState<boolean>(false);
  const [isTikTokStudioModalOpen, setIsTikTokStudioModalOpen] =
    useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] =
    useState<boolean>(false);
  const [referralCodeParam, setReferralCodeParam] = useState<string | null>(
    null
  );
  const [adCountdown, setAdCountdown] = useState<number | null>(null);
  const [bonusBanner, setBonusBanner] = useState<string | null>(null);

  // Real-time Age Policy computation
  const agePolicy = useMemo(
    () => classifyAgeTier(birthYear, CURRENT_REFERENCE_YEAR, selectedReaderId),
    [birthYear, selectedReaderId]
  );

  // Keep selectedTopic synchronized with allowedTopics when age tier switches between 10-15 and 16+
  useEffect(() => {
    const allowedIds = agePolicy.allowedTopics.map((t) => t.id);
    if (!allowedIds.includes(selectedTopic)) {
      const nextDefault = agePolicy.allowedTopics[0]?.id || 'love';
      setSelectedTopic(nextDefault);
      const samples = SAMPLE_QUESTIONS_BY_TOPIC[nextDefault];
      if (samples && samples[0]) {
        setQuestionText(samples[0]);
      }
    }
  }, [agePolicy, selectedTopic]);

  // Check URL `?coupleRoom=XYZ` and `?ref=XYZ` on mount & fetch initial quota
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('tc_nickname');
      const savedYear = localStorage.getItem('tc_birth_year');
      if (savedName) setNickname(savedName);
      if (savedYear) {
        const parsed = Number.parseInt(savedYear, 10);
        if (parsed >= 1970 && parsed <= 2016) setBirthYear(parsed);
      }

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('coupleRoom');
        if (roomParam && roomParam.trim()) {
          setInviteRoomCode(roomParam.trim().toUpperCase());
          setAppMode('couple');
        }
        const refParam = params.get('ref');
        if (refParam && refParam.trim()) {
          setReferralCodeParam(refParam.trim().toUpperCase());
          setIsReferralModalOpen(true);
        }
      }
    } catch {
      // Ignore storage access errors
    }

    fetch('/api/reading?track=page_view')
      .then((res) => res.json())
      .then((data) => {
        if (data?.quota) {
          setQuota((prev) => ({
            ...prev,
            ...data.quota,
            starsBalance: data.quota.starsBalance ?? prev.starsBalance ?? 15,
            streakDays: data.quota.streakDays ?? prev.streakDays ?? 1,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const currentSpreadPositions = useMemo(
    () => getSpreadPositionsForTopic(selectedTopic),
    [selectedTopic]
  );

  // Step 2 -> Step 3 validation
  const handleProceedToStep3 = () => {
    setFormError(null);
    const trimmedName = nickname.trim() || 'Bạn Ẩn Danh';
    const trimmedQuestion = questionText.trim();

    if (!trimmedQuestion) {
      setFormError(
        'Hãy chọn một câu hỏi gợi ý bên dưới hoặc viết đôi dòng tâm sự để Vũ Trụ bắt sóng nhé!'
      );
      return;
    }

    if (trimmedQuestion.length > 300) {
      setFormError('Câu hỏi tối đa 300 ký tự để giữ năng lượng tập trung.');
      return;
    }

    try {
      localStorage.setItem('tc_nickname', trimmedName);
      localStorage.setItem('tc_birth_year', String(birthYear));
    } catch {
      // Ignore storage errors
    }

    setNickname(trimmedName);
    setShuffleStage('charge');
    setChargeProgress(0);
    setSelectedFanIndices([]);
    setStep(3);
  };

  // Sub-stage 3A: Haptic 3s Energy Charge
  const startEnergyCharge = () => {
    if (shuffleStage === 'fan') return;
    if (isCharging) return;

    setIsCharging(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40, 80, 120]);
    }

    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
    }

    chargeIntervalRef.current = setInterval(() => {
      setChargeProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          if (chargeIntervalRef.current) {
            clearInterval(chargeIntervalRef.current);
          }
          setIsCharging(false);
          setShuffleStage('fan');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([90, 50, 140]);
          }
          return 100;
        }
        return next;
      });
    }, 85);
  };

  useEffect(() => {
    return () => {
      if (chargeIntervalRef.current) {
        clearInterval(chargeIntervalRef.current);
      }
    };
  }, []);

  const totalDeckCards = deckMode === 'full_78' ? 78 : 22;

  // Sub-stage 3B: Pick 3 cards from the arc fan
  const handlePickFanCard = (fanIndex: number) => {
    if (isSubmitting) return;
    if (selectedFanIndices.includes(fanIndex)) return;
    if (selectedFanIndices.length >= 3) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    const updated = [...selectedFanIndices, fanIndex];
    setSelectedFanIndices(updated);

    if (updated.length === 3) {
      void submitReadingRequest([updated[0]!, updated[1]!, updated[2]!]);
    }
  };

  const handleQuickPickThree = () => {
    if (isSubmitting) return;
    const pool = Array.from({ length: totalDeckCards }, (_, idx) => idx);
    const picked: number[] = [];
    while (picked.length < 3) {
      const randIdx = Math.floor(Math.random() * pool.length);
      const val = pool.splice(randIdx, 1)[0]!;
      picked.push(val);
    }
    setSelectedFanIndices(picked);
    void submitReadingRequest([picked[0]!, picked[1]!, picked[2]!]);
  };

  // Call POST /api/reading
  const submitReadingRequest = async (indices: [number, number, number]) => {
    setIsSubmitting(true);
    setFormError(null);
    setCrisisResponse(null);
    setReadingSuccess(null);
    setClarifierCard(null);
    setClarifierError(null);

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || 'Bạn Ẩn Danh',
          birth_year: birthYear,
          reader_id: selectedReaderId,
          topic: selectedTopic,
          deck_mode: deckMode,
          question_text: questionText.trim(),
          selected_indices: indices,
        }),
      });

      const data = (await res.json()) as ReadingApiResponse;

      if (data.status === 'crisis') {
        setCrisisResponse(data);
        setStep(4);
        return;
      }

      if (data.status === 'error') {
        if (data.quota) {
          setQuota((prev) => ({ ...prev, ...data.quota }));
        }
        setFormError(data.message);
        setSelectedFanIndices([]);
        if (data.code === 'QUOTA_EXCEEDED') {
          setIsRewardModalOpen(true);
        }
        return;
      }

      if (data.status === 'ok') {
        setReadingSuccess(data);
        setStoryModalReading(data);
        setQuota((prev) => ({
          ...prev,
          ...data.quota,
          starsBalance: data.quota.starsBalance ?? prev.starsBalance ?? 15,
          streakDays: data.quota.streakDays ?? prev.streakDays ?? 1,
        }));
        setFlippedCards([true, false, false]);
        setActiveQuoteIdx(0);
        const defaultFollowup =
          data.result.cliffhanger_upsell?.suggested_followup_questions?.[0] ||
          'Bước ngoặt ẩn giấu nào sắp xảy ra trong 7 ngày tới mà mình cần chuẩn bị?';
        setFollowupQuestion(defaultFollowup);
        setStep(4);
      }
    } catch {
      setFormError(
        'Kết nối tạm thời gián đoạn. Vui lòng chạm chọn lại lá bài thứ 3 nhé!'
      );
      setSelectedFanIndices((prev) => prev.slice(0, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Call POST /api/clarifier (Lá Bài Làm Rõ Thứ 4 — 5 ⭐)
  const handleDrawClarifierCard = async () => {
    if (!readingSuccess || isDrawingClarifier) return;

    const currentStars = quota.starsBalance ?? 0;
    const costStars =
      readingSuccess.result.cliffhanger_upsell?.clarifier_cost_stars ?? 5;

    if (currentStars < costStars) {
      setIsWalletModalOpen(true);
      return;
    }

    const askedQ =
      followupQuestion.trim() ||
      'Điều ẩn giấu thực sự phía sau 3 lá bài này là gì?';

    setIsDrawingClarifier(true);
    setClarifierError(null);

    try {
      const previousCardIds = readingSuccess.drawnCards.map((d) => d.card.id);
      const res = await fetch('/api/clarifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reading_id: readingSuccess.readingId,
          readingId: readingSuccess.readingId,
          nickname: readingSuccess.nickname,
          birth_year: birthYear,
          birthYear,
          reader_id: selectedReaderId,
          readerId: selectedReaderId,
          topic: selectedTopic,
          original_question: readingSuccess.questionText,
          originalQuestion: readingSuccess.questionText,
          followup_question: askedQ,
          followupQuestion: askedQ,
          previous_card_ids: previousCardIds,
          previousCardIds,
          deck_mode: deckMode,
          deckMode,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.status === 'error') {
        if (data?.code === 'INSUFFICIENT_STARS') {
          setIsWalletModalOpen(true);
          return;
        }
        setClarifierError(
          data?.message || 'Không thể rút Lá Bài Làm Rõ lúc này.'
        );
        return;
      }

      const clarifierPayload: ClarifierCardPayload | undefined =
        data?.clarifier || (data?.card ? data : undefined);

      if (clarifierPayload && clarifierPayload.card) {
        setClarifierCard(clarifierPayload);
        setIsClarifierFlipped(true);
        if (data.quota) {
          setQuota((prev) => ({ ...prev, ...data.quota }));
        } else {
          setQuota((prev) => ({
            ...prev,
            starsBalance: Math.max(0, (prev.starsBalance ?? 15) - costStars),
          }));
        }
      } else {
        // Resilient client fallback if /api/clarifier is not yet mounted
        const usedIds = new Set(readingSuccess.drawnCards.map((c) => c.card.id));
        const available = ALL_TAROT_CARDS.filter((c) => !usedIds.has(c.id));
        const chosen =
          available[Math.floor(Math.random() * available.length)] ??
          ALL_TAROT_CARDS[0]!;
        const isRev = Math.random() < 0.3;
        const fallbackClarifier: ClarifierCardPayload = {
          card: chosen,
          reversed: isRev,
          questionAsked: askedQ,
          interpretation: isRev ? chosen.core_meaning_rev : chosen.core_meaning_up,
          advice: isRev ? chosen.healing_hook_rev : chosen.healing_hook_up,
          savageQuote: isRev ? chosen.savage_hook_rev : chosen.savage_hook_up,
          starsSpent: costStars,
        };
        setClarifierCard(fallbackClarifier);
        setIsClarifierFlipped(true);
        setQuota((prev) => ({
          ...prev,
          starsBalance: Math.max(0, (prev.starsBalance ?? 15) - costStars),
        }));
      }
    } catch {
      const usedIds = new Set(readingSuccess.drawnCards.map((c) => c.card.id));
      const available = ALL_TAROT_CARDS.filter((c) => !usedIds.has(c.id));
      const chosen =
        available[Math.floor(Math.random() * available.length)] ??
        ALL_TAROT_CARDS[0]!;
      const isRev = Math.random() < 0.3;
      const fallbackClarifier: ClarifierCardPayload = {
        card: chosen,
        reversed: isRev,
        questionAsked: askedQ,
        interpretation: isRev ? chosen.core_meaning_rev : chosen.core_meaning_up,
        advice: isRev ? chosen.healing_hook_rev : chosen.healing_hook_up,
        savageQuote: isRev ? chosen.savage_hook_rev : chosen.savage_hook_up,
        starsSpent: costStars,
      };
      setClarifierCard(fallbackClarifier);
      setIsClarifierFlipped(true);
      setQuota((prev) => ({
        ...prev,
        starsBalance: Math.max(0, (prev.starsBalance ?? 15) - costStars),
      }));
    } finally {
      setIsDrawingClarifier(false);
    }
  };

  // Simulated 15s Rewarded Ad or Share Bonus
  const handleWatchSimulatedRewardedAd = () => {
    if (adCountdown !== null) return;
    setAdCountdown(5);
    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          void claimBonusTurn('reward_ad_bonus');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimBonusTurn = async (
    action: 'share_bonus' | 'reward_ad_bonus' | 'reset_demo_quota'
  ) => {
    try {
      const res = await fetch('/api/reading', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data?.quota) {
        setQuota((prev) => ({ ...prev, ...data.quota }));
      }
      setBonusBanner(
        data?.message ||
          'Đã cộng thêm +1 lượt trải bài miễn phí vào tài khoản phiên của bạn!'
      );
      setTimeout(() => {
        setIsRewardModalOpen(false);
        setBonusBanner(null);
      }, 1800);
    } catch {
      // Ignore error
    }
  };

  // Reset ritual back to Step 1
  const handleResetRitual = () => {
    setAppMode('solo');
    setStep(1);
    setCrisisResponse(null);
    setReadingSuccess(null);
    setClarifierCard(null);
    setSelectedFanIndices([]);
    setShuffleStage('charge');
    setChargeProgress(0);
    setFormError(null);
  };

  const activeReaderObj =
    READERS.find((r) => r.id === selectedReaderId) ?? READERS[0]!;

  const cliffhangerData = useMemo(() => {
    if (!readingSuccess || readingSuccess.safetyFlag === 'crisis') return null;
    if (readingSuccess.result.cliffhanger_upsell) {
      return readingSuccess.result.cliffhanger_upsell;
    }
    return {
      tease_text: `${readingSuccess.readerDisplayName} nhận thấy giữa lá bài số 2 và số 3 vẫn còn một điểm nút ẩn giấu chưa được lật mở hết. Bạn có muốn rút thêm Lá Bài Làm Rõ thứ 4 để soi tận gốc không?`,
      suggested_followup_questions: [
        'Hành động thực sự tiếp theo của đối phương/cục diện trong 7 ngày tới là gì?',
        'Điều gì mình tuyệt đối không nên làm lúc này để tránh đi vào vết xe đổ?',
      ] as [string, string],
      clarifier_cost_stars: 5,
    };
  }, [readingSuccess]);

  return (
    <div className="min-h-dvh bg-[#09080D] text-[#F8F5F0] flex flex-col justify-between relative overflow-x-hidden">
      {/* Subtle Ambient Gold-Obsidian Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.09)_0%,rgba(18,16,27,0.45)_45%,rgba(9,8,13,1)_85%)]"
      />

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#D4AF37]/20 bg-[#09080D]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-full px-3 sm:px-4 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={handleResetRitual}
            className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#171424] border border-[#D4AF37]/50 flex items-center justify-center text-[#F3E5AB] shadow-[0_0_18px_rgba(212,175,55,0.2)] group-hover:border-[#F3E5AB] transition-colors">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-display text-base sm:text-xl font-bold tracking-wider text-[#F8F5F0] block leading-none">
                TAROT COUPLE
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-[#D4AF37]">
                RWS 1909 • Super-App
              </span>
            </div>
          </button>

          {/* Right Top Bar Badges: Ví Sao | Điểm danh Streak | Lượt miễn phí | Analytics Funnel | Pháp lý */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {/* 1. Ví Sao (WalletPayOSModal) */}
            <button
              type="button"
              onClick={() => setIsWalletModalOpen(true)}
              data-testid="topbar-wallet-btn"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-[#241B35] to-[#171223] hover:border-[#F3E5AB] border border-[#D4AF37]/50 text-xs font-bold text-[#F3E5AB] transition-all cursor-pointer shrink-0"
              title="Ví Sao & Cổng Thanh Toán VietQR PayOS"
            >
              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
              <span>⭐ {quota.starsBalance ?? 15} Sao</span>
            </button>

            {/* 2. Điểm danh Ngày (DailyStreakModal) */}
            <button
              type="button"
              onClick={() => setIsDailyStreakModalOpen(true)}
              data-testid="topbar-streak-btn"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-xs font-bold text-amber-200 transition-colors cursor-pointer shrink-0"
              title="Thông Điệp Vũ Trụ Hàng Ngày & Chuỗi Điểm Danh Streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>🔥 {quota.streakDays ?? 1} ngày</span>
            </button>

            {/* 3. Lượt miễn phí */}
            <button
              type="button"
              onClick={() => setIsRewardModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#171424] hover:bg-[#221D34] border border-[#D4AF37]/35 text-xs font-medium text-[#F3E5AB] transition-colors cursor-pointer shrink-0"
              title="Lượt trải bài miễn phí hôm nay"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Miễn phí:</span>
              <strong className="text-[#F8F5F0] font-bold">
                {quota.remainingToday} lượt
              </strong>
            </button>

            {/* 4. Phase 4 Growth: Hồ Sơ Tâm Linh (Wrapped) */}
            <button
              type="button"
              onClick={() => setIsWrappedModalOpen(true)}
              data-testid="topbar-wrapped-btn"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-[#D4AF37]/45 text-xs font-bold text-[#F3E5AB] transition-colors cursor-pointer shrink-0"
              title="Hồ Sơ Tâm Linh Cuối Tháng (Spiritual Wrapped 9:16)"
            >
              <span>🌙 Hồ Sơ Tâm Linh (Wrapped)</span>
            </button>

            {/* 5. Phase 4 Growth: TikTok Studio */}
            <button
              type="button"
              onClick={() => setIsTikTokStudioModalOpen(true)}
              data-testid="topbar-tiktok-btn"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-xs font-bold text-rose-200 transition-colors cursor-pointer shrink-0"
              title="Xưởng Seeding TikTok & Reels 0đ (3-Slide Carousel Studio)"
            >
              <span>🎬 TikTok Studio</span>
            </button>

            {/* 6. Phase 4 Growth: Mời Bạn (+5 ⭐) */}
            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              data-testid="topbar-referral-btn"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/45 text-xs font-bold text-emerald-200 transition-colors cursor-pointer shrink-0"
              title="Mời Bạn Bè Nhận +5 Sao ⭐ & Xem Quảng Cáo Thưởng"
            >
              <span>🎁 Mời Bạn (+5 ⭐)</span>
            </button>

            {/* 7. Analytics (FunnelAnalyticsModal) */}
            <button
              type="button"
              onClick={() => setIsFunnelModalOpen(true)}
              data-testid="topbar-funnel-btn"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-[#D8D2E7] transition-colors cursor-pointer shrink-0"
              title="Bảng Kiểm Chứng Giả Định Thị Trường & Chi Phí AI"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">📊 Funnel</span>
            </button>

            {/* 8. Pháp lý */}
            <button
              type="button"
              onClick={() => setIsLegalModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#A39BB5] hover:text-[#F8F5F0] transition-colors cursor-pointer shrink-0"
              title="Điều khoản, Quyền riêng tư & Chính sách độ tuổi 10+"
            >
              <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden lg:inline">⚖️ Pháp lý</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN STAGE ================= */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Super-App Mode Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-2xl mx-auto bg-[#12101B] border border-[#D4AF37]/35 rounded-2xl p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => setAppMode('solo')}
            className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              appMode === 'solo'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'text-[#A39BB5] hover:text-[#F8F5F0] hover:bg-white/5'
            }`}
          >
            <span>🔮 Bốc Bài Cá Nhân (Solo 3 Lá)</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode('couple')}
            className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              appMode === 'couple'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'text-[#A39BB5] hover:text-[#F8F5F0] hover:bg-white/5'
            }`}
          >
            <span>💞 Bói Đôi TarotCouple (Check Hợp Cạ & Red Flag)</span>
          </button>
        </div>

        {/* ================= MODE 2: COUPLE MODE VIEW ================= */}
        {appMode === 'couple' ? (
          <CoupleModeView
            initialRoomCode={inviteRoomCode}
            nickname={nickname}
            birthYear={birthYear}
            selectedReaderId={selectedReaderId}
            onSelectReaderId={(rId) => setSelectedReaderId(rId)}
            deckMode={deckMode}
            onQuotaUpdated={(newQuota) =>
              setQuota((prev) => ({ ...prev, ...newQuota }))
            }
            onOpenStoryModal={(coupleReadingData) => {
              setStoryModalReading(coupleReadingData);
              setActiveQuoteIdx(0);
              setIsStoryModalOpen(true);
            }}
          />
        ) : (
          /* ================= MODE 1: SOLO 3-CARD RITUAL ================= */
          <>
            {/* Step Progress Indicator (Hidden during Crisis Intervention) */}
            {!(step === 4 && crisisResponse) ? (
              <div className="mb-6 flex items-center justify-between max-w-xl mx-auto bg-[#12101B] border border-[#D4AF37]/25 rounded-full p-1.5">
                {(
                  [
                    { num: 1, label: '1. Chọn Reader' },
                    { num: 2, label: '2. Tâm Sự' },
                    { num: 3, label: '3. Rút 3 Lá' },
                    { num: 4, label: '4. Giải Mã' },
                  ] as const
                ).map((item) => {
                  const isActive = step === item.num;
                  const isDone = step > item.num;
                  return (
                    <button
                      key={item.num}
                      type="button"
                      disabled={item.num > step}
                      onClick={() => {
                        if (item.num < step) {
                          setStep(item.num);
                        }
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#09080D] shadow-[0_0_16px_rgba(212,175,55,0.4)]'
                          : isDone
                            ? 'text-[#F3E5AB] hover:bg-white/5 cursor-pointer'
                            : 'text-[#A39BB5]/60 cursor-not-allowed'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* ================= STEP 1: CHỌN LỀU READER (ALL 4 READERS) ================= */}
            {step === 1 ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Hero Header */}
                <div className="border-b border-[#D4AF37]/20 pb-6 space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                    ✦ Nghi Thức Tarot Phản Chiếu Tâm Lý • 4 Persona & Trọn Bộ 78 Lá RWS ✦
                  </p>
                  <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#F8F5F0] leading-[1.12] tracking-tight">
                    Chọn Người Đọc Bài Cho Đêm Suy Của Bạn.
                  </h1>
                  <p className="text-sm text-[#A39BB5] max-w-2xl leading-relaxed">
                    Lá bài do hệ thống xáo ngẫu nhiên chuẩn mật mã (CSPRNG). Tự tay rút 3 lá định mệnh, mở khóa Lá Làm Rõ thứ 4 và xuất ngay ảnh Story 9:16 sắc sảo.
                  </p>
                </div>

                {/* All 4 Readers Selectable Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {READERS.map((reader) => {
                    const isSelected = selectedReaderId === reader.id;
                    const isBaCo = reader.id === 'ba_co_mo_hon';

                    return (
                      <div
                        key={reader.id}
                        onClick={() => setSelectedReaderId(reader.id as ReaderId)}
                        className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#1E162B] to-[#120F1D] border-2 border-[#D4AF37] shadow-[0_16px_45px_rgba(212,175,55,0.22)]'
                            : 'bg-[#12101B] border border-[#D4AF37]/30 hover:border-[#D4AF37]/70'
                        }`}
                      >
                        <div className="space-y-4">
                          {/* Top Row: Avatar + Badges */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border shadow-inner"
                                style={{
                                  borderColor: reader.accent_color,
                                  backgroundColor: 'rgba(9, 8, 13, 0.75)',
                                  color: reader.accent_color,
                                }}
                              >
                                {reader.avatar_symbol}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F8F5F0]">
                                    {reader.name}
                                  </h2>
                                  {isBaCo ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-200 border border-rose-400/40">
                                      Hot nhất đêm nay
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-xs font-medium text-[#D4AF37] mt-0.5">
                                  {reader.title}
                                </p>
                              </div>
                            </div>

                            <span className="px-3 py-1 rounded-full text-xs font-semibold border shrink-0 bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/40">
                              {reader.badge}
                            </span>
                          </div>

                          {/* Tagline */}
                          <p className="text-sm text-[#D8D2E7] leading-relaxed">
                            {reader.tagline}
                          </p>

                          {/* Sample Quote Preview */}
                          <div className="p-3.5 rounded-2xl bg-[#09080D]/80 border border-white/10">
                            <p className="text-xs italic text-[#F3E5AB]">
                              “{reader.sample_quote}”
                            </p>
                          </div>
                        </div>

                        {/* Footer Status */}
                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-[#A39BB5]">
                            {isBaCo
                              ? 'Tự động chuyển sang Bà Ngoại Vui Tính nếu 10–15 tuổi'
                              : `Phong cách: ${reader.title}`}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                              isSelected ? 'text-[#F3E5AB]' : 'text-[#D4AF37]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Đang chọn
                              </>
                            ) : (
                              'Chọn Reader này →'
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Couple Mode Quick Switch Banner + Primary Step 1 CTA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
                  <div className="lg:col-span-7 p-5 rounded-3xl bg-[#12101B] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37]">
                        <Users className="w-4 h-4" />
                        <span>Chế độ Bói Đôi (TarotCouple • Hợp Cạ & Red Flag 🚩)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A39BB5]">
                        Tự soi mối quan hệ hoặc tạo phòng bí mật 48h mời người ấy cùng rút bài — ẩn bảo mật câu hỏi riêng tư.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppMode('couple')}
                      className="px-4 py-2.5 rounded-2xl bg-[#171424] hover:bg-[#231E36] border border-[#D4AF37]/40 text-xs font-semibold text-[#F3E5AB] shrink-0 transition-colors cursor-pointer"
                    >
                      Mở Bói Đôi ngay →
                    </button>
                  </div>

                  <div className="lg:col-span-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!questionText) {
                          const defaultSamples =
                            SAMPLE_QUESTIONS_BY_TOPIC[selectedTopic];
                          if (defaultSamples?.[0]) {
                            setQuestionText(defaultSamples[0]);
                          }
                        }
                        setStep(2);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E6C665] to-[#D4AF37] text-[#09080D] font-bold text-base shadow-[0_10px_30px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <span>Bước vào Lều {activeReaderObj.name}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : null}

            {/* ================= STEP 2: KỂ CHUYỆN, CHỌN CHỦ ĐỀ & CHỌN BỘ BÀI (22 vs 78) ================= */}
            {step === 2 ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                {/* Header with Back Button */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#A39BB5] hover:text-[#F8F5F0] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Đổi Reader khác</span>
                  </button>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#171424] border border-[#D4AF37]/40 text-xs text-[#F3E5AB]">
                    <span>{activeReaderObj.avatar_symbol}</span>
                    <span>
                      Reader:{' '}
                      <strong>
                        {agePolicy.isKidTeenSafeMode &&
                        selectedReaderId === 'ba_co_mo_hon'
                          ? 'Bà Ngoại Vui Tính'
                          : activeReaderObj.name}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl bg-[#12101B] border border-[#D4AF37]/35 p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8F5F0]">
                      Kể Chuyện & Chọn Chủ Đề Trải Bài
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A39BB5] mt-1">
                      Thông tin năm sinh giúp hệ thống điều chỉnh ngôn từ và chủ đề phù hợp đúng lứa tuổi của bạn.
                    </p>
                  </div>

                  {/* Row 1: Nickname + Birth Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="nickname-input"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F3E5AB]"
                      >
                        Biệt danh của bạn (Hiển thị trên thẻ bài)
                      </label>
                      <input
                        id="nickname-input"
                        type="text"
                        maxLength={40}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Ví dụ: Mèo Đêm, Cú Nhỏ..."
                        className="w-full px-4 py-3 rounded-2xl bg-[#09080D] border border-[#D4AF37]/35 text-sm text-[#F8F5F0] focus:outline-none focus:border-[#F3E5AB]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="birthyear-select"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F3E5AB]"
                      >
                        Năm sinh ({CURRENT_REFERENCE_YEAR - birthYear} tuổi)
                      </label>
                      <select
                        id="birthyear-select"
                        value={birthYear}
                        onChange={(e) =>
                          setBirthYear(Number.parseInt(e.target.value, 10))
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-[#09080D] border border-[#D4AF37]/35 text-sm text-[#F8F5F0] focus:outline-none focus:border-[#F3E5AB]"
                      >
                        {BIRTH_YEAR_OPTIONS.map((yr) => (
                          <option key={yr} value={yr}>
                            Sinh năm {yr} ({CURRENT_REFERENCE_YEAR - yr} tuổi)
                          </option>
                        ))}
                      </select>

                      {/* Quick Age-Tier Demo Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#A39BB5]">
                          Chọn nhanh:
                        </span>
                        {[
                          { yr: 2004, label: '2004 (18+)' },
                          { yr: 2009, label: '2009 (16–17t)' },
                          { yr: 2013, label: '2013 (10–15t Học Đường)' },
                        ].map((preset) => (
                          <button
                            key={preset.yr}
                            type="button"
                            onClick={() => setBirthYear(preset.yr)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                              birthYear === preset.yr
                                ? 'bg-[#D4AF37]/25 border-[#F3E5AB] text-[#F3E5AB]'
                                : 'bg-[#09080D] border-white/10 text-[#A39BB5] hover:text-[#F8F5F0]'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Age-Tier Guardrail Banner */}
                  {agePolicy.isKidTeenSafeMode ? (
                    <div
                      data-testid="kid-teen-safe-badge"
                      className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-100 text-xs sm:text-sm leading-relaxed shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    >
                      <strong>
                        🌸 Chế độ Học Đường Trong Sáng (10–15 tuổi) đã kích hoạt:
                      </strong>{' '}
                      Chủ đề học đường lành mạnh • Bà Ngoại Vui Tính • Khóa nạp tiền 100%.
                    </div>
                  ) : (
                    <div className="px-4 py-2.5 rounded-2xl bg-[#171424] border border-white/10 text-xs text-[#A39BB5] flex items-center justify-between">
                      <span>{agePolicy.policySummaryVi}</span>
                      <span className="text-[#F3E5AB] font-semibold">
                        {agePolicy.age} tuổi
                      </span>
                    </div>
                  )}

                  {/* Deck Selector Toggle: 22 Major Arcana vs Full 78 RWS */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#F3E5AB] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Chọn Bộ Bài Tarot (Deck Mode)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeckMode('major_22')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          deckMode === 'major_22'
                            ? 'bg-[#221A33] border-[#F3E5AB] shadow-[0_0_18px_rgba(212,175,55,0.25)]'
                            : 'bg-[#09080D]/70 border-white/10 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm sm:text-base font-bold text-[#F8F5F0]">
                            Bộ 22 Lá Ẩn Chính (Major Arcana)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#F3E5AB]">
                            Cô đọng
                          </span>
                        </div>
                        <p className="text-xs text-[#A39BB5] mt-1">
                          Tập trung vào các bước ngoặt lớn và bài học tâm linh cốt lõi.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeckMode('full_78')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          deckMode === 'full_78'
                            ? 'bg-[#221A33] border-[#F3E5AB] shadow-[0_0_18px_rgba(212,175,55,0.25)]'
                            : 'bg-[#09080D]/70 border-white/10 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm sm:text-base font-bold text-[#F8F5F0]">
                            Trọn Bộ 78 Lá Tarot (RWS 1909)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                            Đầy đủ 78 lá
                          </span>
                        </div>
                        <p className="text-xs text-[#A39BB5] mt-1">
                          Kết hợp 22 lá Major + 56 lá Minor (Gậy, Cốc, Kiếm, Tiền) soi chi tiết từng hành vi.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Topic Selector */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#F3E5AB]">
                      Chọn Chủ Đề Trải Bài 3 Lá
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {agePolicy.allowedTopics.map((topicItem) => {
                        const isSelected = selectedTopic === topicItem.id;
                        return (
                          <button
                            key={topicItem.id}
                            type="button"
                            onClick={() => {
                              setSelectedTopic(topicItem.id);
                              const samples =
                                SAMPLE_QUESTIONS_BY_TOPIC[topicItem.id];
                              if (samples?.[0]) {
                                setQuestionText(samples[0]);
                              }
                            }}
                            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-gradient-to-b from-[#231B32] to-[#151120] border-[#F3E5AB] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                                : 'bg-[#09080D]/70 border-white/10 hover:border-[#D4AF37]/50'
                            }`}
                          >
                            <div>
                              <p className="font-display text-base font-bold text-[#F8F5F0]">
                                {topicItem.label}
                              </p>
                              <p className="text-xs text-[#A39BB5] mt-1 leading-relaxed">
                                {topicItem.description}
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-[#D4AF37] font-medium">
                              1. {topicItem.positions[0]} • 2.{' '}
                              {topicItem.positions[1]} • 3. {topicItem.positions[2]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Textarea + 1-Click Sample Chips */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="question-textarea"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F3E5AB]"
                      >
                        Câu chuyện hoặc câu hỏi của bạn
                      </label>
                      <span
                        className={`text-xs font-mono ${
                          questionText.length > 280
                            ? 'text-amber-300 font-bold'
                            : 'text-[#A39BB5]'
                        }`}
                      >
                        {questionText.length} / 300
                      </span>
                    </div>

                    <textarea
                      id="question-textarea"
                      rows={3}
                      maxLength={300}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Kể ngắn gọn hoàn cảnh của bạn để 3 lá bài phản chiếu rõ nhất..."
                      className="w-full p-4 rounded-2xl bg-[#09080D] border border-[#D4AF37]/35 text-sm text-[#F8F5F0] placeholder:text-[#A39BB5]/50 focus:outline-none focus:border-[#F3E5AB] leading-relaxed"
                    />

                    {/* Sample Question Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-[#A39BB5] block">
                        Chạm chọn nhanh câu hỏi mẫu (1-click):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(SAMPLE_QUESTIONS_BY_TOPIC[selectedTopic] || []).map(
                          (sample, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setQuestionText(sample)}
                              className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#171424] hover:bg-[#231D36] border border-[#D4AF37]/25 text-[#D8D2E7] transition-colors cursor-pointer"
                            >
                              “{sample}”
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {formError ? (
                    <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400/40 flex items-center gap-2.5 text-xs text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  ) : null}

                  {/* Submit to Step 3 */}
                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] text-[#09080D] font-bold text-base shadow-[0_10px_30px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span>Bắt Đầu Nghi Thức Xào Bài & Rút 3 Lá</span>
                  </button>
                </div>
              </motion.section>
            ) : null}

            {/* ================= STEP 3: NGHI THỨC XÀO BÀI & RÚT 3 LÁ ================= */}
            {step === 3 ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Top Context Bar + Deck Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#A39BB5] hover:text-[#F8F5F0] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sửa câu hỏi</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-full bg-[#12101B] border border-[#D4AF37]/35 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDeckMode('major_22');
                          setSelectedFanIndices([]);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          deckMode === 'major_22'
                            ? 'bg-[#D4AF37] text-[#09080D]'
                            : 'text-[#A39BB5]'
                        }`}
                      >
                        22 Lá Ẩn Chính
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeckMode('full_78');
                          setSelectedFanIndices([]);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          deckMode === 'full_78'
                            ? 'bg-[#D4AF37] text-[#09080D]'
                            : 'text-[#A39BB5]'
                        }`}
                      >
                        Trọn Bộ 78 Lá
                      </button>
                    </div>

                    <div className="text-xs text-[#F3E5AB] bg-[#171424] border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full">
                      Chủ đề:{' '}
                      <strong>
                        {
                          agePolicy.allowedTopics.find(
                            (t) => t.id === selectedTopic
                          )?.label
                        }
                      </strong>
                    </div>
                  </div>
                </div>

                {/* SUB-STAGE 3A: ENERGY CHARGE & SHUFFLE */}
                {shuffleStage === 'charge' ? (
                  <div className="rounded-3xl bg-[#12101B] border border-[#D4AF37]/35 p-8 sm:p-12 text-center space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
                    <div className="space-y-2 max-w-lg mx-auto">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                        ✦ Nghi Thức Kết Nối Trực Giác ({totalDeckCards} Lá Bài) ✦
                      </span>
                      <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#F8F5F0]">
                        Hít Sâu & Truyền Năng Lượng Vào Bộ Bài
                      </h2>
                      <p className="text-xs sm:text-sm text-[#A39BB5]">
                        Nhẩm lại câu hỏi của bạn: <em>“{questionText}”</em>
                      </p>
                    </div>

                    {/* Animated Shuffling Deck Stack */}
                    <div className="relative h-52 flex items-center justify-center">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <motion.div
                          key={idx}
                          animate={
                            isCharging
                              ? {
                                  x: [0, (idx - 2) * 34, 0],
                                  y: [0, idx % 2 === 0 ? -12 : 12, 0],
                                  rotate: [
                                    (idx - 2) * 5,
                                    (idx - 2) * -8,
                                    (idx - 2) * 4,
                                  ],
                                }
                              : {
                                  x: (idx - 2) * 14,
                                  rotate: (idx - 2) * 4,
                                }
                          }
                          transition={{
                            duration: 0.65,
                            repeat: isCharging ? Infinity : 0,
                            ease: 'easeInOut',
                          }}
                          className="absolute w-28 h-44 rounded-2xl bg-gradient-to-b from-[#231834] to-[#0F0B18] border border-[#D4AF37]/60 shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex items-center justify-center"
                        >
                          <span className="text-2xl text-[#D4AF37]">✦</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Ritual Energy Orb Button */}
                    <div className="flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onMouseDown={startEnergyCharge}
                        onTouchStart={startEnergyCharge}
                        onClick={startEnergyCharge}
                        className="relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] font-bold text-sm sm:text-base shadow-[0_0_35px_rgba(212,175,55,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Flame className="w-5 h-5 mr-2" />
                        <span>
                          {isCharging
                            ? `Đang xáo ${totalDeckCards} lá bài & hội tụ năng lượng... ${chargeProgress}%`
                            : 'Giữ 3 giây để truyền năng lượng & Xào bài'}
                        </span>
                      </button>

                      {/* Progress Bar */}
                      <div className="w-64 h-2 rounded-full bg-[#09080D] border border-[#D4AF37]/30 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] transition-all duration-100"
                          style={{ width: `${chargeProgress}%` }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (chargeIntervalRef.current) {
                            clearInterval(chargeIntervalRef.current);
                          }
                          setChargeProgress(100);
                          setIsCharging(false);
                          setShuffleStage('fan');
                        }}
                        className="text-xs text-[#A39BB5] hover:text-[#F3E5AB] underline cursor-pointer"
                      >
                        Trải {totalDeckCards} lá bài ra bàn ngay →
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* SUB-STAGE 3B: ARC FAN PICKER */}
                {shuffleStage === 'fan' ? (
                  <div className="rounded-3xl bg-[#12101B] border border-[#D4AF37]/35 p-5 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8F5F0]">
                          Chạm Chọn 3 Lá Bài Định Mệnh ({selectedFanIndices.length}/3)
                        </h2>
                        <p className="text-xs sm:text-sm text-[#A39BB5]">
                          Đang mở:{' '}
                          <strong className="text-[#F3E5AB]">
                            {deckMode === 'full_78'
                              ? 'Trọn Bộ 78 Lá Tarot (RWS 1909)'
                              : 'Bộ 22 Lá Ẩn Chính (Major Arcana)'}
                          </strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleQuickPickThree}
                        className="px-4 py-2 rounded-xl bg-[#171424] hover:bg-[#241E38] border border-[#D4AF37]/45 text-xs font-semibold text-[#F3E5AB] shrink-0 transition-colors cursor-pointer"
                      >
                        ✨ Rút nhanh 3 lá theo trực giác
                      </button>
                    </div>

                    {/* 3 Spread Position Slots */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {[0, 1, 2].map((slotIdx) => {
                        const pickedFanIdx = selectedFanIndices[slotIdx];
                        const isFilled = pickedFanIdx !== undefined;
                        return (
                          <div
                            key={slotIdx}
                            className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                              isFilled
                                ? 'bg-[#1D162B] border-[#F3E5AB] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                                : 'bg-[#09080D]/70 border-dashed border-[#D4AF37]/35'
                            }`}
                          >
                            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#D4AF37] font-semibold block">
                              Vị trí 0{slotIdx + 1}
                            </span>
                            <p className="font-display text-sm sm:text-base font-bold text-[#F8F5F0] truncate mt-0.5">
                              {currentSpreadPositions[slotIdx]}
                            </p>
                            <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/50 text-[#F3E5AB] border border-[#D4AF37]/30">
                              {isFilled
                                ? `Đã chọn lá #${pickedFanIdx + 1}`
                                : 'Đang chờ rút...'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {formError ? (
                      <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400/40 flex items-center gap-2.5 text-xs text-rose-200">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    ) : null}

                    {/* Loading State while Server Shuffles & AI Validates */}
                    {isSubmitting ? (
                      <div className="py-12 text-center space-y-4">
                        <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
                        <p className="font-display text-xl font-bold text-[#F3E5AB]">
                          {activeReaderObj.name} đang lật mở 3 lá bài của bạn...
                        </p>
                        <p className="text-xs text-[#A39BB5]">
                          Hệ thống đang ánh xạ CSPRNG và giải mã năng lượng theo đúng chủ đề bạn chọn.
                        </p>
                      </div>
                    ) : (
                      /* Interactive Arc Fan Grid (22 or 78 cards) */
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 sm:gap-2.5 pt-2 pb-4 justify-items-center max-h-[420px] overflow-y-auto pr-1">
                        {Array.from({ length: totalDeckCards }, (_, fanIdx) => {
                          const pickOrder = selectedFanIndices.indexOf(fanIdx);
                          const isPicked = pickOrder !== -1;
                          const tiltAngle = ((fanIdx % 11) - 5) * 1.5;

                          return (
                            <motion.button
                              key={fanIdx}
                              type="button"
                              data-testid={`fan-card-${fanIdx}`}
                              disabled={
                                isPicked || selectedFanIndices.length >= 3
                              }
                              onClick={() => handlePickFanCard(fanIdx)}
                              whileHover={{ y: -8, scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ rotate: isPicked ? 0 : tiltAngle }}
                              className={`relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl p-1.5 border transition-all cursor-pointer flex flex-col items-center justify-between ${
                                isPicked
                                  ? 'bg-gradient-to-b from-[#D4AF37]/35 to-[#1D152B] border-2 border-[#F3E5AB] shadow-[0_0_24px_rgba(212,175,55,0.6)] -translate-y-2'
                                  : 'bg-gradient-to-b from-[#1E152A] via-[#130E1D] to-[#09080D] border-[#D4AF37]/45 hover:border-[#F3E5AB]'
                              }`}
                            >
                              <span className="text-[9px] text-[#D4AF37]/80 font-mono">
                                #{fanIdx + 1}
                              </span>
                              <div className="w-7 h-7 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#F3E5AB] text-xs">
                                {isPicked ? `0${pickOrder + 1}` : '✦'}
                              </div>
                              <span className="text-[8px] uppercase tracking-wider text-[#F3E5AB]/75">
                                {isPicked ? `Vị trí ${pickOrder + 1}` : 'Rút lá'}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.section>
            ) : null}

            {/* ================= STEP 4A: CRISIS INTERVENTION SCREEN ================= */}
            {step === 4 && crisisResponse ? (
              <CrisisSupportView
                crisisSupport={crisisResponse.crisisSupport}
                onReturnHome={handleResetRitual}
              />
            ) : null}

            {/* ================= STEP 4B: GIẢI MÃ TRẢI BÀI, LÁ LÀM RÕ THỨ 4 & STORY 9:16 ================= */}
            {step === 4 && readingSuccess ? (
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="space-y-8"
              >
                {/* Top Summary Banner */}
                <div className="rounded-3xl bg-[#12101B] border border-[#D4AF37]/35 p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/45 text-xs font-bold text-[#F3E5AB]">
                        ✦ {readingSuccess.readerBadge}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#A39BB5]">
                        Chủ đề: {readingSuccess.topicLabel}
                      </span>
                      {readingSuccess.isKidTeenSafeMode ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs text-emerald-200 font-semibold">
                          🌸 Chế độ Học Đường Trong Sáng (10–15t)
                        </span>
                      ) : null}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F8F5F0]">
                      Thông Điệp Vũ Trụ Gửi Đến @{readingSuccess.nickname}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFlippedCards([true, true, true])}
                      className="px-4 py-2.5 rounded-2xl bg-[#171424] hover:bg-[#221D34] border border-[#D4AF37]/45 text-xs font-semibold text-[#F3E5AB] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1.5" />
                      Lật mở cả 3 lá
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStoryModalReading(readingSuccess);
                        setIsStoryModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E6C665] text-[#09080D] text-xs font-bold shadow-[0_6px_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 inline mr-1.5" />
                      Xuất Ảnh Story 9:16
                    </button>
                  </div>
                </div>

                {/* 3 Drawn Cards Interactive 3D Reveal Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                  {readingSuccess.drawnCards.map((drawnSlot, idx) => {
                    const isCardFlipped = flippedCards[idx] ?? true;
                    const analysis =
                      readingSuccess.result.cards_analysis[idx] ??
                      readingSuccess.result.cards_analysis[0];

                    return (
                      <div
                        key={drawnSlot.position_index}
                        className="w-full rounded-3xl bg-[#12101B] border border-[#D4AF37]/30 p-5 flex flex-col items-center space-y-4 shadow-[0_14px_40px_rgba(0,0,0,0.65)]"
                      >
                        <div className="text-center">
                          <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                            Lá số 0{idx + 1} • {drawnSlot.position_label}
                          </span>
                        </div>

                        <TarotCardVisual
                          card={drawnSlot.card}
                          reversed={drawnSlot.reversed}
                          isFlipped={isCardFlipped}
                          positionIndex={idx}
                          positionLabel={drawnSlot.position_label}
                          size="md"
                          onFlip={() => {
                            setFlippedCards((prev) => {
                              const next: [boolean, boolean, boolean] = [
                                ...prev,
                              ];
                              next[idx] = !next[idx];
                              return next;
                            });
                          }}
                        />

                        {/* Card Analysis Detail */}
                        <div className="w-full pt-3 border-t border-white/10 space-y-2 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-lg font-bold text-[#F8F5F0]">
                              {drawnSlot.card.roman}. {drawnSlot.card.name_vi}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/35">
                              {analysis.energy_keyword}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-[#D8D2E7] leading-relaxed">
                            {analysis.interpretation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reader Greeting Hook, Overall Verdict & Actionable Next Step */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 Cols: Deep Reading */}
                  <div className="lg:col-span-7 rounded-3xl bg-[#12101B] border border-[#D4AF37]/35 p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                        ✦ Lời Mở Đầu Từ {readingSuccess.readerDisplayName}
                      </span>
                      <p className="font-display text-xl sm:text-2xl italic text-[#F8F5F0] leading-relaxed">
                        “{readingSuccess.result.greeting_hook}”
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                        ✦ Tổng Kết Cục Diện (Overall Verdict)
                      </span>
                      <p className="text-sm sm:text-base text-[#E2E8F0] leading-relaxed">
                        {readingSuccess.result.overall_verdict}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#171424] border border-emerald-400/30 space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        Bước Đi Thực Tế Tiếp Theo Dành Cho Bạn
                      </span>
                      <p className="text-xs sm:text-sm text-[#F8F5F0] leading-relaxed">
                        {readingSuccess.result.actionable_next_step}
                      </p>
                    </div>
                  </div>

                  {/* Right 5 Cols: Highlighted Savage Quote Box + Story 9:16 Studio Trigger */}
                  <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#1E162B] via-[#151120] to-[#0E0B16] border-2 border-[#D4AF37] p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-[0_20px_60px_rgba(212,175,55,0.2)]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#F3E5AB]">
                          ✦ Câu Chốt Hạ Lên Story 9:16 ✦
                        </span>
                        <span className="text-[11px] text-[#A39BB5]">
                          Đổi Quote 0đ
                        </span>
                      </div>

                      {/* 3 Pre-generated Quote Tabs */}
                      <div className="grid grid-cols-3 gap-2">
                        {([0, 1, 2] as const).map((qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => setActiveQuoteIdx(qIdx)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              activeQuoteIdx === qIdx
                                ? 'bg-[#D4AF37] text-[#09080D] border-[#F3E5AB]'
                                : 'bg-[#09080D]/60 text-[#A39BB5] border-white/10 hover:text-[#F8F5F0]'
                            }`}
                          >
                            Phương án {qIdx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Active Quote Display */}
                      <div className="p-5 rounded-2xl bg-[#09080D]/90 border border-[#D4AF37]/40 space-y-3">
                        <p className="font-display text-xl sm:text-2xl font-bold text-[#F8F5F0] leading-snug">
                          “
                          {readingSuccess.result.shareable_card.savage_quotes[
                            activeQuoteIdx
                          ] || readingSuccess.result.shareable_card.savage_quote}
                          ”
                        </p>
                        <p className="text-xs text-[#A39BB5] leading-relaxed">
                          {readingSuccess.result.shareable_card.sub_advice}
                        </p>
                        <div className="pt-2 border-t border-white/10 text-xs text-[#F3E5AB] font-medium">
                          ★ Vật phẩm độ mệnh:{' '}
                          {readingSuccess.result.shareable_card.lucky_item}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStoryModalReading(readingSuccess);
                          setIsStoryModalOpen(true);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>✨ Xuất Ảnh Story 9:16 & Chia Sẻ Ngay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsTikTokStudioModalOpen(true)}
                        data-testid="step4-tiktok-studio-btn"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#171424] hover:bg-[#231D36] border border-[#D4AF37]/45 text-xs sm:text-sm font-bold text-[#F3E5AB] transition-colors cursor-pointer"
                      >
                        <span>🎬 Tạo Kịch Bản Đăng TikTok 3 Slide Từ Trải Bài Này</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetRitual}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-[#D8D2E7] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Trải một câu hỏi mới</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= LÁ BÀI LÀM RÕ THỨ 4 (CLARIFIER CARD — 5 ⭐) ================= */}
                {cliffhangerData ? (
                  <div className="rounded-3xl bg-gradient-to-r from-[#1D152B] via-[#141020] to-[#1D152B] border-2 border-[#D4AF37]/50 p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="space-y-1">
                        <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#F3E5AB] text-xs font-bold text-[#F3E5AB] inline-flex items-center gap-1.5">
                          <Unlock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Lá Bài Làm Rõ Thứ 4 (Clarifier Card • {cliffhangerData.clarifier_cost_stars} ⭐)
                        </span>
                        <h3 className="font-display text-2xl font-bold text-[#F8F5F0] pt-1">
                          Đào Sâu Góc Khuất Chưa Lộ Diện Trong 3 Lá Đầu
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsWalletModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09080D]/80 border border-[#D4AF37]/40 text-xs font-bold text-[#F3E5AB] cursor-pointer self-start sm:self-auto"
                      >
                        <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                        <span>Số dư: {quota.starsBalance ?? 15} ⭐ (Nạp thêm)</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-[#D8D2E7] leading-relaxed italic bg-[#09080D]/60 p-4 rounded-2xl border border-[#D4AF37]/25">
                      “{cliffhangerData.tease_text}”
                    </p>

                    {!clarifierCard ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#F3E5AB] block">
                            Chọn câu hỏi đào sâu gợi ý hoặc tự nhập câu hỏi phụ:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {cliffhangerData.suggested_followup_questions.map(
                              (q, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setFollowupQuestion(q)}
                                  className={`text-left text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                                    followupQuestion === q
                                      ? 'bg-[#D4AF37]/25 border-[#F3E5AB] text-[#F3E5AB] font-semibold'
                                      : 'bg-[#09080D]/70 border-white/10 text-[#A39BB5] hover:text-[#F8F5F0]'
                                  }`}
                                >
                                  “{q}”
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            maxLength={200}
                            value={followupQuestion}
                            onChange={(e) =>
                              setFollowupQuestion(e.target.value)
                            }
                            placeholder="Nhập câu hỏi làm rõ của bạn..."
                            className="flex-1 px-4 py-3.5 rounded-2xl bg-[#09080D] border border-[#D4AF37]/40 text-sm text-[#F8F5F0] focus:outline-none focus:border-[#F3E5AB]"
                          />

                          <button
                            type="button"
                            disabled={isDrawingClarifier}
                            onClick={() => void handleDrawClarifierCard()}
                            className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] font-bold text-xs sm:text-sm shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all cursor-pointer shrink-0 disabled:opacity-60"
                          >
                            {isDrawingClarifier
                              ? 'Đang rút Lá Thứ 4...'
                              : '🔓 Rút Lá Bài Làm Rõ Thứ 4 (5 ⭐)'}
                          </button>
                        </div>

                        {clarifierError ? (
                          <p className="text-xs text-rose-300">
                            {clarifierError}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      /* Unlocked 4th Clarifier Card Result */
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2"
                      >
                        <div className="md:col-span-4 flex flex-col items-center space-y-2">
                          <TarotCardVisual
                            card={clarifierCard.card}
                            reversed={clarifierCard.reversed}
                            isFlipped={isClarifierFlipped}
                            positionIndex={3}
                            positionLabel="LÁ LÀM RÕ THỨ 4"
                            size="md"
                            onFlip={() =>
                              setIsClarifierFlipped((prev) => !prev)
                            }
                          />
                        </div>

                        <div className="md:col-span-8 rounded-2xl bg-[#09080D]/85 border border-[#D4AF37]/45 p-5 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs font-bold text-emerald-200">
                              ✓ Đã mở khóa Lá Làm Rõ (-{clarifierCard.starsSpent} ⭐)
                            </span>
                            <span className="text-xs text-[#D4AF37] font-semibold">
                              {clarifierCard.card.roman} •{' '}
                              {clarifierCard.card.name_vi} (
                              {clarifierCard.reversed
                                ? 'Chiều Ngược ↺'
                                : 'Chiều Xuôi ↑'}
                              )
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-[#A39BB5]">
                              Câu hỏi làm rõ:{' '}
                              <em className="text-[#F3E5AB]">
                                “{clarifierCard.questionAsked}”
                              </em>
                            </p>
                            <p className="text-sm sm:text-base text-[#F8F5F0] leading-relaxed mt-2">
                              {clarifierCard.interpretation}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#171424] border border-emerald-400/30 space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                              Lời khuyên chốt hạ từ lá thứ 4:
                            </span>
                            <p className="text-xs sm:text-sm text-[#D8D2E7]">
                              {clarifierCard.advice}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-[#12101B] border border-[#D4AF37]/30">
                            <p className="font-display text-base italic text-[#F3E5AB]">
                              “{clarifierCard.savageQuote}”
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : null}

                {/* Mandatory Ethical Disclaimer */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-xs text-[#A39BB5]">
                    {readingSuccess.result.disclaimer}
                  </p>
                </div>
              </motion.section>
            ) : null}
          </>
        )}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-white/10 bg-[#09080D]/90 py-5 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A39BB5]">
          <p>
            Tarot là hình thức giải trí và tự phản chiếu, không thay thế tư vấn chuyên môn.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLegalModalOpen(true)}
              className="hover:text-[#F3E5AB] underline cursor-pointer"
            >
              Điều khoản & Quyền riêng tư (Nghị định 13/2023/NĐ-CP)
            </button>
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}
      {storyModalReading ? (
        <StoryCardModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          readingData={storyModalReading}
          initialQuoteIndex={activeQuoteIdx}
          onQuotaUpdated={(newQuota) =>
            setQuota((prev) => ({ ...prev, ...newQuota }))
          }
        />
      ) : null}

      <DailyStreakModal
        isOpen={isDailyStreakModalOpen}
        onClose={() => setIsDailyStreakModalOpen(false)}
        nickname={nickname}
        birthYear={birthYear}
        readerId={selectedReaderId}
        quota={quota}
        onQuotaUpdated={(newQuota) =>
          setQuota((prev) => ({ ...prev, ...newQuota }))
        }
      />

      <WalletPayOSModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        birthYear={birthYear}
        onBirthYearChange={(yr) => setBirthYear(yr)}
        quota={quota}
        onQuotaUpdated={(newQuota) =>
          setQuota((prev) => ({ ...prev, ...newQuota }))
        }
        onOpenDailyModal={() => setIsDailyStreakModalOpen(true)}
      />

      <FunnelAnalyticsModal
        isOpen={isFunnelModalOpen}
        onClose={() => setIsFunnelModalOpen(false)}
      />

      <SpiritualWrappedModal
        isOpen={isWrappedModalOpen}
        onClose={() => setIsWrappedModalOpen(false)}
        nickname={nickname}
        readerId={selectedReaderId}
        onQuotaUpdated={(newQuota) =>
          setQuota((prev) => ({ ...prev, ...newQuota }))
        }
      />

      <TikTokStudioModal
        isOpen={isTikTokStudioModalOpen}
        onClose={() => setIsTikTokStudioModalOpen(false)}
        currentReading={readingSuccess}
      />

      <ReferralAndAdModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        nickname={nickname}
        initialReferralCode={referralCodeParam}
        quota={quota}
        onQuotaUpdated={(newQuota) =>
          setQuota((prev) => ({ ...prev, ...newQuota }))
        }
      />

      <LegalPrivacyModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        onClearHistory={() => {
          try {
            localStorage.removeItem('tc_nickname');
            localStorage.removeItem('tc_birth_year');
          } catch {}
          setQuestionText('');
          setReadingSuccess(null);
          setClarifierCard(null);
        }}
        onResetSession={() => {
          try {
            localStorage.clear();
          } catch {}
          setNickname('Mèo Đêm');
          setBirthYear(2004);
          setSelectedReaderId('ba_co_mo_hon');
          setSelectedTopic('love');
          void claimBonusTurn('reset_demo_quota');
          handleResetRitual();
        }}
      />

      {/* Rewarded Ad / Share Bonus Modal (+1 Free Turn) */}
      <AnimatePresence>
        {isRewardModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[#12101B] border border-[#D4AF37]/45 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#F3E5AB] font-bold text-sm">
                  <Gift className="w-4 h-4 text-[#D4AF37]" />
                  <span>Nhận Thêm Lượt Bốc Bài Miễn Phí</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="text-xs text-[#A39BB5] hover:text-[#F8F5F0] cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#A39BB5] leading-relaxed">
                Bạn hiện có{' '}
                <strong className="text-[#F8F5F0]">
                  {quota.remainingToday} lượt
                </strong>{' '}
                miễn phí hôm nay. Bạn có thể nhận thêm +1 lượt hoàn toàn miễn phí bằng một trong hai cách:
              </p>

              {bonusBanner ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{bonusBanner}</span>
                </div>
              ) : null}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => void claimBonusTurn('share_bonus')}
                  className="w-full p-4 rounded-2xl bg-[#171424] hover:bg-[#231E36] border border-[#D4AF37]/40 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-[#F3E5AB]">
                      1. Chia sẻ ảnh Story 9:16 hoặc mời bạn bè
                    </p>
                    <p className="text-xs text-[#A39BB5] mt-0.5">
                      Nhận ngay +1 lượt trải bài miễn phí (0đ)
                    </p>
                  </div>
                  <Share2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                </button>

                <button
                  type="button"
                  disabled={adCountdown !== null}
                  onClick={handleWatchSimulatedRewardedAd}
                  className="w-full p-4 rounded-2xl bg-[#171424] hover:bg-[#231E36] border border-emerald-400/35 text-left flex items-center justify-between transition-colors cursor-pointer disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-bold text-emerald-300">
                      {adCountdown !== null
                        ? `Đang phát thông điệp tài trợ... (${adCountdown}s)`
                        : '2. Xem Quảng Cáo Nhận Thưởng (Mô phỏng 5s)'}
                    </p>
                    <p className="text-xs text-[#A39BB5] mt-0.5">
                      Quảng cáo nhận thưởng miễn phí — Mạng quảng cáo trả tiền cho App
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-emerald-300 shrink-0" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
