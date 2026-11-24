import { DEMO_DELIVERED_PHOTOS } from '../constants/demoImages';
import { addDays, formatMonthDay, fromDateKey, startOfToday, toDateKey } from '../utils/date';
import { BASE_PHOTO_COUNT, formatWon, getExpert, type Expert } from './experts';
import { formatLocation } from './places';
import {
  formatShootSchedule,
  type RequestExpertsState,
  type ShootFormDraft,
  type ShootRequestForm,
} from './requests';

// ---- 촬영 의뢰의 받은 제안 · 견적 · 예약 ----
// TODO: API 나오면 이 파일의 fetch/요청 함수 안만 client로 교체 (지금은 임시 데이터)
//       작가 쪽 데이터(제안 내용)는 작가 화면이 생길 때까지 더미

export interface Proposal {
  expertId: number;
  // 작가가 고른 중분류 태그 (예: 관계)
  tag: string;
  // 받은 제안 카드의 한 줄 설명
  summary: string;
  // 제안 상세 '이렇게 촬영해요' (분위기 태그 + 촬영 계획)
  styleTags: string[];
  plan: string;
}

// open: 제안을 받는 중이거나 고르는 중 / expired: 24시간 동안 아무도 제안하지 않음
// closed: 기한 안에 고르지 않아 마감(미선택) / canceled: 의뢰 취소(예약 후 취소 포함)
// reserved: 예약 확정 / expertCanceled: 작가가 예약을 취소
// photosArrived: 촬영 후 사진 도착(고르는 중) / purchased: 사진 구매 완료
export type ShootRequestPhase =
  | 'open'
  | 'expired'
  | 'closed'
  | 'canceled'
  | 'reserved'
  | 'expertCanceled'
  | 'photosArrived'
  | 'purchased';

// 작가가 보낸 사진 (작가 추천 사진은 기한이 지나면 자동 구매되는 기본 장수)
export interface DeliveredPhoto {
  id: number;
  url: string;
  recommended: boolean;
}

// 작가에게 남긴 문의 (답변이 없으면 답변 대기)
export interface Inquiry {
  id: number;
  question: string;
  // 'YYYY-MM-DD'
  askedAt: string;
  answer?: { content: string; answeredAt: string };
}

export interface ShootRequestDetail {
  id: number;
  title: string;
  form: ShootRequestForm;
  // 요청을 보낸 작가 (다시 요청할 때 목록에서 뺌)
  requestedIds: number[];
  proposals: Proposal[];
  phase: ShootRequestPhase;
  // 선택 기한 'YYYY-MM-DD'
  selectDeadline: string;
  // 예약한 작가와 예약 확정일 'YYYY-MM-DD' (예약 후에만)
  reservedExpertId?: number;
  reservedAt?: string;
  // 예약 후 작가에게 남긴 문의 (최근 것이 앞)
  inquiries: Inquiry[];
  // 사진 도착 후: 도착일 'YYYY-MM-DD'와 작가가 보낸 사진
  delivery?: { arrivedAt: string; photos: DeliveredPhoto[] };
  // 구매 후: 구매한 사진 · 결제일 · 기한이 지나 자동 구매됐는지
  purchase?: { photoIds: number[]; paidAt: string; auto: boolean };
}

// 예약금은 기본 금액의 20% (사진 구매 금액에서 빼 줌)
export const DEPOSIT_RATE = 0.2;
// 다시 요청할 때 촬영일까지 이 날짜 수보다 적게 남으면 날짜·시간을 다시 고르게 함
export const MIN_DAYS_BEFORE_SHOOT = 4;

export const PAYMENT_METHODS = ['카카오페이', '신용·체크카드', '토스페이'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function getDeposit({ basePrice }: Pick<Expert, 'basePrice'>): number {
  return Math.round(basePrice * DEPOSIT_RATE);
}

// 오늘부터 촬영일까지 남은 날 (오늘이면 0)
export function daysUntil(dateKey: string): number {
  const diff = fromDateKey(dateKey).getTime() - startOfToday().getTime();
  return Math.round(diff / (24 * 60 * 60 * 1000));
}

export function needsNewDate(form: ShootRequestForm): boolean {
  return daysUntil(form.date) < MIN_DAYS_BEFORE_SHOOT;
}

// 같은 조건으로 다시 요청할 때 갈 화면 (excludeIds: 이미 요청한 작가, 목록에서 뺌)
// 촬영일까지 4일 미만이면 날짜·시간을 비운 요청서부터, 아니면 바로 전문가 선택
export function reRequestTarget(
  { title, form }: Pick<ShootRequestDetail, 'title' | 'form'>,
  excludeIds: number[],
): { to: string; state: { draft: ShootFormDraft } | RequestExpertsState } {
  if (needsNewDate(form)) {
    const draft: ShootFormDraft = {
      ...form,
      date: null,
      time: null,
      excludeIds,
      notice: '촬영일이 가까워 날짜와 시간을 다시 골라 주세요',
    };
    return { to: '/requests/new/shoot', state: { draft } };
  }
  return {
    to: '/requests/new/experts',
    state: {
      summary: {
        title,
        detail: `${formatShootSchedule(form.date, form.time)} · ${formatLocation(form.location)} · 촬영 인원 ${form.people}명`,
      },
      kind: 'shoot',
      form,
      excludeIds,
    },
  };
}

// 예약금 전액 환불 기한: 촬영 2일 전 23:59 (예: 10월 18일 (일) 23:59)
export function formatRefundDeadline(form: ShootRequestForm): string {
  return `${formatMonthDay(toDateKey(addDays(fromDateKey(form.date), -2)))} 23:59`;
}

// 지금 예약을 취소하면 돌려받는 예약금 (기한 안이면 전액, 지나면 50%)
export function getRefund(
  form: ShootRequestForm,
  expert: Expert,
): { amount: number; full: boolean } {
  const deposit = getDeposit(expert);
  const full = daysUntil(form.date) >= 2;
  return { amount: full ? deposit : Math.round(deposit / 2), full };
}

// 예: 10장 기준 89,000원 → 예약금 17,800원
export function formatDeposit(expert: Expert): string {
  return formatWon(getDeposit(expert));
}

// 사진이 도착한 뒤 이 날짜 수 안에 골라야 함 (지나면 작가 추천 사진으로 자동 구매)
export const PICK_DAYS = 7;

export function pickDeadlineOf(arrivedAt: string): string {
  return toDateKey(addDays(fromDateKey(arrivedAt), PICK_DAYS));
}

// 원본 사진은 촬영일부터 1년 동안 보관 (예: 2027년 11월 3일 (수))
export function formatArchiveUntil(form: ShootRequestForm): string {
  const date = fromDateKey(form.date);
  date.setFullYear(date.getFullYear() + 1);
  return `${date.getFullYear()}년 ${formatMonthDay(toDateKey(date))}`;
}

export interface PhotoPrice {
  extraCount: number;
  extraAmount: number;
  // 기본 금액 + 추가 금액
  total: number;
  deposit: number;
  // 예약금을 뺀 실제 결제 금액
  toPay: number;
}

// 기본 10장 포함, 넘는 장수만 1장당 추가 금액
export function getPhotoPrice(expert: Expert, count: number): PhotoPrice {
  const extraCount = Math.max(0, count - BASE_PHOTO_COUNT);
  const extraAmount = extraCount * expert.extraPrice;
  const total = expert.basePrice + extraAmount;
  const deposit = getDeposit(expert);
  return { extraCount, extraAmount, total, deposit, toPay: total - deposit };
}

// ---- 임시 데이터 ----
// 날짜는 오늘 기준으로 계산 (다시 요청 시 '촬영일 4일 미만' 흐름을 볼 수 있게)

function dayKey(days: number): string {
  return toDateKey(addDays(startOfToday(), days));
}

// 선택 기한: '제안 기간 끝난 뒤 2일'과 '촬영 2일 전' 중 빠른 날
// 임시 데이터는 제안 기간이 오늘 끝났다고 봄
function selectDeadlineOf(shootDate: string): string {
  const afterProposals = dayKey(2);
  const beforeShoot = toDateKey(addDays(fromDateKey(shootDate), -2));
  return afterProposals < beforeShoot ? afterProposals : beforeShoot;
}

const PROPOSALS: Record<number, Proposal> = {
  1: {
    expertId: 1,
    tag: '관계',
    summary: '세 친구의 편안한 관계를 밝고 자연스럽게 찍어요',
    styleTags: ['밝음', '자연스러움'],
    plan: '경의선책거리 골목의 햇살 아래에서 세 분의 웃는 순간을 밝게 담아 드려요. 걷고 이야기하는 모습 그대로 자연스러운 단체 사진을 촬영해요.',
  },
  2: {
    expertId: 2,
    tag: '일상',
    summary: '골목을 걷는 일상 그대로 차분하게 찍어요',
    styleTags: ['자연스러움', '차분함'],
    plan: '책거리 산책로를 천천히 걸으며 대화하는 모습을 따라가요. 꾸미지 않은 일상의 분위기를 차분한 톤으로 담아 드려요.',
  },
  3: {
    expertId: 3,
    tag: '관계',
    summary: '우정이 돋보이는 관계 사진을 세련되게 찍어요',
    styleTags: ['밝음', '세련됨'],
    plan: '서로 장난치는 순간과 나란히 선 단체 컷을 함께 찍어요. 배경을 깔끔하게 정리해 우정이 돋보이는 사진을 만들어 드려요.',
  },
};

function shootForm(
  date: string,
  time: string,
  sigungu: string,
  detail: string,
  people: number,
): ShootRequestForm {
  return {
    date,
    time,
    location: { sido: '서울', sigungu, detail },
    people,
    budget: '5~10만 원',
    kind: { category: '인물', subcategory: '관계' },
    moods: ['밝음', '자연스러움'],
    note: '친구들과 자연스럽게 웃는 모습을 남기고 싶어요.',
  };
}

function request(
  id: number,
  form: ShootRequestForm,
  phase: ShootRequestPhase,
  proposalIds: number[],
): ShootRequestDetail {
  return {
    id,
    title: `${form.location.detail} 스냅`,
    form,
    requestedIds: [1, 2, 3],
    proposals: proposalIds.map((expertId) => PROPOSALS[expertId]),
    phase,
    selectDeadline: selectDeadlineOf(form.date),
    inquiries: [],
  };
}

// 예약까지 끝난 의뢰
function reservation(
  id: number,
  form: ShootRequestForm,
  expertId: number,
  phase: 'reserved' | 'expertCanceled' | 'photosArrived',
  inquiries: Inquiry[] = [],
): ShootRequestDetail {
  return {
    ...request(id, form, phase, []),
    requestedIds: [expertId],
    reservedExpertId: expertId,
    reservedAt: dayKey(-7),
    inquiries,
  };
}

// 의뢰 메인 카드 id와 같은 id 사용 (myRequests.ts)
// 작가가 보낸 사진 24장 중 작가 추천 10장
const RECOMMENDED_PHOTO_IDS = new Set([1, 2, 3, 5, 6, 8, 9, 13, 15, 18]);

function deliveredPhotos(count: number): DeliveredPhoto[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    url: DEMO_DELIVERED_PHOTOS[index % DEMO_DELIVERED_PHOTOS.length],
    recommended: RECOMMENDED_PHOTO_IDS.has(index + 1),
  }));
}

const SHOOT_REQUESTS: ShootRequestDetail[] = [
  // 제안 3개 도착
  request(8, shootForm(dayKey(10), '14:00', '마포구', '경의선책거리', 3), 'open', [1, 2, 3]),
  // 3명 중 2명만 제안
  request(9, shootForm(dayKey(14), '16:00', '마포구', '망원한강공원', 2), 'open', [1, 3]),
  // 24시간 동안 제안 없음
  request(10, shootForm(dayKey(12), '11:00', '종로구', '서촌', 2), 'expired', []),
  // 기한 안에 고르지 않음 (촬영일이 가까워 다시 요청하면 날짜부터 다시 고름)
  {
    ...request(5, shootForm(dayKey(2), '15:00', '마포구', '연남', 2), 'closed', [1, 2, 3]),
    selectDeadline: dayKey(-1),
  },
  // 예약 확정 (문의 2건)
  reservation(
    2,
    {
      ...shootForm(dayKey(21), '14:00', '제주시', '애월', 2),
      moods: ['자연스러움', '차분함', '몽환적'],
      note: '바다와 노을을 배경으로 차분하고 몽환적인 분위기의 커플 사진을 자연스럽게 남기고 싶어요.',
    },
    10,
    'reserved',
    [
      {
        id: 2,
        question: '촬영 당일 의상을 2벌 준비해도 될까요? 갈아입을 곳이 있는지도 궁금해요.',
        askedAt: dayKey(-1),
      },
      {
        id: 1,
        question: '비가 오면 촬영 일정은 어떻게 되나요?',
        askedAt: dayKey(-6),
        answer: {
          content:
            '비 예보가 있으면 촬영 이틀 전에 먼저 연락드릴게요. 날짜를 옮기거나, 애월 근처 실내 카페에서 촬영하는 방법 중에 고르실 수 있어요.',
          answeredAt: dayKey(-6),
        },
      },
    ],
  ),
  // 작가가 예약을 취소
  reservation(3, shootForm(dayKey(28), '11:00', '성동구', '성수', 1), 6, 'expertCanceled'),
  reservation(4, shootForm(dayKey(35), '15:00', '성남시', '분당', 5), 11, 'reserved'),
  // 촬영 후 사진 24장 도착 (오늘 도착해 고르기 D-7)
  {
    ...reservation(
      12,
      {
        ...shootForm(dayKey(-3), '14:00', '제주시', '협재', 2),
        moods: ['자연스러움', '차분함', '몽환적'],
        note: '바다와 노을을 배경으로 차분하고 몽환적인 분위기의 커플 사진을 자연스럽게 남기고 싶어요.',
      },
      10,
      'photosArrived',
    ),
    reservedAt: dayKey(-20),
    delivery: { arrivedAt: dayKey(0), photos: deliveredPhotos(24) },
  },
];

export function listShootRequests(): ShootRequestDetail[] {
  return SHOOT_REQUESTS;
}

export async function fetchShootRequest(id: number): Promise<ShootRequestDetail | null> {
  return SHOOT_REQUESTS.find((item) => item.id === id) ?? null;
}

export function findProposal(detail: ShootRequestDetail, expertId: number): Proposal | null {
  return detail.proposals.find((proposal) => proposal.expertId === expertId) ?? null;
}

// 제안과 그 작가 정보를 함께 (작가 정보가 없으면 뺌)
export function withExperts(proposals: Proposal[]): { proposal: Proposal; expert: Expert }[] {
  return proposals.flatMap((proposal) => {
    const expert = getExpert(proposal.expertId);
    return expert ? [{ proposal, expert }] : [];
  });
}

// TODO: API 연동 시 client.post(`/requests/${id}/cancel`)
export async function cancelShootRequest(id: number): Promise<void> {
  const target = SHOOT_REQUESTS.find((item) => item.id === id);
  if (target) target.phase = 'canceled';
}

// 받은 제안(예약 전) · 예약 상세에서 작가에게 문의
// TODO: API 연동 시 client.post(`/requests/${id}/inquiries`, { expertId, content })
export async function sendInquiry(id: number, expertId: number, content: string): Promise<void> {
  void expertId;
  await new Promise((resolve) => setTimeout(resolve, 300));
  const target = SHOOT_REQUESTS.find((item) => item.id === id);
  if (!target) return;
  const nextId = Math.max(0, ...target.inquiries.map((inquiry) => inquiry.id)) + 1;
  target.inquiries.unshift({ id: nextId, question: content, askedAt: dayKey(0) });
}

export const CANCEL_REASONS = ['일정 변경', '다른 작가 선택', '기타'] as const;
export type CancelReason = (typeof CANCEL_REASONS)[number];

// 사용자가 예약 취소 (환불은 결제한 수단으로)
// TODO: API 연동 시 client.post(`/requests/${id}/reservation/cancel`, { reason })
export async function cancelReservation(id: number, reason: CancelReason): Promise<void> {
  void reason;
  await new Promise((resolve) => setTimeout(resolve, 300));
  const target = SHOOT_REQUESTS.find((item) => item.id === id);
  if (target) target.phase = 'canceled';
}

// 지금은 결제 버튼을 누르면 바로 결제 완료로 처리 (실제 결제 연동은 추후)
// TODO: 결제 연동 시 결제 수단별 결제창을 띄우고, 성공 후 서버에 예약 확정 요청
export async function payDeposit(
  id: number,
  expertId: number,
  method: PaymentMethod,
): Promise<void> {
  void method;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const target = SHOOT_REQUESTS.find((item) => item.id === id);
  if (target) {
    target.phase = 'reserved';
    target.reservedExpertId = expertId;
    target.reservedAt = dayKey(0);
  }
}

// 사진 고르기 중 고른 사진 (구매 확인에 갔다 돌아와도 유지, 새로고침하면 사라짐)
const photoPicks = new Map<number, number[]>();

export function loadPhotoPick(id: number): number[] {
  return photoPicks.get(id) ?? [];
}

export function savePhotoPick(id: number, photoIds: number[]): void {
  photoPicks.set(id, photoIds);
}

// 고른 사진 구매 (예약금을 뺀 금액 결제). 지금은 버튼을 누르면 바로 결제 완료
// TODO: 결제 연동 후 client.post(`/requests/${id}/photos/purchase`, { photoIds, method })
export async function purchasePhotos(
  id: number,
  photoIds: number[],
  method: PaymentMethod,
): Promise<void> {
  void method;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const target = SHOOT_REQUESTS.find((item) => item.id === id);
  if (!target) return;
  target.phase = 'purchased';
  target.purchase = { photoIds, paidAt: dayKey(0), auto: false };
  photoPicks.delete(id);
}
