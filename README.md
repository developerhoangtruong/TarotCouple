# 🔮 Tarot Couple — Super-App Bói Tarot AI & Bói Đôi (RWS 1909)

**Tarot Couple** là ứng dụng web (PWA) phản chiếu tâm lý và giải trí bằng bài Tarot (bộ chuẩn **Rider-Waite-Smith 1909 Public Domain**), tích hợp **4 Reader AI đa cá tính**, chế độ **Bói Đôi ẩn danh 48h**, **Lá Làm Rõ thứ 4**, xuất ảnh **Story 9:16 (1080×1920)** phía server và **Tăng trưởng Viral (Spiritual Wrapped, TikTok 3-Slide Studio, Referral & Rewarded Ads)**.

---

## ✨ Tính Năng Nổi Bật Qua 5 Giai Đoạn (Phase 0 – Phase 4)

### 1. Phase 0 & Phase 1 — Nền Tảng Cốt Lõi & An Toàn Tuyệt Đối (MVP)
- **Bộ bài chuẩn RWS 1909 (Public Domain):** Hỗ trợ chuyển đổi linh hoạt giữa **Bộ 22 Lá Ẩn Chính (Major Arcana)** cô đọng và **Trọn Bộ 78 Lá (22 Major + 56 Minor Arcana: Gậy, Cốc, Kiếm, Tiền)**.
- **Xáo bài mật mã phía Server (CSPRNG Fisher-Yates):** Sử dụng `crypto.getRandomValues()` với tỷ lệ lá bài ngược (Reversed) mặc định `30%`. Mô hình AI chỉ giải nghĩa các lá đã được chọn, tuyệt đối không để AI tự bịa lá bài.
- **4 Nhân vật Reader AI cá tính:**
  1. **Bà Cố Mỏ Hỗn** (*Phũ nhưng thương, vả tỉnh mộng lụy tình*)
  2. **Tiên Tử Chữa Lành** (*Dịu dàng, ôm ấp tâm hồn & manifest năng lượng lành*)
  3. **Tổng Tài Lý Trí** (*Phân tích chiến lược, quản trị rủi ro & xác suất*)
  4. **Pháp Sư Tối Cổ** (*Huyền học cổ điển, giải mã biểu tượng Rider-Waite-Smith*)
- **Kiểm duyệt Khủng hoảng Tâm lý Độc lập (Crisis Intervention):** Quét từ khóa nhạy cảm trước khi gọi AI. Khi phát hiện dấu hiệu khủng hoảng (`crisis`), hệ thống lập tức ngắt luồng bói bài, tắt mọi tính năng thu phí/chia sẻ và hiển thị màn hình hỗ trợ khẩn cấp (**Tổng đài 111**, **Cấp cứu 115**, **Đường dây nóng Ngày Mai `096 306 1414`**).
- **Chính sách Độ tuổi 3 Tầng (10+ Age Policy):**
  - **10–15 tuổi (*Chế độ Học Đường Trong Sáng*):** Tự động chuyển chủ đề sang *Tình bạn & Crush học đường*, *Học tập / Thi cử*, *Vận may ngày mới*; chuyển giọng `Bà Cố Mỏ Hỗn` thành **Bà Ngoại Vui Tính**; khóa 100% tính năng nạp tiền.
  - **16–17 tuổi:** Mở chủ đề giải trí nhưng khóa nạp tiền qua ngân hàng/VietQR.
  - **18+ tuổi:** Mở toàn bộ tính năng và cổng thanh toán VietQR PayOS (kèm trần chi tiêu có trách nhiệm `50.000đ/ngày`).

### 2. Phase 2 — Xuất Ảnh Story 9:16 Server-Side & Kiểm Chứng Funnel
- **Xưởng Ảnh Story 9:16 (`1080×1920`) phía Server:** Render đồng nhất trên mọi thiết bị (`/api/story-card`), căn sẵn vùng an toàn `250px` trên/dưới cho Instagram Story và TikTok.
- **Quyền riêng tư mặc định:** Công tắc *"Ẩn câu hỏi của tôi"* được bật sẵn để bảo vệ bí mật cá nhân khi đăng Story.
- **Đổi Quote 0đ:** Sinh sẵn 3 phương án `savage_quotes[]` trong cùng 1 lượt gọi AI.
- **Bảng Kiểm Chứng Giả Định Thị Trường & Daily AI Hard Cap:** Theo dõi trực tiếp 5 giả định cốt lõi và tự động ngắt lượt miễn phí nếu chạm trần ngân sách AI hàng ngày.

### 3. Phase 3 — Bói Đôi (TarotCouple), Lá Làm Rõ Thứ 4, Ví Sao & PayOS VietQR
- **Bói Đôi 2 Chế Độ (`/api/couple`):**
  - **Kiểu 1 (Tự soi):** Tự rút 2 lá đại diện cho Bạn & Người ấy + 1 lá kết nối.
  - **Kiểu 2 (Mời người kia cùng rút 48h):** Người A rút lá của mình và tạo link phòng (`?coupleRoom=XYZ`). Người B mở link chỉ thấy lời mời và rút lá của mình, **tuyệt đối không thấy câu hỏi riêng tư của Người A**. Kết quả Hợp Cạ (%) & Red Flag 🚩 chỉ mở khóa khi cả hai đồng ý xem chung.
- **Lá Bài Làm Rõ Thứ 4 (`Clarifier Card` — `/api/clarifier`):** Đặt câu hỏi phụ đào sâu góc khuất sau 3 lá đầu tiên với chi phí `5 ⭐`.
- **Điểm Danh Hàng Ngày (`Daily 1-Card Pull & Streak` — `/api/daily`):** Rút 1 lá thông điệp vũ trụ mỗi ngày, tích lũy chuỗi ngày liên tiếp (Streak) và nhận thưởng `+2 ⭐` (hoặc `+5 ⭐` mỗi mốc 3 ngày).
- **Ví Sao & Thanh Toán VietQR PayOS (`/api/payment/create`, `/api/payment/webhook`):** Hỗ trợ 4 gói Sao (`5.000đ`, `19.000đ`, `29.000đ`, `69.000đ`), xác thực chữ ký HMAC-SHA256 và chống cộng trùng (`idempotent provider_ref`).

### 4. Phase 4 — Tăng Trưởng Viral (Growth Hub) & Kinh Tế Đơn Vị
- **🌙 Hồ Sơ Tâm Linh Cuối Tháng (`Spiritual Wrapped` — `/api/wrapped-card`):** Tổng kết số lượt bốc bài đêm muộn, khung giờ suy nhất, lá bài hộ mệnh xuất hiện nhiều nhất, 4 thanh tiến hóa tâm linh (*Độ yêu bản thân*, *Độ lụy tình đã giảm*, *Radar bắt thóp Red Flag*, *Tần số Manifest*) và xuất Poster 9:16.
- **🎬 Xưởng Seeding TikTok & Reels 0đ (`3-Slide Carousel Studio`):** Chuyển hóa trải bài vừa rút hoặc các chủ đề xu hướng thành kịch bản 3 Slide TikTok Photo Mode kèm Caption chuẩn SEO, Hashtag và kịch bản Voiceover dán thẳng vào CapCut TTS.
- **🎁 Mời Bạn Bè (`?ref=TC-XXXX`) & Xem Quảng Cáo Thưởng (`Rewarded Ads`):** Nhận miễn phí `+5 ⭐` & `+1 Lượt` khi nhập mã giới thiệu bạn bè hoặc `+3 ⭐` & `+1 Lượt` khi xem quảng cáo tài trợ 15 giây.
- **💰 Kinh Tế Đơn Vị (`Unit Economics — Stage Gate 4`):** Theo dõi `ARPPU` so với `Cost per Paying User` (Chi phí AI + Hạ tầng trên mỗi người trả phí) và biên lợi nhuận gộp (`Gross Margin %`).

---

## 🛠️ Kiến Trúc Kỹ Thuật

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend API** | Next.js Route Handlers (`/api/reading`, `/api/story-card`, `/api/couple`, `/api/clarifier`, `/api/daily`, `/api/payment/*`, `/api/growth`, `/api/wrapped-card`) |
| **AI Provider** | Google Gemini (`@google/genai`) qua lớp trừu tượng `TarotAIProvider` + Kiểm tra đầu ra bằng **Zod** + **Deterministic Fallback** |
| **Database** | Supabase PostgreSQL (12 bảng chuẩn hóa kèm Row Level Security - `supabase/migrations/`) |
| **Thanh toán** | PayOS VietQR động + Webhook HMAC-SHA256 (`src/lib/payment.ts`) |
| **Kiểm thử** | Vitest (`npm test`) |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử Trên Máy (Local Development)

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường (`.env.local`)
Tạo file `.env.local` ở thư mục gốc (hoặc sao chép từ `.env.example`). Ứng dụng hoạt động ngay cả khi chưa điền khóa API nhờ cơ chế **Deterministic Fallback & Sandbox**:

```env
# 1. Google Gemini AI (Tùy chọn - nếu để trống sẽ dùng bộ giải nghĩa chuẩn RWS 1909 dự phòng)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# 2. Supabase Database (Tùy chọn ở local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 3. PayOS VietQR (Tùy chọn - tự động chạy chế độ PayOS Sandbox nếu để trống)
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# 4. Hạn mức ngân sách AI hàng ngày (VNĐ)
DAILY_AI_BUDGET_CAP_VND=50000
```

### Bước 3: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000`

### Bước 4: Chạy bộ kiểm thử tự động & Kiểm tra kiểu TypeScript
```bash
npm test
npx tsc --noEmit
```

---

## ☁️ Hướng Dẫn Triển Khai Miễn Phí Lên Vercel (`tarotcouple.vercel.app`)

1. **Đẩy mã nguồn lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: release TarotCouple Phase 0-4 Super-App"
   git branch -M main
   git remote add origin https://github.com/<username>/tarot-couple.git
   git push -u origin main
   ```
2. **Kết nối với Vercel:**
   - Đăng nhập [vercel.com](https://vercel.com) bằng tài khoản GitHub.
   - Chọn **Add New Project** $\rightarrow$ Import kho lưu trữ `tarot-couple`.
   - File `vercel.json` đã cấu hình sẵn vùng máy chủ `sin1` (Singapore) cho tốc độ phản hồi nhanh nhất tại Việt Nam.
3. **Thiết lập Biến Môi Trường trên Vercel:**
   - Vào **Settings $\rightarrow$ Environment Variables**, thêm `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, và bộ khóa `PAYOS_*` (khi bật thanh toán thật).
4. **Khởi tạo Database Supabase:**
   - Mở **SQL Editor** trên bảng điều khiển Supabase, dán và chạy nội dung file `supabase/migrations/20261011000000_tarot_couple_v2_schema.sql` để tạo đầy đủ 12 bảng và chính sách bảo mật RLS.
5. **Bấm Deploy:**
   - Ứng dụng sẽ được xuất bản ngay tại tên miền miễn phí `https://tarotcouple.vercel.app`.

---

## ⚖️ Tuyên Bố Đạo Đức & Pháp Lý
- Tarot Couple được định vị là **trò chơi giải trí và phản chiếu tâm lý (Journaling / Self-reflection)**, hoàn toàn không thay thế tư vấn y tế, tâm lý, tài chính hay pháp lý chuyên môn.
- Tuân thủ **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân: ẩn danh hóa thông tin trước khi gọi AI và cho phép người dùng xóa lịch sử trải bài bất cứ lúc nào.
