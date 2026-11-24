// 요청서에서 고르는 값 (촬영 종류 · 분위기 · 예산 · 희망 시간)
// TODO: API 명세에서 코드 값이 정해지면 라벨 대신 코드로 주고받기

export const BUDGETS = ['5만 원 이하', '5~10만 원', '10만 원 이상'] as const;
export type Budget = (typeof BUDGETS)[number];

// 촬영 종류: 대분류 + 중분류. 중분류가 없는 대분류는 대분류만 고르면 됨
export const SHOOT_CATEGORIES = {
  인물: ['프로필·증명', '기념', '관계', '일상'],
  반려동물: [],
  제품: [],
  기타: [],
} as const satisfies Record<string, readonly string[]>;

export type ShootCategory = keyof typeof SHOOT_CATEGORIES;
export const SHOOT_CATEGORY_NAMES = Object.keys(SHOOT_CATEGORIES) as ShootCategory[];

export interface ShootKind {
  category: ShootCategory;
  // 중분류 (대분류에 중분류가 없으면 null)
  subcategory: string | null;
}

// 예: '인물 > 관계', '반려동물'
export function formatShootKind({ category, subcategory }: ShootKind): string {
  return subcategory ? `${category} > ${subcategory}` : category;
}

export function isShootKindDone(kind: ShootKind | null): kind is ShootKind {
  if (!kind) return false;
  return SHOOT_CATEGORIES[kind.category].length === 0 || kind.subcategory !== null;
}

export const MOODS = ['밝음', '자연스러움', '차분함', '세련됨', '몽환적', '개성적', '극적 표현'];
export const MAX_MOODS = 3;

// 희망 시간: 09:00 ~ 19:30, 30분 단위
export const TIME_SLOTS = Array.from({ length: 22 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  return `${hour}:${minutes % 60 === 0 ? '00' : '30'}`;
});
