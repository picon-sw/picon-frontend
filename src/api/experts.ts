import {
  DEMO_REQUEST_PORTFOLIO_IMAGES,
  DEMO_REQUEST_PROFILE_PORTFOLIO_IMAGES,
  demoProfileImage,
} from '../constants/demoImages';
import { addDays, formatMonthDay, fromDateKey, toDateKey } from '../utils/date';
import type { ShootRequestForm } from './requests';

// ---- 의뢰에서 보는 작가 정보 (전문가 선택 · 작가 프로필 · 받은 제안이 함께 사용) ----
// TODO: API 나오면 이 파일의 fetch 함수 안만 client.get(...)으로 교체 (지금은 임시 데이터)

export interface PortfolioPhoto {
  id: number;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  imageUrl?: string;
}

export interface Expert {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  // 평균 전달 기간 (일)
  deliveryDays: number;
  introduction: string;
  // '이렇게 촬영해요' 분위기 태그와 설명
  moodTags: string[];
  shootingStyle: string;
  // 기본 10장 금액, 추가 1장당 금액 (원)
  basePrice: number;
  extraPrice: number;
  profileImageUrl?: string;
  // 카드에 보이는 대표 3장 / 프로필에 보이는 전체
  portfolio: PortfolioPhoto[];
  profilePortfolio: PortfolioPhoto[];
  // 활동 지역 (바로 의뢰하면 이 지역에서만 촬영)
  region: { sido: string; sigungu: string };
  // 편집 의뢰도 받는지
  acceptsEdit: boolean;
  // 편집 전문가의 1장당 보정 금액 (편집 전문가만)
  editPrice?: number;
}

export const BASE_PHOTO_COUNT = 10;

// 예: 10장 기준 89,000원 · 추가 1장당 5,000원
export function formatExpertPrice({ basePrice, extraPrice }: Expert): string {
  return `${BASE_PHOTO_COUNT}장 기준 ${formatWon(basePrice)} · 추가 1장당 ${formatWon(extraPrice)}`;
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

// TODO: 시연용 사진 (API 연동 시 imageUrl 삭제)
const CARD_PORTFOLIO = DEMO_REQUEST_PORTFOLIO_IMAGES.map((imageUrl, index) => ({
  id: index + 1,
  imageUrl,
}));
const PROFILE_PORTFOLIO = DEMO_REQUEST_PROFILE_PORTFOLIO_IMAGES.map((imageUrl, index) => ({
  id: index + 1,
  imageUrl,
}));

const EXPERT_REGIONS: Record<number, Expert['region']> = {
  1: { sido: '서울', sigungu: '마포구' },
  2: { sido: '서울', sigungu: '용산구' },
  3: { sido: '서울', sigungu: '성동구' },
  4: { sido: '서울', sigungu: '마포구' },
  5: { sido: '서울', sigungu: '성동구' },
  6: { sido: '경기', sigungu: '성남시' },
  10: { sido: '서울', sigungu: '서초구' },
  11: { sido: '서울', sigungu: '강남구' },
};
// 편집도 받는 작가
const EDIT_EXPERT_IDS = [1, 2, 3, 5, 6, 7, 8, 9, 21, 22, 23];

// 편집 의뢰 전문가 (보정만 함)
const EDIT_EXPERTS = [
  {
    id: 21,
    name: '하린 작가',
    rating: 4.9,
    reviewCount: 58,
    deliveryDays: 2,
    introduction: '원래 얼굴은 그대로, 피부와 색감만 맑게 다듬어요.',
    moodTags: ['피부·잡티', '색감'],
    shootingStyle: '피부결은 살리고 잡티만 정리해요. 색감은 맑고 자연스럽게 맞춰요.',
    basePrice: 40000,
    extraPrice: 8000,
    editPrice: 8000,
  },
  {
    id: 22,
    name: '도윤 작가',
    rating: 4.8,
    reviewCount: 24,
    deliveryDays: 3,
    introduction: '따뜻한 필름 느낌의 색감을 잘 만들어요.',
    moodTags: ['색감'],
    shootingStyle: '필름 카메라로 찍은 듯한 따뜻한 색감으로 보정해요.',
    basePrice: 30000,
    extraPrice: 6000,
    editPrice: 6000,
  },
  {
    id: 23,
    name: '수아 작가',
    rating: 4.9,
    reviewCount: 41,
    deliveryDays: 2,
    introduction: '얼굴형과 배경까지 꼼꼼하게 다듬어요.',
    moodTags: ['얼굴형', '배경 정리·합성'],
    shootingStyle: '얼굴형은 티 나지 않게, 배경은 깔끔하게 정리해요.',
    basePrice: 45000,
    extraPrice: 9000,
    editPrice: 9000,
  },
];

const EXPERTS: Expert[] = [
  ...EDIT_EXPERTS,
  {
    id: 1,
    name: '김하늘 작가',
    rating: 4.9,
    reviewCount: 32,
    deliveryDays: 3,
    introduction: '자연스러운 빛으로, 가장 나다운 순간을 담아요.',
    moodTags: ['자연스러움', '차분함'],
    shootingStyle:
      '창가로 스며드는 빛 아래에서 꾸미지 않은 표정을 편안하게 담아 드려요. 서두르지 않고 가장 나다운 순간을 기다려요.',
    basePrice: 89000,
    extraPrice: 5000,
  },
  {
    id: 2,
    name: '윤슬 작가',
    rating: 4.8,
    reviewCount: 24,
    deliveryDays: 4,
    introduction: '햇살 아래 반짝이는 순간을 기록해요.',
    moodTags: ['밝음', '자연스러움'],
    shootingStyle:
      '야외 자연광을 가장 좋아해요. 걷거나 웃는 사이사이의 움직임을 따라가며, 포즈보다 분위기가 느껴지는 사진을 남겨 드려요.',
    basePrice: 79000,
    extraPrice: 5000,
  },
  {
    id: 3,
    name: '민서 작가',
    rating: 4.9,
    reviewCount: 41,
    deliveryDays: 3,
    introduction: '편안한 대화 속에서 자연스러운 표정을 찾아요.',
    moodTags: ['밝음', '개성적'],
    shootingStyle:
      '촬영 내내 이야기를 나누며 긴장을 풀어 드려요. 친구들끼리 장난치는 순간처럼 꾸밈없는 사진을 잘 찍어요.',
    basePrice: 85000,
    extraPrice: 5000,
  },
  {
    id: 4,
    name: '서하 작가',
    rating: 4.7,
    reviewCount: 18,
    deliveryDays: 5,
    introduction: '선명한 색감으로 오늘의 기분을 담아요.',
    moodTags: ['밝음', '세련됨'],
    shootingStyle:
      '밝고 쨍한 색감을 좋아해요. 도심 속 컬러풀한 배경을 활용해 생기 있는 스냅을 찍어 드려요.',
    basePrice: 80000,
    extraPrice: 5000,
  },
  {
    id: 5,
    name: '무드필름',
    rating: 4.8,
    reviewCount: 56,
    deliveryDays: 4,
    introduction: '영화 한 장면 같은 분위기를 만들어요.',
    moodTags: ['몽환적', '극적 표현'],
    shootingStyle:
      '차분한 톤과 깊은 그림자를 살린 시네마틱 사진을 찍어요. 해 질 녘 골든아워 촬영을 추천해요.',
    basePrice: 95000,
    extraPrice: 6000,
  },
  {
    id: 6,
    name: '이젤 작가',
    rating: 4.6,
    reviewCount: 12,
    deliveryDays: 3,
    introduction: '그림처럼 부드러운 사진을 그려요.',
    moodTags: ['차분함', '몽환적'],
    shootingStyle:
      '파스텔 톤의 부드러운 보정을 좋아해요. 꽃이나 하늘이 있는 배경에서 따뜻한 느낌의 사진을 담아 드려요.',
    basePrice: 60000,
    extraPrice: 4000,
  },
  {
    id: 7,
    name: '도하 작가',
    rating: 4.8,
    reviewCount: 27,
    deliveryDays: 4,
    introduction: '걷는 사이사이의 순간을 놓치지 않아요.',
    moodTags: ['자연스러움', '밝음'],
    shootingStyle:
      '골목과 공원을 함께 걸으며 대화하듯 촬영해요. 정해진 포즈보다 움직임 속 표정을 담아 드려요.',
    basePrice: 85000,
    extraPrice: 5000,
  },
  {
    id: 8,
    name: '이안 작가',
    rating: 4.9,
    reviewCount: 36,
    deliveryDays: 3,
    introduction: '깔끔한 구도로 오래 두고 보는 사진을 찍어요.',
    moodTags: ['세련됨', '차분함'],
    shootingStyle:
      '배경을 정돈하고 빛을 맞춰 깔끔한 사진을 만들어요. 기념일·프로필 촬영을 많이 해 왔어요.',
    basePrice: 92000,
    extraPrice: 6000,
  },
  {
    id: 9,
    name: '소울 작가',
    rating: 4.7,
    reviewCount: 19,
    deliveryDays: 5,
    introduction: '필름 같은 색감으로 하루를 기록해요.',
    moodTags: ['몽환적', '자연스러움'],
    shootingStyle:
      '따뜻한 필름 톤을 좋아해요. 해 질 녘 빛을 활용해 영화 같은 장면을 만들어 드려요.',
    basePrice: 75000,
    extraPrice: 5000,
  },
  {
    id: 10,
    name: '지훈 작가',
    rating: 4.9,
    reviewCount: 44,
    deliveryDays: 3,
    introduction: '바다와 노을을 가장 좋아하는 작가예요.',
    moodTags: ['차분함', '몽환적'],
    shootingStyle:
      '해 질 녘 바닷가에서 차분한 커플·우정 사진을 찍어요. 날씨에 맞춰 촬영 장소를 함께 정해요.',
    basePrice: 89000,
    extraPrice: 5000,
  },
  {
    id: 11,
    name: '아리 작가',
    rating: 4.8,
    reviewCount: 22,
    deliveryDays: 4,
    introduction: '여럿이 함께하는 순간을 즐겁게 담아요.',
    moodTags: ['밝음', '개성적'],
    shootingStyle:
      '가족·단체 촬영을 많이 해요. 모두가 편하게 웃을 수 있도록 촬영 내내 분위기를 이끌어요.',
    basePrice: 99000,
    extraPrice: 6000,
  },
].map((expert) => ({
  ...expert,
  // TODO: API 연동 시 작가 정보에서 받기 (지금은 임시 데이터)
  region: EXPERT_REGIONS[expert.id] ?? { sido: '서울', sigungu: '마포구' },
  acceptsEdit: EDIT_EXPERT_IDS.includes(expert.id),
  // TODO: 시연용 사진 (API 연동 시 삭제)
  profileImageUrl: demoProfileImage(expert.name),
  portfolio: CARD_PORTFOLIO,
  profilePortfolio: PROFILE_PORTFOLIO,
}));

// 탐색 프로필의 작가 이름('서하 작가')으로 의뢰 쪽 작가 찾기
// TODO: API 연동 시 탐색과 의뢰가 같은 작가 id를 쓰면 삭제
export function findExpertByName(name: string): Expert | null {
  return EXPERTS.find((expert) => expert.name === name) ?? null;
}

// 바로 의뢰하기에서 작가가 촬영할 수 있는 시간 (오전 10~11시, 오후 1~4시)
const AVAILABLE_TIMES = [
  '10:00',
  '10:30',
  '11:00',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
];

// 작가가 촬영할 수 있는 날짜인지 (임시 규칙: 날짜와 작가 id로 정한 일부 날짜는 일정이 참)
// TODO: API 연동 시 client.get(`/experts/${id}/schedule`) 결과 사용
export function isExpertDateAvailable(expert: Expert, dateKey: string): boolean {
  return (fromDateKey(dateKey).getDate() * 7 + expert.id) % 5 >= 2;
}

// 지금은 날짜와 상관없이 같은 시간 (API 연동 시 날짜별 가능 시간)
export function expertAvailableTimes(expert: Expert, dateKey: string): string[] {
  void expert;
  void dateKey;
  return AVAILABLE_TIMES;
}

// 예: 서울 마포구 · 촬영 · 80,000원~
export function formatExpertSummary(expert: Expert): string {
  const { sido, sigungu } = expert.region;
  const fields = expert.acceptsEdit ? '촬영·편집' : '촬영';
  return `${sido} ${sigungu} · ${fields} · ${formatWon(expert.basePrice)}~`;
}

// 편집 의뢰 전문가인지 (1장당 금액이 있음)
export function isEditExpert(expert: Expert): boolean {
  return expert.editPrice !== undefined;
}

// 예: 1장 8,000원~ (편집) / 89,000원~ (촬영)
export function formatStartPrice(expert: Expert): string {
  return expert.editPrice !== undefined
    ? `1장 ${formatWon(expert.editPrice)}~`
    : `${formatWon(expert.basePrice)}~`;
}

// 작가 한 명 (없으면 null)
export function getExpert(id: number): Expert | null {
  return EXPERTS.find((expert) => expert.id === id) ?? null;
}

export async function fetchExpert(id: number): Promise<Expert | null> {
  return getExpert(id);
}

// 시간이 맞는 작가가 없을 때 추천하는 가까운 시간
export interface NearbySlot {
  date: string;
  time: string;
  expertCount: number;
}

export type AvailableExperts =
  { kind: 'available'; experts: Expert[] } | { kind: 'none'; nearby: NearbySlot[] };

// 요청서 조건(날짜·시간·지역·촬영 종류)으로 촬영 가능한 작가
// excludeIds: 이미 요청한 작가 (다시 요청할 때 제외)
// TODO: API 연동 시 서버가 조건으로 거른 목록을 그대로 사용
// 지금은 임시 규칙: 19시 이후는 가능한 작가가 없다고 보고 가까운 시간을 추천
export async function fetchAvailableExperts(
  form: ShootRequestForm | undefined,
  excludeIds: readonly number[] = [],
  kind: 'shoot' | 'edit' = 'shoot',
): Promise<AvailableExperts> {
  // 편집은 편집 전문가만 (날짜·지역 조건 없음)
  if (kind === 'edit') {
    return {
      kind: 'available',
      experts: EXPERTS.filter((expert) => isEditExpert(expert) && !excludeIds.includes(expert.id)),
    };
  }
  if (form && form.time >= '19:00') {
    return {
      kind: 'none',
      nearby: [
        { date: form.date, time: '16:00', expertCount: 3 },
        { date: nextDateKey(form.date, 1), time: form.time.replace('19', '14'), expertCount: 5 },
        { date: nextDateKey(form.date, 2), time: '11:00', expertCount: 2 },
      ],
    };
  }
  return {
    kind: 'available',
    experts: EXPERTS.filter((expert) => !isEditExpert(expert) && !excludeIds.includes(expert.id)),
  };
}

function nextDateKey(dateKey: string, days: number): string {
  return toDateKey(addDays(fromDateKey(dateKey), days));
}

// 예: 10월 20일 (화) 16:00
export function formatSlot({ date, time }: Pick<NearbySlot, 'date' | 'time'>): string {
  return `${formatMonthDay(date)} ${time}`;
}
