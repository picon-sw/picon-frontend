import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronDownIcon from '../assets/icons/explore/chevron-down.svg';
import chevronRightSmallIcon from '../assets/icons/explore/chevron-right-small.svg';
import locationIcon from '../assets/icons/explore/location.svg';
import searchIcon from '../assets/icons/explore/search.svg';
import starIcon from '../assets/icons/explore/star.svg';
import closeIcon from '../assets/icons/explore/close.svg';
import {
  EXPLORE_FILTERS,
  readExploreFilters,
  toExploreSearchParams,
  type ExploreFilterKey,
} from '../constants/exploreFilters';
import { useRecentKeywords } from '../hooks/useRecentKeywords';
// 상단(뒤로가기·제목·검색창)은 일반검색 화면과 같은 스타일 사용
import { DEMO_PROFILE_IMAGES } from '../constants/demoImages';
import searchStyles from './ExploreSearchPage.module.css';
import styles from './ExploreSearchResultPage.module.css';

interface SearchResult {
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

type SortKey = 'rating' | 'reviews';

// 첫 번째가 기본 정렬
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rating', label: '평점 높은순' },
  { value: 'reviews', label: '리뷰 많은순' },
];

// TODO: API 연동 시 교체 (임시 데이터 — 검색어와 상관없이 같은 결과)
const RESULTS: SearchResult[] = [
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

export function ExploreSearchResultPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const filters = readExploreFilters(searchParams);
  // 일반검색에서 선택한 필터 값 (분야 → 지역 → 가격 → 경력 순)
  const appliedFilters = EXPLORE_FILTERS.flatMap(({ key }) =>
    (filters[key] ?? []).map((value) => ({ key, value })),
  );

  // 조건 하나 지우기 (검색어와 나머지 조건은 유지)
  // TODO: API 연동 시 조건이 바뀌면 결과 다시 요청
  const removeFilter = (key: ExploreFilterKey, value: string) => {
    const next = { ...filters, [key]: (filters[key] ?? []).filter((v) => v !== value) };
    setSearchParams(toExploreSearchParams(next, keyword), { replace: true });
  };
  const [query, setQuery] = useState(keyword);
  const { addRecent } = useRecentKeywords();

  // 다른 검색어로 다시 검색 (뒤로가기 시 일반검색 화면으로 가도록 replace)
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    navigate(`/explore/results?${toExploreSearchParams(filters, trimmed)}`, { replace: true });
  };

  // 정렬: 기본은 평점 높은 순. 같으면 다른 기준으로 한 번 더 비교
  // TODO: API 연동 시 정렬 기준을 요청에 담아 백엔드에서 정렬
  const [sort, setSort] = useState<SortKey>('rating');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const sortedResults = [...RESULTS].sort((a, b) =>
    sort === 'rating'
      ? b.rating - a.rating || b.reviewCount - a.reviewCount
      : b.reviewCount - a.reviewCount || b.rating - a.rating,
  );

  // 정렬 메뉴 바깥을 누르면 닫기
  useEffect(() => {
    if (!sortOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [sortOpen]);

  return (
    <main className={styles.page}>
      <header className={searchStyles.header}>
        {/* 뒤로 가도 선택한 필터 유지 */}
        <Link
          to={`/explore/search?${toExploreSearchParams(filters)}`}
          className={searchStyles.back}
          aria-label="뒤로 가기"
        >
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={searchStyles.title}>SEARCH</h1>
      </header>

      <form className={searchStyles.searchBox} role="search" onSubmit={handleSubmit}>
        <img src={searchIcon} alt="" />
        <input
          type="search"
          className={searchStyles.searchInput}
          placeholder="작가, 사진 스타일을 검색해 보세요"
          aria-label="검색어"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>

      {/* 선택한 조건이 있을 때만 표시 */}
      {appliedFilters.length > 0 && (
        <ul className={styles.filters} aria-label="적용된 필터">
          {appliedFilters.map(({ key, value }) => (
            <li key={`${key}-${value}`} className={styles.filter}>
              {value}
              <button
                type="button"
                className={styles.filterRemove}
                aria-label={`${value} 조건 삭제`}
                onClick={() => removeFilter(key, value)}
              >
                <img src={closeIcon} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.resultHeader}>
        <h2 className={styles.resultTitle}>검색 결과</h2>
        <div className={styles.sortWrapper} ref={sortRef}>
          <button
            type="button"
            className={sortOpen ? `${styles.sort} ${styles.sortOpen}` : styles.sort}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((prev) => !prev)}
          >
            {SORT_OPTIONS.find(({ value }) => value === sort)?.label}
            <img src={chevronDownIcon} alt="" />
          </button>
          {sortOpen && (
            <ul className={styles.sortMenu} role="listbox" aria-label="정렬">
              {SORT_OPTIONS.map(({ value, label }) => (
                <li key={value} role="option" aria-selected={sort === value}>
                  <button
                    type="button"
                    className={
                      sort === value
                        ? `${styles.sortOption} ${styles.sortOptionSelected}`
                        : styles.sortOption
                    }
                    onClick={() => {
                      setSort(value);
                      setSortOpen(false);
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ul className={styles.list}>
        {sortedResults.map(
          ({ id, name, rating, reviewCount, field, specialties, region, price, imageUrl }) => (
            <li key={id} className={styles.card}>
              {imageUrl ? (
                <img className={styles.image} src={imageUrl} alt="" />
              ) : (
                <span className={`${styles.image} ${styles.imageEmpty}`} />
              )}

              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{name}</span>
                  <span className={styles.rating}>
                    <img src={starIcon} alt="" />
                    <span aria-label={`평점 ${rating}`}>{rating.toFixed(1)}</span>
                    <span className={styles.reviewCount} aria-label={`리뷰 ${reviewCount}개`}>
                      ({reviewCount})
                    </span>
                  </span>
                </div>
                <p className={styles.specialty}>
                  {field} · {specialties.join(' / ')}
                </p>
                <p className={styles.region}>
                  <img src={locationIcon} alt="" />
                  {region}
                </p>
                <p className={styles.price}>{price.toLocaleString('ko-KR')}원~</p>

                <Link to={`/explore/photographers/${id}`} className={styles.profileButton}>
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
