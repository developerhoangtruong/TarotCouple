# 🔮 Tarot Couple — Master Plan v2

**Ngày cập nhật:** 11/10/2026 · **Tác giả:** @Hoàng Trường

Tarot Couple là web app (PWA) bói Tarot bằng AI với 4 nhân vật Reader có cá tính riêng, kết quả xuất thành ảnh Story 9:16 để chia sẻ. Bản v2 thu gọn MVP về một tuần làm được, bổ sung database, an toàn nội dung, pháp lý và kiểm soát chi phí mà bản đầu còn thiếu.

---

## 1. Thay đổi so với bản đầu

Hướng sản phẩm giữ nguyên. Phần thay đổi nằm ở phạm vi, kỹ thuật và rủi ro.

| Hạng mục | Bản đầu | Bản v2 |
| :--- | :--- | :--- |
| **Bộ bài MVP** | 78 lá, art đồng bộ trong 1 tuần | **22 lá Major Arcana**; 56 lá còn lại ở phase 2 |
| **Reader MVP** | 4 persona | **2 persona (`Bà Cố Mỏ Hỗn` + `Tiên Tử Chữa Lành` làm đối trọng)**; 2 persona còn lại ở phase 2 |
| **Database** | Sơ đồ tổng quan | Schema đầy đủ ở mục Kiến trúc (11 bảng chi tiết) |
| **Xuất ảnh 9:16** | `html-to-image` phía client | **Render phía server (`satori` hoặc `canvas`)**, client chỉ tải và chia sẻ |
| **Chia sẻ** | "Bật thẳng Instagram Story" | Mở menu chia sẻ của hệ điều hành (`navigator.share`); không đảm bảo vào thẳng Story |
| **Đầu ra JSON** | "100% không lỗi" | **Validate bằng Zod**, thử lại tối đa 2 lần, có bản dự phòng (fallback) |
| **Quảng cáo thưởng** | Mặc định có | Thử nghiệm sau; MVP chỉ dùng chia sẻ và mời bạn để nhận lượt |
| **An toàn nội dung** | 3 gạch đầu dòng | **Mục riêng:** khủng hoảng tâm lý, người dưới 18, quyền riêng tư |
| **Kiểm soát chi phí AI** | Không có | **Hạn mức theo user, IP và ngân sách ngày** |
| **Số liệu thị trường** | Viết như sự thật | Ghi rõ là giả định, kiểm chứng ở tuần 1–2 |

---

## 2. Khách hàng và giả định

Nhóm mục tiêu là người Việt 16–27 tuổi, chủ yếu nữ, hay dùng điện thoại vào buổi tối muộn để hỏi chuyện tình cảm. Tất cả số liệu dưới đây là giả định của nhóm, chưa có nguồn, và phải được kiểm chứng bằng dữ liệu thật.

| Giả định | Cách kiểm chứng | Ngưỡng coi là đúng |
| :--- | :--- | :--- |
| Tình duyên chiếm khoảng 65% câu hỏi | Gắn nhãn chủ đề cho mỗi lượt bốc bài | **Trên 50%** |
| Giờ cao điểm 22:00–02:00 | Biểu đồ lượt bốc bài theo giờ | **Trên 40%** lượt trong khung này |
| Người dùng chia sẻ ảnh Story | Tỷ lệ bấm chia sẻ trên lượt xem kết quả | **Trên 10%** |
| Bói Đôi kéo thêm người dùng mới | Số người B mở link và hoàn thành lượt rút | **Trên 25%** số link gửi đi |
| Người dùng trả tiền cho lá làm rõ | Tỷ lệ mua trên số lượt thấy nút mở khóa | **Trên 2%** |

> [!IMPORTANT]
> **CAC không phải 0đ:** Mỗi người dùng đến từ chia sẻ vẫn tốn chi phí AI và hạ tầng. Chỉ số cần theo dõi là **chi phí cho mỗi người dùng trả phí (Cost per Paying User)**.

---

## 3. Sản phẩm và phạm vi MVP

MVP chỉ làm một việc thật tốt: **người dùng chọn Reader, kể chuyện, tự tay rút 3 lá và nhận kết quả kèm ảnh Story đủ gắt để muốn đăng.**

### 3.1. Luồng MVP (Tuần 1)
1. **Chọn Reader:** `Bà Cố Mỏ Hỗn` hoặc `Tiên Tử Chữa Lành`.
2. **Chọn chủ đề:** Tình duyên, Học tập/Công việc, Tài chính/Vận may; nhập biệt danh và hoàn cảnh (tối đa 300 ký tự).
3. **Tương tác rút bài:** Xào bài, giữ nút 3 giây có rung haptic, rồi chọn 3 lá trong bộ bài trải hình rẻ quạt.
4. **Nhận kết quả:** Lời mở đầu (`greeting_hook`), giải nghĩa từng lá (`cards_analysis`), chốt hạ (`overall_verdict`), câu `savage_quote`.
5. **Chia sẻ:** Xem trước ảnh 9:16, bật hoặc tắt ẩn câu hỏi, đổi quote (1 trong 3 phương án), tải ảnh hoặc chia sẻ.

### 3.2. Để sang Phase 2
- **Bói Đôi:** Tự soi và mời người kia cùng rút, kèm Hợp Cạ (%) và Red Flag.
- **Monetization:** Lá làm rõ (Clarifier), ví Sao, thanh toán VietQR.
- **Retention:** Daily 1-card, điểm danh streak.
- **Mở rộng nội dung:** 56 lá Minor Arcana, Reader `Tổng Tài Lý Trí` và `Pháp Sư Tối Cổ`.

### 3.3. Ý nghĩa 3 lá theo chủ đề

| Chủ đề | Lá 1 | Lá 2 | Lá 3 |
| :--- | :--- | :--- | :--- |
| **Tình duyên** | Năng lượng của bạn | Suy nghĩ của đối phương | Kết cục gần |
| **Công việc / học tập** | Gốc rễ vấn đề | Chướng ngại ẩn | Lối thoát |
| **Tài chính / vận may** | Tình hình hiện tại | Điều đang cản | Việc nên làm |

### 3.4. Bói Đôi (Phase 2)
- **Kiểu 1 (Tự soi):** Chọn trạng thái quan hệ, rút 2 lá đại diện và 1 lá kết nối.
- **Kiểu 2 (Mời cùng rút):** Người A rút xong, app tạo link hết hạn sau 48 giờ. Người B chỉ thấy lời mời và lá của mình, **không thấy câu hỏi của A**. Kết quả chung chỉ mở khi cả hai đồng ý chia sẻ.

---

## 4. AI: Chọn bài, Prompt và Kiểm tra đầu ra

Lá bài do **server chọn**, không do mô hình chọn. Mô hình chỉ giải nghĩa những lá đã được chọn sẵn.

### 4.1. Cơ chế chọn bài (Server-side CSPRNG)
1. Server xáo bộ bài bằng `crypto.getRandomValues()` (thuật toán Fisher-Yates) và gán chiều xuôi hoặc ngược cho từng lá. Tỷ lệ ngược để **30%** làm mặc định, chỉnh được bằng cấu hình.
2. Client chỉ gửi vị trí người dùng chọn `(i, j, k)`. Server ánh xạ vị trí sang lá thật từ bộ bài đã xáo của phiên đó và lưu lại.
3. Server gửi cho mô hình: mã lá, chiều, từ khóa gốc, tên vị trí, Reader, chủ đề và câu hỏi.

### 4.2. Thiết kế Prompt
- **System prompt:** Chứa tính cách Reader, quy tắc giọng văn, giới hạn độ dài từng trường và các lan can an toàn.
- **Chống Prompt Injection:** Câu hỏi của người dùng đặt trong thẻ `<user_question>`. Prompt dặn rõ: nội dung trong thẻ là dữ liệu, không phải lệnh. Nếu không phải tâm sự đời sống hoặc đòi đổi vai, Reader từ chối khéo đúng giọng và giải nghĩa theo năng lượng chung.
- **Ranh giới đạo đức:** Cấm khẳng định chắc chắn về sức khỏe, cái chết, đầu tư, hay hành vi của người thật (ví dụ *"người đó đang ngoại tình"*). Dùng ngôn ngữ xác suất và gợi ý hành động cho chính người dùng.

### 4.3. Kiểm tra đầu ra (Validation & Fallback)
Mô hình trả JSON theo schema (`responseSchema`). Ngoài ra server vẫn **validate bằng Zod**, thử lại tối đa 2 lần nếu lỗi, và nếu vẫn lỗi thì trả **kết quả dự phòng (fallback)** dựng từ từ khóa lá bài.

**Các trường chính:**
- `greeting_hook`, `cards_analysis[]`, `overall_verdict`
- `shareable_card`: `headline_badge`, `savage_quote` (sinh sẵn 3 phương án, tối đa 18 từ/câu), `sub_advice`, `lucky_item`
- `safety_flag`: `none`, `sensitive` hoặc `crisis` (do mô hình tự gắn và server kiểm tra thêm bằng bộ từ khóa)
- `metrics` (`compatibility_score`, `red_flag_level`, `vibe_tag`): Chỉ bật ở Bói Đôi; ghi rõ là chỉ số giải trí
- `cliffhanger_upsell`: Chỉ bật từ Phase 2, khi đã có thanh toán

### 4.4. Mô hình AI
Chọn mô hình nhanh, giá thấp, tiếng Việt tốt. Trước khi code, kiểm tra tên và giá mô hình Gemini đang khả dụng. Giữ lớp gọi AI sau một **interface (`TarotAIProvider`)** để đổi nhà cung cấp mà không sửa nghiệp vụ.

---

## 5. Story Card 9:16 và Chia sẻ

Ảnh xuất ra **1080 x 1920 px**, câu `savage_quote` là điểm nhấn lớn nhất. Ảnh được **render phía server** để giống nhau trên mọi thiết bị.

| Vùng | Tỷ lệ chiều cao | Nội dung |
| :--- | :--- | :--- |
| **Header** | 15% | Tên hiển thị (hoặc ẩn) và badge Reader |
| **Lá bài** | 35% | 1 hoặc 3 lá, nghiêng nhẹ, có glow; thanh đo mini ở Bói Đôi |
| **Punchline** | 35% | `savage_quote`, font display cỡ lớn, tối đa 18 từ |
| **Footer** | 15% | QR, tên miền, câu mời bạn bè |

- **Safe-zone:** Chừa vùng an toàn trên và dưới khoảng `250 px` để không bị giao diện Instagram hay TikTok đè lên.
- **Quyền riêng tư mặc định:** Công tắc *"Ẩn câu hỏi của tôi"* **bật mặc định**. Ảnh khi đó chỉ có lá bài, quote và chỉ số.
- **Đổi Quote 0đ:** Cho phép đổi quote trên màn hình xem trước — server sinh sẵn 3 phương án `savage_quotes[]` trong cùng lượt gọi AI, nên không tốn thêm chi phí.
- **Cơ chế chia sẻ:** Chia sẻ qua `navigator.share` với file ảnh. Hệ điều hành mở menu chia sẻ; việc có hiện Instagram Story hay không phụ thuộc thiết bị và ứng dụng. Luôn có nút **"Tải ảnh"** làm phương án dự phòng.
- **Bảo mật QR:** Link trong QR dẫn đến trang landing của Reader, **không dẫn đến kết quả cá nhân**, để không lộ nội dung bói của người đăng.
- **Kiểm thử Font:** Font tiếng Việt cần nhúng trực tiếp vào server renderer và kiểm tra dấu trên Safari iOS trước khi chốt thiết kế.

---

## 6. Kiến trúc kỹ thuật và Database

Chạy web app mobile-first (PWA) trước, đóng gói lên App Store sau khi có doanh thu. **Mọi logic bốc bài, gọi AI, trừ lượt và thanh toán nằm ở server, client không được tin.**

### 6.1. Tech Stack

| Lớp | Lựa chọn | Ghi chú |
| :--- | :--- | :--- |
| **Giao diện** | Next.js (App Router), TypeScript, Tailwind, Framer Motion | Hiệu ứng xào bài và lật bài 3D |
| **API** | Route handlers của Next.js | Mỗi lượt bốc bài là một giao dịch có kiểm tra hạn mức |
| **Database & Đăng nhập** | Supabase (PostgreSQL, Google OAuth) | Bật Row Level Security (RLS) cho mọi bảng |
| **AI** | Gemini API, qua một interface đổi được nhà cung cấp | Validate bằng Zod + Fallback |
| **Ảnh 9:16** | `satori` (`next/og`) hoặc `canvas` phía server | Cache theo `reading_id` + quote index |
| **Thanh toán (Phase 2)** | PayOS hoặc SePay (VietQR) | Webhook có xác thực chữ ký và chống xử lý trùng |
| **Giới hạn tốc độ** | Upstash Redis hoặc bảng đếm trong Postgres | Theo user, IP và thiết bị |
| **Theo dõi** | PostHog hoặc GA4, Sentry | Sự kiện funnel ở mục Lộ trình |
| **Triển khai** | Vercel, tên miền riêng | Biến môi trường cho khóa AI và thanh toán |

### 6.2. Schema Database

| Bảng | Cột chính | Mục đích |
| :--- | :--- | :--- |
| `users` | `id`, `email`, `display_name`, `birth_year`, `created_at` | Tài khoản; `birth_year` để kiểm tra độ tuổi |
| `cards` | `id` (0–77), `name_en`, `name_vi`, `arcana`, `keywords_up`, `keywords_rev`, `image_url` | Dữ liệu 78 lá, nạp sẵn (MVP kích hoạt 0–21) |
| `readers` | `id`, `name`, `persona_prompt`, `is_free`, `active` | Cấu hình persona |
| `readings` | `id`, `user_id`, `reader_id`, `topic`, `question_text`, `mode`, `safety_flag`, `ai_model`, `tokens_in`, `tokens_out`, `created_at` | Mỗi lượt bốc bài |
| `reading_cards` | `reading_id`, `position`, `card_id`, `reversed` | Lá bài đã chọn, lưu từ server |
| `reading_results` | `reading_id`, `result_json`, `share_quote`, `created_at` | Kết quả đã validate |
| `share_cards` | `id`, `reading_id`, `hide_question`, `image_url`, `created_at` | Ảnh đã xuất |
| `couple_rooms` | `id`, `owner_id`, `partner_id`, `status`, `expires_at`, `owner_card`, `partner_card` | Bói Đôi (Phase 2) |
| `wallets` | `user_id`, `stars_balance`, `updated_at` | Số dư Sao (Phase 2) |
| `transactions` | `id`, `user_id`, `type`, `amount_vnd`, `stars`, `provider_ref` (unique), `status`, `created_at` | Thanh toán và cộng lượt; `provider_ref` duy nhất để chống cộng trùng |
| `daily_quota` | `user_id`, `day`, `used`, `limit` | Hạn mức lượt miễn phí |
| `usage_events` | `id`, `user_id`, `ip_hash`, `device_hash`, `event`, `created_at` | Chống lạm dụng và phân tích |

**Quy tắc dữ liệu:** Tự động xóa `question_text` sau **90 ngày**, trừ khi người dùng chọn lưu lịch sử. Người dùng xóa được từng lượt hoặc toàn bộ tài khoản.

---

## 7. Kiếm tiền và Kinh tế đơn vị

MVP chưa thu tiền. Mục tiêu của hai tuần đầu là đo lượt bốc bài, tỷ lệ chia sẻ và tỷ lệ quay lại. Thanh toán chỉ bật ở Phase 2 khi đã có người dùng thật.

### 7.1. Bậc giá (Phase 2, giá thử nghiệm)

| Gói | Nội dung | Giá |
| :--- | :--- | :--- |
| **Miễn phí** | 1 lượt bốc bài cơ bản mỗi ngày với Reader mặc định | `0đ` |
| **Lá làm rõ** | 1 lá Clarifier trong phiên đang mở | `5.000đ` |
| **Đêm Suy** | 3 lượt hỏi sâu, mở khóa Reader thứ hai, hỏi đáp qua lại | `19.000đ` |
| **Check Var Tình Yêu** | Bói Đôi chuyên sâu, phân tích 12 khía cạnh | `29.000đ` |
| **Thẻ tháng** | Không giới hạn trong mức dùng hợp lý, bộ bài hiếm, không quảng cáo | `69.000đ / tháng` |

Lượt miễn phí thêm có thể kiếm bằng chia sẻ ảnh hoặc mời bạn. Quảng cáo video thưởng chỉ thêm vào sau khi kiểm tra được giải pháp chạy trên web.

### 7.2. Chi phí mỗi lượt (Ước tính, cần đo lại)
- Một lượt khoảng 800 token vào và 600 token ra. Với mô hình giá thấp, bản đầu ước tính 15–25đ mỗi lượt. **Đo bằng `tokens_in` và `tokens_out` trong bảng `readings`**, không dùng số ước tính để ra quyết định.
- Gói 19.000đ tương đương khoảng 760 lượt miễn phí ở mức 25đ mỗi lượt.
- Biên lợi nhuận phải tính thêm phí cổng thanh toán, hạ tầng, nhà cung cấp lưu trữ ảnh và thuế. Xác nhận biểu phí PayOS hoặc SePay trước khi chốt giá.
- Thanh toán qua VietQR cần pháp nhân (hộ kinh doanh hoặc công ty); làm thủ tục này song song với Phase 1.

### 7.3. Nguyên tắc chi tiêu có trách nhiệm
- Không dùng câu cliffhanger đe dọa hoặc gây hoảng sợ để bán lá làm rõ.
- Đặt trần chi tiêu mỗi ngày cho mỗi tài khoản (ví dụ `50.000đ`) và hiện số tiền trước khi thanh toán.
- Tài khoản dưới 18 tuổi: xem mục An toàn và pháp lý.

---

## 8. An toàn, Quyền riêng tư, Pháp lý và Chống lạm dụng

> [!CAUTION]
> Người dùng kể chuyện riêng tư lúc tâm trạng yếu, nên phần này là **điều kiện ra mắt (launch blocker)**, không phải việc làm thêm. Mọi mục dưới đây phải xong trước khi mở cho người ngoài.

### 8.1. Khủng hoảng tâm lý (Crisis Intervention)
- Server quét câu hỏi bằng bộ từ khóa (*tự tử, tự làm hại, muốn chết, trầm cảm nặng...*) **trước và độc lập với AI**, đồng thời mô hình gắn `safety_flag`. Nếu một trong hai báo `crisis`:
  - Bỏ qua giọng Reader, bỏ qua lá bài.
  - Hiện màn hình hỗ trợ: lời trấn an ngắn, khuyến khích nói chuyện với người tin cậy, và số điện thoại hỗ trợ.
- Số điện thoại bắt đầu từ **111** (Tổng đài quốc gia bảo vệ trẻ em) và **115** (Cấp cứu). Trước khi ra mắt, xác minh lại các số này và chọn thêm một đường dây hỗ trợ tâm lý đang hoạt động (VD: Đường dây nóng Ngày Mai `096 306 1414`).
- **Tuyệt đối không** bán lá làm rõ, không hiện upsell và không đề xuất chia sẻ ảnh trong phiên có cờ `crisis`.

### 8.2. Nội dung AI
- Cấm phán quyết chắc chắn về sức khỏe, cái chết, đầu tư, cờ bạc, hoặc việc người thứ ba đang lừa dối. Chỉ số Hợp Cạ và Red Flag luôn có dòng *"Chỉ để giải trí"*.
- Giọng mỏ hỗn chỉ nhắm vào tình huống và hành vi, không chửi người dùng hay người được nhắc tên, và không nhắm vào nhóm người nào.
- Mỗi kết quả có dòng: *"Tarot là hình thức giải trí và tự phản chiếu, không thay thế tư vấn chuyên môn."*

### 8.3. Chính sách Độ tuổi (Ngưỡng 10+ và Phân tầng Bảo vệ)
Hỏi năm sinh (`birth_year`) ngay ở bước vào trải bài. Áp dụng tự động 3 tầng bảo vệ:
1. **Nhóm 10 – 15 tuổi (Chế độ Học Đường Trong Sáng - Kid/Teen Safe Mode):**
   - **Đăng nhập:** Cho phép chơi chế độ Khách (Guest + LocalStorage) vì tài khoản Google chuẩn yêu cầu từ 13+.
   - **Chủ đề:** Đổi chủ đề Tình duyên thành *"Tình bạn & Crush học đường"*, giữ *"Học tập / Thi cử"* và *"Vận may ngày mới"*. Tắt chủ đề Tài chính/Tiền bạc.
   - **Giọng văn AI:** Tự động hạ độ gắt của `Bà Cố Mỏ Hỗn` xuống mức **"Bà Ngoại Vui Tính"** (hài hước, khích lệ học tập, không dùng từ lóng người lớn).
   - **Thanh toán:** **Tắt 100% tính năng nạp tiền**. Chỉ nhận thêm lượt bằng cách chia sẻ hoặc điểm danh.
2. **Nhóm 16 – 17 tuổi:**
   - Mở đầy đủ chủ đề giải trí nhưng **tắt nạp tiền bằng ngân hàng/VietQR** (hoặc giới hạn tối đa 10.000đ/ngày nếu có xác nhận).
3. **Nhóm 18+ tuổi:**
   - Mở toàn bộ tính năng, giọng văn gốc của các Reader và thanh toán PayOS (có trần chi tiêu an toàn 50.000đ/ngày).

### 8.4. Quyền riêng tư và Pháp lý
- Có điều khoản sử dụng và chính sách quyền riêng tư bằng tiếng Việt, nêu rõ dữ liệu nào lưu, bao lâu, gửi cho nhà cung cấp AI nào.
- Luật Bảo vệ dữ liệu cá nhân và các nghị định hướng dẫn áp dụng cho dữ liệu này. Nhờ luật sư xác nhận phạm vi áp dụng, cơ sở pháp lý xử lý dữ liệu và nghĩa vụ thông báo.
- **Ẩn danh hóa trước khi gọi AI:** Không gửi email, số điện thoại hay tên thật tới nhà cung cấp AI; chỉ gửi biệt danh và nội dung câu hỏi. Khuyến khích người dùng không nhập thông tin định danh người khác.
- Có nút xóa lượt bốc bài và xóa tài khoản trong cài đặt.
- Làm rõ với cơ quan có thẩm quyền hoặc luật sư về quy định quảng cáo và dịch vụ bói toán (định vị rõ là **Trò chơi giải trí & Phản chiếu tâm lý / Journaling**), rồi ghi kết luận vào tài liệu này.

### 8.5. Chống lạm dụng và Kiểm soát chi phí

| Rủi ro | Biện pháp |
| :--- | :--- |
| **Bào lượt miễn phí** | Kết hợp hạn mức theo user/session, IP và thiết bị (FingerprintJS chỉ là một tín hiệu, không phải căn cứ duy nhất) |
| **Bot gọi API** | Giới hạn tốc độ (Rate limit), CAPTCHA không hiện (Cloudflare Turnstile hoặc tương đương), kiểm tra Origin |
| **Tốn tiền AI ngoài dự kiến** | Ngân sách tối đa mỗi ngày (Daily Hard Cap); chạm 80% thì cảnh báo, chạm 100% thì tạm dừng lượt miễn phí |
| **Prompt injection** | Thẻ `<user_question>`, giới hạn độ dài 300 ký tự, validate đầu ra, không bao giờ đưa khóa hay prompt hệ thống vào ngữ cảnh |
| **Cộng lượt trùng khi thanh toán** | `provider_ref` duy nhất, webhook xác thực chữ ký, xử lý idempotent |

---

## 9. Lộ trình, Chỉ số và Các Quyết Định Đã Chốt

Mỗi giai đoạn có một **điều kiện qua cổng (Stage Gate)**; chưa đạt thì không sang giai đoạn sau.

| Giai đoạn | Thời gian | Việc chính | Điều kiện qua cổng |
| :--- | :--- | :--- | :--- |
| **0. Chuẩn bị** | Tuần 0 | Chuẩn bị 22 lá Rider-Waite-Smith 1909; kiểm tra mô hình AI và giá; viết prompt 2 Reader | Có bộ art 22 lá dùng được và prompt cho kết quả ổn định trên 20 câu hỏi thử |
| **1. MVP** | Tuần 1–2 | Luồng bốc 3 lá, 2 Reader, JSON và validate, `safety_flag`, ảnh 9:16, hạn mức, analytics | Chạy ổn với 20–30 người thử; không có lỗi an toàn nghiêm trọng |
| **2. Thử nghiệm kín** | Tuần 3 | Mời 100–200 người; đo funnel; sửa prompt và thiết kế card theo phản hồi | Tỷ lệ chia sẻ và quay lại ngày 7 đạt ngưỡng đã đặt ở mục Khách hàng |
| **3. Bói Đôi & Thanh toán** | Tuần 4–6 | Bói Đôi hai kiểu, lá làm rõ, ví Sao, PayOS (VietQR); thêm 2 Reader và 56 lá còn lại | Điều khoản và chính sách quyền riêng tư hoàn tất; thanh toán PayOS thử thành công |
| **4. Tăng trưởng** | Tuần 7 | Nội dung TikTok và Reels, Hồ Sơ Tâm Linh cuối tháng, gắn mạng quảng cáo nhận thưởng | Chi phí cho mỗi người dùng trả phí thấp hơn doanh thu trung bình mỗi người |
| **5. Mobile-Native App Shell** | Tuần 8 | Tối ưu 100% layout điện thoại (Thumb-zone Bottom Tab Bar 5 tab, Compact Mobile Header, Vuốt chọn bài cảm ứng, Bottom Sheet Modals & Chế độ Giả lập iPhone trên máy tính) | Hiển thị mượt trên màn hình dọc `360px–430px`, không tràn ngang, thao tác 1 ngón cái |

*Tiến độ là ước tính cho một người làm chính; điều chỉnh sau khi xong giai đoạn 0.*

### 9.1. Chỉ số theo dõi (Metrics)
- **Funnel:** Vào trang $\rightarrow$ Bắt đầu bốc bài $\rightarrow$ Hoàn thành 3 lá $\rightarrow$ Xem kết quả $\rightarrow$ Bấm chia sẻ $\rightarrow$ Quay lại ngày 1 (D1) và ngày 7 (D7).
- **Chất lượng:** Tỷ lệ JSON lỗi hoặc phải thử lại, thời gian trả kết quả (Latency), tỷ lệ cờ `crisis`.
- **Tiền:** Chi phí AI mỗi lượt, chi phí AI mỗi ngày so với ngân sách, tỷ lệ mua, doanh thu mỗi người dùng (ARPU).

### 9.2. Các quyết định đã chốt (Closed Decisions)
- [x] **Nguồn art cho 22 lá Major Arcana:** Dùng bộ **Rider-Waite-Smith gốc (1909 - Public Domain)**, miễn phí bản quyền 100%, bọc khung viền vàng/huyền bí bằng CSS/SVG.
- [x] **Cổng thanh toán (Phase 2):** Dùng **PayOS** (VietQR động).
- [x] **Thương hiệu & Tên miền:** Giữ thương hiệu **TarotCouple**.
  - *Giai đoạn MVP (0đ):* Dùng tên miền miễn phí của Vercel (`tarotcouple.vercel.app`).
  - *Khi mua tên miền riêng giá rẻ:* Mua trên Cloudflare Registrar hoặc Namecheap/Porkbun đuôi `.xyz` / `.site` (~25.000đ - 50.000đ/năm đầu) hoặc nhận miễn phí qua GitHub Student Pack.
- [x] **Ngưỡng tuổi tối thiểu:** **10+**, chia 3 tầng bảo vệ tự động theo năm sinh (10–15 tuổi bật *Chế độ Học Đường Trong Sáng* + khóa nạp tiền; 16–17 tuổi khóa nạp tiền; 18+ mở toàn bộ).
- [x] **Quảng cáo thưởng (Rewarded Ads):** **Có triển khai** (tích hợp mạng quảng cáo miễn phí 0đ chi phí đầu tư, nhà mạng trả tiền cho app theo lượt xem/click ở Phase tăng trưởng; trong MVP có thể giả lập hoặc kết hợp nút Chia sẻ/Mời bạn nhận lượt).
- [x] **Đường dây hỗ trợ tâm lý trên màn hình khủng hoảng:** Tổng đài quốc gia bảo vệ trẻ em **111** (miễn phí 24/7), Cấp cứu **115**, và Đường dây nóng Ngày Mai (**096 306 1414**).
