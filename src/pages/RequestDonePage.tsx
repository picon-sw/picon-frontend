import { useLocation, useNavigate } from 'react-router';
import { readDoneState, type RequestDoneState } from '../api/requests';
import { demoProfileImage } from '../constants/demoImages';
import { withSubject } from '../utils/korean';
import styles from './RequestDonePage.module.css';

// 주소로 바로 들어와서 전문가 선택 화면에서 넘겨받은 정보가 없을 때 보여 줄 임시 데이터
// 전문가 사진(profileImageUrl)이 없으면 빈 동그라미로 표시
const SAMPLE_DONE: RequestDoneState = {
  summary: {
    title: '경의선책거리 스냅',
    detail: '10월 20일 (화) 14:00 · 마포구 경의선책거리 · 촬영 인원 3명',
  },
  experts: [
    { id: 1, name: '김하늘' },
    { id: 2, name: '윤슬' },
    { id: 3, name: '민서' },
  ]
    // TODO: 시연용 사진 연결 (API 연동 시 .map 삭제)
    .map((expert) => ({ ...expert, profileImageUrl: demoProfileImage(expert.name) })),
};

export function RequestDonePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { summary, experts } = readDoneState(location.state) ?? SAMPLE_DONE;
  // 바로 의뢰하기처럼 1명에게만 보냈으면 작가 이름으로 안내
  const single = experts.length === 1 ? experts[0] : null;

  // 뒤로가기로 요청서·완료 화면에 다시 들어오지 않도록 replace 이동
  // 의뢰 메인은 '진행 중' 탭이 기본 선택
  const goToRequests = () => navigate('/requests', { replace: true });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
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
              <span className={styles.expertName}>{name.replace(/ 작가$/, '')}</span>
            </li>
          ))}
        </ul>

        <h2 className={styles.message}>
          {single ? `${single.name}에게 요청서를 보냈어요` : '요청서를 보냈어요'}
        </h2>
        <p className={styles.description}>
          {single
            ? `${withSubject(single.name)} 24시간 안에 제안을 보내요.`
            : `선택한 전문가 ${experts.length}명이 24시간 안에 제안을 보내요.`}
          <br />
          도착하면 나의 의뢰에서 확인할 수 있어요.
        </p>
      </section>

      <article className={styles.card}>
        <span className={styles.badge}>제안 대기</span>
        <p className={styles.cardTitle}>{summary.title}</p>
        {/* 카드에서는 '촬영 인원 3명' 대신 '3명'으로 짧게 */}
        <p className={styles.cardSummary}>{summary.detail.replace('촬영 인원 ', '')}</p>
      </article>

      <div className={styles.bottomBar}>
        <button type="button" className={styles.confirmButton} onClick={goToRequests}>
          확인
        </button>
      </div>
    </main>
  );
}
