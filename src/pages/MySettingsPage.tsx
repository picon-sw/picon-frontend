import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import styles from './MySettingsPage.module.css';

const SETTING_ITEMS = ['알림 설정', '공지사항', '고객센터', '약관 및 정책'];

export function MySettingsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>설정 및 지원</h1>
      </header>

      {/* TODO: 각 메뉴의 상세 화면은 이후 이슈에서 */}
      <ul className={styles.list}>
        {SETTING_ITEMS.map((label) => (
          <li key={label}>
            <button type="button" className={styles.item}>
              <span>{label}</span>
              <img src={chevronRightIcon} alt="" />
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
