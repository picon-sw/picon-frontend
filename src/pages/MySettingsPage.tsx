import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import styles from './MySettingsPage.module.css';

// to가 없는 메뉴는 아직 화면이 없어 버튼만 표시
const SETTING_ITEMS: { label: string; to?: string }[] = [
  { label: '알림 설정', to: '/my/settings/notifications' },
  { label: '공지사항' },
  { label: '고객센터' },
  { label: '약관 및 정책', to: '/my/settings/terms' },
];

export function MySettingsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>설정 및 지원</h1>
      </header>

      {/* TODO: 공지사항 · 고객센터 화면은 이후 이슈에서 */}
      <ul className={styles.list}>
        {SETTING_ITEMS.map(({ label, to }) => (
          <li key={label}>
            {to ? (
              <Link to={to} className={styles.item}>
                <span>{label}</span>
                <img src={chevronRightIcon} alt="" />
              </Link>
            ) : (
              <button type="button" className={styles.item}>
                <span>{label}</span>
                <img src={chevronRightIcon} alt="" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
