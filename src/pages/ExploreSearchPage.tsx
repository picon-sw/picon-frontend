import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronDownIcon from '../assets/icons/explore/chevron-down.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import clockIcon from '../assets/icons/explore/clock.svg';
import closeIcon from '../assets/icons/explore/close.svg';
import searchIcon from '../assets/icons/explore/search.svg';
import sparkleIcon from '../assets/icons/explore/sparkle.svg';
import styles from './ExploreSearchPage.module.css';

const FILTERS = ['분야', '지역', '가격', '경력'];

// TODO: API 연동 시 교체 (임시 데이터)
const RECOMMENDED_KEYWORDS = ['졸업사진', '증명사진', '취업사진', '홍대'];
const INITIAL_RECENT_KEYWORDS = ['졸업사진', '홍대 프로필', '여권사진', '강아지'];

export function ExploreSearchPage() {
  const [query, setQuery] = useState('');
  const [recentKeywords, setRecentKeywords] = useState(INITIAL_RECENT_KEYWORDS);

  // 검색한 단어를 최근 검색어 맨 위로 (중복 제거)
  // TODO: 검색 결과 화면 이동은 다음 이슈에서
  const search = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setRecentKeywords((prev) => [trimmed, ...prev.filter((k) => k !== trimmed)]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search(query);
  };

  const removeRecent = (keyword: string) => {
    setRecentKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/explore" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>SEARCH</h1>
      </header>

      <form className={styles.searchBox} role="search" onSubmit={handleSubmit}>
        <img src={searchIcon} alt="" />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="작가, 사진 스타일을 검색해 보세요"
          aria-label="검색어"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
      </form>

      {/* TODO: 필터 선택 동작은 이후 이슈에서 */}
      <div className={styles.filters}>
        {FILTERS.map((name) => (
          <button key={name} type="button" className={styles.filter}>
            {name}
            <img src={chevronDownIcon} alt="" />
          </button>
        ))}
      </div>

      {/* TODO: AI 검색 화면 이동은 이후 이슈에서 */}
      <button type="button" className={styles.aiButton}>
        <img src={sparkleIcon} alt="" />
        <span className={styles.aiLabel}>AI로 사진작가 찾기</span>
        <img src={chevronRightIcon} alt="" />
      </button>

      <section className={styles.section} aria-labelledby="recommended-title">
        <h2 id="recommended-title" className={styles.sectionTitle}>
          추천 검색어
        </h2>
        <div className={styles.keywords}>
          {RECOMMENDED_KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className={styles.keyword}
              onClick={() => search(keyword)}
            >
              # {keyword}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.recentSection} aria-labelledby="recent-title">
        <div className={styles.sectionHeader}>
          <h2 id="recent-title" className={styles.sectionTitle}>
            최근 검색어
          </h2>
          {recentKeywords.length > 0 && (
            <button type="button" className={styles.clearAll} onClick={() => setRecentKeywords([])}>
              전체 삭제
            </button>
          )}
        </div>

        {recentKeywords.length > 0 ? (
          <ul className={styles.recentList}>
            {recentKeywords.map((keyword) => (
              <li key={keyword} className={styles.recentItem}>
                <button
                  type="button"
                  className={styles.recentKeyword}
                  onClick={() => search(keyword)}
                >
                  <img src={clockIcon} alt="" />
                  <span>{keyword}</span>
                </button>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`${keyword} 삭제`}
                  onClick={() => removeRecent(keyword)}
                >
                  <img src={closeIcon} alt="" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>최근 검색어가 없어요</p>
        )}
      </section>
    </main>
  );
}
