import { Link, useSearchParams } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronRightSmallIcon from '../assets/icons/explore/chevron-right-small.svg';
import locationIcon from '../assets/icons/explore/location.svg';
import starIcon from '../assets/icons/explore/star.svg';
import aiIcon from '../assets/icons/profile/ai-sparkle.svg';
import { conditionChips, conditionSentence, readConditionParams } from '../utils/aiSearchMock';
// 상단은 일반검색, 작가 카드는 일반검색 결과 화면과 같은 스타일 사용
import { DEMO_PROFILE_IMAGES } from '../constants/demoImages';
import searchStyles from './ExploreSearchPage.module.css';
import resultStyles from './ExploreSearchResultPage.module.css';
import styles from './ExploreAiSearchResultPage.module.css';

interface AiSearchResult {
  // 작가 프로필 화면(/explore/photographers/:id)의 작가 id
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  // 분야(촬영/편집)와 전문 분야 — 작가 프로필과 같은 형식으로 표시
  field: string;
  specialties: string[];
  region: string;
  price: number;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  imageUrl?: string;
}

// TODO: AI 검색 API 연동 시 교체 (임시 데이터 — Figma 예시, 조건과 상관없이 같은 결과)
const RESULTS: AiSearchResult[] = [
  {
    id: 1,
    name: '서하 작가',
    rating: 4.9,
    reviewCount: 182,
    field: '촬영',
    specialties: ['졸업사진', '프로필사진'],
    region: '서울 마포구',
    price: 80000,
  },
  {
    id: 3,
    name: '무드필름',
    rating: 4.7,
    reviewCount: 96,
    field: '촬영',
    specialties: ['졸업사진', '프로필사진'],
    region: '서울 성동구',
    price: 90000,
  },
  {
    id: 2,
    name: '지훈 작가',
    rating: 4.8,
    reviewCount: 30,
    field: '촬영',
    specialties: ['졸업사진', '프로필사진'],
    region: '서울 서초구',
    price: 70000,
  },
  {
    id: 4,
    name: '아리 작가',
    rating: 4.5,
    reviewCount: 12,
    field: '촬영',
    specialties: ['졸업사진', '프로필사진'],
    region: '서울 강남구',
    price: 50000,
  },
  // TODO: 시연용 사진 연결 (API 연동 시 .map 삭제)
].map((result) => ({ ...result, imageUrl: DEMO_PROFILE_IMAGES[result.id] }));

export function ExploreAiSearchResultPage() {
  const [searchParams] = useSearchParams();
  const conditions = readConditionParams(searchParams);
  const chips = conditionChips(conditions);

  return (
    <main className={styles.page}>
      <header className={`${searchStyles.header} ${styles.header}`}>
        <Link to="/explore/ai" className={searchStyles.back} aria-label="AI 검색 다시 하기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={searchStyles.title}>AI SEARCH</h1>
      </header>

      <section className={styles.summary}>
        <img className={styles.summaryIcon} src={aiIcon} alt="" />
        <div>
          <h2 className={styles.summaryTitle}>조건에 맞는 작가를 찾았어요!</h2>
          <p className={styles.summaryText}>{conditionSentence(conditions)}를 검색했어요.</p>
          {chips.length > 0 && (
            <ul className={styles.chips} aria-label="검색 조건">
              {chips.map((chip) => (
                <li key={chip} className={styles.chip}>
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <h2 className={styles.resultTitle}>
        <img src={aiIcon} alt="" />
        검색 결과
      </h2>

      <ul className={`${resultStyles.list} ${styles.list}`}>
        {RESULTS.map(
          ({ id, name, rating, reviewCount, field, specialties, region, price, imageUrl }) => (
            <li key={id} className={resultStyles.card}>
              {imageUrl ? (
                <img className={resultStyles.image} src={imageUrl} alt="" />
              ) : (
                <span className={`${resultStyles.image} ${resultStyles.imageEmpty}`} />
              )}

              <div className={resultStyles.info}>
                <div className={resultStyles.nameRow}>
                  <span className={resultStyles.name}>{name}</span>
                  <span className={resultStyles.rating}>
                    <img src={starIcon} alt="" />
                    <span aria-label={`평점 ${rating}`}>{rating.toFixed(1)}</span>
                    <span className={resultStyles.reviewCount} aria-label={`리뷰 ${reviewCount}개`}>
                      ({reviewCount})
                    </span>
                  </span>
                </div>
                <p className={resultStyles.specialty}>
                  {field} · {specialties.join(' / ')}
                </p>
                <p className={resultStyles.region}>
                  <img src={locationIcon} alt="" />
                  {region}
                </p>
                <p className={resultStyles.price}>{price.toLocaleString('ko-KR')}원~</p>

                <Link
                  to={`/explore/photographers/${id}`}
                  className={`${resultStyles.profileButton} ${styles.profileLink}`}
                >
                  프로필 보기
                  <img src={chevronRightSmallIcon} alt="" />
                </Link>
              </div>
            </li>
          ),
        )}
      </ul>
    </main>
  );
}
