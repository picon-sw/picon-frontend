import { Link } from 'react-router';
import megaphoneIcon from '../assets/icons/my/megaphone.svg';
import pinIcon from '../assets/icons/my/pin.svg';
import { NOTICES, sortNotices } from '../constants/notices';
import { PageHeader } from '../components/PageHeader';
import styles from './MyNoticesPage.module.css';

// 공지사항 목록 (설정 및 지원 → 공지사항)
export function MyNoticesPage() {
  const notices = sortNotices(NOTICES);

  return (
    <main className={styles.page}>
      <PageHeader title="공지사항" backTo="/my/settings" />

      {notices.length > 0 ? (
        <ul className={styles.list}>
          {notices.map(({ id, title, date, pinned }) => (
            <li key={id}>
              <Link
                to={`/my/settings/notices/${id}`}
                className={pinned ? `${styles.card} ${styles.cardPinned}` : styles.card}
              >
                <img
                  className={styles.icon}
                  src={pinned ? pinIcon : megaphoneIcon}
                  alt={pinned ? '고정 공지' : '공지'}
                />
                <span className={styles.cardText}>
                  <span className={styles.cardTitle}>{title}</span>
                  <time className={styles.date}>{date}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>등록된 공지사항이 없어요.</p>
      )}
    </main>
  );
}
