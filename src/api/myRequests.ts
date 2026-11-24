import { demoProfileImage } from '../constants/demoImages';

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

const MY_REQUESTS: Record<MyRequestTab, MyRequest[]> = {
  ongoing: [
    {
      id: 1,
      kind: 'edit',
      status: 'proposal',
      title: '사진 편집 - 5장',
      requestedDate: '10월 18일 (일)',
      photoCount: 5,
      scheduleLabel: '10월 20일 (화)까지 선택',
      photographers: [
        photographer(1, '서하 작가'),
        photographer(2, '윤슬 작가'),
        photographer(3, '무드필름'),
      ],
      message: '새로운 제안 3개가 도착했어요.',
    },
    {
      id: 2,
      kind: 'shoot',
      status: 'confirmed',
      title: '애월 스냅',
      date: '11월 3일 (화)',
      place: '애월',
      people: 2,
      scheduleLabel: '촬영 D-21',
      photographers: [photographer(4, '지훈 작가')],
      message: '일정이 확정되었어요.',
    },
    {
      id: 3,
      kind: 'shoot',
      status: 'confirmed',
      title: '성수 스냅',
      date: '11월 10일 (화)',
      place: '성수',
      people: 1,
      scheduleLabel: '촬영 D-28',
      photographers: [photographer(5, '이젤 작가')],
      message: '일정이 확정되었어요.',
    },
    {
      id: 4,
      kind: 'shoot',
      status: 'confirmed',
      title: '분당 스냅',
      date: '11월 17일 (화)',
      place: '분당',
      people: 5,
      scheduleLabel: '촬영 D-35',
      photographers: [photographer(6, '아리 작가')],
      message: '일정이 확정되었어요.',
    },
  ],
  completed: [
    {
      id: 5,
      kind: 'shoot',
      status: 'closed',
      title: '연남 스냅',
      date: '11월 28일 (토)',
      time: '15:00',
      place: '마포구 연남',
      people: 2,
      scheduleLabel: '11월 22일 (일) 마감',
      photographers: [],
      headline: '받은 제안 3개',
      message: '선택하지 않아 마감됐어요. 받은 제안은 계속 볼 수 있어요.',
    },
    {
      id: 6,
      kind: 'shoot',
      status: 'completed',
      title: '애월 스냅',
      date: '11월 3일 (화)',
      place: '애월',
      people: 2,
      scheduleLabel: '촬영일 11월 3일 (화)',
      photographers: [photographer(4, '지훈 작가')],
      message: '구매 사진 12장 · 결제 총액 99,000원',
    },
    {
      id: 7,
      kind: 'shoot',
      status: 'completed',
      title: '한강 스냅',
      date: '10월 12일 (월)',
      place: '한강',
      people: 3,
      scheduleLabel: '촬영일 10월 12일 (월)',
      photographers: [photographer(7, '수민 작가')],
      message: '촬영이 완료되었어요.',
    },
  ],
};

// 진행 중 / 완료 목록 (임시 데이터, 바로 돌려줌)
export async function fetchMyRequests(): Promise<Record<MyRequestTab, MyRequest[]>> {
  return MY_REQUESTS;
}
