import { useState } from 'react';
import { Link } from 'react-router';
import starsIcon from '../assets/icons/home/stars.svg';
import {
  DEMO_CONTEST_IMAGE,
  DEMO_HOME_BANNER_IMAGES,
  DEMO_HOME_PHOTOGRAPHER_IMAGES,
} from '../constants/demoImages';
import styles from './HomePage.module.css';

// TODO: API 연동 시 실제 데이터로 교체
// imageUrl이 없으면 기본 배경색으로 표시
const banners: { label: string; title: string; link: string; imageUrl?: string }[] = [
  {
    label: 'NEW PHOTOGRAPHER',
    title: '새로운 시선으로 담아낼\n당신만의 특별한 순간',
    link: '/explore',
    // TODO: 시연용 사진 (API 연동 시 삭제)
    imageUrl: DEMO_HOME_BANNER_IMAGES.newPhotographer,
  },
  {
    label: 'CONTEST WINNER',
    title: '수상으로 증명된 감각,\n당신의 순간을 작품으로',
    link: '/explore',
    // TODO: 시연용 사진 (API 연동 시 삭제)
    imageUrl: DEMO_HOME_BANNER_IMAGES.contestWinner,
  },
];

// imageUrl이 없으면 기본 배경색으로 표시
const photographers: {
  id: number;
  name: string;
  category: string;
  rating: string;
  imageUrl?: string;
}[] = [
  {
    id: 1,
    name: '서하 작가',
    category: '인물 · 필름',
    rating: '4.7',
    // TODO: 시연용 사진 (API 연동 시 삭제)
    imageUrl: DEMO_HOME_PHOTOGRAPHER_IMAGES.seoha,
  },
  {
    id: 2,
    name: '윤슬 작가',
    category: '자연광 · 필름',
    rating: '4.6',
    // TODO: 시연용 사진 (API 연동 시 삭제)
    imageUrl: DEMO_HOME_PHOTOGRAPHER_IMAGES.yunseul,
  },
  {
    id: 3,
    name: '무드 필름',
    category: '풍경 · 필름',
    rating: '4.3',
    // TODO: 시연용 사진 (API 연동 시 삭제)
    imageUrl: DEMO_HOME_PHOTOGRAPHER_IMAGES.moodFilm,
  },
];

export function HomePage() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const banner = banners[bannerIndex];

  return (
    <main className={styles.home}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <p className={styles.slogan}>나만의 순간을 더 특별하게</p>
          <h1 className={styles.logo}>
            PIC:<span>ON</span>
          </h1>
        </div>

        <button className={styles.notification} type="button" aria-label="알림" disabled>
          <svg
            width="29"
            height="29"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        </button>
      </header>

      <section className={styles.hero} aria-label="추천 작가 배너">
        <div className={styles.heroImage}>
          {banner.imageUrl && (
            <>
              <img className={styles.heroPhoto} src={banner.imageUrl} alt="" />
              <span className={styles.heroDim} aria-hidden="true" />
            </>
          )}
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>{banner.label}</span>

            <h2 className={styles.heroTitle}>{banner.title}</h2>

            <Link to={banner.link} className={styles.heroButton}>
              작가 둘러보기
              <span aria-hidden="true">›</span>
            </Link>
          </div>
        </div>

        <div className={styles.heroDots}>
          {banners.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setBannerIndex(index)}
              className={
                bannerIndex === index ? `${styles.heroDot} ${styles.heroDotActive}` : styles.heroDot
              }
              aria-label={`${index + 1}번 배너 보기`}
              aria-pressed={bannerIndex === index}
            />
          ))}
        </div>
      </section>

      <section className={styles.contestSection}>
        <h2 className={styles.sectionTitle}>이달의 콘테스트</h2>

        <div className={styles.contestCard}>
          <div className={styles.contestImage}>
            {/* TODO: 시연용 사진 (API 연동 시 콘테스트 대표 이미지 URL로 교체) */}
            <img src={DEMO_CONTEST_IMAGE} alt="" />
          </div>

          <div className={styles.contestContent}>
            <span className={styles.dday}>투표 D-8</span>

            <h3>가을의 미학</h3>

            <p>
              가장 마음에 드는 한 장에
              <br />
              당신의 표를 보내주세요.
            </p>

            <Link to="/contests" className={styles.contestButton}>
              투표하러 가기
              <span aria-hidden="true">›</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.requestSection}>
        <div className={styles.requestIcon}>
          <img src={starsIcon} alt="" />
        </div>

        <div className={styles.requestContent}>
          <span className={styles.requestLabel}>MULTI REQUEST</span>

          <h2>
            내 요청에 꼭 맞는
            <br />
            전문가 제안 3개 받기
          </h2>

          <p>한 번의 요청으로 편하게 비교해 보세요</p>
        </div>

        <Link to="/requests" className={styles.requestButton}>
          의뢰하러 가기
          <span aria-hidden="true">›</span>
        </Link>
      </section>

      <section className={styles.recommendSection}>
        <div className={styles.recommendHeader}>
          <h2 className={styles.sectionTitle}>취향 맞춤 전문가</h2>

          <Link to="/explore" className={styles.more}>
            더보기
          </Link>
        </div>

        <div className={styles.photographerList}>
          {photographers.map((photographer) => (
            <Link
              key={photographer.id}
              to={`/explore/photographers/${photographer.id}`}
              className={styles.photographerCard}
            >
              <div className={styles.photographerImage}>
                {photographer.imageUrl && <img src={photographer.imageUrl} alt="" />}
              </div>

              <strong>{photographer.name}</strong>

              <span className={styles.photographerCategory}>{photographer.category}</span>

              <span className={styles.rating}>
                <span aria-hidden="true">★</span>
                {photographer.rating}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
