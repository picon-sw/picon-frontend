import { Link } from 'react-router';
import chevronRightSmallIcon from '../assets/icons/explore/chevron-right-small.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import handIcon from '../assets/icons/my/hand.svg';
import settingIcon from '../assets/icons/my/setting.svg';
import aiSparkleIcon from '../assets/icons/profile/ai-sparkle.svg';
import { DEMO_MY_PROFILE_IMAGE } from '../constants/demoImages';
import styles from './MyPage.module.css';

interface MyProfile {
  nickname: string;
  introduction: string;
  // 백엔드에서 받은 이미지 URL. 없으면 빈 칸으로 표시
  profileImageUrl?: string;
  interestField: string;
  hashtags: string[];
  requestCount: number;
  reviewCount: number;
  likedCount: number;
}

// TODO: API 연동 시 교체 (임시 데이터 — Figma 예시)
const SAMPLE_PROFILE: MyProfile = {
  nickname: '치로',
  introduction: '일상 속 작은 순간들을 기록하고 싶어요.',
  // TODO: 시연용 사진 (API 연동 시 삭제)
  profileImageUrl: DEMO_MY_PROFILE_IMAGE,
  interestField: '촬영',
  hashtags: ['자연광', '인물', '풍경', '필름'],
  requestCount: 6,
  reviewCount: 4,
  likedCount: 13,
};

const MENU_ITEMS = [
  { to: '/my/activity', label: '나의 활동', icon: handIcon },
  { to: '/my/settings', label: '설정 및 지원', icon: settingIcon },
];

export function MyPage() {
  const {
    nickname,
    introduction,
    profileImageUrl,
    interestField,
    hashtags,
    requestCount,
    reviewCount,
    likedCount,
  } = SAMPLE_PROFILE;

  const stats = [
    { label: '내 의뢰', count: requestCount },
    { label: '작성한 리뷰', count: reviewCount },
    { label: '찜한 전문가', count: likedCount },
  ];

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>MY PAGE</h1>

      <section className={styles.profile}>
        {profileImageUrl ? (
          <img className={styles.avatar} src={profileImageUrl} alt="" />
        ) : (
          <span className={`${styles.avatar} ${styles.avatarEmpty}`} />
        )}
        <div className={styles.info}>
          <p className={styles.nickname}>{nickname}</p>
          <p className={styles.introduction}>{introduction}</p>
          {/* TODO: 프로필 수정 화면은 이후 이슈에서 */}
          <button type="button" className={styles.editProfile}>
            프로필 정보 수정
            <img src={chevronRightSmallIcon} alt="" />
          </button>
        </div>
      </section>

      <section className={styles.taste} aria-labelledby="taste-title">
        <div className={styles.tasteHeader}>
          <h2 id="taste-title" className={styles.tasteTitle}>
            <img src={aiSparkleIcon} alt="" />내 취향 설정
          </h2>
          {/* TODO: 취향 수정 화면은 이후 이슈에서 */}
          <button type="button" className={styles.tasteEdit}>
            수정
          </button>
        </div>
        <p className={styles.interest}>
          관심 분야
          <span className={styles.interestDivider} aria-hidden="true">
            |
          </span>
          <strong>{interestField}</strong>
        </p>
        <ul className={styles.hashtags}>
          {hashtags.map((tag) => (
            <li key={tag} className={styles.hashtag}>
              #{tag}
            </li>
          ))}
        </ul>
      </section>

      <dl className={styles.stats}>
        {stats.map(({ label, count }) => (
          <div key={label} className={styles.stat}>
            <dt className={styles.statLabel}>{label}</dt>
            <dd className={styles.statCount}>{count}</dd>
          </div>
        ))}
      </dl>

      <nav className={styles.menu} aria-label="마이페이지 메뉴">
        {MENU_ITEMS.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={styles.menuItem}>
            <span className={styles.menuLabel}>
              <span className={styles.menuIcon}>
                <img src={icon} alt="" />
              </span>
              {label}
            </span>
            <img src={chevronRightIcon} alt="" />
          </Link>
        ))}
      </nav>
    </main>
  );
}
