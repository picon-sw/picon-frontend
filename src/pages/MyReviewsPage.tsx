import starOffIcon from '../assets/icons/request/star-off.svg';
import starOnIcon from '../assets/icons/request/star-on.svg';
import { PageHeader } from '../components/PageHeader';
import { DEMO_MY_REVIEW_PHOTOS } from '../constants/demoImages';
import styles from './MyReviewsPage.module.css';

interface MyWrittenReview {
  id: number;
  expertName: string;
  service: string;
  // YYYY.MM.DD
  date: string;
  rating: number;
  content: string;
  // 백엔드에서 받은 이미지 URL
  photoUrls: string[];
}

// TODO: API 연동 시 교체 (임시 데이터 — Figma 예시, 사진은 시연용)
const SAMPLE_REVIEWS: MyWrittenReview[] = [
  {
    id: 1,
    expertName: '서하 작가',
    service: '프로필 촬영',
    date: '2026.11.30',
    rating: 5,
    content:
      '자연광 활용을 정말 잘하셔서 원하던 분위기 그대로 나왔어요. 촬영 내내 편하게 리드해주셔서 어색하지 않았습니다!',
    photoUrls: DEMO_MY_REVIEW_PHOTOS.slice(0, 3),
  },
  {
    id: 2,
    expertName: '하린 작가',
    service: '커플 스냅 촬영',
    date: '2026.11.18',
    rating: 5,
    content:
      '보정 톤이 너무 예뻐요. 셀렉 기간도 넉넉하게 주셔서 천천히 고를 수 있었어요. 다음에도 꼭 의뢰할게요.',
    photoUrls: DEMO_MY_REVIEW_PHOTOS.slice(3, 5),
  },
  {
    id: 3,
    expertName: '도윤 에디터',
    service: '증명사진 보정',
    date: '2026.11.05',
    rating: 4,
    content: '요청한 부분을 꼼꼼하게 반영해주셨어요. 수정 요청에도 빠르게 응답해주셨습니다.',
    photoUrls: [],
  },
];

interface StarsProps {
  rating: number;
}

// 별 5개 중 별점만큼 파랑 + 숫자
function Stars({ rating }: StarsProps) {
  return (
    <p className={styles.stars} aria-label={`별점 ${rating.toFixed(1)}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <img key={index} src={index < rating ? starOnIcon : starOffIcon} alt="" />
      ))}
      <span aria-hidden="true">{rating.toFixed(1)}</span>
    </p>
  );
}

// 작성한 리뷰 (나의 활동 → 작성한 리뷰)
export function MyReviewsPage() {
  const reviews = SAMPLE_REVIEWS;

  return (
    <main className={styles.page}>
      <PageHeader title="작성한 리뷰" backTo="/my/activity" />

      <div className={styles.summary}>
        <p className={styles.count}>
          총 <strong>{reviews.length}</strong>개의 리뷰
        </p>
        {/* TODO: 정렬 기준이 여러 개가 되면 SortDropdown으로 교체 */}
        <span className={styles.sort}>최신순</span>
      </div>

      {reviews.length > 0 ? (
        <ul className={styles.list}>
          {reviews.map(({ id, expertName, service, date, rating, content, photoUrls }) => (
            <li key={id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.avatar} aria-hidden="true" />
                <div className={styles.expert}>
                  <p className={styles.expertName}>{expertName}</p>
                  <p className={styles.service}>
                    {service} · {date}
                  </p>
                </div>
                {/* TODO: 리뷰 수정 · 삭제는 API 연동 때 */}
                <div className={styles.manage}>
                  <button type="button">수정</button>
                  <span aria-hidden="true">|</span>
                  <button type="button">삭제</button>
                </div>
              </div>
              <Stars rating={rating} />
              {photoUrls.length > 0 && (
                <ul className={styles.photos}>
                  {photoUrls.map((url) => (
                    <li key={url}>
                      <img src={url} alt="" />
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.content}>{content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>작성한 리뷰가 없어요.</p>
      )}
    </main>
  );
}
