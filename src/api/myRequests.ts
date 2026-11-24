import { demoProfileImage } from '../constants/demoImages';
import { formatMonthDay } from '../utils/date';
import {
  confirmDeadline,
  editDueDate,
  getEditPrice,
  listEditRequests,
  type EditRequestDetail,
} from './editRequests';
import { formatWon, getExpert } from './experts';
import { formatLocation } from './places';
import {
  daysUntil,
  getPhotoPrice,
  listShootRequests,
  pickDeadlineOf,
  type ShootRequestDetail,
} from './proposals';

// ---- 나의 의뢰 (의뢰 메인 목록) ----
// TODO: API 나오면 이 파일의 fetch 함수 안만 client.get('/requests/me', ...) 등으로 교체 (지금은 임시 데이터)

export type MyRequestTab = 'ongoing' | 'completed';

// 의뢰 카드 상태 (이름은 의뢰 흐름 UX 정리 '의뢰 메인 카드 상태'와 같음)
export type MyRequestStatus =
  | 'waiting' // 제안 대기
  | 'proposal' // 제안 도착
  | 'confirmed' // 예약 확정
  | 'photosArrived' // 사진 도착
  | 'editWaiting' // 작업 대기 (편집, 시작 전)
  | 'editing' // 보정 중
  | 'revising' // 수정 중
  | 'completed' // 완료
  | 'closed' // 제안 마감(미선택)
  | 'expertCanceled' // 작가 취소
  | 'canceled'; // 의뢰 취소

export const MY_REQUEST_STATUS_LABEL: Record<MyRequestStatus, string> = {
  waiting: '제안 대기',
  proposal: '제안 도착',
  confirmed: '예약 확정',
  photosArrived: '사진 도착',
  editWaiting: '작업 대기',
  editing: '보정 중',
  revising: '수정 중',
  completed: '완료',
  closed: '제안 마감(미선택)',
  expertCanceled: '작가 취소',
  canceled: '의뢰 취소',
};

export interface RequestPhotographer {
  id: number;
  name: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 동그라미로 표시
  profileImageUrl?: string;
}

interface BaseMyRequest {
  id: number;
  status: MyRequestStatus;
  title: string;
  // 카드 오른쪽 위 안내 (10월 20일 (화)까지 선택, 촬영 D-21, 촬영일 11월 3일 (화) 등)
  scheduleLabel: string;
  // 제안 도착: 제안한 작가들 / 제안 마감: 비어 있음 / 그 외: 담당 작가 1명
  photographers: RequestPhotographer[];
  // 카드 아래 안내. 제안 마감처럼 작가가 없을 때는 headline이 굵은 첫 줄
  headline?: string;
  message: string;
}

// 촬영: 날짜(시간) · 지역 · 인원 / 편집: 요청일 · 사진 장수
export type MyRequest = BaseMyRequest &
  (
    | { kind: 'shoot'; date: string; time?: string; place: string; people: number }
    | { kind: 'edit'; requestedDate: string; photoCount: number }
  );

export function formatMyRequestMeta(request: MyRequest): string {
  if (request.kind === 'edit') {
    return `${request.requestedDate} 요청 · 사진 ${request.photoCount}장`;
  }
  const date = request.time ? `${request.date} ${request.time}` : request.date;
  return `${date} · ${request.place} · ${request.people}명`;
}

function photographer(id: number, name: string): RequestPhotographer {
  // TODO: 시연용 사진 (API 연동 시 백엔드 이미지 URL 사용)
  return { id, name, profileImageUrl: demoProfileImage(name) };
}

function expertPhotographer(id: number): RequestPhotographer[] {
  const expert = getExpert(id);
  return expert ? [photographer(id, expert.name)] : [];
}

// 받은 제안 임시 데이터(proposals.ts)로 만든 촬영 의뢰 카드
// 제안 마감·의뢰 취소는 완료 탭, 나머지는 진행 중 탭
function shootRequestCard(detail: ShootRequestDetail): { tab: MyRequestTab; card: MyRequest } {
  const { id, title, form, proposals, phase, selectDeadline } = detail;
  const base = {
    id,
    kind: 'shoot' as const,
    title,
    date: formatMonthDay(form.date),
    time: form.time,
    place: formatLocation(form.location),
    people: form.people,
  };
  const deadline = formatMonthDay(selectDeadline);

  switch (phase) {
    case 'open':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'proposal',
          scheduleLabel: `${deadline}까지 선택`,
          photographers: proposals.flatMap(({ expertId }) => expertPhotographer(expertId)),
          message: `새로운 제안 ${proposals.length}개가 도착했어요.`,
        },
      };
    case 'expired':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'waiting',
          scheduleLabel: '제안 기간 끝',
          photographers: [],
          headline: '받은 제안 0개',
          message: '24시간 동안 제안이 오지 않았어요.',
        },
      };
    case 'closed':
      return {
        tab: 'completed',
        card: {
          ...base,
          status: 'closed',
          scheduleLabel: `${deadline} 마감`,
          photographers: [],
          headline: `받은 제안 ${proposals.length}개`,
          message: '선택하지 않아 마감됐어요. 받은 제안은 계속 볼 수 있어요.',
        },
      };
    case 'canceled':
      return {
        tab: 'completed',
        card: {
          ...base,
          status: 'canceled',
          scheduleLabel: '',
          photographers: [],
          headline: '의뢰 취소',
          // 예약 후 취소면 환불 안내
          message: detail.reservedExpertId
            ? '예약을 취소했어요. 예약금은 환불돼요.'
            : '의뢰를 취소했어요.',
        },
      };
    case 'reserved':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'confirmed',
          scheduleLabel: `촬영 D-${daysUntil(form.date)}`,
          photographers: expertPhotographer(detail.reservedExpertId ?? 0),
          message: '일정이 확정되었어요.',
        },
      };
    case 'photosArrived': {
      const photoCount = detail.delivery?.photos.length ?? 0;
      const pickDeadline = pickDeadlineOf(detail.delivery?.arrivedAt ?? form.date);
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'photosArrived',
          scheduleLabel: `고르기 D-${daysUntil(pickDeadline)}`,
          photographers: expertPhotographer(detail.reservedExpertId ?? 0),
          message: `사진 ${photoCount}장이 도착했어요. 마음에 드는 사진을 골라 주세요.`,
        },
      };
    }
    case 'purchased': {
      const expert = getExpert(detail.reservedExpertId ?? 0);
      const photoCount = detail.purchase?.photoIds.length ?? 0;
      const total = expert ? getPhotoPrice(expert, photoCount).total : 0;
      return {
        tab: 'completed',
        card: {
          ...base,
          status: 'completed',
          scheduleLabel: `촬영일 ${formatMonthDay(form.date)}`,
          photographers: expertPhotographer(detail.reservedExpertId ?? 0),
          message: `구매 사진 ${photoCount}장 · 결제 총액 ${formatWon(total)}`,
        },
      };
    }
    case 'expertCanceled':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'expertCanceled',
          scheduleLabel: '예약금 전액 환불',
          photographers: expertPhotographer(detail.reservedExpertId ?? 0),
          message: '작가 사정으로 예약이 취소됐어요.',
        },
      };
  }
}

// 편집 의뢰 임시 데이터(editRequests.ts)로 만든 편집 의뢰 카드
// 의뢰 취소·확인 완료는 완료 탭, 나머지는 진행 중 탭
function editRequestCard(detail: EditRequestDetail): { tab: MyRequestTab; card: MyRequest } {
  const { id, title, photos, proposals, phase, expertId } = detail;
  const base = {
    id,
    kind: 'edit' as const,
    title,
    requestedDate: formatMonthDay(detail.requestedAt),
    photoCount: photos.length,
  };
  const assigned = expertPhotographer(expertId ?? 0);
  const due = editDueDate(detail);
  const dueLabel = due ? `완료 D-${daysUntil(due)}` : '';

  switch (phase) {
    case 'open':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'proposal',
          scheduleLabel: `${formatMonthDay(detail.selectDeadline)}까지 선택`,
          photographers: proposals.flatMap((proposal) => expertPhotographer(proposal.expertId)),
          message: `새로운 제안 ${proposals.length}개가 도착했어요.`,
        },
      };
    case 'waiting':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'editWaiting',
          scheduleLabel: dueLabel,
          photographers: assigned,
          message: '작가가 곧 작업을 시작해요.',
        },
      };
    case 'editing':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'editing',
          scheduleLabel: dueLabel,
          photographers: assigned,
          message: '보정 작업을 하고 있어요.',
        },
      };
    case 'delivered': {
      const deadline = confirmDeadline(detail);
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'photosArrived',
          scheduleLabel: deadline ? `확인 D-${daysUntil(deadline)}` : '',
          photographers: assigned,
          message: `보정한 사진 ${photos.length}장이 도착했어요. 확인해 주세요.`,
        },
      };
    }
    case 'revising':
      return {
        tab: 'ongoing',
        card: {
          ...base,
          status: 'revising',
          scheduleLabel: '',
          photographers: assigned,
          message: '요청하신 수정을 반영하고 있어요.',
        },
      };
    case 'completed': {
      const expert = getExpert(expertId ?? 0);
      const total = expert ? getEditPrice(expert, photos.length) : 0;
      return {
        tab: 'completed',
        card: {
          ...base,
          status: 'completed',
          scheduleLabel: detail.completedAt ? `완료일 ${formatMonthDay(detail.completedAt)}` : '',
          photographers: assigned,
          message: `보정 사진 ${photos.length}장 · 결제 총액 ${formatWon(total)}`,
        },
      };
    }
    case 'canceled':
      return {
        tab: 'completed',
        card: {
          ...base,
          status: 'canceled',
          scheduleLabel: '',
          photographers: [],
          headline: '의뢰 취소',
          message: expertId
            ? '의뢰를 취소했어요. 결제 금액은 전액 환불돼요.'
            : '의뢰를 취소했어요.',
        },
      };
  }
}

// 진행 중 / 완료 목록 (임시 데이터, 바로 돌려줌)
// 편집 의뢰 카드는 촬영 의뢰 카드 앞에 둠
export async function fetchMyRequests(): Promise<Record<MyRequestTab, MyRequest[]>> {
  const cards = [
    ...listEditRequests().map(editRequestCard),
    ...listShootRequests().map(shootRequestCard),
  ];
  const cardsOf = (tab: MyRequestTab) =>
    cards.filter((item) => item.tab === tab).map(({ card }) => card);
  return { ongoing: cardsOf('ongoing'), completed: cardsOf('completed') };
}
