import React from 'react';
import { ImageResponse } from 'next/og';
import { MAJOR_ARCANA, TAROT_CARDS_BY_ID } from '@/data/tarot-cards';

export const runtime = 'nodejs';

let cachedFontBold: ArrayBuffer | null = null;
let cachedFontMedium: ArrayBuffer | null = null;

/**
 * Fetch Vietnamese-capable TTF font (Be Vietnam Pro) with in-memory caching & fast timeout fallback
 */
async function loadVietnameseFonts(): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: 500 | 700; style: 'normal' }>
> {
  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 500 | 700;
    style: 'normal';
  }> = [];

  try {
    if (!cachedFontBold || !cachedFontMedium) {
      const [boldRes, mediumRes] = await Promise.all([
        fetch(
          'https://cdn.jsdelivr.net/fontsource/fonts/be-vietnam-pro@latest/vietnamese-700-normal.ttf',
          { signal: AbortSignal.timeout(2500) }
        ),
        fetch(
          'https://cdn.jsdelivr.net/fontsource/fonts/be-vietnam-pro@latest/vietnamese-500-normal.ttf',
          { signal: AbortSignal.timeout(2500) }
        ),
      ]);

      if (boldRes.ok) {
        cachedFontBold = await boldRes.arrayBuffer();
      }
      if (mediumRes.ok) {
        cachedFontMedium = await mediumRes.arrayBuffer();
      }
    }

    if (cachedFontBold) {
      fonts.push({
        name: 'BeVietnamPro',
        data: cachedFontBold,
        weight: 700,
        style: 'normal',
      });
    }
    if (cachedFontMedium) {
      fonts.push({
        name: 'BeVietnamPro',
        data: cachedFontMedium,
        weight: 500,
        style: 'normal',
      });
    }
  } catch {
    // Graceful fallback to system font if offline or CDN unreachable
  }

  return fonts;
}

function clampScore(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(10, Math.min(100, parsed));
}

/**
 * GET /api/wrapped-card
 * Server-side 1080 x 1920 (9:16) PNG Renderer for "HỒ SƠ TÂM LINH THÁNG 10 / SPIRITUAL WRAPPED"
 * Renders a Spotify-Wrapped-inspired Mystic Gold & Obsidian 9:16 poster via Satori (`next/og`).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  const nickname = (url.searchParams.get('nickname') || 'Tín Đồ Tarot')
    .trim()
    .slice(0, 32);
  const monthLabel = (url.searchParams.get('month') || 'Tháng 10 / 2026')
    .trim()
    .slice(0, 28);
  const archetype = (
    url.searchParams.get('archetype') || 'Nữ Hoàng Tỉnh Thức • The Empress'
  )
    .trim()
    .slice(0, 56);

  const rawCardId = Number.parseInt(url.searchParams.get('cardId') || '3', 10);
  const validCardId = Number.isNaN(rawCardId)
    ? 3
    : Math.max(0, Math.min(77, rawCardId));
  const signatureCard = TAROT_CARDS_BY_ID[validCardId] ?? MAJOR_ARCANA[3]!;
  const reversedParam = url.searchParams.get('reversed');
  const isReversed =
    reversedParam === '1' ||
    reversedParam === 'true' ||
    reversedParam === 'rev';

  const totalReadings = Math.max(
    1,
    Number.parseInt(url.searchParams.get('totalReadings') || '14', 10) || 14
  );
  const peakHour = (
    url.searchParams.get('peakHour') || '23:45 — Giờ Suy Thượng Thừa'
  )
    .trim()
    .slice(0, 40);
  const dominantTopic = (
    url.searchParams.get('dominantTopic') || 'Tình duyên & Mập mờ (68%)'
  )
    .trim()
    .slice(0, 42);
  const readerName = (url.searchParams.get('readerName') || 'Bà Cố Mỏ Hỗn')
    .trim()
    .slice(0, 32);

  const selfLove = clampScore(url.searchParams.get('selfLove'), 91);
  const delusionDrop = clampScore(url.searchParams.get('delusionDrop'), 87);
  const redFlagRadar = clampScore(url.searchParams.get('redFlagRadar'), 94);
  const manifestPower = clampScore(url.searchParams.get('manifestPower'), 96);

  const quote = (
    url.searchParams.get('quote') ||
    'Đầu tháng còn thức tới 2h sáng lụy mập mờ, cuối tháng đã hóa Nữ Hoàng biết đắp mặt nạ đi ngủ đúng giờ!'
  )
    .trim()
    .slice(0, 190);

  const activeKeyword = isReversed
    ? signatureCard.keywords_rev[0] || 'Tỉnh thức nội tâm'
    : signatureCard.keywords_up[0] || 'Tỏa sáng rực rỡ';

  const auraBars = [
    {
      label: 'Độ Yêu Bản Thân (Self-Love)',
      score: selfLove,
      color: '#E5B869',
    },
    {
      label: 'Độ Giảm Lụy Tình (Delusion Drop)',
      score: delusionDrop,
      color: '#8CE0C9',
    },
    {
      label: 'Radar Bắt Thóp Red Flag',
      score: redFlagRadar,
      color: '#F472B6',
    },
    {
      label: 'Tần Số Manifest Vũ Trụ',
      score: manifestPower,
      color: '#60A5FA',
    },
  ];

  const fonts = await loadVietnameseFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1920px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(180deg, #07050C 0%, #170F2B 42%, #1E1336 68%, #07050C 100%)',
          color: '#F4EFE6',
          fontFamily:
            fonts.length > 0 ? 'BeVietnamPro, sans-serif' : 'sans-serif',
          paddingTop: '195px',
          paddingBottom: '195px',
          paddingLeft: '64px',
          paddingRight: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Outer Celestial Gold Frame */}
        <div
          style={{
            position: 'absolute',
            top: '165px',
            bottom: '165px',
            left: '36px',
            right: '36px',
            border: '2px solid rgba(229, 184, 105, 0.5)',
            borderRadius: '38px',
            display: 'flex',
          }}
        />

        {/* 1. HEADER: SPIRITUAL WRAPPED BADGE + ARCHETYPE */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(229, 184, 105, 0.16)',
              border: '1.5px solid #E5B869',
              borderRadius: '999px',
              padding: '10px 30px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#FDE68A',
                letterSpacing: '2.5px',
              }}
            >
              ✦ HỒ SƠ TÂM LINH • {monthLabel.toUpperCase()} ✦
            </span>
          </div>

          <span
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#D8D2E7',
            }}
          >
            BẢN ĐỒ NĂNG LƯỢNG CỦA @{nickname.toUpperCase()}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(19, 15, 30, 0.92)',
              border: '2px solid #E5B869',
              borderRadius: '22px',
              padding: '12px 32px',
            }}
          >
            <span
              style={{
                fontSize: '30px',
                fontWeight: 700,
                color: '#FDE68A',
                textAlign: 'center',
              }}
            >
              👑 {archetype}
            </span>
          </div>
        </div>

        {/* 2. SIGNATURE TAROT CARD + MONTHLY STATS GRID */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            width: '100%',
            gap: '24px',
          }}
        >
          {/* Left: Signature Tarot Card Centerpiece */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '410px',
              backgroundColor: '#130F1E',
              border: '2px solid #E5B869',
              borderRadius: '28px',
              padding: '24px 20px',
              boxShadow: '0 18px 44px rgba(0, 0, 0, 0.7)',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#E5B869',
                letterSpacing: '1.8px',
              }}
            >
              ✦ LÁ BÀI BẢN MỆNH THÁNG ✦
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '132px',
                height: '132px',
                borderRadius: '999px',
                backgroundColor: 'rgba(229, 184, 105, 0.12)',
                border: '2px solid rgba(229, 184, 105, 0.55)',
                marginTop: '8px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: signatureCard.roman.length > 5 ? '22px' : '40px',
                  fontWeight: 700,
                  color: '#FDE68A',
                }}
              >
                {signatureCard.roman}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  color: '#E5B869',
                  marginTop: '4px',
                }}
              >
                {signatureCard.arcana === 'minor' ? 'MINOR' : 'ARCANA'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                {signatureCard.name_vi}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: '#A39BB5',
                }}
              >
                {signatureCard.name_en} ({isReversed ? 'Ngược ↺' : 'Xuôi ↑'})
              </span>
              <span
                style={{
                  fontSize: '15px',
                  color: '#FDE68A',
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                “{activeKeyword}”
              </span>
            </div>
          </div>

          {/* Right: 4 Key Monthly Stats Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
              gap: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(19, 15, 30, 0.88)',
                border: '1px solid rgba(229, 184, 105, 0.35)',
                borderRadius: '20px',
                padding: '16px 22px',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '15px', color: '#A39BB5' }}>
                TỔNG SỐ LƯỢT XIN VÍA THÁNG 10
              </span>
              <span
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#FDE68A',
                }}
              >
                🔮 {totalReadings} phiên trải bài
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(19, 15, 30, 0.88)',
                border: '1px solid rgba(229, 184, 105, 0.35)',
                borderRadius: '20px',
                padding: '16px 22px',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '15px', color: '#A39BB5' }}>
                KHUNG GIỜ HAY SUY NHẤT
              </span>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#8CE0C9',
                }}
              >
                🌙 {peakHour}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(19, 15, 30, 0.88)',
                border: '1px solid rgba(229, 184, 105, 0.35)',
                borderRadius: '20px',
                padding: '16px 22px',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '15px', color: '#A39BB5' }}>
                CHỦ ĐỀ CHIẾM SÓNG
              </span>
              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 700,
                  color: '#F472B6',
                }}
              >
                💘 {dominantTopic}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(19, 15, 30, 0.88)',
                border: '1px solid rgba(229, 184, 105, 0.35)',
                borderRadius: '20px',
                padding: '16px 22px',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '15px', color: '#A39BB5' }}>
                READER ĐỘ MỆNH RUỘT
              </span>
              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 700,
                  color: '#F4EFE6',
                }}
              >
                ✨ {readerName}
              </span>
            </div>
          </div>
        </div>

        {/* 3. 4 AURA METRIC BARS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(19, 15, 30, 0.92)',
            border: '1.5px solid rgba(229, 184, 105, 0.45)',
            borderRadius: '28px',
            padding: '24px 32px',
            width: '100%',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#E5B869',
                letterSpacing: '2px',
              }}
            >
              ✦ CHỈ SỐ HÀO QUANG THÁNG 10 (AURA METRICS)
            </span>
            <span style={{ fontSize: '15px', color: '#A39BB5' }}>
              Chỉ số giải trí & tự phản chiếu
            </span>
          </div>

          {auraBars.map((bar, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#F4EFE6',
                  }}
                >
                  {bar.label}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: bar.color,
                  }}
                >
                  {bar.score}%
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: `${bar.score}%`,
                    height: '100%',
                    backgroundColor: bar.color,
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 4. MONTHLY SAVAGE QUOTE */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(19, 15, 30, 0.94)',
            border: '2px solid #E5B869',
            borderRadius: '28px',
            padding: '24px 36px',
            width: '100%',
            gap: '10px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#E5B869',
              letterSpacing: '2.5px',
            }}
          >
            ✦ CÂU CHỐT HẠ THÁNG CỦA BẠN ✦
          </span>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              lineHeight: 1.35,
            }}
          >
            “{quote}”
          </span>
        </div>

        {/* 5. FOOTER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(19, 15, 30, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '22px',
            padding: '16px 28px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#E5B869',
              }}
            >
              tarotcouple.vercel.app
            </span>
            <span style={{ fontSize: '16px', color: '#D8D2E7' }}>
              Mở Hồ Sơ Tâm Linh Cuối Tháng của riêng bạn ngay hôm nay →
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FDE68A',
              color: '#08060C',
              borderRadius: '14px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            SPIRITUAL WRAPPED
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      ...(fonts.length > 0 ? { fonts } : {}),
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    }
  );
}
