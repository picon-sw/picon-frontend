import { useState } from 'react';
import { Link } from 'react-router';
import chevronDownIcon from '../assets/icons/explore/chevron-down.svg';
import searchIcon from '../assets/icons/explore/search.svg';
import styles from './ExplorePage.module.css';

type ExploreTab = 'shoot' | 'edit';

interface Photographer {
  id: number;
  // 작가 프로필 화면(/explore/photographers/:id)의 작가 id
  photographerId: number;
  name: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  imageUrl?: string;
  profileImageUrl?: string;
}

const TABS: { value: ExploreTab; label: string }[] = [
  { value: 'shoot', label: '촬영' },
  { value: 'edit', label: '편집' },
];

// TODO: 해시태그 목록 확정 시 교체 (제품사진 이후는 임시 값)
const TAGS = [
  '추천',
  '증명사진',
  '웨딩',
  '프로필',
  '가족사진',
  '제품사진',
  '졸업사진',
  '취업사진',
  '여권사진',
  '바디프로필',
  '커플사진',
  '우정사진',
  '반려동물',
  '돌사진',
  '만삭사진',
  '스냅',
  '행사사진',
  '화보',
  '야외촬영',
  '보정',
];

// TODO: API 연동 시 교체 (임시 데이터)
const PHOTOGRAPHERS: Record<ExploreTab, Photographer[]> = {
  shoot: [
    { id: 1, photographerId: 1, name: '서하 작가' },
    { id: 2, photographerId: 5, name: '윤슬 작가' },
    { id: 3, photographerId: 3, name: '무드필름' },
    { id: 4, photographerId: 2, name: '지훈 작가' },
    { id: 5, photographerId: 6, name: '이젤 작가' },
    { id: 6, photographerId: 4, name: '아리 작가' },
  ],
  edit: [
    { id: 7, photographerId: 1, name: '서하 작가' },
    { id: 8, photographerId: 5, name: '윤슬 작가' },
    { id: 9, photographerId: 3, name: '무드필름' },
    { id: 10, photographerId: 2, name: '지훈 작가' },
    { id: 11, photographerId: 6, name: '이젤 작가' },
    { id: 12, photographerId: 4, name: '아리 작가' },
  ],
};

export function ExplorePage() {
  const [tab, setTab] = useState<ExploreTab>('shoot');
  const [tag, setTag] = useState(TAGS[0]);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>SEARCH</h1>

      <Link to="/explore/search" className={styles.searchBox}>
        <img src={searchIcon} alt="" />
        <span>작가, 사진 스타일을 검색해 보세요</span>
      </Link>

      <div className={styles.tabs} role="tablist">
        {TABS.map(({ value, label }) => (
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

      {/* 접힘: 한 줄 가로 스크롤 / 펼침: 전체 태그 여러 줄. 화살표는 항상 오른쪽 위 고정 */}
      <div
        className={tagsExpanded ? `${styles.tagsRow} ${styles.tagsRowExpanded}` : styles.tagsRow}
      >
        {/* 펼침 상태에서 float으로 첫 줄 오른쪽에 고정되도록 태그보다 먼저 둠 */}
        <button
          type="button"
          className={
            tagsExpanded ? `${styles.tagsToggle} ${styles.tagsToggleOpen}` : styles.tagsToggle
          }
          aria-expanded={tagsExpanded}
          aria-controls="explore-tags"
          aria-label={tagsExpanded ? '해시태그 접기' : '해시태그 더 보기'}
          onClick={() => setTagsExpanded((prev) => !prev)}
        >
          <img src={chevronDownIcon} alt="" />
        </button>
        <div id="explore-tags" className={styles.tags}>
          {TAGS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={tag === name}
              className={tag === name ? `${styles.tag} ${styles.tagActive}` : styles.tag}
              onClick={() => setTag(name)}
            >
              #{name}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.grid}>
        {PHOTOGRAPHERS[tab].map(({ id, photographerId, name, imageUrl, profileImageUrl }) => (
          <li key={id} className={imageUrl ? styles.card : `${styles.card} ${styles.cardEmpty}`}>
            {imageUrl && <img className={styles.cardImage} src={imageUrl} alt="" />}
            <div className={styles.cardHeader}>
              {/* 프로필 동그라미를 누르면 작가 프로필로 이동 */}
              <Link
                to={`/explore/photographers/${photographerId}`}
                className={styles.avatarLink}
                aria-label={`${name} 프로필 보기`}
              >
                {profileImageUrl ? (
                  <img className={styles.avatar} src={profileImageUrl} alt="" />
                ) : (
                  <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
                )}
              </Link>
              <span className={styles.cardName}>{name}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
