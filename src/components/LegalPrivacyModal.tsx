'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Trash2,
  RotateCcw,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface LegalPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onResetSession: () => void;
}

export function LegalPrivacyModal({
  isOpen,
  onClose,
  onClearHistory,
  onResetSession,
}: LegalPrivacyModalProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleClearLocalHistory = () => {
    onClearHistory();
    setFeedbackMessage(
      'Đã xóa toàn bộ lịch sử bốc bài và câu hỏi lưu trên thiết bị này.'
    );
  };

  const handleResetAccountSession = () => {
    onResetSession();
    setFeedbackMessage(
      'Đã đặt lại toàn bộ dữ liệu phiên, biệt danh và tùy chọn cá nhân về mặc định.'
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Điều khoản sử dụng và Chính sách quyền riêng tư"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 14 }}
            className="relative w-full max-w-2xl rounded-3xl bg-[#12101B] border border-[#D4AF37]/40 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20 bg-[#09080D]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#F8F5F0]">
                  Điều Khoản, Quyền Riêng Tư & Bảo Vệ Dữ Liệu
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#F8F5F0] transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm text-[#D8D2E7] leading-relaxed">
              {/* Section 1: Positioning */}
              <div className="p-4 rounded-2xl bg-[#171424] border border-[#D4AF37]/25 space-y-1.5">
                <p className="font-semibold text-[#F3E5AB] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  1. Định vị dịch vụ: Giải trí & Tự phản chiếu tâm lý
                </p>
                <p className="text-xs sm:text-sm text-[#A39BB5]">
                  Tarot Couple là ứng dụng trò chơi giải trí và tự phản chiếu tâm lý (Journaling / Self-reflection) dựa trên hệ biểu tượng 22 lá Major Arcana Rider-Waite-Smith 1909. Mọi thông điệp hoàn toàn mang tính chất tham khảo tinh thần, không khẳng định tương lai tuyệt đối và không thay thế tư vấn y tế, tâm lý, pháp lý hay tài chính chuyên nghiệp.
                </p>
              </div>

              {/* Section 2: Privacy & PDPD Decree 13/2023/ND-CP */}
              <div className="p-4 rounded-2xl bg-[#171424] border border-white/10 space-y-1.5">
                <p className="font-semibold text-[#F8F5F0] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  2. Bảo vệ dữ liệu cá nhân (Tuân thủ Nghị định 13/2023/NĐ-CP)
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-[#A39BB5] space-y-1">
                  <li>
                    <strong className="text-[#F8F5F0]">Ẩn danh hóa trước khi gọi AI:</strong> Hệ thống tuyệt đối không gửi email, số điện thoại hay định danh cá nhân (PII) tới nhà cung cấp mô hình AI; chỉ gửi biệt danh và nội dung câu hỏi đã lọc thẻ bảo mật.
                  </li>
                  <li>
                    <strong className="text-[#F8F5F0]">Tự động xóa sau 90 ngày:</strong> Nội dung câu hỏi (`question_text`) được tự động ẩn/xóa định kỳ sau 90 ngày và người dùng có toàn quyền xóa ngay lập tức bên dưới.
                  </li>
                  <li>
                    <strong className="text-[#F8F5F0]">Mặc định ẩn câu hỏi khi chia sẻ:</strong> Trên ảnh Story 9:16, công tắc <em>“Ẩn câu hỏi của tôi”</em> luôn được bật mặc định để bảo vệ bí mật riêng tư.
                  </li>
                </ul>
              </div>

              {/* Section 3: Age Policy */}
              <div className="p-4 rounded-2xl bg-[#171424] border border-white/10 space-y-1.5">
                <p className="font-semibold text-[#F8F5F0]">
                  3. Phân tầng bảo vệ theo độ tuổi (Ngưỡng 10+)
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-[#A39BB5] space-y-1">
                  <li>
                    <strong className="text-emerald-300">Nhóm 10–15 tuổi (Chế độ Học Đường Trong Sáng):</strong> Tự động chuyển sang chủ đề học tập, bạn bè trong sáng; chuyển giọng văn <em>Bà Cố Mỏ Hỗn</em> sang <em>Bà Ngoại Vui Tính</em> ấm áp; khóa 100% tính năng nạp tiền.
                  </li>
                  <li>
                    <strong className="text-amber-200">Nhóm 16–17 tuổi:</strong> Mở các chủ đề giải trí phù hợp lứa tuổi, khóa tính năng thanh toán ngân hàng.
                  </li>
                  <li>
                    <strong className="text-[#F3E5AB]">Nhóm 18+ tuổi:</strong> Mở đầy đủ chủ đề và cá tính Reader gốc, áp dụng trần chi tiêu có trách nhiệm (tối đa 50.000đ/ngày ở Phase 2).
                  </li>
                </ul>
              </div>

              {/* Feedback Toast */}
              {feedbackMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 flex items-center gap-2.5 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {/* Data Management Controls per Section 8.4 */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Quyền kiểm soát & Xóa dữ liệu của bạn
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleClearLocalHistory}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-400/35 text-rose-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa lịch sử bốc bài trên thiết bị này</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAccountSession}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#171424] hover:bg-[#221D35] border border-[#D4AF37]/35 text-[#F3E5AB] text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Đặt lại dữ liệu tài khoản / phiên</span>
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
