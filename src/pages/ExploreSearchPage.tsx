import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronDownIcon from '../assets/icons/explore/chevron-down.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import clockIcon from '../assets/icons/explore/clock.svg';
import closeIcon from '../assets/icons/explore/close.svg';
import searchIcon from '../assets/icons/explore/search.svg';
import sparkleIcon from '../assets/icons/explore/sparkle.svg';
import { BottomSheet } from '../components/BottomSheet';
import {
  EXPLORE_FILTERS,
  readExploreFilters,
  toExploreSearchParams,
  type ExploreFilterKey,
} from '../constants/exploreFilters';
import { useRecentKeywords } from '../hooks/useRecentKeywords';
import styles from './ExploreSearchPage.module.css';

// TODO: API 연동 시 교체 (임시 데이터)
const RECOMMENDED_KEYWORDS = ['졸업사진', '증명사진', '취업사진', '홍대'];

export function ExploreSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { recentKeywords, addRecent, removeRecent, clearRecent } = useRecentKeywords();

  // 선택한 필터는 URL에 저장 (검색 결과에서 뒤로 와도 유지)
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readExploreFilters(searchParams);
  const [openFilterKey, setOpenFilterKey] = useState<ExploreFilterKey | null>(null);
  const openFilter = EXPLORE_FILTERS.find(({ key }) => key === openFilterKey);

  const updateFilter = (key: ExploreFilterKey, values: string[]) => {
    setSearchParams(toExploreSearchParams({ ...filters, [key]: values }), { replace: true });
  };

  // 하나만 고르는 필터: 고르면 바로 닫힘 / 여러 개 고르는 필터: 눌러서 켜고 끄기, 완료로 닫기
  const toggleOption = (key: ExploreFilterKey, option: string, multiple?: boolean) => {
    const current = filters[key] ?? [];
    if (!multiple) {
      updateFilter(key, [option]);
      setOpenFilterKey(null);
      return;
    }
    updateFilter(
      key,
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
    );
  };

  // 무관: 선택 해제
  const clearFilter = (key: ExploreFilterKey, multiple?: boolean) => {
    updateFilter(key, []);
    if (!multiple) setOpenFilterKey(null);
  };

  // 최근 검색어에 추가하고 검색 결과 화면으로 이동 (선택한 필터 포함)
  const search = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    addRecent(trimmed);
    navigate(`/explore/results?${toExploreSearchParams(filters, trimmed)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search(query);
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

      {/* 선택하면 버튼에 선택한 값이 표시됨 */}
      <div className={styles.filters}>
        {EXPLORE_FILTERS.map(({ key, label }) => {
          const selected = filters[key] ?? [];
          // 여러 개 선택 시 "서울 외 2"
          const summary =
            selected.length > 1 ? `${selected[0]} 외 ${selected.length - 1}` : selected[0];
          return (
            <button
              key={key}
              type="button"
              className={summary ? `${styles.filter} ${styles.filterSelected}` : styles.filter}
              aria-haspopup="dialog"
              aria-label={summary ? `${label}: ${selected.join(', ')}` : label}
              onClick={() => setOpenFilterKey(key)}
            >
              {summary ?? label}
              <img src={chevronDownIcon} alt="" />
            </button>
          );
        })}
      </div>

      {openFilter && (
        <BottomSheet
          title={openFilter.multiple ? `${openFilter.label} (중복 선택 가능)` : openFilter.label}
          onClose={() => setOpenFilterKey(null)}
        >
          {openFilter.options.length > 0 ? (
            <>
              <div className={styles.options}>
                <button
                  type="button"
                  className={
                    filters[openFilter.key]
                      ? styles.option
                      : `${styles.option} ${styles.optionSelected}`
                  }
                  aria-pressed={!filters[openFilter.key]}
                  onClick={() => clearFilter(openFilter.key, openFilter.multiple)}
                >
                  무관
                </button>
                {openFilter.options.map((option) => {
                  const isSelected = filters[openFilter.key]?.includes(option) ?? false;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={
                        isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option
                      }
                      aria-pressed={isSelected}
                      onClick={() => toggleOption(openFilter.key, option, openFilter.multiple)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {openFilter.multiple && (
                <button
                  type="button"
                  className={styles.sheetDone}
                  onClick={() => setOpenFilterKey(null)}
                >
                  {filters[openFilter.key]
                    ? `${filters[openFilter.key]?.length}개 선택 완료`
                    : '완료'}
                </button>
              )}
            </>
          ) : (
            <p className={styles.optionsEmpty}>선택지를 준비 중이에요</p>
          )}
        </BottomSheet>
      )}

      <Link to="/explore/ai" className={styles.aiButton}>
        <img src={sparkleIcon} alt="" />
        <span className={styles.aiLabel}>AI로 사진작가 찾기</span>
        <img src={chevronRightIcon} alt="" />
      </Link>

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
            <button type="button" className={styles.clearAll} onClick={clearRecent}>
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
