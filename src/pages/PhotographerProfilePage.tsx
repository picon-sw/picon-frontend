import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import starIcon from '../assets/icons/explore/star.svg';
import aiSparkleIcon from '../assets/icons/profile/ai-sparkle.svg';
import chatIcon from '../assets/icons/profile/chat.svg';
import heartIcon from '../assets/icons/profile/heart.svg';
import starFilledIcon from '../assets/icons/profile/star-filled.svg';
import starLargeIcon from '../assets/icons/profile/star-large.svg';
import userIcon from '../assets/icons/profile/user.svg';
import { SortDropdown } from '../components/SortDropdown';
import styles from './PhotographerProfilePage.module.css';

type ProfileTab = 'portfolio' | 'review';
type ReviewSort = 'latest' | 'ratingHigh' | 'ratingLow';

interface Review {
  id: number;
  author: string;
  rating: number;
  // YYYY.MM.DD
  date: string;
  service: string;
  content: string;
}

interface PhotographerProfile {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  field: string;
  specialties: string[];
  price: number;
  career: string;
  region: string;
  introduction: string;
  aiReviewSummary: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  profileImageUrl?: string;
  portfolio: { id: number; imageUrl?: string }[];
  reviews: Review[];
}

const REVIEW_SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'ratingHigh', label: '별점 높은순' },
  { value: 'ratingLow', label: '별점 낮은순' },
];

// TODO: API 연동 시 교체 (임시 데이터 — 검색 결과 화면의 작가 id와 맞춤, 리뷰는 Figma 예시)
const SAMPLE_REVIEWS: Review[] = [
  {
    id: 1,
    author: 'daeun****',
    rating: 5,
    date: '2027.02.25',
    service: '졸업사진 촬영',
    content:
      '처음 촬영하는 거라 긴장했는데 포즈를 친절하게 알려주셔서 편하게 촬영했어요!! 사진도 자연스럽게 나와서 정말 만족합니다.',
  },
  {
    id: 2,
    author: 'kde****',
    rating: 4,
    date: '2026.11.07',
    service: '프로필사진 촬영',
    content:
      '원하는 분위기를 잘 반영해 주셨고 촬영 내내 친절하셨어요. 보정 결과물도 마음에 들고 다음에도 이용하고 싶어요!',
  },
  {
    id: 3,
    author: 'pci**',
    rating: 5,
    date: '2026.10.30',
    service: '졸업사진 촬영',
    content:
      '촬영 장소도 잘 추천해 주시고 다양한 구도로 찍어주셔서 좋았어요ㅜㅜ 결과물도 만족스럽습니다!',
  },
];

const SAMPLE_PORTFOLIO = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

const SAMPLE_INTRODUCTION =
  '자연스러운 표정과 분위기를 담는 사진작가입니다.\n소중한 순간을 편안하게 기록해 드려요.';

const SAMPLE_AI_SUMMARY =
  '자연스러운 사진 분위기와 친절한 촬영 진행에 대한 긍정적인 평가가 많아요. 특히 포즈 안내가 편안하다는 후기가 자주 언급돼요.';

const PHOTOGRAPHERS: PhotographerProfile[] = [
  {
    id: 1,
    name: '서하 작가',
    rating: 4.9,
    reviewCount: 182,
    region: '서울 마포구',
    price: 80000,
    career: '2년',
  },
  {
    id: 2,
    name: '지훈 작가',
    rating: 4.8,
    reviewCount: 30,
    region: '서울 서초구',
    price: 70000,
    career: '4년',
  },
  {
    id: 3,
    name: '무드필름',
    rating: 4.7,
    reviewCount: 96,
    region: '서울 성동구',
    price: 90000,
    career: '6년',
  },
  {
    id: 4,
    name: '아리 작가',
    rating: 4.5,
    reviewCount: 12,
    region: '서울 강남구',
    price: 50000,
    career: '1년',
  },
  // 탐색 메인 화면에만 나오는 작가 (검색 결과에는 없음)
  {
    id: 5,
    name: '윤슬 작가',
    rating: 4.8,
    reviewCount: 64,
    region: '서울 용산구',
    price: 100000,
    career: '3년',
  },
  {
    id: 6,
    name: '이젤 작가',
    rating: 4.6,
    reviewCount: 41,
    region: '경기도 성남시',
    price: 60000,
    career: '5년',
  },
].map((base) => ({
  ...base,
  field: '촬영',
  specialties: ['졸업사진', '프로필사진'],
  introduction: SAMPLE_INTRODUCTION,
  aiReviewSummary: SAMPLE_AI_SUMMARY,
  portfolio: SAMPLE_PORTFOLIO,
  reviews: SAMPLE_REVIEWS,
}));

interface StarsProps {
  rating: number;
}

// 별점만큼 채운 별 (Figma처럼 빈 별은 표시하지 않음)
function Stars({ rating }: StarsProps) {
  return (
    <span className={styles.stars} aria-label={`별점 ${rating.toFixed(1)}`}>
      {Array.from({ length: Math.round(rating) }, (_, index) => (
        <img key={index} src={starFilledIcon} alt="" />
      ))}
      <span className={styles.starsValue} aria-hidden="true">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export function PhotographerProfilePage() {
  const { photographerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<ProfileTab>('portfolio');
  const [reviewSort, setReviewSort] = useState<ReviewSort>('latest');

  // TODO: API 연동 시 id로 작가 정보 요청
  const photographer = PHOTOGRAPHERS.find(({ id }) => String(id) === photographerId);

  // 들어온 화면으로 돌아가기. 주소로 바로 들어온 경우(이전 화면 없음)는 탐색 메인으로
  const goBack = () => {
    if (location.key === 'default') navigate('/explore');
    else navigate(-1);
  };

  if (!photographer) {
    return (
      <main className={styles.notFound}>
        <p>작가 정보를 찾을 수 없어요.</p>
        <Link to="/explore">탐색으로 돌아가기</Link>
      </main>
    );
  }

  const {
    name,
    rating,
    reviewCount,
    field,
    specialties,
    price,
    career,
    region,
    introduction,
    aiReviewSummary,
    profileImageUrl,
    portfolio,
    reviews,
  } = photographer;

  // 날짜 문자열(YYYY.MM.DD)은 그대로 비교해도 순서가 맞음
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'ratingHigh') return b.rating - a.rating || b.date.localeCompare(a.date);
    if (reviewSort === 'ratingLow') return a.rating - b.rating || b.date.localeCompare(a.date);
    return b.date.localeCompare(a.date);
  });

  const tabs: { value: ProfileTab; label: string }[] = [
    { value: 'portfolio', label: '포트폴리오' },
    { value: 'review', label: `리뷰(${reviewCount})` },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="뒤로 가기" onClick={goBack}>
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>Profile</h1>
        {/* TODO: 찜하기 기능은 이후 이슈에서 */}
        <button type="button" className={styles.like} aria-label="찜하기">
          <img src={heartIcon} alt="" />
        </button>
      </header>

      <section className={styles.profile}>
        {profileImageUrl ? (
          <img className={styles.avatar} src={profileImageUrl} alt="" />
        ) : (
          <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
        )}

        <div className={styles.info}>
          <p className={styles.name}>{name}</p>
          <p className={styles.rating}>
            <img src={starIcon} alt="" />
            <span aria-label={`평점 ${rating}`}>{rating.toFixed(1)}</span>
            <span className={styles.reviewCount} aria-label={`리뷰 ${reviewCount}개`}>
              ({reviewCount})
            </span>
          </p>
          <p className={styles.specialty}>
            {field} · {specialties.join(' / ')}
          </p>

          <dl className={styles.details}>
            <div>
              <dt>분야</dt>
              <dd>{field}</dd>
            </div>
            <div>
              <dt>가격대</dt>
              <dd>{price.toLocaleString('ko-KR')}원~</dd>
            </div>
            <div>
              <dt>경력</dt>
              <dd>{career}</dd>
            </div>
            <div>
              <dt>지역</dt>
              <dd>{region}</dd>
            </div>
          </dl>
        </div>
      </section>

      <p className={styles.introduction}>{introduction}</p>

      <div className={styles.tabs} role="tablist">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'portfolio' ? (
        <ul className={styles.portfolio} aria-label="포트폴리오">
          {portfolio.map(({ id, imageUrl }) => (
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
      ) : (
        <section className={styles.reviewSection} aria-label="리뷰">
          <p className={styles.reviewSummary}>
            <img src={starLargeIcon} alt="" />
            <strong>{rating.toFixed(1)}</strong>
            <span>리뷰 {reviewCount}개</span>
          </p>

          <div className={styles.aiSummary}>
            <p className={styles.aiTitle}>
              <img src={aiSparkleIcon} alt="" />
              AI 리뷰 요약
            </p>
            <p className={styles.aiText}>{aiReviewSummary}</p>
          </div>

          <div className={styles.reviewHeader}>
            <h2 className={styles.reviewTitle}>사용자 리뷰</h2>
            <SortDropdown
              options={REVIEW_SORT_OPTIONS}
              value={reviewSort}
              onChange={setReviewSort}
              label="리뷰 정렬"
            />
          </div>

          <ul className={styles.reviewList}>
            {sortedReviews.map(({ id, author, rating: reviewRating, date, service, content }) => (
              <li key={id} className={styles.review}>
                <img className={styles.reviewUser} src={userIcon} alt="" />
                <div className={styles.reviewBody}>
                  <div className={styles.reviewTop}>
                    <span className={styles.reviewAuthor}>{author}</span>
                    <time className={styles.reviewDate}>{date}</time>
                  </div>
                  <Stars rating={reviewRating} />
                  <p className={styles.reviewService}>{service}</p>
                  <p className={styles.reviewContent}>{content}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 하단바 바로 위에 고정 */}
      {/* TODO: 채팅 · 의뢰 화면 이동은 이후 이슈에서 */}
      <div className={styles.actions}>
        <button type="button" className={styles.chatButton}>
          <img src={chatIcon} alt="" />
          채팅하기
        </button>
        <button type="button" className={styles.requestButton}>
          바로 의뢰하기
        </button>
      </div>
    </main>
  );
}
