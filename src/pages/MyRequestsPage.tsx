import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  fetchMyRequests,
  formatMyRequestMeta,
  getMyRequestDetailPath,
  MY_REQUEST_STATUS_LABEL,
  type MyRequest,
  type MyRequestStatus,
  type MyRequestTab,
} from '../api/myRequests';
import { FilterChips } from '../components/FilterChips';
import { PageHeader } from '../components/PageHeader';
import { SegmentTabs } from '../components/SegmentTabs';
import styles from './MyRequestsPage.module.css';

type KindTab = MyRequest['kind'];
type Filter = 'all' | MyRequestTab;

const KIND_TABS: { value: KindTab; label: string }[] = [
  { value: 'shoot', label: '촬영 의뢰' },
  { value: 'edit', label: '편집 의뢰' },
];

// 배지 색: 지금 해야 할 일이 있으면 진한 파랑, 진행 중이면 연한 파랑, 끝났으면 회색
const STATUS_TONE: Record<MyRequestStatus, 'action' | 'progress' | 'done'> = {
  proposal: 'action',
  photosArrived: 'action',
  waiting: 'progress',
  confirmed: 'progress',
  editWaiting: 'progress',
  editing: 'progress',
  revising: 'progress',
  completed: 'done',
  closed: 'done',
  expertCanceled: 'done',
  canceled: 'done',
};

// 카드 아래 버튼 문구
function actionLabel({ kind, status }: MyRequest): string {
  switch (status) {
    case 'proposal':
      return '받은 제안 확인하기';
    case 'waiting':
      return '요청 내용 보기';
    case 'confirmed':
      return '예약 상세 보기';
    case 'photosArrived':
      return kind === 'shoot' ? '사진 고르러 가기' : '완료 사진 확인하기';
    case 'editWaiting':
    case 'editing':
    case 'revising':
      return '작업 상세 보기';
    case 'completed':
      return '리뷰 작성하기';
    default:
      return '상세 보기';
  }
}

// 제목 아래 두 번째 줄: 제안 단계면 받은 제안 수, 그 외에는 담당 작가
function summaryLine({ status, photographers, headline }: MyRequest): string {
  if (status === 'proposal') return `받은 제안 ${photographers.length}건`;
  if (status === 'waiting') return '제안을 기다리는 중이에요';
  return photographers[0]?.name ?? headline ?? '';
}

interface RequestCardProps {
  request: MyRequest;
  onOpen: (path: string) => void;
}

function RequestCard({ request, onOpen }: RequestCardProps) {
  const { kind, status, title, photographers } = request;
  const tone = STATUS_TONE[status];
  const path = getMyRequestDetailPath(request);
  // TODO: API 연동 시 의뢰 대표 사진으로 교체 (지금은 담당 작가 사진, 없으면 빈 칸)
  const imageUrl = photographers[0]?.profileImageUrl;

  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        {imageUrl ? (
          <img className={styles.thumbnail} src={imageUrl} alt="" />
        ) : (
          <span className={styles.thumbnail} />
        )}
        <div className={styles.info}>
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles[`badge_${tone}`]}`}>
              {MY_REQUEST_STATUS_LABEL[status]}
            </span>
            <span className={styles.kind}>{kind === 'shoot' ? '촬영' : '편집'}</span>
          </div>
          <p className={styles.cardTitle}>{title}</p>
          <p className={styles.meta}>{formatMyRequestMeta(request)}</p>
          <p className={styles.summary}>{summaryLine(request)}</p>
        </div>
      </div>
      {path && (
        <button
          type="button"
          className={tone === 'done' ? `${styles.action} ${styles.actionDone}` : styles.action}
          onClick={() => onOpen(path)}
        >
          {actionLabel(request)}
        </button>
      )}
    </li>
  );
}

// 내 의뢰 내역 (나의 활동 → 내 의뢰 내역). 의뢰 탭과 같은 데이터
export function MyRequestsPage() {
  const navigate = useNavigate();
  const [kindTab, setKindTab] = useState<KindTab>('shoot');
  const [filter, setFilter] = useState<Filter>('all');
  const [requests, setRequests] = useState<Record<MyRequestTab, MyRequest[]>>({
    ongoing: [],
    completed: [],
  });

  useEffect(() => {
    let ignore = false;
    fetchMyRequests().then((result) => {
      if (!ignore) setRequests(result);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const ofKind = (list: MyRequest[]) => list.filter((request) => request.kind === kindTab);
  const ongoing = ofKind(requests.ongoing);
  const completed = ofKind(requests.completed);
  const filters: { value: Filter; label: string; items: MyRequest[] }[] = [
    { value: 'all', label: '전체', items: [...ongoing, ...completed] },
    { value: 'ongoing', label: '진행 중', items: ongoing },
    { value: 'completed', label: '완료', items: completed },
  ];
  const visible = filters.find(({ value }) => value === filter)?.items ?? [];

  const changeKind = (next: KindTab) => {
    setKindTab(next);
    setFilter('all');
  };

  return (
    <main className={styles.page}>
      <PageHeader title="내 의뢰 내역" backTo="/my/activity" />

      <SegmentTabs tabs={KIND_TABS} value={kindTab} onChange={changeKind} label="의뢰 종류" />

      <div className={styles.filters}>
        <FilterChips
          options={filters.map(({ value, label, items }) => ({
            value,
            label,
            count: items.length,
          }))}
          value={filter}
          onChange={setFilter}
          sortLabel="최신순"
        />
      </div>

      {visible.length > 0 ? (
        <ul className={styles.list}>
          {visible.map((request) => (
            <RequestCard
              key={`${request.kind}-${request.id}`}
              request={request}
              onOpen={(path) => navigate(path)}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>의뢰 내역이 없어요.</p>
      )}
    </main>
  );
}
