import { DEMO_DELIVERED_PHOTOS } from '../constants/demoImages';
import { addDays, formatMonthDay, fromDateKey, startOfToday, toDateKey } from '../utils/date';
import { getExpert, type Expert } from './experts';
import type { Inquiry, PaymentMethod, Review } from './proposals';

// ---- 편집 의뢰의 받은 제안 · 결제 · 작업 진행 ----
// TODO: API 나오면 이 파일의 fetch/요청 함수 안만 client로 교체 (지금은 임시 데이터)

export interface EditProposal {
  expertId: number;
  // 작가가 고른 보정 태그 (예: 피부·잡티)
  tag: string;
  // 받은 제안 카드의 한 줄 설명
  summary: string;
  // 제안 상세 '이렇게 보정해요'
  styleTags: string[];
  plan: string;
  // 결제 후 완료까지 걸리는 날짜 수
  days: number;
}

// open: 제안을 받는 중이거나 고르는 중 / canceled: 의뢰 취소
// waiting: 결제 완료, 작업 시작 전 (취소하면 전액 환불)
// editing: 보정 중 / delivered: 완료 사진 도착 (확인·수정 요청)
// revising: 수정 중 / completed: 확인 완료
export type EditRequestPhase =
  'open' | 'canceled' | 'waiting' | 'editing' | 'delivered' | 'revising' | 'completed';

export interface EditRequestDetail {
  id: number;
  title: string;
  // 요청서를 보낸 날 'YYYY-MM-DD'
  requestedAt: string;
  // 맡긴 사진 (보정 전)
  photos: string[];
  strength: string | null;
  items: string[];
  note: string;
  requestedIds: number[];
  proposals: EditProposal[];
  phase: EditRequestPhase;
  // 작가 선택 기한 'YYYY-MM-DD'
  selectDeadline: string;
  // 결제 후
  expertId?: number;
  paidAt?: string;
  // 완료 사진 도착일 (도착 후)
  deliveredAt?: string;
  // 수정 요청을 썼는지 (1회까지)
  revisionUsed: boolean;
  completedAt?: string;
  inquiries: Inquiry[];
  review?: Review;
}

// 완료 사진을 받은 날부터 이 날짜 수 안에 확인 (지나면 자동 확인 완료)
export const CONFIRM_DAYS = 3;

// 편집 금액: 사진 장수 × 1장당 금액
export function getEditPrice(expert: Expert, photoCount: number): number {
  return (expert.editPrice ?? 0) * photoCount;
}

// 예: 5장 40,000원 · 1장당 8,000원
export function formatEditPrice(expert: Expert, photoCount: number): string {
  const won = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;
  return `${photoCount}장 ${won(getEditPrice(expert, photoCount))} · 1장당 ${won(expert.editPrice ?? 0)}`;
}

// 완료 예정일: 결제일 + 작가 제안의 완료 기간
export function editDueDate(detail: EditRequestDetail): string | null {
  const proposal = detail.proposals.find(({ expertId }) => expertId === detail.expertId);
  if (!detail.paidAt || !proposal) return null;
  return toDateKey(addDays(fromDateKey(detail.paidAt), proposal.days));
}

export function confirmDeadline(detail: EditRequestDetail): string | null {
  return detail.deliveredAt
    ? toDateKey(addDays(fromDateKey(detail.deliveredAt), CONFIRM_DAYS))
    : null;
}

// 보정 결과 사진은 확인 완료일부터 1년 보관 (예: 2027년 10월 25일 (월))
export function formatEditArchiveUntil(detail: EditRequestDetail): string {
  const date = fromDateKey(detail.completedAt ?? toDateKey(startOfToday()));
  date.setFullYear(date.getFullYear() + 1);
  return `${date.getFullYear()}년 ${formatMonthDay(toDateKey(date))}`;
}

// ---- 임시 데이터 ----

function dayKey(days: number): string {
  return toDateKey(addDays(startOfToday(), days));
}

const PROPOSALS: Record<number, EditProposal> = {
  21: {
    expertId: 21,
    tag: '피부·잡티',
    summary: '샘플 1장을 먼저 보정했어요. 피부결은 살리고 색감은 맑게 맞췄어요',
    styleTags: ['피부·잡티', '색감'],
    plan: '보내 주신 5장 모두 피부결은 살리고 잡티만 정리해요. 색감은 맑고 자연스럽게 맞추고, 턱선은 요청하신 만큼만 살짝 다듬어 드려요.',
    days: 2,
  },
  22: {
    expertId: 22,
    tag: '색감',
    summary: '따뜻한 필름 느낌 색감으로 샘플을 보정했어요',
    styleTags: ['색감'],
    plan: '필름 카메라로 찍은 듯한 따뜻한 색감으로 맞춰요. 피부는 자연스럽게 두고 전체 톤을 부드럽게 정리해 드려요.',
    days: 3,
  },
  23: {
    expertId: 23,
    tag: '얼굴형',
    summary: '얼굴형은 티 나지 않게, 배경은 깔끔하게 정리했어요',
    styleTags: ['얼굴형', '배경 정리·합성'],
    plan: '얼굴형은 원래 느낌을 살려 살짝만 다듬고, 배경의 방해 요소를 깔끔하게 정리해 드려요.',
    days: 2,
  },
};

const EDIT_PHOTOS = DEMO_DELIVERED_PHOTOS.slice(0, 5);

function editRequest(
  id: number,
  phase: EditRequestPhase,
  extra: Partial<EditRequestDetail> = {},
): EditRequestDetail {
  return {
    id,
    title: `사진 편집 - ${EDIT_PHOTOS.length}장`,
    requestedAt: extra.paidAt ?? dayKey(0),
    photos: EDIT_PHOTOS,
    strength: '보통',
    items: ['피부·잡티', '색감', '얼굴형'],
    note: '턱선만 살짝, 피부는 자연스럽게 해 주세요.',
    requestedIds: [21, 22, 23],
    proposals: [PROPOSALS[21], PROPOSALS[22], PROPOSALS[23]],
    phase,
    selectDeadline: dayKey(2),
    revisionUsed: false,
    inquiries: [],
    ...extra,
  };
}

// 의뢰 메인 카드와 같은 id (myRequests.ts)
const EDIT_REQUESTS: EditRequestDetail[] = [
  // 제안 3개 도착
  editRequest(1, 'open'),
  // 결제 완료, 작업 시작 전
  editRequest(14, 'waiting', { expertId: 21, paidAt: dayKey(0) }),
  // 보정 중
  editRequest(15, 'editing', { expertId: 22, paidAt: dayKey(-1) }),
  // 완료 사진 도착 (확인 D-3)
  editRequest(16, 'delivered', { expertId: 21, paidAt: dayKey(-2), deliveredAt: dayKey(0) }),
  // 확인 완료 (수정 1회 사용)
  editRequest(17, 'completed', {
    expertId: 21,
    paidAt: dayKey(-9),
    deliveredAt: dayKey(-7),
    revisionUsed: true,
    completedAt: dayKey(-4),
  }),
];

export function listEditRequests(): EditRequestDetail[] {
  return EDIT_REQUESTS;
}

export async function fetchEditRequest(id: number): Promise<EditRequestDetail | null> {
  return EDIT_REQUESTS.find((item) => item.id === id) ?? null;
}

export function isEditRequest(id: number): boolean {
  return EDIT_REQUESTS.some((item) => item.id === id);
}

export function findEditProposal(detail: EditRequestDetail, expertId: number): EditProposal | null {
  return detail.proposals.find((proposal) => proposal.expertId === expertId) ?? null;
}

export function editProposalsWithExperts(
  proposals: EditProposal[],
): { proposal: EditProposal; expert: Expert }[] {
  return proposals.flatMap((proposal) => {
    const expert = getExpert(proposal.expertId);
    return expert ? [{ proposal, expert }] : [];
  });
}

function findTarget(id: number): EditRequestDetail | undefined {
  return EDIT_REQUESTS.find((item) => item.id === id);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 편집 금액 결제 (지금은 버튼을 누르면 바로 결제 완료)
// TODO: 결제 연동 후 client.post(`/edit-requests/${id}/pay`, { expertId, method })
export async function payEdit(id: number, expertId: number, method: PaymentMethod): Promise<void> {
  void method;
  await delay(500);
  const target = findTarget(id);
  if (!target) return;
  target.phase = 'waiting';
  target.expertId = expertId;
  target.paidAt = dayKey(0);
}

// 작업 시작 전에만 취소 (전액 환불)
// TODO: API 연동 시 client.post(`/edit-requests/${id}/cancel`)
export async function cancelEditRequest(id: number): Promise<void> {
  await delay(300);
  const target = findTarget(id);
  if (target) target.phase = 'canceled';
}

// 수정 요청 (1회)
// TODO: API 연동 시 client.post(`/edit-requests/${id}/revision`, { content })
export async function requestRevision(id: number, content: string): Promise<void> {
  void content;
  await delay(300);
  const target = findTarget(id);
  if (!target) return;
  target.phase = 'revising';
  target.revisionUsed = true;
}

// 확인 완료 (원본 화질로 저장 가능)
// TODO: API 연동 시 client.post(`/edit-requests/${id}/confirm`)
export async function confirmEdit(id: number): Promise<void> {
  await delay(300);
  const target = findTarget(id);
  if (!target) return;
  target.phase = 'completed';
  target.completedAt = dayKey(0);
}

// TODO: API 연동 시 client.post(`/edit-requests/${id}/inquiries`, { content })
export async function sendEditInquiry(id: number, content: string): Promise<void> {
  await delay(300);
  const target = findTarget(id);
  if (!target) return;
  const nextId = Math.max(0, ...target.inquiries.map((inquiry) => inquiry.id)) + 1;
  target.inquiries.unshift({ id: nextId, question: content, askedAt: dayKey(0) });
}

// TODO: API 연동 시 client.post(`/edit-requests/${id}/review`, review)
export async function submitEditReview(
  id: number,
  review: Omit<Review, 'createdAt'>,
): Promise<void> {
  await delay(300);
  const target = findTarget(id);
  if (target) target.review = { ...review, createdAt: dayKey(0) };
}
