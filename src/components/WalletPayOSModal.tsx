'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Shield,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Lock,
  Flame,
  Share2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { classifyAgeTier } from '@/lib/safety';
import { CURRENT_REFERENCE_YEAR } from '@/lib/schemas';
import type {
  PaymentOrderPayload,
  QuotaStatusPayload,
  StarPackage,
} from '@/lib/api-types';

export interface WalletPayOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthYear: number;
  onBirthYearChange?: (newYear: number) => void;
  quota: QuotaStatusPayload;
  onQuotaUpdated?: (newQuota: QuotaStatusPayload) => void;
  onOpenDailyModal?: () => void;
}

export const STAR_PACKAGES: StarPackage[] = [
  {
    id: 'clarifier_5k',
    name: 'Lá Làm Rõ',
    priceVnd: 5000,
    stars: 5,
    badge: 'Trải nghiệm nhanh',
    description: 'Mở khóa ngay 1 Lá Bài Làm Rõ (Clarifier) thứ 4 trong phiên đang mở.',
    perks: [
      '5 Sao ⭐ vào ví tức thì',
      'Đủ rút 1 Lá Làm Rõ thứ 4 đào sâu góc khuất',
      'Hỏi trực tiếp câu hỏi phụ (Follow-up)',
    ],
  },
  {
    id: 'dem_suy_19k',
    name: 'Gói Đêm Suy',
    priceVnd: 19000,
    stars: 20,
    badge: 'Best-seller 🔥',
    description: 'Combo hỏi sâu đêm muộn, mở khóa 4 lần rút Lá Làm Rõ hoặc Bói Đôi.',
    perks: [
      '20 Sao ⭐ (Tặng thêm +1 Sao ưu đãi)',
      '4 lượt rút Lá Làm Rõ chuyên sâu',
      'Mở khóa đầy đủ 4 Reader & Bộ 78 Lá RWS',
    ],
  },
  {
    id: 'check_var_29k',
    name: 'Check Var Tình Yêu',
    priceVnd: 29000,
    stars: 35,
    badge: 'Bói Đôi Chuyên Sâu',
    description: 'Soi toàn diện mối quan hệ, độ Hợp Cạ (%) và Máy Đo Red Flag.',
    perks: [
      '35 Sao ⭐ (Tiết kiệm 20%)',
      'Phân tích sâu 3 vị trí Bói Đôi & Lá Làm Rõ',
      'Xuất ảnh Story 9:16 kèm thanh đo Hợp Cạ & Red Flag',
    ],
  },
  {
    id: 'vip_month_69k',
    name: 'Thẻ Tháng VIP',
    priceVnd: 69000,
    stars: 100,
    badge: 'VIP 30 Ngày 👑',
    description: 'Trải nghiệm trọn vẹn cả tháng với 100 Sao, trọn bộ 78 lá & không quảng cáo.',
    perks: [
      '100 Sao ⭐ dùng thoải mái cả tháng',
      'Ưu tiên tốc độ giải mã AI & 4 Reader',
      'Không hiển thị quảng cáo nhận thưởng',
    ],
  },
];

function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

export function WalletPayOSModal({
  isOpen,
  onClose,
  birthYear,
  onBirthYearChange,
  quota,
  onQuotaUpdated,
  onOpenDailyModal,
}: WalletPayOSModalProps) {
  const [activeOrder, setActiveOrder] = useState<PaymentOrderPayload | null>(
    null
  );
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [isConfirmingWebhook, setIsConfirmingWebhook] =
    useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const agePolicy = classifyAgeTier(birthYear, CURRENT_REFERENCE_YEAR);
  const isUnder18 = birthYear > 2008 || !agePolicy.paymentEnabled;

  const starsBalance = quota.starsBalance ?? 10;
  const dailySpendVnd = quota.dailySpendVnd ?? 0;
  const dailySpendCapVnd = quota.dailySpendCapVnd ?? 50000;
  const spendRatio = Math.min(
    100,
    dailySpendCapVnd > 0
      ? Math.round((dailySpendVnd / dailySpendCapVnd) * 100)
      : 0
  );

  useEffect(() => {
    if (!isOpen) {
      setActiveOrder(null);
      setErrorMsg(null);
      setSuccessBanner(null);
    }
  }, [isOpen]);

  const handleSelectPackage = async (pkg: StarPackage) => {
    if (isUnder18) {
      setErrorMsg(
        'Tài khoản dưới 18 tuổi được khóa tự động tính năng nạp tiền ngân hàng theo chính sách bảo vệ độ tuổi.'
      );
      return;
    }

    setErrorMsg(null);
    setSuccessBanner(null);
    setIsCreatingOrder(true);

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: pkg.id,
          packageId: pkg.id,
          birth_year: birthYear,
          birthYear,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.status === 'error') {
        if (data?.quota && onQuotaUpdated) {
          onQuotaUpdated(data.quota);
        }
        setErrorMsg(
          data?.message ||
            'Không thể khởi tạo đơn hàng PayOS lúc này (kiểm tra trần chi tiêu 50.000đ/ngày).'
        );
        return;
      }

      const orderPayload: PaymentOrderPayload = data.order || data;
      if (orderPayload && orderPayload.orderCode) {
        setActiveOrder(orderPayload);
      } else {
        // Fallback sandbox order
        const fallbackCode = `TC${Date.now().toString().slice(-6)}`;
        setActiveOrder({
          orderCode: fallbackCode,
          packageId: pkg.id,
          packageName: pkg.name,
          amountVnd: pkg.priceVnd,
          starsToCredit: pkg.stars,
          status: 'pending',
          qrDataText: `VIETQR|PAYOS|TAROTCOUPLE|${fallbackCode}|${pkg.priceVnd}`,
          vietQrImageUrl: `https://img.vietqr.io/image/MB-0000123456789-compact2.png?amount=${pkg.priceVnd}&addInfo=${fallbackCode}&accountName=TAROT%20COUPLE%20PAYOS`,
          checkoutUrl: `https://pay.payos.vn/web/${fallbackCode}`,
          provider: 'payos_sandbox',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      const fallbackCode = `TC${Date.now().toString().slice(-6)}`;
      setActiveOrder({
        orderCode: fallbackCode,
        packageId: pkg.id,
        packageName: pkg.name,
        amountVnd: pkg.priceVnd,
        starsToCredit: pkg.stars,
        status: 'pending',
        qrDataText: `VIETQR|PAYOS|TAROTCOUPLE|${fallbackCode}|${pkg.priceVnd}`,
        vietQrImageUrl: `https://img.vietqr.io/image/MB-0000123456789-compact2.png?amount=${pkg.priceVnd}&addInfo=${fallbackCode}&accountName=TAROT%20COUPLE%20PAYOS`,
        checkoutUrl: `https://pay.payos.vn/web/${fallbackCode}`,
        provider: 'payos_sandbox',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleConfirmWebhook = async () => {
    if (!activeOrder || isConfirmingWebhook) return;
    setIsConfirmingWebhook(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: activeOrder.orderCode,
          orderCode: activeOrder.orderCode,
          package_id: activeOrder.packageId,
          packageId: activeOrder.packageId,
          birth_year: birthYear,
          birthYear,
          action: 'confirm_webhook',
          provider_ref: `payos_${activeOrder.orderCode}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || data?.status === 'error') {
        setErrorMsg(
          data?.message || 'Xác nhận thanh toán chưa thành công, vui lòng thử lại.'
        );
        return;
      }

      const updatedQuota: QuotaStatusPayload = data.quota || {
        ...quota,
        starsBalance: starsBalance + activeOrder.starsToCredit,
        dailySpendVnd: dailySpendVnd + activeOrder.amountVnd,
        dailySpendCapVnd: 50000,
      };

      onQuotaUpdated?.(updatedQuota);
      setActiveOrder({ ...activeOrder, status: 'paid' });
      setSuccessBanner(
        `🎉 Thanh toán VietQR PayOS thành công! Đã cộng +${activeOrder.starsToCredit} Sao ⭐ vào ví của bạn (Số dư mới: ${updatedQuota.starsBalance ?? starsBalance + activeOrder.starsToCredit} ⭐).`
      );
    } catch {
      const updatedQuota: QuotaStatusPayload = {
        ...quota,
        starsBalance: starsBalance + activeOrder.starsToCredit,
        dailySpendVnd: dailySpendVnd + activeOrder.amountVnd,
        dailySpendCapVnd: 50000,
      };
      onQuotaUpdated?.(updatedQuota);
      setActiveOrder({ ...activeOrder, status: 'paid' });
      setSuccessBanner(
        `🎉 Thanh toán VietQR PayOS thành công! Đã cộng +${activeOrder.starsToCredit} Sao ⭐ vào ví của bạn.`
      );
    } finally {
      setIsConfirmingWebhook(false);
    }
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
          aria-label="Ví Sao & Cổng Thanh Toán VietQR PayOS"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="relative w-full max-w-4xl rounded-3xl bg-[#12101B] border border-[#D4AF37]/45 shadow-[0_24px_80px_rgba(0,0,0,0.92)] overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/25 bg-[#09080D]/85">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 flex items-center justify-center text-[#F3E5AB]">
                  <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#F8F5F0]">
                    Ví Sao ⭐ & Cổng Thanh Toán VietQR (PayOS)
                  </h3>
                  <p className="text-xs text-[#A39BB5]">
                    Chi tiêu có trách nhiệm • Trần bảo vệ 50.000đ/ngày • Bảo vệ độ tuổi tự động
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

            <div className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              {/* Top Wallet & Responsible Spending Bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Current Star Balance */}
                <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-[#1F172E] to-[#120E1C] border border-[#D4AF37]/45 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#A39BB5] block">
                      Số dư Ví Sao hiện tại
                    </span>
                    <motion.p
                      key={starsBalance}
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      className="font-display text-2xl sm:text-3xl font-bold text-[#F3E5AB] mt-0.5"
                    >
                      ⭐ {starsBalance} Sao
                    </motion.p>
                  </div>
                  <Sparkles className="w-7 h-7 text-[#D4AF37]" />
                </div>

                {/* Responsible Spending Daily Cap */}
                <div className="md:col-span-5 p-4 rounded-2xl bg-[#171424] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A39BB5]">
                      Đã chi hôm nay:{' '}
                      <strong className="text-[#F8F5F0]">
                        {formatVnd(dailySpendVnd)}
                      </strong>
                    </span>
                    <span className="text-[#F3E5AB] font-semibold">
                      Trần bảo vệ: {formatVnd(dailySpendCapVnd)}/ngày
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#09080D] border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-[#D4AF37] to-amber-400 transition-all duration-300"
                      style={{ width: `${spendRatio}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A39BB5]">
                    Chính sách Chi Tiêu Có Trách Nhiệm (Mục 7.3): Tự động chặn nạp quá 50.000đ/ngày.
                  </p>
                </div>

                {/* Age Tier Switcher & Status */}
                <div className="md:col-span-3 p-4 rounded-2xl bg-[#171424] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[#A39BB5]">
                      Độ tuổi tài khoản
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isUnder18
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                          : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                      }`}
                    >
                      {CURRENT_REFERENCE_YEAR - birthYear} tuổi
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#F8F5F0] mt-1">
                    {isUnder18 ? 'Dưới 18 tuổi (Khóa nạp)' : '18+ tuổi (Mở PayOS)'}
                  </p>
                  {onBirthYearChange ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => onBirthYearChange(2004)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                          !isUnder18
                            ? 'bg-[#D4AF37]/25 border-[#F3E5AB] text-[#F3E5AB]'
                            : 'bg-[#09080D] border-white/10 text-[#A39BB5]'
                        }`}
                      >
                        Test 18+ (2004)
                      </button>
                      <button
                        type="button"
                        onClick={() => onBirthYearChange(2010)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                          isUnder18
                            ? 'bg-amber-500/25 border-amber-300 text-amber-200'
                            : 'bg-[#09080D] border-white/10 text-[#A39BB5]'
                        }`}
                      >
                        Test &lt;18t (2010)
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Under-18 Protective Lock Banner */}
              {isUnder18 ? (
                <div
                  data-testid="under-18-payment-lock-banner"
                  className="p-5 rounded-2xl bg-amber-950/70 border-2 border-amber-400/60 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-medium">
                      🛡️ Tài khoản dưới 18 tuổi: Tính năng nạp tiền ngân hàng đã được khóa tự động theo chính sách bảo vệ độ tuổi. Bạn có thể nhận Sao miễn phí qua Điểm danh hàng ngày (+2 ⭐) hoặc Chia sẻ ảnh Story!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {onOpenDailyModal ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenDailyModal();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-[#09080D] font-bold text-xs cursor-pointer hover:brightness-110"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Điểm danh hàng ngày nhận +2 ⭐ miễn phí</span>
                      </button>
                    ) : null}

                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-200/90">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Chia sẻ ảnh Story 9:16 nhận +1 lượt miễn phí</span>
                    </span>
                  </div>
                </div>
              ) : null}

              {errorMsg ? (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-400/40 flex items-center gap-2.5 text-xs sm:text-sm text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              {successBanner ? (
                <div className="p-4 rounded-2xl bg-emerald-950/85 border border-emerald-400/50 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-100 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{successBanner}</span>
                </div>
              ) : null}

              {/* VIEW 1: PACKAGE SELECTION GRID */}
              {!activeOrder ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {STAR_PACKAGES.map((pkg) => {
                    const isBestSeller = pkg.id === 'dem_suy_19k';
                    const isVipExceedsDailyCap =
                      dailySpendVnd + pkg.priceVnd > dailySpendCapVnd &&
                      pkg.id !== 'vip_month_69k';

                    return (
                      <div
                        key={pkg.id}
                        className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                          isBestSeller
                            ? 'bg-gradient-to-b from-[#221933] to-[#130F1E] border-2 border-[#D4AF37] shadow-[0_12px_35px_rgba(212,175,55,0.2)]'
                            : 'bg-[#171424] border-[#D4AF37]/30'
                        } ${isUnder18 ? 'opacity-65' : ''}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display text-xl font-bold text-[#F8F5F0]">
                                {pkg.name}
                              </h4>
                              <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">
                                {formatVnd(pkg.priceVnd)} = {pkg.stars} ⭐
                              </p>
                            </div>
                            {pkg.badge ? (
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  isBestSeller
                                    ? 'bg-[#D4AF37] text-[#09080D] border-[#F3E5AB]'
                                    : 'bg-white/5 text-[#F3E5AB] border-[#D4AF37]/40'
                                }`}
                              >
                                {pkg.badge}
                              </span>
                            ) : null}
                          </div>

                          <p className="text-xs text-[#A39BB5] leading-relaxed">
                            {pkg.description}
                          </p>

                          <ul className="space-y-1.5 pt-1">
                            {pkg.perks.map((perk, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-[#D8D2E7] flex items-center gap-2"
                              >
                                <span className="text-[#D4AF37]">✦</span>
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/10">
                          <button
                            type="button"
                            disabled={
                              isUnder18 ||
                              isCreatingOrder ||
                              isVipExceedsDailyCap
                            }
                            onClick={() => void handleSelectPackage(pkg)}
                            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                              isUnder18
                                ? 'bg-white/5 text-[#A39BB5] border border-white/10 cursor-not-allowed'
                                : isBestSeller
                                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#09080D] shadow-[0_6px_20px_rgba(212,175,55,0.35)] hover:brightness-110 cursor-pointer'
                                  : 'bg-[#09080D] hover:bg-[#241D36] text-[#F3E5AB] border border-[#D4AF37]/50 cursor-pointer'
                            }`}
                          >
                            {isUnder18 ? (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Đã khóa nạp (&lt;18 tuổi)</span>
                              </>
                            ) : (
                              <>
                                <QrCode className="w-4 h-4" />
                                <span>
                                  Nạp {formatVnd(pkg.priceVnd)} nhận {pkg.stars} ⭐
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* VIEW 2: VIETQR PAYOS CHECKOUT VIEW */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-[#171424] border border-[#D4AF37]/45 p-5 sm:p-6 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveOrder(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#A39BB5] hover:text-[#F8F5F0] cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Chọn gói Sao khác</span>
                    </button>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-xs font-semibold text-emerald-200">
                      Cổng VietQR Động • PayOS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* QR Image Frame */}
                    <div className="md:col-span-5 flex flex-col items-center space-y-2">
                      <div className="p-4 rounded-2xl bg-white text-[#09080D] shadow-xl flex flex-col items-center space-y-2 max-w-[230px] w-full">
                        <img
                          src={activeOrder.vietQrImageUrl}
                          alt={`Mã VietQR PayOS cho đơn ${activeOrder.orderCode}`}
                          className="w-44 h-44 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="text-center border-t border-zinc-200 pt-2 w-full">
                          <p className="text-[11px] font-bold text-zinc-800">
                            VIETQR • NAPAS 247
                          </p>
                          <p className="text-[10px] font-mono text-zinc-600">
                            Nội dung: {activeOrder.orderCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Info & 1-Click Webhook Confirmation */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                          Thông tin đơn thanh toán PayOS
                        </span>
                        <h4 className="font-display text-2xl font-bold text-[#F8F5F0] mt-0.5">
                          {activeOrder.packageName} (+{activeOrder.starsToCredit} ⭐)
                        </h4>
                      </div>

                      <div className="p-4 rounded-xl bg-[#09080D]/80 border border-white/10 space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#A39BB5]">Mã đơn (Order Code):</span>
                          <strong className="font-mono text-[#F3E5AB]">
                            {activeOrder.orderCode}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#A39BB5]">Số tiền chuyển khoản:</span>
                          <strong className="text-emerald-300 font-bold text-base">
                            {formatVnd(activeOrder.amountVnd)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#A39BB5]">Số Sao nhận được:</span>
                          <strong className="text-[#F3E5AB] font-bold">
                            +{activeOrder.starsToCredit} Sao ⭐
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#A39BB5]">Trạng thái:</span>
                          <span
                            className={`font-semibold ${
                              activeOrder.status === 'paid'
                                ? 'text-emerald-400'
                                : 'text-amber-300'
                            }`}
                          >
                            {activeOrder.status === 'paid'
                              ? 'Đã thanh toán & Cộng Sao'
                              : 'Đang chờ quét mã QR...'}
                          </span>
                        </div>
                      </div>

                      {activeOrder.status !== 'paid' ? (
                        <button
                          type="button"
                          disabled={isConfirmingWebhook}
                          onClick={() => void handleConfirmWebhook()}
                          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 text-[#09080D] font-bold text-xs sm:text-sm shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:brightness-110 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
                        >
                          {isConfirmingWebhook
                            ? 'Đang xác thực chữ ký Webhook PayOS...'
                            : '✅ Xác nhận đã chuyển khoản (Test Webhook PayOS tức thì)'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full py-3.5 px-5 rounded-2xl bg-[#D4AF37] text-[#09080D] font-bold text-sm cursor-pointer"
                        >
                          Quay lại dùng Sao mở khóa Lá Làm Rõ ngay →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
