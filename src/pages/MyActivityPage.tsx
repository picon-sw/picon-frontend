import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import starIcon from '../assets/icons/explore/star.svg';
import styles from './MyActivityPage.module.css';

interface ImageItem {
  id: number;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  imageUrl?: string;
}

interface MyReview {
  id: number;
  photographerName: string;
  rating: number;
  content: string;
}

// TODO: API 연동 시 교체 (임시 데이터)
const SAMPLE_REQUESTS: ImageItem[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
const SAMPLE_REVIEW: MyReview = {
  id: 1,
  photographerName: '서하 작가',
  rating: 4.5,
  content: '포즈를 친절하게 알려주셔서 편하게 촬영했어요. 사진도 자연스럽게 나와서 만족해요!',
};
const SAMPLE_LIKED: ImageItem[] = [{ id: 1 }, { id: 2 }, { id: 3 }];
const SAMPLE_VOTES: ImageItem[] = [{ id: 1 }, { id: 2 }];

interface SectionHeaderProps {
  title: string;
}

// 섹션 제목 + 오른쪽 화살표
// TODO: 각 목록 전체 보기 화면은 이후 이슈에서 (지금은 화살표만 표시)
function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <img src={chevronRightIcon} alt="" />
    </div>
  );
}

interface ImageListProps {
  items: ImageItem[];
  variant: 'thumbnail' | 'card';
}

function ImageList({ items, variant }: ImageListProps) {
  return (
    <ul className={variant === 'card' ? styles.cards : styles.thumbnails}>
      {items.map(({ id, imageUrl }) => (
        <li key={id} className={imageUrl ? styles.image : `${styles.image} ${styles.imageEmpty}`}>
          {imageUrl && <img src={imageUrl} alt="" />}
        </li>
      ))}
    </ul>
  );
}

export function MyActivityPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>나의 활동</h1>
      </header>

      <section className={styles.section}>
        <SectionHeader title="내 의뢰 내역" />
        <ImageList items={SAMPLE_REQUESTS} variant="thumbnail" />
      </section>

      <section className={styles.section}>
        <SectionHeader title="작성한 리뷰" />
        <p className={styles.reviewTarget}>
          <img src={starIcon} alt="" />
          <span aria-label={`평점 ${SAMPLE_REVIEW.rating}`}>{SAMPLE_REVIEW.rating}</span>
          {SAMPLE_REVIEW.photographerName}
        </p>
        <p className={styles.reviewContent}>{SAMPLE_REVIEW.content}</p>
      </section>

      <section className={styles.section}>
        <SectionHeader title="찜한 전문가" />
        <ImageList items={SAMPLE_LIKED} variant="thumbnail" />
      </section>

      <section className={styles.section}>
        <SectionHeader title="콘테스트 투표 내역" />
        <ImageList items={SAMPLE_VOTES} variant="card" />
      </section>
    </main>
  );
}
