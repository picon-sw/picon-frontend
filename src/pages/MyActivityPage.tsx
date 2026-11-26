import { Link } from 'react-router';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import { DEMO_MY_ACTIVITY_IMAGES } from '../constants/demoImages';
import { PageHeader } from '../components/PageHeader';
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

// TODO: 시연용 사진 (API 연동 시 toImageItems와 DEMO_MY_ACTIVITY_IMAGES 삭제)
function toImageItems(imageUrls: string[]): ImageItem[] {
  return imageUrls.map((imageUrl, index) => ({ id: index + 1, imageUrl }));
}

// TODO: API 연동 시 교체 (임시 데이터)
const SAMPLE_REQUESTS: ImageItem[] = toImageItems(DEMO_MY_ACTIVITY_IMAGES.requests);
const SAMPLE_REVIEW: MyReview = {
  id: 1,
  photographerName: '서하 작가',
  rating: 4.5,
  content: '포즈를 친절하게 알려주셔서 편하게 촬영했어요. 사진도 자연스럽게 나와서 만족해요!',
};
const SAMPLE_LIKED: ImageItem[] = toImageItems(DEMO_MY_ACTIVITY_IMAGES.liked);
const SAMPLE_VOTES: ImageItem[] = toImageItems(DEMO_MY_ACTIVITY_IMAGES.votes);

interface SectionHeaderProps {
  title: string;
  // 전체 목록 화면 주소. 없으면 화살표만 표시
  to?: string;
}

// 섹션 제목 + 오른쪽 화살표 (누르면 전체 목록)
function SectionHeader({ title, to }: SectionHeaderProps) {
  const content = (
    <>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <img src={chevronRightIcon} alt="" />
    </>
  );
  return to ? (
    <Link to={to} className={styles.sectionHeader} aria-label={`${title} 전체 보기`}>
      {content}
    </Link>
  ) : (
    <div className={styles.sectionHeader}>{content}</div>
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
      <PageHeader title="나의 활동" backTo="/my" />

      <section className={styles.section}>
        <SectionHeader title="내 의뢰 내역" to="/my/activity/requests" />
        <ImageList items={SAMPLE_REQUESTS} variant="thumbnail" />
      </section>

      <section className={styles.section}>
        <SectionHeader title="작성한 리뷰" to="/my/activity/reviews" />
        <p className={styles.reviewTarget}>
          <span className={styles.star} aria-hidden="true" />
          <span aria-label={`평점 ${SAMPLE_REVIEW.rating}`}>{SAMPLE_REVIEW.rating}</span>
          {SAMPLE_REVIEW.photographerName}
        </p>
        <p className={styles.reviewContent}>{SAMPLE_REVIEW.content}</p>
      </section>

      <section className={styles.section}>
        <SectionHeader title="찜한 전문가" to="/my/activity/liked" />
        <ImageList items={SAMPLE_LIKED} variant="thumbnail" />
      </section>

      <section className={styles.section}>
        <SectionHeader title="콘테스트 투표 내역" to="/my/activity/votes" />
        <ImageList items={SAMPLE_VOTES} variant="card" />
      </section>
    </main>
  );
}
