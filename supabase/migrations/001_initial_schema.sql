-- ============================================================================
-- TarotCouple — Initial Production Database Schema (Migration 001)
-- Aligns with PLAN.md Section 6.2 & Supabase Postgres Best Practices
-- Includes all 12 tables, FK indexes, RLS policies, 90-day privacy purge,
-- and seed data for 4 Readers + 22 Major Arcana (1909 Rider-Waite-Smith).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABLE: users
-- ============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text not null default 'Người Hỏi Ẩn Danh',
  birth_year smallint check (birth_year is null or (birth_year >= 1920 and birth_year <= 2025)),
  keep_history boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 2. TABLE: cards (0-77 capacity; MVP activates 0-21 Major Arcana)
-- ============================================================================
create table if not exists public.cards (
  id smallint primary key check (id >= 0 and id <= 77),
  roman text not null,
  name_en text not null,
  name_vi text not null,
  arcana text not null check (arcana in ('major', 'minor')),
  keywords_up text[] not null default '{}',
  keywords_rev text[] not null default '{}',
  image_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 3. TABLE: readers
-- ============================================================================
create table if not exists public.readers (
  id text primary key,
  name text not null,
  teen_safe_name text not null,
  persona_prompt text not null,
  is_free boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. TABLE: readings
-- ============================================================================
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  reader_id text not null references public.readers(id) on delete restrict,
  topic text not null check (topic in ('love', 'career', 'finance')),
  question_text text,
  keep_question boolean not null default false,
  mode text not null default 'solo_3' check (mode in ('solo_3', 'daily_1', 'couple_self', 'couple_invite', 'clarifier')),
  safety_flag text not null default 'none' check (safety_flag in ('none', 'sensitive', 'crisis')),
  ai_model text not null default 'gemini-2.5-flash',
  tokens_in integer not null default 0 check (tokens_in >= 0),
  tokens_out integer not null default 0 check (tokens_out >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_readings_user_id_created_at
  on public.readings (user_id, created_at desc);

create index if not exists idx_readings_reader_id
  on public.readings (reader_id);

create index if not exists idx_readings_purge_candidates
  on public.readings (created_at)
  where question_text is not null and keep_question = false;

-- ============================================================================
-- 5. TABLE: reading_cards
-- ============================================================================
create table if not exists public.reading_cards (
  reading_id uuid not null references public.readings(id) on delete cascade,
  position smallint not null check (position >= 1 and position <= 5),
  card_id smallint not null references public.cards(id) on delete restrict,
  reversed boolean not null default false,
  primary key (reading_id, position)
);

create index if not exists idx_reading_cards_card_id
  on public.reading_cards (card_id);

-- ============================================================================
-- 6. TABLE: reading_results
-- ============================================================================
create table if not exists public.reading_results (
  reading_id uuid primary key references public.readings(id) on delete cascade,
  result_json jsonb not null,
  share_quote text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 7. TABLE: share_cards
-- ============================================================================
create table if not exists public.share_cards (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.readings(id) on delete cascade,
  hide_question boolean not null default true,
  quote_index smallint not null default 0 check (quote_index >= 0 and quote_index <= 2),
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_share_cards_reading_id
  on public.share_cards (reading_id);

-- ============================================================================
-- 8. TABLE: couple_rooms (Phase 2)
-- ============================================================================
create table if not exists public.couple_rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  partner_id uuid references public.users(id) on delete set null,
  status text not null default 'waiting_partner' check (status in ('waiting_partner', 'partner_drawn', 'consented_revealed', 'expired')),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  owner_card smallint references public.cards(id) on delete restrict,
  partner_card smallint references public.cards(id) on delete restrict,
  owner_consented boolean not null default false,
  partner_consented boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_couple_rooms_owner_id
  on public.couple_rooms (owner_id);

create index if not exists idx_couple_rooms_partner_id
  on public.couple_rooms (partner_id);

-- ============================================================================
-- 9. TABLE: wallets (Phase 2)
-- ============================================================================
create table if not exists public.wallets (
  user_id uuid primary key references public.users(id) on delete cascade,
  stars_balance integer not null default 0 check (stars_balance >= 0),
  daily_spend_vnd integer not null default 0 check (daily_spend_vnd >= 0),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 10. TABLE: transactions (Phase 2 — unique provider_ref prevents double credit)
-- ============================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('topup_vietqr', 'spend_clarifier', 'spend_deep_night', 'spend_couple_var', 'subscription_monthly', 'reward_share', 'reward_invite')),
  amount_vnd integer not null default 0 check (amount_vnd >= 0 and amount_vnd <= 50000),
  stars integer not null default 0,
  provider_ref text not null unique,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id_created_at
  on public.transactions (user_id, created_at desc);

-- ============================================================================
-- 11. TABLE: daily_quota
-- ============================================================================
create table if not exists public.daily_quota (
  user_id uuid not null references public.users(id) on delete cascade,
  day date not null default current_date,
  used smallint not null default 0 check (used >= 0),
  "limit" smallint not null default 1 check ("limit" >= 0),
  primary key (user_id, day)
);

-- ============================================================================
-- 12. TABLE: usage_events
-- ============================================================================
create table if not exists public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.users(id) on delete set null,
  ip_hash text not null,
  device_hash text,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_usage_events_user_id
  on public.usage_events (user_id);

create index if not exists idx_usage_events_ip_hash_created_at
  on public.usage_events (ip_hash, created_at desc);

create index if not exists idx_usage_events_event_created_at
  on public.usage_events (event, created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — Enabled on ALL 12 tables
-- Uses (select auth.uid()) per Supabase Postgres performance guidelines
-- ============================================================================
alter table public.users enable row level security;
alter table public.cards enable row level security;
alter table public.readers enable row level security;
alter table public.readings enable row level security;
alter table public.reading_cards enable row level security;
alter table public.reading_results enable row level security;
alter table public.share_cards enable row level security;
alter table public.couple_rooms enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.daily_quota enable row level security;
alter table public.usage_events enable row level security;

-- Public read access for catalog tables (cards & readers)
create policy "Public can read active tarot cards"
  on public.cards for select
  to anon, authenticated
  using (active = true);

create policy "Public can read tarot readers"
  on public.readers for select
  to anon, authenticated
  using (true);

-- Users policies
create policy "Users can view own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete own profile"
  on public.users for delete
  to authenticated
  using ((select auth.uid()) = id);

-- Readings policies (users can view & delete their own readings)
create policy "Users can view own readings"
  on public.readings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can delete own readings"
  on public.readings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Reading cards policies
create policy "Users can view own reading cards"
  on public.reading_cards for select
  to authenticated
  using (
    exists (
      select 1 from public.readings r
      where r.id = reading_cards.reading_id
        and r.user_id = (select auth.uid())
    )
  );

-- Reading results policies
create policy "Users can view own reading results"
  on public.reading_results for select
  to authenticated
  using (
    exists (
      select 1 from public.readings r
      where r.id = reading_results.reading_id
        and r.user_id = (select auth.uid())
    )
  );

-- Share cards policies
create policy "Users can view own share cards"
  on public.share_cards for select
  to authenticated
  using (
    exists (
      select 1 from public.readings r
      where r.id = share_cards.reading_id
        and r.user_id = (select auth.uid())
    )
  );

-- Couple rooms policies (owner or partner can view)
create policy "Participants can view couple room"
  on public.couple_rooms for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    or (select auth.uid()) = partner_id
  );

-- Wallets policies
create policy "Users can view own wallet"
  on public.wallets for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Transactions policies
create policy "Users can view own transactions"
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Daily quota policies
create policy "Users can view own daily quota"
  on public.daily_quota for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Usage events policies (users can view own audit events; inserts happen via service_role on server)
create policy "Users can view own usage events"
  on public.usage_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- PRIVACY & RETENTION HELPER: 90-day question_text anonymization
-- Per PLAN.md Section 6.2: Automatically scrub question_text after 90 days
-- unless the user explicitly opted to keep history.
-- ============================================================================
create or replace function public.anonymize_expired_reading_questions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  scrubbed_count integer;
begin
  update public.readings r
  set question_text = null
  where r.question_text is not null
    and r.keep_question = false
    and r.created_at < (now() - interval '90 days')
    and not exists (
      select 1 from public.users u
      where u.id = r.user_id
        and u.keep_history = true
    );

  get diagnostics scrubbed_count = row_count;
  return scrubbed_count;
end;
$$;

-- ============================================================================
-- SEED DATA: 4 Readers (2 active free MVP readers + 2 Phase 2 readers)
-- ============================================================================
insert into public.readers (id, name, teen_safe_name, persona_prompt, is_free, active)
values
  (
    'ba_co_mo_hon',
    'Bà Cố Mỏ Hỗn',
    'Bà Ngoại Vui Tính',
    'Bạn là Bà Cố Mỏ Hỗn — một Reader Tarot sắc sảo, hài hước kiểu Gen Z Việt Nam, nhìn thấu sự tự huyễn hoặc nhưng sâu bên trong vẫn muốn người hỏi tỉnh táo và yêu thương bản thân.',
    true,
    true
  ),
  (
    'tien_tu_chua_lanh',
    'Tiên Tử Chữa Lành',
    'Tiên Tử Chữa Lành',
    'Bạn là Tiên Tử Chữa Lành — một Reader Tarot ấm áp, giàu sự thấu cảm, giọng văn giàu chất thơ và tinh tế.',
    true,
    true
  ),
  (
    'tong_tai_ly_tri',
    'Tổng Tài Lý Trí',
    'Đàn Anh Điềm Tĩnh',
    'Bạn là Tổng Tài Lý Trí — phân tích Tarot dưới góc nhìn tâm lý học hành vi, quản trị rủi ro và chiến lược thực tế.',
    false,
    false
  ),
  (
    'phap_su_toi_co',
    'Pháp Sư Tối Cổ',
    'Hiền Triết Cổ Đại',
    'Bạn là Pháp Sư Tối Cổ — giải mã Tarot theo trường phái biểu tượng học Jungian và cổ điển Rider-Waite-Smith 1909.',
    false,
    false
  )
on conflict (id) do update set
  name = excluded.name,
  teen_safe_name = excluded.teen_safe_name,
  persona_prompt = excluded.persona_prompt,
  is_free = excluded.is_free,
  active = excluded.active;

-- ============================================================================
-- SEED DATA: 22 Major Arcana Cards (1909 Rider-Waite-Smith Public Domain)
-- ============================================================================
insert into public.cards (id, roman, name_en, name_vi, arcana, keywords_up, keywords_rev, image_url, active)
values
  (0, '0', 'The Fool', 'Kẻ Khờ', 'major',
    array['Khởi đầu mới', 'Tự do', 'Bản năng', 'Bước nhảy niềm tin', 'Hồn nhiên'],
    array['Bốc đồng', 'Ngây thơ quá mức', 'Sợ bước tiếp', 'Thiếu tính toán', 'Liều lĩnh'],
    'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg', true),
  (1, 'I', 'The Magician', 'Nhà Ảo Thuật', 'major',
    array['Chủ động', 'Đủ nguồn lực', 'Tập trung ý chí', 'Biến ý tưởng thành thật', 'Khéo léo'],
    array['Thao túng', 'Nói nhiều làm ít', 'Phân tán năng lượng', 'Tự nghi ngờ', 'Hào nhoáng rỗng'],
    'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg', true),
  (2, 'II', 'The High Priestess', 'Nữ Tư Tế', 'major',
    array['Trực giác nhạy bén', 'Bí mật', 'Tĩnh lặng quan sát', 'Chiều sâu nội tâm', 'Chờ thời điểm'],
    array['Bỏ qua linh cảm', 'Bí mật bị lộ', 'Bề nổi hời hợt', 'Nén cảm xúc', 'Hoài nghi'],
    'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg', true),
  (3, 'III', 'The Empress', 'Nữ Hoàng', 'major',
    array['Trù phú', 'Yêu thương bản thân', 'Quyến rũ tự nhiên', 'Nuôi dưỡng', 'Sáng tạo'],
    array['Bỏ bê bản thân', 'Cho đi quá mức', 'Phụ thuộc cảm xúc', 'Cạn kiệt', 'Ngột ngạt'],
    'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg', true),
  (4, 'IV', 'The Emperor', 'Hoàng Đế', 'major',
    array['Kỷ luật', 'Ranh giới vững vàng', 'Trách nhiệm', 'Vững chãi', 'Chủ quyền'],
    array['Bảo thủ', 'Kiểm soát quá mức', 'Thiếu kỷ luật', 'Gia trưởng', 'Cứng nhắc'],
    'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg', true),
  (5, 'V', 'The Hierophant', 'Giáo Hoàng', 'major',
    array['Cam kết chính thức', 'Giá trị cốt lõi', 'Người dẫn đường', 'Truyền thống', 'Học hỏi'],
    array['Phá vỡ khuôn mẫu', 'Sợ định kiến', 'Tư duy lối mòn', 'Lệch chuẩn giá trị', 'Nổi loạn'],
    'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg', true),
  (6, 'VI', 'The Lovers', 'Đôi Tình Nhân', 'major',
    array['Đồng điệu sâu sắc', 'Lựa chọn từ trái tim', 'Gắn kết chân thành', 'Hòa hợp', 'Nhất quán'],
    array['Lưỡng lự ngã ba đường', 'Lệch pha giá trị', 'Cám dỗ nhất thời', 'Thiếu đồng thuận', 'Né tránh chọn'],
    'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg', true),
  (7, 'VII', 'The Chariot', 'Cỗ Xe', 'major',
    array['Bứt tốc', 'Chiến thắng', 'Làm chủ tay lái', 'Quyết tâm cao độ', 'Vượt chướng ngại'],
    array['Mất phương hướng', 'Nóng vội cưỡng cầu', 'Xung đột nội tâm', 'Đứt phanh', 'Trì trệ'],
    'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg', true),
  (8, 'VIII', 'Strength', 'Sức Mạnh Nội Tâm', 'major',
    array['Bản lĩnh dịu dàng', 'Kiên nhẫn', 'Làm chủ cảm xúc', 'Bao dung', 'Nội lực bền bỉ'],
    array['Kiệt sức vì gồng', 'Nóng nảy mất bình tĩnh', 'Tự ti', 'Yếu lòng', 'Đè nén'],
    'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg', true),
  (9, 'IX', 'The Hermit', 'Ẩn Sĩ', 'major',
    array['Chiêm nghiệm', 'Tạm lùi lại', 'Tự soi chiếu', 'Tìm câu trả lời bên trong', 'Độc lập'],
    array['Cô lập quá mức', 'Sợ cô đơn', 'Trốn tránh thực tại', 'Từ chối giao tiếp', 'Lạc lõng'],
    'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg', true),
  (10, 'X', 'Wheel of Fortune', 'Bánh Xe Số Phận', 'major',
    array['Bước ngoặt bất ngờ', 'Chuyển vận', 'Chu kỳ mới', 'Cơ hội tình cờ', 'Thuận dòng chảy'],
    array['Lặp lại vòng lặp cũ', 'Chống lại thay đổi', 'Trì hoãn tạm thời', 'Chưa đúng thời điểm', 'Bị động'],
    'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg', true),
  (11, 'XI', 'Justice', 'Công Lý', 'major',
    array['Công bằng', 'Nhân quả rõ ràng', 'Sự thật sáng tỏ', 'Cân bằng cho - nhận', 'Minh bạch'],
    array['Mất cân bằng', 'Đổ lỗi né trách nhiệm', 'Thiên vị cảm tính', 'Thiếu công bằng', 'Mập mờ'],
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg', true),
  (12, 'XII', 'The Hanged Man', 'Người Treo Ngược', 'major',
    array['Đổi góc nhìn', 'Tạm dừng chủ động', 'Buông bỏ kiểm soát', 'Thấu hiểu mới', 'Chấp nhận'],
    array['Hy sinh vô ích', 'Mắc kẹt kéo dài', 'Chờ đợi trong mỏi mòn', 'Cố chấp', 'Trì hoãn'],
    'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg', true),
  (13, 'XIII', 'Death', 'Sự Chuyển Hóa', 'major',
    array['Khép lại chương cũ', 'Tái sinh mạnh mẽ', 'Lột xác', 'Thay đổi tất yếu', 'Buông bỏ dứt khoát'],
    array['Níu kéo quá khứ', 'Sợ thay đổi', 'Vấn vương chuyện cũ', 'Trì hoãn kết thúc', 'Bế tắc'],
    'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg', true),
  (14, 'XIV', 'Temperance', 'Tiết Độ', 'major',
    array['Dung hòa', 'Chữa lành từ tốn', 'Cân bằng', 'Điềm đạm', 'Kiên nhẫn pha trộn'],
    array['Cực đoan', 'Nóng vội đốt giai đoạn', 'Mất cân bằng sống', 'Xung đột', 'Quá tải'],
    'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg', true),
  (15, 'XV', 'The Devil', 'Ác Quỷ', 'major',
    array['Ám ảnh độc hại', 'Ràng buộc vô hình', 'Cám dỗ', 'Phụ thuộc cảm xúc', 'Thói quen xấu'],
    array['Thức tỉnh tháo xích', 'Thoát khỏi thao túng', 'Lấy lại tự do', 'Cai nghiện cảm xúc', 'Vượt cám dỗ'],
    'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg', true),
  (16, 'XVI', 'The Tower', 'Tòa Tháp', 'major',
    array['Sự thật phơi bày', 'Sụp đổ ảo tưởng', 'Biến cố thức tỉnh', 'Giải phóng', 'Xây lại từ nền móng'],
    array['Cố chống đỡ cái sai', 'Sợ đối diện sự thật', 'Chấn động âm ỉ', 'Giảm nhẹ va đập', 'Trì hoãn sụp đổ'],
    'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg', true),
  (17, 'XVII', 'The Star', 'Ngôi Sao Hy Vọng', 'major',
    array['Hy vọng thuần khiết', 'Chữa lành tâm hồn', 'Niềm tin', 'Cảm hứng sáng tạo', 'Bình yên sau bão'],
    array['Mất niềm tin', 'Bi quan', 'Cạn cảm hứng', 'Tự hoài nghi', 'Quên giá trị bản thân'],
    'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg', true),
  (18, 'XVIII', 'The Moon', 'Mặt Trăng', 'major',
    array['Mập mờ ẩn khuất', 'Lo âu đêm muộn', 'Tự suy diễn', 'Ảo ảnh dưới ánh trăng', 'Nhạy cảm'],
    array['Sương mù tan dần', 'Nhìn rõ sự thật', 'Giải tỏa hiểu lầm', 'Thoát khỏi nỗi sợ', 'Tỉnh táo'],
    'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg', true),
  (19, 'XIX', 'The Sun', 'Mặt Trời', 'major',
    array['Niềm vui rực rỡ', 'Thành công sáng rõ', 'Chân thành ấm áp', 'Năng lượng tích cực', 'Minh bạch'],
    array['Niềm vui đến muộn', 'Áp lực phải tích cực', 'Che giấu nỗi buồn', 'Cái tôi quá lớn', 'Kỳ vọng quá cao'],
    'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg', true),
  (20, 'XX', 'Judgement', 'Phán Quyết & Thức Tỉnh', 'major',
    array['Tiếng gọi thức tỉnh', 'Quyết định bước ngoặt', 'Tha thứ cho mình', 'Làm lại từ đầu', 'Sáng suốt'],
    array['Khắt khe tự trách', 'Do dự trước cơ hội', 'Bám víu lỗi lầm cũ', 'Sợ phán xét', 'Chưa sẵn sàng'],
    'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg', true),
  (21, 'XXI', 'The World', 'Thế Giới Viên Mãn', 'major',
    array['Trọn vẹn viên mãn', 'Hoàn thành chu kỳ', 'Thành tựu xứng đáng', 'Hòa hợp', 'Mở ra chân trời mới'],
    array['Thiếu mảnh ghép cuối', 'Chưa khép lại trọn vẹn', 'Đốt cháy giai đoạn', 'Còn vướng bận', 'Chậm đích'],
    'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg', true)
on conflict (id) do update set
  roman = excluded.roman,
  name_en = excluded.name_en,
  name_vi = excluded.name_vi,
  arcana = excluded.arcana,
  keywords_up = excluded.keywords_up,
  keywords_rev = excluded.keywords_rev,
  image_url = excluded.image_url,
  active = excluded.active;
