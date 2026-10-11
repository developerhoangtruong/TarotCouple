import { NextResponse } from 'next/server';
import {
  buildCustomTikTokKitFromInput,
  buildSpiritualWrappedForClient,
  buildTikTokCarouselKits,
  claimReferralBonus,
  getCachedReading,
  getQuotaStatus,
  getReferralStatus,
  getUnitEconomicsSummary,
  recordRewardedAdView,
  resolveClientKey,
} from '@/lib/quota-store';
import { type ReaderId, ReaderIdSchema } from '@/lib/schemas';

/**
 * GET /api/growth
 * Returns Phase 4 Growth Engine payload:
 * - `wrapped`: SpiritualWrappedPayload ("Hồ Sơ Tâm Linh Cuối Tháng")
 * - `tiktokKits`: TikTokCarouselKit[] (4 viral 3-slide seeding kits + custom reading kit if `readingId` provided)
 * - `referral`: ReferralStatusPayload (referral code, invited friends, rewarded ad counter)
 * - `unitEconomics`: UnitEconomicsSummary (ARPU, ARPPU, Cost per Paying User, Stage Gate 4 status)
 * - `quota`: QuotaStatusPayload
 */
export async function GET(request: Request) {
  const clientKey = resolveClientKey(request);
  const url = new URL(request.url);

  const nicknameParam = url.searchParams.get('nickname') || undefined;
  const readingIdParam = url.searchParams.get('readingId') || undefined;
  const rawReaderId = url.searchParams.get('readerId');
  const parsedReader = ReaderIdSchema.safeParse(rawReaderId);
  const readerId: ReaderId | undefined = parsedReader.success
    ? parsedReader.data
    : undefined;

  const customReading = readingIdParam
    ? getCachedReading(readingIdParam)
    : undefined;

  const wrapped = buildSpiritualWrappedForClient(
    clientKey,
    nicknameParam || customReading?.nickname,
    readerId || customReading?.readerId
  );
  const tiktokKits = buildTikTokCarouselKits(customReading);
  const referral = getReferralStatus(clientKey);
  const unitEconomics = getUnitEconomicsSummary();
  const quota = getQuotaStatus(clientKey);

  return NextResponse.json(
    {
      status: 'ok',
      wrapped,
      tiktokKits,
      referral,
      unitEconomics,
      quota,
    },
    { status: 200 }
  );
}

/**
 * POST /api/growth
 * Actions:
 * - `claim_referral`: `{ action: 'claim_referral', referralCode: string }`
 * - `watch_rewarded_ad`: `{ action: 'watch_rewarded_ad' }`
 * - `generate_custom_tiktok_kit`: `{ action: 'generate_custom_tiktok_kit', readingId?, nickname?, questionText?, readerId?, savageQuote? }`
 */
export async function POST(request: Request) {
  const clientKey = resolveClientKey(request);
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Body JSON không hợp lệ.',
      },
      { status: 400 }
    );
  }

  const action = typeof body.action === 'string' ? body.action.trim() : '';

  if (action === 'claim_referral') {
    const referralCode =
      typeof body.referralCode === 'string'
        ? body.referralCode
        : typeof body.friendReferralCode === 'string'
        ? body.friendReferralCode
        : '';

    const result = claimReferralBonus(clientKey, referralCode);
    return NextResponse.json(
      {
        status: result.success ? 'ok' : 'error',
        ...result,
      },
      { status: result.success ? 200 : 400 }
    );
  }

  if (action === 'watch_rewarded_ad') {
    const result = recordRewardedAdView(clientKey);
    return NextResponse.json(
      {
        status: result.success ? 'ok' : 'error',
        ...result,
      },
      { status: result.success ? 200 : 429 }
    );
  }

  if (action === 'generate_custom_tiktok_kit') {
    const readingId =
      typeof body.readingId === 'string' ? body.readingId : undefined;
    const nickname =
      typeof body.nickname === 'string' ? body.nickname : undefined;
    const questionText =
      typeof body.questionText === 'string' ? body.questionText : undefined;
    const savageQuote =
      typeof body.savageQuote === 'string' ? body.savageQuote : undefined;
    const parsedReader = ReaderIdSchema.safeParse(body.readerId);
    const readerId: ReaderId | undefined = parsedReader.success
      ? parsedReader.data
      : undefined;

    const customKit = buildCustomTikTokKitFromInput({
      readingId,
      nickname,
      questionText,
      readerId,
      savageQuote,
    });

    return NextResponse.json(
      {
        status: 'ok',
        kit: customKit,
        customKit,
        tiktokKits: [customKit, ...buildTikTokCarouselKits()],
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      status: 'error',
      message: `Action không hợp lệ: ${action || 'trống'}. Hỗ trợ: claim_referral, watch_rewarded_ad, generate_custom_tiktok_kit.`,
    },
    { status: 400 }
  );
}
