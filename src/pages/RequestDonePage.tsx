import { useNavigate } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import styles from './RequestDonePage.module.css';

interface SelectedExpert {
  id: number;
  name: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 동그라미로 표시
  profileImageUrl?: string;
}

interface SentRequest {
  title: string;
  // 촬영: 날짜 · 장소 · 인원 / 편집: 보정 항목 · 장수
  summary: string;
  experts: SelectedExpert[];
}

// TODO: 전문가 선택 화면에서 보낸 요청서 정보로 교체 (임시 데이터)
const SENT_REQUEST: SentRequest = {
  title: '서울숲 우정 스냅',
  summary: '10월 20일 · 서울숲 · 3명',
  experts: [
    { id: 1, name: '김하늘' },
    { id: 2, name: '윤슬' },
    { id: 3, name: '민서' },
  ],
};

export function RequestDonePage() {
  const navigate = useNavigate();
  const { title, summary, experts } = SENT_REQUEST;

  // 뒤로가기로 요청서·완료 화면에 다시 들어오지 않도록 replace 이동
  // 의뢰 메인은 '진행 중' 탭이 기본 선택
  const goToRequests = () => navigate('/requests', { replace: true });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="의뢰 메인으로 가기"
          onClick={goToRequests}
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>의뢰 요청 완료</h1>
      </header>

      <section className={styles.notice}>
        <ul className={styles.experts} aria-label="요청을 보낸 전문가">
          {experts.map(({ id, name, profileImageUrl }) => (
            <li key={id} className={styles.expert}>
              {profileImageUrl ? (
                <img className={styles.avatar} src={profileImageUrl} alt="" />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
              )}
              <span className={styles.expertName}>{name}</span>
            </li>
          ))}
        </ul>

        <h2 className={styles.message}>요청서를 보냈어요</h2>
        <p className={styles.description}>
          선택한 전문가 {experts.length}명이 24시간 안에 제안을 보내요.
          <br />
          도착하면 나의 의뢰에서 확인할 수 있어요.
        </p>
      </section>

      <article className={styles.card}>
        <span className={styles.badge}>제안 대기</span>
        <p className={styles.cardTitle}>{title}</p>
        <p className={styles.cardSummary}>{summary}</p>
      </article>

      <div className={styles.bottomBar}>
        <button type="button" className={styles.confirmButton} onClick={goToRequests}>
          확인
        </button>
      </div>
    </main>
  );
}
