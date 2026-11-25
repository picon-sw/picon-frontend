import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  fetchMyRequests,
  formatMyRequestMeta,
  MY_REQUEST_STATUS_LABEL,
  type MyRequest,
  type MyRequestTab,
} from '../api/myRequests';
import calendarIcon from '../assets/icons/request/calendar.svg';
import { DEMO_REQUEST_BANNER_IMAGE } from '../constants/demoImages';
import styles from './RequestPage.module.css';

const TABS: { value: MyRequestTab; label: string }[] = [
  { value: 'ongoing', label: '진행 중' },
  { value: 'completed', label: '완료' },
];

const EMPTY_REQUESTS: Record<MyRequestTab, MyRequest[]> = { ongoing: [], completed: [] };

// 카드를 눌렀을 때 갈 상세 화면. 아직 없는 화면은 null (누를 수 없는 카드)
// TODO: 예약 상세·완료 상세·편집 제안 등 화면이 생기면 상태별로 연결
// 편집 의뢰 상세 (받은 제안 · 작업 상세 · 완료 사진 확인 · 완료 상세)
function getEditDetailPath(id: number, status: MyRequest['status']): string | null {
  if (status === 'proposal' || status === 'waiting') return `/requests/edits/${id}/proposals`;
  if (status === 'editWaiting' || status === 'editing' || status === 'revising') {
    return `/requests/edits/${id}/work`;
  }
  if (status === 'photosArrived') return `/requests/edits/${id}/result`;
  if (status === 'completed') return `/requests/edits/${id}/completed`;
  return null;
}

function getDetailPath({ id, kind, status }: MyRequest): string | null {
  if (kind === 'edit') return getEditDetailPath(id, status);
  if (status === 'proposal' || status === 'waiting' || status === 'closed') {
    return `/requests/${id}/proposals`;
  }
  if (status === 'confirmed' || status === 'expertCanceled' || status === 'photosArrived') {
    return `/requests/${id}/reservation`;
  }
  if (status === 'completed') return `/requests/${id}/completed`;
  return null;
}

interface AvatarProps {
  imageUrl?: string;
}

function Avatar({ imageUrl }: AvatarProps) {
  return imageUrl ? (
    <img className={styles.avatar} src={imageUrl} alt="" />
  ) : (
    <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
  );
}

interface RequestCardProps {
  request: MyRequest;
  tab: MyRequestTab;
  highlighted: boolean;
  onOpen: (path: string) => void;
}

function RequestCard({ request, tab, highlighted, onOpen }: RequestCardProps) {
  const { status, title, scheduleLabel, photographers, headline, message } = request;
  const path = getDetailPath(request);
  const classNames = [
    styles.card,
    tab === 'completed' && styles.cardCompleted,
    highlighted && styles.cardHighlighted,
    status === 'closed' && styles.cardClosed,
    path && styles.cardClickable,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className={styles.cardTop}>
        <span className={`${styles.badge} ${styles[`badge_${status}`] ?? ''}`}>
          {MY_REQUEST_STATUS_LABEL[status]}
        </span>
        <span className={styles.scheduleLabel}>{scheduleLabel}</span>
      </div>

      <p className={styles.cardTitle}>{title}</p>

      <p className={styles.cardMeta}>
        {tab === 'ongoing' && <img src={calendarIcon} alt="" />}
        {formatMyRequestMeta(request)}
      </p>

      <hr className={styles.divider} />

      {status === 'proposal' ? (
        <div className={styles.cardFooter}>
          <div className={styles.avatarStack}>
            {photographers.map(({ id, profileImageUrl }) => (
              <Avatar key={id} imageUrl={profileImageUrl} />
            ))}
          </div>
          <span className={styles.proposalMessage}>{message}</span>
        </div>
      ) : (
        <div className={styles.cardFooter}>
          {photographers[0] && <Avatar imageUrl={photographers[0].profileImageUrl} />}
          <div className={styles.photographerInfo}>
            <span className={styles.photographerName}>{headline ?? photographers[0]?.name}</span>
            <span>{message}</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <li>
      {path ? (
        <button type="button" className={classNames} onClick={() => onOpen(path)}>
          {content}
        </button>
      ) : (
        <div className={classNames}>{content}</div>
      )}
    </li>
  );
}

export function RequestPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MyRequestTab>('ongoing');
  const [requests, setRequests] = useState(EMPTY_REQUESTS);

  useEffect(() => {
    let ignore = false;
    fetchMyRequests().then((result) => {
      if (!ignore) setRequests(result);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>REQUEST</h1>
      <p className={styles.subtitle}>내게 맞는 방식으로 전문가를 만나보세요.</p>

      <section className={styles.banner}>
        {/* TODO: 시연용 사진 (실제 배너 이미지 정해지면 교체) */}
        <img className={styles.bannerImage} src={DEMO_REQUEST_BANNER_IMAGE} alt="" />
        <p className={styles.bannerText}>
          나만의 순간,
          <br />꼭 맞는 작가에게 맡겨 보세요
        </p>
        <button
          type="button"
          className={styles.bannerButton}
          onClick={() => navigate('/requests/new')}
        >
          의뢰 시작하기 <span aria-hidden="true">›</span>
        </button>
      </section>

      <h2 className={styles.sectionTitle}>나의 의뢰</h2>

      <div className={styles.tabs} role="tablist">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTab(value)}
          >
            {label} {requests[value].length}
          </button>
        ))}
      </div>

      <ul className={styles.list}>
        {requests[tab].map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            tab={tab}
            // 진행 중: 제안이 도착한 의뢰 / 완료: 완료된 의뢰 중 가장 최근 것을 강조
            highlighted={
              tab === 'ongoing'
                ? request.status === 'proposal'
                : request === requests.completed.find(({ status }) => status === 'completed')
            }
            onOpen={(path) => navigate(path)}
          />
        ))}
      </ul>
    </main>
  );
}
