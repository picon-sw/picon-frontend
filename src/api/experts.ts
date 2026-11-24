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

const EXPERTS: Expert[] = [
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
    basePrice: 70000,
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
].map((expert) => ({
  ...expert,
  // TODO: 시연용 사진 (API 연동 시 삭제)
  profileImageUrl: demoProfileImage(expert.name),
  portfolio: CARD_PORTFOLIO,
  profilePortfolio: PROFILE_PORTFOLIO,
}));

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
): Promise<AvailableExperts> {
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
  return { kind: 'available', experts: EXPERTS.filter(({ id }) => !excludeIds.includes(id)) };
}

function nextDateKey(dateKey: string, days: number): string {
  return toDateKey(addDays(fromDateKey(dateKey), days));
}

// 예: 10월 20일 (화) 16:00
export function formatSlot({ date, time }: Pick<NearbySlot, 'date' | 'time'>): string {
  return `${formatMonthDay(date)} ${time}`;
}
