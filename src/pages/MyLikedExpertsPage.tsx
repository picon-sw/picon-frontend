import { useState } from 'react';
import heartFilledIcon from '../assets/icons/my/heart-filled.svg';
import heartOutlineIcon from '../assets/icons/my/heart-outline.svg';
import starOnIcon from '../assets/icons/request/star-on.svg';
import { FilterChips } from '../components/FilterChips';
import { PageHeader } from '../components/PageHeader';
import { DEMO_MY_LIKED_EXPERT_IMAGES } from '../constants/demoImages';
import styles from './MyLikedExpertsPage.module.css';

type ExpertField = 'shoot' | 'edit';
type Filter = 'all' | ExpertField;

interface LikedExpert {
  id: number;
  name: string;
  field: ExpertField;
  rating: number;
  reviewCount: number;
  tags: string[];
  minPrice: number;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  imageUrl?: string;
}

// TODO: API 연동 시 교체 (임시 데이터 — Figma 예시, 사진은 시연용)
const SAMPLE_LIKED_BASE: Omit<LikedExpert, 'imageUrl'>[] = [
  {
    id: 1,
    name: '서하 작가',
    field: 'shoot',
    rating: 4.8,
    reviewCount: 32,
    tags: ['인물', '자연광'],
    minPrice: 80000,
  },
  {
    id: 2,
    name: '하린 작가',
    field: 'shoot',
    rating: 4.9,
    reviewCount: 57,
    tags: ['커플', '스냅'],
    minPrice: 120000,
  },
  {
    id: 3,
    name: '도윤 에디터',
    field: 'edit',
    rating: 4.7,
    reviewCount: 21,
    tags: ['보정', '색감'],
    minPrice: 20000,
  },
  {
    id: 4,
    name: '유나 작가',
    field: 'shoot',
    rating: 4.6,
    reviewCount: 14,
    tags: ['풍경', '필름'],
    minPrice: 70000,
  },
  {
    id: 5,
    name: '민재 에디터',
    field: 'edit',
    rating: 5.0,
    reviewCount: 9,
    tags: ['합성', '리터칭'],
    minPrice: 30000,
  },
  {
    id: 6,
    name: '지우 작가',
    field: 'shoot',
    rating: 4.8,
    reviewCount: 40,
    tags: ['프로필', '스튜디오'],
    minPrice: 90000,
  },
];
const SAMPLE_LIKED: LikedExpert[] = SAMPLE_LIKED_BASE.map((expert, index) => ({
  ...expert,
  imageUrl: DEMO_MY_LIKED_EXPERT_IMAGES[index],
}));

const FIELD_LABEL: Record<ExpertField, string> = { shoot: '촬영', edit: '편집' };

// 찜한 전문가 (나의 활동 → 찜한 전문가)
export function MyLikedExpertsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  // 하트를 다시 누르면 찜 해제 (목록에서는 바로 빼지 않고 빈 하트로 표시)
  // TODO: API 연동 시 찜 해제 요청
  const [unliked, setUnliked] = useState<number[]>([]);

  const experts = SAMPLE_LIKED;
  const countOf = (field: ExpertField) => experts.filter((e) => e.field === field).length;
  const visible = filter === 'all' ? experts : experts.filter((e) => e.field === filter);

  const toggleLike = (id: number) => {
    setUnliked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <main className={styles.page}>
      <PageHeader title="찜한 전문가" backTo="/my/activity" />

      <div className={styles.filters}>
        <FilterChips
          options={[
            { value: 'all', label: '전체', count: experts.length },
            { value: 'shoot', label: '촬영', count: countOf('shoot') },
            { value: 'edit', label: '편집', count: countOf('edit') },
          ]}
          value={filter}
          onChange={setFilter}
          sortLabel="최근 찜한 순"
        />
      </div>

      {visible.length > 0 ? (
        <ul className={styles.grid}>
          {visible.map(({ id, name, field, rating, reviewCount, tags, minPrice, imageUrl }) => {
            const liked = !unliked.includes(id);
            return (
              <li key={id} className={styles.card}>
                <div className={styles.imageWrap}>
                  {imageUrl && <img className={styles.image} src={imageUrl} alt="" />}
                  <button
                    type="button"
                    className={styles.heart}
                    aria-pressed={liked}
                    aria-label={liked ? `${name} 찜 해제` : `${name} 찜하기`}
                    onClick={() => toggleLike(id)}
                  >
                    <img src={liked ? heartFilledIcon : heartOutlineIcon} alt="" />
                  </button>
                </div>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{name}</span>
                  <span className={`${styles.field} ${styles[`field_${field}`]}`}>
                    {FIELD_LABEL[field]}
                  </span>
                </div>
                <p
                  className={styles.rating}
                  aria-label={`평점 ${rating.toFixed(1)}, 리뷰 ${reviewCount}개`}
                >
                  <img src={starOnIcon} alt="" />
                  {rating.toFixed(1)} ({reviewCount})
                </p>
                <p className={styles.tags}>{tags.map((tag) => `#${tag}`).join(' ')}</p>
                <p className={styles.price}>{minPrice.toLocaleString('ko-KR')}원~</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>찜한 전문가가 없어요.</p>
      )}
    </main>
  );
}
