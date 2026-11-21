import { Link } from 'react-router';
import backIcon from '../assets/icons/explore/back.svg';
import chevronRightIcon from '../assets/icons/explore/chevron-right.svg';
import { TERMS } from '../constants/terms';
import styles from './MyTermsPage.module.css';

// 약관 및 정책 목록 (설정 및 지원 → 약관 및 정책)
export function MyTermsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/my/settings" className={styles.back} aria-label="뒤로 가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1 className={styles.title}>약관 및 정책</h1>
      </header>

      <ul className={styles.list}>
        {TERMS.map(({ id, title, required }) => (
          <li key={id}>
            <Link to={`/my/settings/terms/${id}`} className={styles.item}>
              <span className={styles.itemTitle}>
                {title}
                <span className={required ? styles.badgeRequired : styles.badgeOptional}>
                  {required ? '필수' : '선택'}
                </span>
              </span>
              <img src={chevronRightIcon} alt="" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
