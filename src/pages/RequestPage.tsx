import { useState } from 'react';
import { useNavigate } from 'react-router';
import calendarIcon from '../assets/icons/request/calendar.svg';
import bannerImage from '../assets/images/request/banner.png';
import styles from './RequestPage.module.css';

type RequestTab = 'ongoing' | 'completed';

// proposal: 제안 도착, confirmed: 예약확정, completed: 완료
type RequestStatus = 'proposal' | 'confirmed' | 'completed';

interface Photographer {
  id: number;
  name: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 동그라미로 표시
  profileImageUrl?: string;
}

interface MyRequest {
  id: number;
  status: RequestStatus;
  title: string;
  date: string;
  place: string;
  people: number;
  // 카드 오른쪽 위 안내 (2일 안에 선택해 주세요, 촬영 D-21, 촬영일 11월 3일 등)
  scheduleLabel: string;
  // 제안 선택 마감이 하루 이하로 남았을 때 굵게 표시
  scheduleUrgent?: boolean;
  // 제안 도착: 제안한 작가들 / 그 외: 담당 작가 1명
  photographers: Photographer[];
  message: string;
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  proposal: '제안 도착',
  confirmed: '예약확정',
  completed: '완료',
};

// 제안 선택 마감까지 남은 일수 → 안내 문구 (하루 이하면 '오늘 안에' + 굵게)
function getProposalDeadline(daysLeft: number) {
  const urgent = daysLeft <= 1;
  return {
    scheduleLabel: urgent ? '오늘 안에 선택해 주세요' : `${daysLeft}일 안에 선택해 주세요`,
    scheduleUrgent: urgent,
  };
}

const TABS: { value: RequestTab; label: string }[] = [
  { value: 'ongoing', label: '진행 중' },
  { value: 'completed', label: '완료' },
];

// TODO: API 연동 시 교체 (임시 데이터)
const REQUESTS: Record<RequestTab, MyRequest[]> = {
  ongoing: [
    {
      id: 1,
      status: 'proposal',
      title: '서울숲 우정 스냅사진 보정',
      date: '10월 20일',
      place: '서울숲',
      people: 3,
      ...getProposalDeadline(2),
      photographers: [
        { id: 1, name: '서하 작가' },
        { id: 2, name: '윤슬 작가' },
        { id: 3, name: '무드필름' },
      ],
      message: '새로운 제안 3개가 도착했어요.',
    },
    {
      id: 2,
      status: 'confirmed',
      title: '제주 여행 커플 스냅',
      date: '11월 3일',
      place: '애월',
      people: 2,
      scheduleLabel: '촬영 D-21',
      photographers: [{ id: 4, name: '지훈 작가' }],
      message: '일정이 확정되었어요.',
    },
    {
      id: 3,
      status: 'confirmed',
      title: '성수 프로필 촬영',
      date: '11월 10일',
      place: '성수',
      people: 1,
      scheduleLabel: '촬영 D-28',
      photographers: [{ id: 5, name: '이젤 작가' }],
      message: '일정이 확정되었어요.',
    },
    {
      id: 4,
      status: 'confirmed',
      title: '돌잔치 가족 스냅',
      date: '11월 17일',
      place: '분당',
      people: 5,
      scheduleLabel: '촬영 D-35',
      photographers: [{ id: 6, name: '아리 작가' }],
      message: '일정이 확정되었어요.',
    },
  ],
  completed: [
    {
      id: 5,
      status: 'completed',
      title: '제주 여행 커플 스냅',
      date: '11월 3일',
      place: '애월',
      people: 2,
      scheduleLabel: '촬영일 11월 3일',
      photographers: [{ id: 4, name: '지훈 작가' }],
      message: '구매 사진 12장 · 결제 총액 98,000원',
    },
    {
      id: 6,
      status: 'completed',
      title: '한강 우정 스냅',
      date: '10월 12일',
      place: '한강',
      people: 3,
      scheduleLabel: '촬영일 10월 12일',
      photographers: [{ id: 7, name: '수민 작가' }],
      message: '촬영이 완료되었어요.',
    },
  ],
};

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
  highlighted: boolean;
}

function RequestCard({ request, highlighted }: RequestCardProps) {
  const {
    status,
    title,
    date,
    place,
    people,
    scheduleLabel,
    scheduleUrgent,
    photographers,
    message,
  } = request;
  const isCompleted = status === 'completed';

  return (
    <li className={highlighted ? `${styles.card} ${styles.cardHighlighted}` : styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
          {STATUS_LABEL[status]}
        </span>
        <span
          className={
            scheduleUrgent
              ? `${styles.scheduleLabel} ${styles.scheduleLabelUrgent}`
              : styles.scheduleLabel
          }
        >
          {scheduleLabel}
        </span>
      </div>

      <p className={styles.cardTitle}>{title}</p>

      <p className={styles.cardMeta}>
        {!isCompleted && <img src={calendarIcon} alt="" />}
        {date} · {place} · {people}명
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
          <Avatar imageUrl={photographers[0]?.profileImageUrl} />
          <div className={styles.photographerInfo}>
            <span className={styles.photographerName}>{photographers[0]?.name}</span>
            <span>{message}</span>
          </div>
        </div>
      )}
    </li>
  );
}

export function RequestPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RequestTab>('ongoing');

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>REQUEST</h1>
      <p className={styles.subtitle}>내게 맞는 방식으로 전문가를 만나보세요.</p>

      <section className={styles.banner}>
        <img className={styles.bannerImage} src={bannerImage} alt="" />
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
            {label} {REQUESTS[value].length}
          </button>
        ))}
      </div>

      <ul className={styles.list}>
        {REQUESTS[tab].map((request, index) => (
          <RequestCard
            key={request.id}
            request={request}
            // 진행 중: 제안이 도착한 의뢰 / 완료: 가장 최근 의뢰를 강조
            highlighted={tab === 'ongoing' ? request.status === 'proposal' : index === 0}
          />
        ))}
      </ul>
    </main>
  );
}
