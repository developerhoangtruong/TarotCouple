/**
 * Server-Side Cryptographic Tarot Shuffler (CSPRNG Fisher-Yates)
 * Per PLAN.md Section 4.1:
 * - Uses Web Crypto API `crypto.getRandomValues()`
 * - Supports both 22 Major Arcana cards (IDs 0..21) and full 78 RWS cards (IDs 0..77)
 * - Assigns upright/reversed orientation with configurable reversed probability (default 30%)
 */

export const MAJOR_ARCANA_COUNT = 22;
export const FULL_DECK_COUNT = 78;
export const DEFAULT_REVERSED_PROBABILITY = 0.3;

export type SupportedDeckSize = 22 | 78 | 'major_22' | 'full_78';

export interface ShuffledDeckSlot {
  fan_index: number;
  card_id: number;
  cardId: number;
  reversed: boolean;
}

export interface ShuffledCardDraw {
  position_index: 0 | 1 | 2;
  positionIndex: 0 | 1 | 2;
  fan_index: number;
  fanIndex: number;
  card_id: number;
  cardId: number;
  reversed: boolean;
}

export interface SingleCardDrawResult {
  card_id: number;
  cardId: number;
  reversed: boolean;
  fan_index: number;
  fanIndex: number;
}

export type ShuffleAndDrawResult = [
  ShuffledCardDraw,
  ShuffledCardDraw,
  ShuffledCardDraw,
] & {
  drawnCards: [ShuffledCardDraw, ShuffledCardDraw, ShuffledCardDraw];
  deck: ShuffledDeckSlot[];
};

function resolveDeckCount(deckSize?: SupportedDeckSize): 22 | 78 {
  if (deckSize === 78 || deckSize === 'full_78') {
    return FULL_DECK_COUNT;
  }
  return MAJOR_ARCANA_COUNT;
}

/**
 * Generate a cryptographically secure random 32-bit unsigned integer
 */
function getCryptoRandomUint32(): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0]!;
}

/**
 * Cryptographically unbiased random integer in [0, maxExclusive) using rejection sampling
 */
export function cryptoRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error(`maxExclusive must be a positive integer, got ${maxExclusive}`);
  }
  if (maxExclusive === 1) return 0;

  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - ((maxUint32 + 1) % maxExclusive);

  let rand = getCryptoRandomUint32();
  while (rand > limit) {
    rand = getCryptoRandomUint32();
  }
  return rand % maxExclusive;
}

/**
 * Cryptographically secure random float in [0, 1)
 */
export function cryptoRandomFloat(): number {
  // Divide random uint32 by 2^32
  return getCryptoRandomUint32() / 0x100000000;
}

/**
 * Generate a freshly shuffled Tarot deck (22 Major Arcana or full 78-card deck) using CSPRNG Fisher-Yates
 */
export function generateShuffledMajorArcanaDeck(
  reversedProbability: number = DEFAULT_REVERSED_PROBABILITY,
  deckSize: SupportedDeckSize = MAJOR_ARCANA_COUNT
): ShuffledDeckSlot[] {
  const clampedProb = Math.max(0, Math.min(1, reversedProbability));
  const totalCards = resolveDeckCount(deckSize);

  // Initialize card IDs 0..(totalCards - 1)
  const cardIds: number[] = Array.from(
    { length: totalCards },
    (_, idx) => idx
  );

  // Fisher-Yates shuffle using CSPRNG
  for (let i = cardIds.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    const temp = cardIds[i]!;
    cardIds[i] = cardIds[j]!;
    cardIds[j] = temp;
  }

  return cardIds.map((cardId, fanIndex) => {
    const reversed = cryptoRandomFloat() < clampedProb;
    return {
      fan_index: fanIndex,
      card_id: cardId,
      cardId,
      reversed,
    };
  });
}

/**
 * Alias for shuffling either 22 or 78 cards
 */
export const generateShuffledTarotDeck = generateShuffledMajorArcanaDeck;

/**
 * Shuffles the Tarot deck (22 Major Arcana or 78 full deck) on the server and maps the 3 user-selected
 * fan indices (i, j, k) to 3 distinct drawn cards with upright/reversed orientation.
 *
 * Returns a 3-element tuple `[card0, card1, card2]` augmented with `.drawnCards` and `.deck`
 * so both array destructuring and object property access work seamlessly.
 */
export function shuffleAndDrawServerSide(
  selectedIndices: [number, number, number],
  reversedProbability: number = DEFAULT_REVERSED_PROBABILITY,
  deckSize?: SupportedDeckSize
): ShuffleAndDrawResult {
  if (!Array.isArray(selectedIndices) || selectedIndices.length !== 3) {
    throw new Error('Phải chọn đúng 3 vị trí lá bài.');
  }

  const [i, j, k] = selectedIndices;
  const indices: [number, number, number] = [i, j, k];

  // Auto-detect 78-card deck if deckSize is omitted and indices clearly target Minor Arcana (> 22 and < 78)
  const effectiveDeckSize: 22 | 78 =
    deckSize !== undefined
      ? resolveDeckCount(deckSize)
      : indices.every((idx) => Number.isInteger(idx) && idx >= 0 && idx < FULL_DECK_COUNT) &&
        indices.some((idx) => idx > MAJOR_ARCANA_COUNT)
      ? FULL_DECK_COUNT
      : MAJOR_ARCANA_COUNT;

  for (const idx of indices) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= effectiveDeckSize) {
      throw new Error(
        `Vị trí lá bài không hợp lệ (${idx}). Phải là số nguyên từ 0 đến ${effectiveDeckSize - 1}.`
      );
    }
  }

  if (i === j || j === k || i === k) {
    throw new Error('Ba vị trí lá bài được chọn phải hoàn toàn khác nhau.');
  }

  const deck = generateShuffledMajorArcanaDeck(reversedProbability, effectiveDeckSize);

  const drawnTuple: [ShuffledCardDraw, ShuffledCardDraw, ShuffledCardDraw] = [
    {
      position_index: 0,
      positionIndex: 0,
      fan_index: i,
      fanIndex: i,
      card_id: deck[i]!.card_id,
      cardId: deck[i]!.card_id,
      reversed: deck[i]!.reversed,
    },
    {
      position_index: 1,
      positionIndex: 1,
      fan_index: j,
      fanIndex: j,
      card_id: deck[j]!.card_id,
      cardId: deck[j]!.card_id,
      reversed: deck[j]!.reversed,
    },
    {
      position_index: 2,
      positionIndex: 2,
      fan_index: k,
      fanIndex: k,
      card_id: deck[k]!.card_id,
      cardId: deck[k]!.card_id,
      reversed: deck[k]!.reversed,
    },
  ];

  return Object.assign(drawnTuple, {
    drawnCards: drawnTuple,
    deck,
  });
}

/**
 * Draw a single cryptographically random card on the server (excluding any already-drawn card IDs).
 * Used for Phase 2/3 Clarifier Card ("Lá làm rõ") and Daily 1-Card Pull ("Thông điệp vũ trụ mỗi ngày").
 */
export function drawSingleRandomCardServerSide(
  excludeCardIds: number[] = [],
  reversedProbability: number = DEFAULT_REVERSED_PROBABILITY,
  deckSize: SupportedDeckSize = FULL_DECK_COUNT
): SingleCardDrawResult {
  const effectiveDeckSize = resolveDeckCount(deckSize);
  const deck = generateShuffledMajorArcanaDeck(reversedProbability, effectiveDeckSize);
  const excludedSet = new Set(excludeCardIds);

  const available = deck.filter((slot) => !excludedSet.has(slot.card_id));
  const chosen = available[0] ?? deck[0]!;

  return {
    card_id: chosen.card_id,
    cardId: chosen.cardId,
    reversed: chosen.reversed,
    fan_index: chosen.fan_index,
    fanIndex: chosen.fan_index,
  };
}
