import { useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/request/arrow-left.svg';
import { DEMO_REQUEST_PROFILE_PORTFOLIO_IMAGES, demoProfileImage } from '../constants/demoImages';
import styles from './RequestExpertProfilePage.module.css';

interface ExpertProfile {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  // 평균 전달 기간 (일)
  deliveryDays: number;
  introduction: string;
  // 작가가 직접 쓴 촬영 스타일 소개
  shootingStyle: string;
  priceSummary: string;
  priceDetail: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  profileImageUrl?: string;
  portfolio: { id: number; imageUrl?: string }[];
}

// TODO: 시연용 사진 (API 연동 시 imageUrl 삭제)
const SAMPLE_PORTFOLIO = DEMO_REQUEST_PROFILE_PORTFOLIO_IMAGES.map((imageUrl, index) => ({
  id: index + 1,
  imageUrl,
}));

// TODO: API 연동 시 교체 (임시 데이터 — 전문가 선택 화면의 작가 id와 맞춤)
const EXPERTS: ExpertProfile[] = [
  {
    id: 1,
    name: '김하늘 작가',
    rating: 4.9,
    reviewCount: 32,
    deliveryDays: 3,
    introduction: '자연스러운 빛으로, 가장 나다운 순간을 담아요.',
    shootingStyle:
      '필름 카메라의 따뜻한 색감을 좋아해요. 창가로 스며드는 빛 아래 편하게 앉거나 누운 채로, 꾸미지 않은 표정을 자연스럽게 담아 드려요.',
    priceSummary: '10장 기준 89,000원 · 추가 비용 없음',
    priceDetail: '원본·보정 1회 포함',
  },
  {
    id: 2,
    name: '윤슬 작가',
    rating: 4.8,
    reviewCount: 24,
    deliveryDays: 4,
    introduction: '햇살 아래 반짝이는 순간을 기록해요.',
    shootingStyle:
      '야외 자연광을 가장 좋아해요. 걷거나 웃는 사이사이의 움직임을 따라가며, 포즈보다 분위기가 느껴지는 사진을 남겨 드려요.',
    priceSummary: '10장 기준 79,000원 · 추가 비용 없음',
    priceDetail: '원본·보정 1회 포함',
  },
  {
    id: 3,
    name: '민서 작가',
    rating: 4.9,
    reviewCount: 41,
    deliveryDays: 3,
    introduction: '편안한 대화 속에서 자연스러운 표정을 찾아요.',
    shootingStyle:
      '촬영 내내 이야기를 나누며 긴장을 풀어 드려요. 친구들끼리 장난치는 순간처럼 꾸밈없는 우정 사진을 잘 찍어요.',
    priceSummary: '10장 기준 85,000원 · 추가 비용 없음',
    priceDetail: '원본·보정 1회 포함',
  },
  {
    id: 4,
    name: '서하 작가',
    rating: 4.7,
    reviewCount: 18,
    deliveryDays: 5,
    introduction: '선명한 색감으로 오늘의 기분을 담아요.',
    shootingStyle:
      '밝고 쨍한 색감을 좋아해요. 도심 속 컬러풀한 배경을 활용해 생기 있는 스냅을 찍어 드려요.',
    priceSummary: '10장 기준 70,000원 · 추가 비용 없음',
    priceDetail: '원본·보정 1회 포함',
  },
  {
    id: 5,
    name: '무드필름',
    rating: 4.8,
    reviewCount: 56,
    deliveryDays: 4,
    introduction: '영화 한 장면 같은 분위기를 만들어요.',
    shootingStyle:
      '차분한 톤과 깊은 그림자를 살린 시네마틱 사진을 찍어요. 해 질 녘 골든아워 촬영을 추천해요.',
    priceSummary: '10장 기준 95,000원 · 추가 비용 없음',
    priceDetail: '원본·보정 1회 포함',
  },
  {
    id: 6,
    name: '이젤 작가',
    rating: 4.6,
    reviewCount: 12,
    deliveryDays: 3,
    introduction: '그림처럼 부드러운 사진을 그려요.',
    shootingStyle:
      '파스텔 톤의 부드러운 보정을 좋아해요. 꽃이나 하늘이 있는 배경에서 따뜻한 느낌의 사진을 담아 드려요.',
    priceSummary: '10장 기준 60,000원 · 추가 비용 없음',
    priceDetail: '원본·보정 1회 포함',
  },
].map((expert) => ({
  ...expert,
  portfolio: SAMPLE_PORTFOLIO,
  // TODO: 시연용 사진 (API 연동 시 삭제)
  profileImageUrl: demoProfileImage(expert.name),
}));

export function RequestExpertProfilePage() {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // TODO: API 연동 시 id로 작가 정보 요청
  const expert = EXPERTS.find(({ id }) => String(id) === expertId);

  // 전문가 선택 목록으로 돌아가기. 주소로 바로 들어온 경우(이전 화면 없음)는 목록 주소로
  const goBackToList = () => {
    if (location.key === 'default') navigate('/requests/new/experts');
    else navigate(-1);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBackToList}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>{expert ? expert.name : '작가 프로필'}</h1>
      </header>

      {expert ? (
        <div className={styles.content}>
          <section className={styles.profile}>
            <div className={styles.profileRow}>
              {expert.profileImageUrl ? (
                <img className={styles.avatar} src={expert.profileImageUrl} alt="" />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
              )}
              <div className={styles.info}>
                <p className={styles.name}>{expert.name}</p>
                <p className={styles.meta}>
                  ★ {expert.rating.toFixed(1)}&nbsp;&nbsp;후기 {expert.reviewCount} · 평균 전달{' '}
                  {expert.deliveryDays}일
                </p>
              </div>
            </div>
            <p className={styles.introduction}>{expert.introduction}</p>
          </section>

          <ul className={styles.portfolio} aria-label="포트폴리오">
            {expert.portfolio.map(({ id, imageUrl }) => (
              <li
                key={id}
                className={
                  imageUrl ? styles.portfolioItem : `${styles.portfolioItem} ${styles.imageEmpty}`
                }
              >
                {imageUrl && <img src={imageUrl} alt="" />}
              </li>
            ))}
          </ul>

          <section className={styles.styleCard}>
            <h2 className={styles.cardTitle}>이렇게 촬영해요</h2>
            <p className={styles.cardText}>{expert.shootingStyle}</p>
          </section>

          <section className={styles.priceCard} aria-label="견적">
            <p className={styles.priceSummary}>{expert.priceSummary}</p>
            <p className={styles.priceDetail}>{expert.priceDetail}</p>
          </section>
        </div>
      ) : (
        <p className={styles.notFound}>작가 정보를 찾을 수 없어요.</p>
      )}

      <div className={styles.bottomBar}>
        <button type="button" className={styles.backButton} onClick={goBackToList}>
          목록으로 돌아가기
        </button>
      </div>
    </main>
  );
}
